"""
FastAPI service for querying financial tables.

Requirements:
  pip install fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg pydantic-settings python-dotenv

Run:
  export DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/yourdb"
  uvicorn fastapi_financial_api:app --reload
"""
from __future__ import annotations

import os
from typing import Optional, List, Literal
from datetime import datetime

import uvicorn
from fastapi import FastAPI, Depends, Query, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text


# -----------------------------
# Settings & DB
# -----------------------------
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://localhost/postgres"

settings = Settings()

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=10,
)

AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


app = FastAPI(title="Financial API", version="1.0.0")


# -----------------------------
# Schemas
# -----------------------------
class FinancialTx(BaseModel):
    transaction_id: str
    abstracted_index: Optional[str]
    hash: Optional[str]
    block_number: Optional[int]
    from_address: Optional[str]
    to_address: Optional[str]
    symbol: Optional[str]
    amount: Optional[str]
    fee: Optional[str]
    decimals: Optional[int]
    kind: Optional[str]
    type: Optional[str]
    address: Optional[str]
    timestamp: Optional[int]
    index_address: Optional[str]
    blockchain_id: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TxAggregate(BaseModel):
    index_address: str
    symbol: str
    address: str
    sum: str  # decimal as string (to avoid FP precision issues)


class Token(BaseModel):
    symbol: str
    name: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    owner: Optional[str]
    extra: Optional[str]
    decimals: Optional[int]
    address: Optional[str]
    is_spam: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class TokenXChain(BaseModel):
    contract_address: str
    symbol: str
    chain: str
    decimal: Optional[int]
    is_spam: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class AddressCount(BaseModel):
    chain_id: str
    indexed_address: str
    financial_transaction_count: Optional[int]


class PaginatedResponse(BaseModel):
    data: List[FinancialTx]
    pagination: dict
    
class PaginationMeta(BaseModel):
    total: int
    limit: int
    offset: int
    page: int
    total_pages: int
    has_next: bool
    has_previous: bool

# -----------------------------
# Utils
# -----------------------------
SUPPORTED_SORT: List[str] = [
    "block_number_desc",
    "block_number_asc",
    "created_at_desc",
    "created_at_asc",
]


def build_order_clause(sort: str) -> str:
    if sort == "block_number_asc":
        return "ORDER BY block_number ASC, abstracted_index ASC NULLS LAST"
    if sort == "created_at_desc":
        return "ORDER BY created_at DESC, transaction_id DESC"
    if sort == "created_at_asc":
        return "ORDER BY created_at ASC, transaction_id ASC"
    # default
    return "ORDER BY block_number DESC, abstracted_index DESC NULLS LAST"


# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
async def health():
    return {"ok": True, "time": datetime.utcnow().isoformat()}


