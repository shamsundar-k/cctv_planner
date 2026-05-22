from enum import Enum


class LensType(str, Enum):
    VARIFOCAL = "varifocal"
    FIXED = "fixed"
