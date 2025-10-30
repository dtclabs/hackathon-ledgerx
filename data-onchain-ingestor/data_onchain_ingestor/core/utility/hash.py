import xxhash


def generate_hash(*args: str) -> str:
    combined = ",".join(str(v) for v in args)
    hash_str: str = xxhash.xxh64(combined.encode()).hexdigest()
    return hash_str
