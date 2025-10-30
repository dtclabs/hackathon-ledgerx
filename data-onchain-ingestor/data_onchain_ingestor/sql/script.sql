create table public.financial_transactions
(
    transaction_id   text primary key,
    abstracted_index text,
    hash             text,
    block_number     bigint,
    from_address       text,
    to_address         text,
    symbol           text,
    amount           text,
    fee              text,
    decimals         smallint,
    kind             text,
    type             text,
    address          text,
    timestamp        int,
    index_address    text,
    blockchain_id    text,
    created_at       timestamp default now(),
    updated_at       timestamp default now()
);

create index financial_transactions_block_number_index
    on public.financial_transactions (index_address);

create table public.address_registry
(
    register_id     varchar                                not null
        primary key,
    chain_id        varchar                                not null,
    indexed_address varchar                                not null,
    status          integer                                not null,
    is_scheduled     bool default false,
    created_at      timestamp with time zone default now() not null,
    updated_at      timestamp with time zone default now() not null
);

create table public.address_jobs
(
    id              serial
        primary key,
    chain_id        varchar not null,
    run_id          varchar not null UNIQUE,
    indexed_address varchar not null,
    status          integer,
    created_at      timestamp with time zone default now(),
    updated_at      timestamp with time zone default now()
);

create table public.token_cross_chains
(
    contract_address text,
    symbol           text,
    chain            text,
    decimal          bigint,
    is_spam          boolean,
    created_at       timestamp default now(),
    updated_at       timestamp default now(),
    unique (contract_address, chain)
);

create table public.tokens
(
    symbol      text not null
        primary key,
    name        text,
    description text,
    image_url   text,
    owner       text,
    extra       text,
    decimals    bigint,
    address     text,
    is_spam     boolean,
    created_at  timestamp default now(),
    updated_at  timestamp default now()
);

insert into tokens (symbol, name, description, image_url, owner, extra, decimals, address, is_spam, created_at, updated_at)
values ('ETH', 'Ethereum', 'Native Ethereum in Ethereum network', null, null, null, 18, 'ethereum', False, now(), now());
values ('SOL', 'Solana', 'Native Solana in Solana network', null, null, null, 9, 'solana', False, now(), now());

insert into token_cross_chains (contract_address, symbol, chain, "decimal", is_spam, created_at, updated_at)
values ('ethereum', 'ETH', 'ethereum', 18, False, now(), now());
values ('solana', 'SOL', 'solana', 9, False, now(), now());

create table public.financial_transaction_count
(
    indexed_address             varchar not null,
    chain_id                    varchar not null,
    financial_transaction_count integer,
    created_at                  timestamp with time zone default now(),
    updated_at                  timestamp with time zone default now(),
    unique (chain_id, indexed_address)
);
