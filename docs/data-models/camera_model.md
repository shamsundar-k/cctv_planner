# Camera Model — Data Structure & Schema

> Varifocal CCTV Camera Model for Coverage Area & DORI Performance Calculation  
> Standard Reference: IEC EN 62676-4:2015  
> Version: 1.0 | March 2025

---

## Overview

This document defines the canonical data model for a varifocal CCTV camera used in the two-stage coverage and DORI performance calculation pipeline. The model is structured into five logical groups:

| Group | Purpose |
|---|---|
| `lens` | Focal and optical properties of the varifocal lens |
| `sensor` | Image sensor resolution and physical characteristics |
| `installation` | Physical mounting parameters (height, tilt, pan) |
| `calculated.stage1` | Derived geometric coverage outputs |
| `calculated.stage2` | Derived DORI performance outputs |

---

## Full Data Model

```typescript
interface CameraModel {

  // ── Camera Identity ──────────────────────────────────────────────────────
  id:           string;          // Unique camera identifier  e.g. "CAM-001"
  name:         string;          // Human-readable label      e.g. "Main Entrance Camera"
  manufacturer: string;          // e.g. "Hikvision", "Axis", "Dahua"
  model:        string;          // Manufacturer model number e.g. "DS-2DE4A425IWG-E"
  type:         CameraType;      // See CameraType enum below
  location:     string;          // Site/zone description     e.g. "Building A - North Facade"
  notes?:       string;          // Optional free-text notes

  // ── Lens Parameters ──────────────────────────────────────────────────────
  lens: {
    focalLengthMin:   number;    // mm  — widest angle setting   e.g. 2.8
    focalLengthMax:   number;    // mm  — narrowest angle setting e.g. 12.0
    focalLengthChosen: number;   // mm  — selected operating FL  e.g. 6.0
    hFovMin:          number;    // °   — H-FOV at focalLengthMax e.g. 28
    hFovMax:          number;    // °   — H-FOV at focalLengthMin e.g. 97
    vFovMin:          number;    // °   — V-FOV at focalLengthMax e.g. 16
    vFovMax:          number;    // °   — V-FOV at focalLengthMin e.g. 54
    hFovChosen?:      number;    // °   — interpolated H-FOV (computed) e.g. 52
    vFovChosen?:      number;    // °   — interpolated V-FOV (computed) e.g. 30
    lensType:         LensType;  // See LensType enum
    iRCutFilter:      boolean;   // true = dual-filter IR cut present
  };

  // ── Sensor Parameters ────────────────────────────────────────────────────
  sensor: {
    resolutionH:      number;    // pixels — horizontal pixel count  e.g. 2560
    resolutionV:      number;    // pixels — vertical pixel count    e.g. 1440
    megapixels:       number;    // MP     — total sensor MP          e.g. 4.0
    aspectRatio:      string;    // ratio  — e.g. "16:9", "4:3"
    sensorSize:       string;    // format — e.g. "1/2.8\"", "1/3\""
    sensorType:       SensorType;// See SensorType enum
    minIllumination:  number;    // lux    — minimum scene illumination e.g. 0.005
    wdr:              boolean;   // Wide Dynamic Range enabled
    wdrDb?:           number;    // dB     — WDR range if applicable e.g. 120
  };

  // ── Installation Parameters ──────────────────────────────────────────────
  installation: {
    height:           number;    // m   — lens height above ground plane  e.g. 4.0
    tiltAngle:        number;    // °   — downward tilt from horizontal    e.g. 30
    panAngle:         number;    // °   — horizontal rotation from forward e.g. 0
    rollAngle:        number;    // °   — rotational roll (normally 0)     e.g. 0
    mountType:        MountType; // See MountType enum
    coordinates?: {              // Optional GPS or local grid coordinates
      x:              number;
      y:              number;
      z?:             number;
      crs?:           string;    // Coordinate Reference System e.g. "WGS84"
    };
  };

  // ── Stage 1: Geometric Coverage Outputs (computed) ───────────────────────
  calculated: {
    stage1: {
      dNear:          number;    // m   — horizontal distance to near edge  e.g. 4.0
      dFar:           number;    // m   — horizontal distance to far edge   e.g. 14.9
      wNear:          number;    // m   — coverage width at near edge        e.g. 3.9
      wFar:           number;    // m   — coverage width at far edge         e.g. 14.6
      coverageArea:   number;    // m²  — total trapezoidal footprint area   e.g. 100.8
      footprint:      Polygon;   // GeoJSON-style polygon of ground coverage
      valid:          boolean;   // false if tilt <= vFovChosen/2 (infinite far)
    };

    // ── Stage 2: DORI Performance Outputs (computed) ──────────────────────
    stage2: {
      ppmAtNear:      number;    // PPM  — pixel density at dNear            e.g. 329
      ppmAtFar:       number;    // PPM  — pixel density at dFar             e.g. 88
      ppmAtCenter:    number;    // PPM  — pixel density at mid-coverage

      dori: {
        detection: {
          ppmThreshold: 25;
          dSlant:       number;  // m  — slant distance at 25 PPM threshold
          dHoriz:       number;  // m  — horizontal distance at 25 PPM
          width:        number;  // m  — coverage width at detection boundary
          withinFov:    boolean; // true if dHoriz < dFar
        };
        observation: {
          ppmThreshold: 62;
          dSlant:       number;
          dHoriz:       number;
          width:        number;
          withinFov:    boolean;
        };
        recognition: {
          ppmThreshold: 125;
          dSlant:       number;
          dHoriz:       number;
          width:        number;
          withinFov:    boolean;
        };
        identification: {
          ppmThreshold: 250;
          dSlant:       number;
          dHoriz:       number;
          width:        number;
          withinFov:    boolean;
        };
      };

      zones: {
        identificationArea:  number;  // m²  — area of ≥ 250 PPM zone
        recognitionArea:     number;  // m²  — area of ≥ 125 PPM zone (excl. ID zone)
        observationArea:     number;  // m²  — area of ≥ 62 PPM zone  (excl. above)
        detectionArea:       number;  // m²  — area of ≥ 25 PPM zone  (excl. above)
        identificationPct:   number;  // %   — identification zone as % of total
        recognitionPct:      number;  // %
        observationPct:      number;  // %
        detectionPct:        number;  // %
      };

      limitingFactor: LimitingFactor; // What limits coverage — see enum
    };
  };

  // ── Metadata ─────────────────────────────────────────────────────────────
  meta: {
    createdAt:        string;    // ISO 8601 timestamp  e.g. "2025-03-01T09:00:00Z"
    updatedAt:        string;    // ISO 8601 timestamp
    calculationVersion: string;  // Schema version      e.g. "2.0"
    standard:         string;    // e.g. "IEC EN 62676-4:2015"
  };
}
```

