import hashlib
import os
import re

SALT = os.environ.get("RUT_SALT", "healt_impact_lab_aps_salt_2026")

def hash_rut(rut: str | None) -> str:
    """
    Hashes Chilean RUT string using SHA-256 with a salt string.
    Normalizes RUT string before hashing.
    Returns empty string if rut is empty or None.
    """
    if not rut:
        return ""
    clean = re.sub(r'[\.\-\s]', '', str(rut)).upper()
    if not clean:
        return ""
    salted = f"{clean}:{SALT}"
    return hashlib.sha256(salted.encode('utf-8')).hexdigest()


def mask_rut(rut: str | None) -> str:
    """
    Masks Chilean RUT string.
    Examples:
    - "12.458.930-K" -> "12.458.***-K"
    - "14.821.405-3" -> "14.821.***-3"
    - "12458930K" -> "12.458.***-K"
    - "9.310.224-8" -> "9.310.***-8"
    - "93102248" -> "9.310.***-8"
    - "12.458.***-K" -> "12.458.***-K" (idempotent)
    - "" or None -> ""
    """
    if not rut:
        return ""

    if "***" in rut:
        return rut

    clean = re.sub(r'[\.\-\s]', '', str(rut)).upper()
    if not clean:
        return ""

    dv = clean[-1]
    body = clean[:-1]

    if not body.isdigit():
        return str(rut)

    if len(body) == 8:
        p1 = body[:2]
        p2 = body[2:5]
        return f"{p1}.{p2}.***-{dv}"
    elif len(body) == 7:
        p1 = body[:1]
        p2 = body[1:4]
        return f"{p1}.{p2}.***-{dv}"
    elif len(body) > 3:
        p1 = body[:-3]
        return f"{p1}.***-{dv}"
    else:
        return f"***-{dv}"