@app.get("/transactions")
async def list_transactions(
    index_address: str = Query(..., description="Indexed address to filter"),
    chain_id: Optional[str] = Query(None),
    symbol: Optional[str] = Query(None),
    kind: Optional[Literal["IN", "OUT"]] = Query(None),
    type: Optional[str] = Query(None, description="Event type (e.g., TRANSFER)"),
    address: Optional[str] = Query(None, description="Token contract / mint"),
    from_block: Optional[int] = Query(None),
    to_block: Optional[int] = Query(None),
    from_time: Optional[int] = Query(None, description="unix seconds"),
    to_time: Optional[int] = Query(None, description="unix seconds"),
    exclude_wsol: bool = Query(True, description="If symbol == WSOL, exclude"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: str = Query("block_number_desc", enum=SUPPORTED_SORT),
    session: AsyncSession = Depends(get_session),
):
    # Build WHERE clause (same as before)
    where = ["index_address = :index_address"]
    params = {"index_address": index_address}

    if chain_id:
        where.append("blockchain_id = :chain_id")
        params["chain_id"] = chain_id
    if symbol:
        where.append("symbol = :symbol")
        params["symbol"] = symbol
    if kind:
        where.append("kind = :kind")
        params["kind"] = kind
    if type:
        where.append("type = :type")
        params["type"] = type
    if address:
        where.append("address = :address")
        params["address"] = address
    if from_block is not None:
        where.append("block_number >= :from_block")
        params["from_block"] = from_block
    if to_block is not None:
        where.append("block_number <= :to_block")
        params["to_block"] = to_block
    if from_time is not None:
        where.append("timestamp >= :from_time")
        params["from_time"] = from_time
    if to_time is not None:
        where.append("timestamp <= :to_time")
        params["to_time"] = to_time
    if exclude_wsol:
        where.append("symbol <> 'WSOL'")

    where_clause = " AND ".join(where)
    order_clause = build_order_clause(sort)

    # 1. Get total count first
    count_sql = f"""
        SELECT COUNT(*) as total
        FROM public.financial_transactions
        WHERE {where_clause}
    """
    count_result = await session.execute(text(count_sql), params)
    total = count_result.scalar()

    # 2. Get paginated data
    data_sql = f"""
        SELECT
            transaction_id, abstracted_index, hash, block_number,
            from_address, to_address, symbol, amount, fee, decimals,
            kind, type, address, timestamp, index_address, blockchain_id,
            created_at, updated_at
        FROM public.financial_transactions
        WHERE {where_clause}
        {order_clause}
        LIMIT :limit OFFSET :offset
    """
    
    data_params = params.copy()
    data_params.update({"limit": limit, "offset": offset})
    
    rows = (await session.execute(text(data_sql), data_params)).mappings().all()
    transactions = [FinancialTx(**r) for r in rows]

    # 3. Calculate pagination metadata
    page = (offset // limit) + 1
    total_pages = (total + limit - 1) // limit  # Ceiling division
    has_next = offset + limit < total
    has_previous = offset > 0

    return {
        "data": transactions,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "page": page,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous
        }
    }


@app.get("/transactions/aggregate", response_model=List[TxAggregate])
async def aggregate_balances(
    index_address: str = Query(...),
    chain_id: Optional[str] = Query(None),
    by_symbol: bool = Query(True, description="Group by symbol+address"),
    include_fee: bool = Query(True, description="Subtract fee from native SOL OUT only"),
    exclude_wsol: bool = Query(True),
    session: AsyncSession = Depends(get_session),
):
    # Cast amount/fee (stored as text) to numeric; scale is expected as already-normalized amounts
    # If your amounts are raw base units, change the formula accordingly.
    where = ["index_address = :index_address"]
    params = {"index_address": index_address}

    if chain_id:
        where.append("blockchain_id = :chain_id")
        params["chain_id"] = chain_id
    if exclude_wsol:
        where.append("symbol <> 'WSOL'")

    where_clause = " AND ".join(where)

    # Only subtract fee for native SOL OUT; assumes symbol = 'SOL' for native
    fee_term = "CASE WHEN kind = 'OUT' AND symbol = 'SOL' THEN COALESCE(fee::numeric, 0) ELSE 0 END"
    amount_term = "amount::numeric"

    sum_expr = f"(CASE WHEN kind = 'OUT' THEN -1 * ({amount_term} {'+ ' + fee_term if include_fee else ''}) ELSE {amount_term} END)"

    group_cols = "index_address, symbol, address" if by_symbol else "index_address"

    sql = f"""
        SELECT {group_cols}, CAST(SUM({sum_expr}) AS TEXT) AS sum
        FROM public.financial_transactions
        WHERE {where_clause}
        GROUP BY {group_cols}
        ORDER BY {('symbol, address' if by_symbol else 'index_address')}
    """

    rows = (await session.execute(text(sql), params)).mappings().all()

    # Normalize output shape
    out: List[TxAggregate] = []
    for r in rows:
        if by_symbol:
            out.append(TxAggregate(
                index_address=r["index_address"],
                symbol=r["symbol"],
                address=r["address"],
                sum=r["sum"],
            ))
        else:
            out.append(TxAggregate(
                index_address=r["index_address"],
                symbol="*",
                address="*",
                sum=r["sum"],
            ))
    return out


@app.get("/tokens", response_model=List[Token])
async def list_tokens(
    q: Optional[str] = Query(None, description="Search symbol or name contains"),
    session: AsyncSession = Depends(get_session),
):
    where = []
    params = {}
    if q:
        where.append("(symbol ILIKE :q OR name ILIKE :q)")
        params["q"] = f"%{q}%"
    where_clause = ("WHERE " + " AND ".join(where)) if where else ""

    sql = f"""
        SELECT symbol, name, description, image_url, owner, extra, decimals, address, is_spam, created_at, updated_at
        FROM public.tokens
        {where_clause}
        ORDER BY symbol
        LIMIT 500
    """
    rows = (await session.execute(text(sql), params)).mappings().all()
    return [Token(**r) for r in rows]


@app.get("/tokens/{symbol}", response_model=Token)
async def get_token(symbol: str, session: AsyncSession = Depends(get_session)):
    sql = text(
        """
        SELECT symbol, name, description, image_url, owner, extra, decimals, address, is_spam, created_at, updated_at
        FROM public.tokens WHERE symbol = :symbol
        """
    )
    row = (await session.execute(sql, {"symbol": symbol})).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Token not found")
    return Token(**row)


@app.get("/token-cross-chains", response_model=List[TokenXChain])
async def list_token_cross_chains(
    symbol: Optional[str] = Query(None),
    chain: Optional[str] = Query(None),
    contract_address: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
):
    where = []
    params = {}
    if symbol:
        where.append("symbol = :symbol")
        params["symbol"] = symbol
    if chain:
        where.append("chain = :chain")
        params["chain"] = chain
    if contract_address:
        where.append("contract_address = :contract_address")
        params["contract_address"] = contract_address

    where_clause = ("WHERE " + " AND ".join(where)) if where else ""
    sql = f"""
        SELECT contract_address, symbol, chain, decimal, is_spam, created_at, updated_at
        FROM public.token_cross_chains
        {where_clause}
        ORDER BY symbol, chain
        LIMIT 1000
    """
    rows = (await session.execute(text(sql), params)).mappings().all()
    return [TokenXChain(**r) for r in rows]


@app.get("/address/{chain_id}/{indexed_address}/count", response_model=AddressCount)
async def get_address_count(chain_id: str, indexed_address: str, session: AsyncSession = Depends(get_session)):
    sql = text(
        """
        SELECT chain_id, indexed_address, financial_transaction_count
        FROM public.financial_transaction_count
        WHERE chain_id = :chain_id AND indexed_address = :indexed_address
        """
    )
    row = (await session.execute(sql, {"chain_id": chain_id, "indexed_address": indexed_address})).mappings().first()
    if not row:
        # If not found, return count null
        return AddressCount(chain_id=chain_id, indexed_address=indexed_address, financial_transaction_count=None)
    return AddressCount(**row)


@app.get("/address-registry")
async def list_address_registry(
    chain_id: Optional[str] = Query(None),
    status: Optional[int] = Query(None),
    scheduled: Optional[bool] = Query(None, alias="is_scheduled"),
    q: Optional[str] = Query(None, description="search in indexed_address"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
):
    where, params = [], {}
    if chain_id:
        where.append("chain_id = :chain_id")
        params["chain_id"] = chain_id
    if status is not None:
        where.append("status = :status")
        params["status"] = status
    if scheduled is not None:
        where.append("is_scheduled = :scheduled")
        params["scheduled"] = scheduled
    if q:
        where.append("indexed_address ILIKE :q")
        params["q"] = f"%{q}%"

    where_clause = ("WHERE " + " AND ".join(where)) if where else ""

    # Count total
    count_sql = f"""
        SELECT COUNT(*) as total
        FROM public.address_registry
        {where_clause}
    """
    total = (await session.execute(text(count_sql), params)).scalar()

    # Get data
    data_sql = f"""
        SELECT register_id, chain_id, indexed_address, status, is_scheduled, created_at, updated_at
        FROM public.address_registry
        {where_clause}
        ORDER BY updated_at DESC
        LIMIT :limit OFFSET :offset
    """

    params.update({"limit": limit, "offset": offset})
    rows = (await session.execute(text(data_sql), params)).mappings().all()

    # Build pagination metadata
    page = (offset // limit) + 1
    total_pages = (total + limit - 1) // limit
    has_next = offset + limit < total
    has_previous = offset > 0

    return {
        "data": rows,
        "pagination": {
            "total": total,
            "limit": limit, 
            "offset": offset,
            "page": page,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous
        }
    }


@app.get("/address-jobs")
async def list_address_jobs(
    chain_id: Optional[str] = Query(None),
    run_id: Optional[str] = Query(None),
    indexed_address: Optional[str] = Query(None),
    status: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
):
    where, params = [], {}
    if chain_id:
        where.append("chain_id = :chain_id")
        params["chain_id"] = chain_id
    if run_id:
        where.append("run_id = :run_id")
        params["run_id"] = run_id
    if indexed_address:
        where.append("indexed_address = :indexed_address")
        params["indexed_address"] = indexed_address
    if status is not None:
        where.append("status = :status")
        params["status"] = status

    where_clause = ("WHERE " + " AND ".join(where)) if where else ""

    sql = f"""
        SELECT id, chain_id, run_id, indexed_address, status, created_at, updated_at
        FROM public.address_jobs
        {where_clause}
        ORDER BY id DESC
        LIMIT :limit OFFSET :offset
    """

    params.update({"limit": limit, "offset": offset})
    rows = (await session.execute(text(sql), params)).mappings().all()
    return rows


# -----------------------------
# Performance notes (indexes)
# -----------------------------
# Recommended indexes in addition to what's provided in DDL:
#   CREATE INDEX CONCURRENTLY IF NOT EXISTS ft_idx_address_block ON public.financial_transactions (index_address, block_number DESC);
#   CREATE INDEX CONCURRENTLY IF NOT EXISTS ft_idx_address_symbol ON public.financial_transactions (index_address, symbol);
#   CREATE INDEX CONCURRENTLY IF NOT EXISTS ft_idx_hash ON public.financial_transactions (hash);
#   -- The existing index name "financial_transactions_block_number_index" actually indexes (index_address).
#   -- Consider renaming for clarity or adding a real block_number index if you filter by block ranges.

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
