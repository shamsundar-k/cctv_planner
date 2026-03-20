# Camera Model Form - UI Design Guide

## Form Structure

Organize into **4 collapsible sections**:

### 1. Identity
Basic camera information with simple text inputs and dropdowns.
- `name` - text input (required)
- `manufacturer`, `model_number`, `location`, `notes` - text inputs (optional)
- `camera_type` - dropdown (Bullet, Dome, PTZ, etc.)

### 2. Lens
FOV and focal length parameters with range validation.
- Focal length: paired inputs for `min` and `max` (min ≤ max)
- Horizontal FOV: paired inputs for `min` (tele) and `max` (wide)
- Vertical FOV: paired inputs for `min` (tele) and `max` (wide)
- `lens_type` - dropdown (Fixed, Varifocal)
- `ir_cut_filter` - toggle switch
- `ir_range` - number input with units (meters)

**Conditional Logic:** If `lens_type` = "Fixed", disable max fields (auto-sync with min).

### 3. Sensor
Resolution and image quality settings.
- `resolution_h`, `resolution_v` - paired number inputs (width × height pixels)
- `megapixels` - read-only (auto-calculated from resolution)
- `aspect_ratio` - read-only (auto-calculated, e.g., "16:9")
- `sensor_size` - text input (optional, e.g., "1/2.7"")
- `sensor_type` - dropdown (CMOS, CCD)
- `min_illumination` - number input (lux)
- `wdr` - toggle switch
- `wdr_db` - number input (only show if WDR enabled)

### 4. Advanced
IR and WDR settings (collapsible).

## Validation Rules

- **Range validation:** min ≤ max for focal_length and FOV ranges
- **Fixed lens sync:** When lens_type = "Fixed", enforce focal_length_min = focal_length_max and h/v_fov_min = h/v_fov_max
- **Positive values:** All numeric fields have minimum thresholds (>0 or ≥0)
- **Auto-fill:** Megapixels and aspect ratio calculate on resolution change
- **Conditional display:** WDR dB only shows when WDR is enabled

## Input Types

| Field Type | Component |
|-----------|-----------|
| Required text | Text input with asterisk |
| Optional text | Text input (no asterisk) |
| Number (range) | Number input with validation |
| Paired values | Side-by-side inputs with label |
| Toggle | Switch component |
| Selection | Dropdown |
| Read-only | Disabled input or badge |

## UX Tips

- Show units inline (°, m, pixels, lux, dB)
- Group related min/max pairs visually
- Use tooltips for technical terms (HFOV, VFOV, WDR, IR range)
- Real-time validation with error messages
- Disable dependent fields when conditions unmet
- Auto-calculate megapixels/aspect ratio on blur
