# =============================================================================
# SENSOR FORMAT LOOKUP  (optical format → physical sensor width in mm)
# Source: standard imaging sensor dimensions
# =============================================================================

SENSOR_FORMATS: list[tuple[str, float]] = [
    ('1/4"',   3.20),
    ('1/3.6"', 4.00),
    ('1/3"',   4.80),
    ('1/2.9"', 5.12),
    ('1/2.8"', 5.37),
    ('1/2.7"', 5.37),
    ('1/2"',   6.40),
    ('1/1.8"', 7.18),
    ('1/1.7"', 7.60),
    ('1/1.2"', 10.67),
    ('2/3"',   8.80),
    ('1"',     12.80),
    ('4/3"',   17.30),
    ('Custom', 0.0),   # user enters width directly
]

# Quick lookup: optical format string → physical sensor width in mm
SENSOR_FORMAT_MAP: dict[str, float] = {fmt: width for fmt, width in SENSOR_FORMATS}
