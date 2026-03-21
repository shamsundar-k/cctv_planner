/*
 * FILE SUMMARY — src/constants/sensorFormats.ts
 *
 * Lookup tables and helpers for optical sensor format strings used when
 * creating or editing camera models.
 *
 * SENSOR_FORMATS — ReadonlyArray<SensorFormat>. An ordered list of standard
 *   optical formats (e.g. '1/4"', '1/3"', '1"') mapped to their physical
 *   sensor width in millimetres. Includes a trailing "Custom" entry (widthMm
 *   = 0) for non-standard sizes.
 *
 * SENSOR_FORMAT_MAP — ReadonlyMap<string, number>. A pre-built Map derived
 *   from SENSOR_FORMATS for O(1) look-ups: optical format string → sensor
 *   width in mm.
 *
 * isStandardSensorFormat(value) — Returns true if `value` matches a key in
 *   SENSOR_FORMAT_MAP (i.e., it is one of the predefined standard formats).
 *   Used in AdminCameraEditPage to determine whether the stored sensor_size
 *   string is a standard option or a custom entry.
 */
// =============================================================================
// SENSOR FORMAT LOOKUP  (optical format → physical sensor width in mm)
// Source: standard imaging sensor dimensions
// =============================================================================

export interface SensorFormat {
  format: string
  widthMm: number
}

export const SENSOR_FORMATS: ReadonlyArray<SensorFormat> = [
  { format: '1/4"',   widthMm: 3.20 },
  { format: '1/3.6"', widthMm: 4.00 },
  { format: '1/3"',   widthMm: 4.80 },
  { format: '1/2.9"', widthMm: 5.12 },
  { format: '1/2.8"', widthMm: 5.37 },
  { format: '1/2.7"', widthMm: 5.37 },
  { format: '1/2"',   widthMm: 6.40 },
  { format: '1/1.8"', widthMm: 7.18 },
  { format: '1/1.7"', widthMm: 7.60 },
  { format: '1/1.2"', widthMm: 10.67 },
  { format: '2/3"',   widthMm: 8.80 },
  { format: '1"',     widthMm: 12.80 },
  { format: '4/3"',   widthMm: 17.30 },
  { format: 'Custom', widthMm: 0 },   // user enters width directly
]

// Quick lookup: optical format string → physical sensor width in mm
export const SENSOR_FORMAT_MAP: ReadonlyMap<string, number> = new Map(
  SENSOR_FORMATS.map(({ format, widthMm }) => [format, widthMm]),
)

/** Returns true if the given string is a known standard optical format. */
export function isStandardSensorFormat(value: string): boolean {
  return SENSOR_FORMAT_MAP.has(value)
}