---

## Supporting Types & Enumerations

```typescript
// ── Camera Type ──────────────────────────────────────────────────────────────
enum CameraType {
  FIXED_DOME     = "fixed_dome",
  PTZ            = "ptz",
  BULLET         = "bullet",
  BOX            = "box",
  FISHEYE        = "fisheye",
  MULTISENSOR    = "multisensor",
}

// ── Lens Type ────────────────────────────────────────────────────────────────
enum LensType {
  VARIFOCAL      = "varifocal",       // Manual or motorised zoom
  MOTORISED      = "motorised",       // Electrically controlled varifocal
  FIXED          = "fixed",           // Single focal length
  OPTICAL_ZOOM   = "optical_zoom",    // PTZ optical zoom
}

// ── Sensor Type ──────────────────────────────────────────────────────────────
enum SensorType {
  CMOS           = "cmos",
  CCD            = "ccd",
  BSI_CMOS       = "bsi_cmos",        // Back-side illuminated CMOS
  STARVIS        = "starvis",         // Sony Starvis low-light CMOS
}

// ── Mount Type ───────────────────────────────────────────────────────────────
enum MountType {
  WALL           = "wall",
  CEILING        = "ceiling",
  POLE           = "pole",
  CORNER         = "corner",
  PENDANT        = "pendant",
  SURFACE        = "surface",
}

// ── Limiting Factor ──────────────────────────────────────────────────────────
// Identifies whether sensor resolution or installation geometry
// is the bottleneck for each DORI zone
enum LimitingFactor {
  GEOMETRY       = "geometry",        // tilt/height limits far distance
  RESOLUTION     = "resolution",      // sensor PPM is the bottleneck
  BOTH           = "both",            // at near edge: geometry; at far: resolution
}

// ── Polygon (GeoJSON-style) ──────────────────────────────────────────────────
interface Polygon {
  type:           "Polygon";
  coordinates:    number[][][];       // [[[x,y], [x,y], [x,y], [x,y], [x,y]]]
}
```

---

## Calculation Formulas Reference

All computed fields in `calculated.stage1` and `calculated.stage2` are derived from
the input parameters using the following formulas.

### Stage 1 — Geometric Coverage

```
// Angle interpolation
hFovChosen = hFovMax − [(f − fMin) / (fMax − fMin)] × (hFovMax − hFovMin)
vFovChosen = vFovMax − [(f − fMin) / (fMax − fMin)] × (vFovMax − vFovMin)

// Ground distances (tiltAngle θ, height H, vFov V)
dNear = H / tan(θ + V/2)
dFar  = H / tan(θ − V/2)          // only valid when θ > V/2

// Edge widths
wNear = 2 × dNear × tan(hFov/2)
wFar  = 2 × dFar  × tan(hFov/2)

// Total trapezoidal coverage area
coverageArea = 0.5 × (wNear + wFar) × (dFar − dNear)
```

### Stage 2 — DORI Performance

```
// Slant distance from camera to ground point at horizontal distance d
dSlant(d) = sqrt(d² + H²)

// Pixel density (PPM) at horizontal distance d
PPM(d) = resolutionH / [2 × dSlant(d) × tan(hFov/2)]

// DORI threshold distance (solve PPM(d) = ppmThreshold for d)
dSlant_DORI = resolutionH / (2 × ppmThreshold × tan(hFov/2))
dHoriz_DORI = sqrt(dSlant_DORI² − H²)

// DORI zone boundary width
width_DORI = 2 × dHoriz_DORI × tan(hFov/2)

// DORI zone area (trapezoid between inner and outer boundary)
zoneArea = 0.5 × (widthInner + widthOuter) × (dOuter − dInner)
```

---

## Example Instance (JSON)

```json
{
  "id": "CAM-001",
  "name": "Main Entrance Camera",
  "manufacturer": "Hikvision",
  "model": "DS-2CD2T47G2-L",
  "type": "bullet",
  "location": "Building A - North Facade, 3m left of main door",

  "lens": {
    "focalLengthMin": 2.8,
    "focalLengthMax": 12.0,
    "focalLengthChosen": 6.0,
    "hFovMin": 28,
    "hFovMax": 97,
    "vFovMin": 16,
    "vFovMax": 54,
    "hFovChosen": 52,
    "vFovChosen": 30,
    "lensType": "motorised",
    "iRCutFilter": true
  },

  "sensor": {
    "resolutionH": 2560,
    "resolutionV": 1440,
    "megapixels": 4.0,
    "aspectRatio": "16:9",
    "sensorSize": "1/2.7\"",
    "sensorType": "cmos",
    "minIllumination": 0.005,
    "wdr": true,
    "wdrDb": 120
  },

  "installation": {
    "height": 4.0,
    "tiltAngle": 30,
    "panAngle": 0,
    "rollAngle": 0,
    "mountType": "wall",
    "coordinates": {
      "x": 412.5,
      "y": 308.0,
      "crs": "local_grid"
    }
  },

  "calculated": {
    "stage1": {
      "dNear": 4.0,
      "dFar": 14.9,
      "wNear": 3.9,
      "wFar": 14.6,
      "coverageArea": 100.8,
      "valid": true,
      "footprint": {
        "type": "Polygon",
        "coordinates": [[
          [410.6, 306.1],
          [408.5, 322.9],
          [419.8, 322.9],
          [416.4, 306.1],
          [410.6, 306.1]
        ]]
      }
    },

    "stage2": {
      "ppmAtNear": 329,
      "ppmAtFar": 88,
      "ppmAtCenter": 178,

      "dori": {
        "detection": {
          "ppmThreshold": 25,
          "dSlant": 104.9,
          "dHoriz": 104.8,
          "width": 102.5,
          "withinFov": false
        },
        "observation": {
          "ppmThreshold": 62,
          "dSlant": 42.3,
          "dHoriz": 42.1,
          "width": 41.2,
          "withinFov": false
        },
        "recognition": {
          "ppmThreshold": 125,
          "dSlant": 21.0,
          "dHoriz": 20.6,
          "width": 20.1,
          "withinFov": false
        },
        "identification": {
          "ppmThreshold": 250,
          "dSlant": 10.5,
          "dHoriz": 9.7,
          "width": 9.5,
          "withinFov": true
        }
      },

      "zones": {
        "identificationArea": 38.2,
        "recognitionArea": 62.6,
        "observationArea": 0,
        "detectionArea": 0,
        "identificationPct": 37.9,
        "recognitionPct": 62.1,
        "observationPct": 0,
        "detectionPct": 0
      },

      "limitingFactor": "geometry"
    }
  },

  "meta": {
    "createdAt": "2025-03-01T09:00:00Z",
    "updatedAt": "2025-03-08T11:30:00Z",
    "calculationVersion": "2.0",
    "standard": "IEC EN 62676-4:2015"
  }
}
```

---

## Field Validation Rules

| Field | Rule |
|---|---|
| `lens.focalLengthChosen` | Must be within `[focalLengthMin, focalLengthMax]` |
| `installation.tiltAngle` | Must be `> vFovChosen / 2` for finite `dFar` |
| `installation.height` | Must be `> 0` |
| `sensor.resolutionH` | Must be `> 0`; common values: 1920 (2MP), 2560 (4MP), 3840 (8MP) |
| `calculated.stage1.valid` | Set to `false` if `tiltAngle ≤ vFovChosen / 2` |
| `calculated.stage2.dori.*.withinFov` | Set to `false` if `dHoriz > dFar` — DORI range exceeds geometric footprint |
| `zones.*Pct` | All four zone percentages must sum to `≤ 100%` |

---

## DORI Threshold Constants

Defined by **IEC EN 62676-4:2015** — these values are fixed and must not be altered.

```typescript
const DORI_THRESHOLDS = {
  DETECTION:      25,   // PPM
  OBSERVATION:    62,   // PPM
  RECOGNITION:   125,   // PPM
  IDENTIFICATION: 250,  // PPM
} as const;
```

---

## Notes

- All angular values are in **decimal degrees**.
- All distances and dimensions are in **metres (m)**.
- All areas are in **square metres (m²)**.
- PPM values are in **pixels per metre** measured horizontally at the target.
- DORI distances assume **ideal lighting conditions** and a **human operator** reviewing footage. Results will differ for automated video analytics.
- The model uses **horizontal slant distance** for PPM calculation to correctly account for camera mounting height — this gives more accurate results than using horizontal ground distance alone at steep tilt angles.
- When `calculated.stage2.dori.*.withinFov = false`, the camera sensor is capable of the stated DORI quality at that distance but the **installation geometry does not allow the camera to see that far**. The `limitingFactor` field distinguishes whether sensor resolution or geometry is the binding constraint.
