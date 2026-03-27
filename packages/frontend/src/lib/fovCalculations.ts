/**
 * FOV Core Calculations — Stage 1 Geometric Coverage
 *
 * Computes the camera field-of-view trapezoid in camera-local Cartesian coordinates:
 *   - Origin (0, 0) = camera ground position (directly below lens)
 *   - +Y axis = camera forward direction (bearing 0° before rotation)
 *   - +X axis = camera right
 *   - All distances in metres
 *
 * To render on a map: rotate each corner by bearing, then project metre offsets
 * to lat/lng using the camera position.
 *
 * Reference: CCTV_Coverage_Calculation.pdf, CCTV_Stage1_Stage2_DORI-1.pdf
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FovInput {
  // From CameraModel
  focalLengthMin: number  // mm — minimum focal length (wide end)
  focalLengthMax: number  // mm — maximum focal length (tele end)
  hFovMin: number         // degrees — H-FOV at tele (max focal, narrowest)
  hFovMax: number         // degrees — H-FOV at wide (min focal, widest)
  vFovMin: number         // degrees — V-FOV at tele (max focal, narrowest)
  vFovMax: number         // degrees — V-FOV at wide (min focal, widest)

  // From CameraInstance
  installationHeight: number  // metres — lens height above ground
  focalLengthChosen: number   // mm — within [focalLengthMin, focalLengthMax]
}

export interface CartesianPoint {
  x: number  // metres, lateral (right = positive)
  y: number  // metres, forward from camera base (0 = camera ground position)
}

export interface FovResult {
  valid: boolean
  error?: string         // populated when valid = false
  hAngle: number         // degrees — interpolated H-FOV at chosen focal length
  vAngle: number         // degrees — interpolated V-FOV at chosen focal length
  dNear: number          // metres — horizontal distance to near coverage edge
  dFar: number           // metres — horizontal distance to far coverage edge
  wNear: number          // metres — coverage width at near edge
  wFar: number           // metres — coverage width at far edge
  areaSqMetres: number   // m² — total trapezoidal coverage area
  trapezoid: {           // 4 corners in camera-local Cartesian coordinates
    nearLeft: CartesianPoint
    nearRight: CartesianPoint
    farRight: CartesianPoint
    farLeft: CartesianPoint
  }
}

// ── Default values for first camera placement ─────────────────────────────────

export const FOV_DEFAULTS = {
  height: 5.0,          // metres — typical wall/pole mount height
  targetDistance: 50.0, // metres — default surveillance distance
  targetHeight: 1.7,    // metres — average adult head height
} as const

// ── Internal helpers ──────────────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

// ── Tilt back-calculation ─────────────────────────────────────────────────────

/**
 * Back-calculates the camera tilt angle needed to aim the camera centre-line
 * at a target at a given horizontal distance and height.
 *
 * Formula: θ = atan((H_camera − H_target) / D_target)
 *
 * @param cameraHeight   metres — lens height above ground
 * @param targetDistance metres — horizontal ground distance to target
 * @param targetHeight   metres — height of target above ground (e.g. 1.7 for head)
 * @returns tilt angle in degrees (downward from horizontal)
 */
export function calculateTiltFromTarget(
  cameraHeight: number,
  targetDistance: number,
  targetHeight: number,
): number {
  return toDeg(Math.atan((cameraHeight - targetHeight) / targetDistance))
}

// ── Stage 1 internal steps ────────────────────────────────────────────────────

function interpolateAngles(input: FovInput): { hAngle: number; vAngle: number } {
  const { focalLengthMin, focalLengthMax, hFovMin, hFovMax, vFovMin, vFovMax, focalLengthChosen } =
    input
  const ratio = (focalLengthChosen - focalLengthMin) / (focalLengthMax - focalLengthMin)
  return {
    hAngle: hFovMax - ratio * (hFovMax - hFovMin),
    vAngle: vFovMax - ratio * (vFovMax - vFovMin),
  }
}

function validateFovInputs(
  input: FovInput,
  vAngle: number,
): { valid: boolean; error?: string } {
  if (input.installationHeight <= 0) {
    return { valid: false, error: 'Installation height must be greater than 0 m' }
  }
  if (
    input.focalLengthChosen < input.focalLengthMin ||
    input.focalLengthChosen > input.focalLengthMax
  ) {
    return {
      valid: false,
      error: `Focal length ${input.focalLengthChosen} mm is outside range [${input.focalLengthMin}, ${input.focalLengthMax}]`,
    }
  }
  if (input.tiltAngle <= vAngle / 2) {
    return {
      valid: false,
      error: `Tilt angle (${input.tiltAngle.toFixed(1)}°) must be > V-angle/2 (${(vAngle / 2).toFixed(1)}°) — camera sees sky`,
    }
  }
  return { valid: true }
}

function calculateGroundGeometry(
  hAngle: number,
  vAngle: number,
  height: number,
  tilt: number,
): { dNear: number; dFar: number; wNear: number; wFar: number; areaSqMetres: number } {
  const dNear = height / Math.tan(toRad(tilt + vAngle / 2))
  const dFar = height / Math.tan(toRad(tilt - vAngle / 2))
  const wNear = 2 * dNear * Math.tan(toRad(hAngle / 2))
  const wFar = 2 * dFar * Math.tan(toRad(hAngle / 2))
  const areaSqMetres = 0.5 * (wNear + wFar) * (dFar - dNear)
  return { dNear, dFar, wNear, wFar, areaSqMetres }
}

function buildTrapezoidPolygon(
  dNear: number,
  dFar: number,
  wNear: number,
  wFar: number,
): FovResult['trapezoid'] {
  return {
    nearLeft: { x: -(wNear / 2), y: dNear },
    nearRight: { x: +(wNear / 2), y: dNear },
    farRight: { x: +(wFar / 2), y: dFar },
    farLeft: { x: -(wFar / 2), y: dFar },
  }
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Calculates the Stage 1 geometric FOV trapezoid in camera-local Cartesian
 * coordinates (camera at origin, facing +Y axis).
 *
 * Feed the output `trapezoid` corners into a bearing rotation + lat/lng
 * projection step to get map-ready coordinates.
 */
export function calculateFov(input: FovInput): FovResult {
  const { hAngle, vAngle } = interpolateAngles(input)

  const validation = validateFovInputs(input, vAngle)
  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error,
      hAngle,
      vAngle,
      dNear: 0,
      dFar: 0,
      wNear: 0,
      wFar: 0,
      areaSqMetres: 0,
      trapezoid: {
        nearLeft: { x: 0, y: 0 },
        nearRight: { x: 0, y: 0 },
        farRight: { x: 0, y: 0 },
        farLeft: { x: 0, y: 0 },
      },
    }
  }

  const { dNear, dFar, wNear, wFar, areaSqMetres } = calculateGroundGeometry(
    hAngle,
    vAngle,
    input.installationHeight,
    input.tiltAngle,
  )

  return {
    valid: true,
    hAngle,
    vAngle,
    dNear,
    dFar,
    wNear,
    wFar,
    areaSqMetres,
    trapezoid: buildTrapezoidPolygon(dNear, dFar, wNear, wFar),
  }
}

// ── Map projection ────────────────────────────────────────────────────────────

/**
 * Projects the 4 trapezoid corners from camera-local Cartesian metres to
 * geographic [lat, lng] pairs, applying the camera's bearing rotation.
 *
 * Coordinate system:
 *   - Camera +Y = forward (bearing 0° points north)
 *   - Camera +X = right
 *   - Bearing θ is clockwise degrees from north
 *
 * Rotation:  eastM  =  x·cosθ + y·sinθ
 *            northM = −x·sinθ + y·cosθ
 */
export function projectTrapezoidToLatLng(
  trapezoid: FovResult['trapezoid'],
  cameraLat: number,
  cameraLng: number,
  bearingDeg: number,
): [number, number][] {
  const θ = (bearingDeg * Math.PI) / 180
  const cosLat = Math.cos((cameraLat * Math.PI) / 180)

  const project = ({ x, y }: CartesianPoint): [number, number] => {
    const eastM = x * Math.cos(θ) + y * Math.sin(θ)
    const northM = -x * Math.sin(θ) + y * Math.cos(θ)
    return [
      cameraLat + northM / 111320,
      cameraLng + eastM / (111320 * cosLat),
    ]
  }

  const { nearLeft, nearRight, farRight, farLeft } = trapezoid
  return [project(nearLeft), project(nearRight), project(farRight), project(farLeft)]
}

// ── Demo runner ───────────────────────────────────────────────────────────────

/**
 * Demonstrates both usage patterns using the spec doc's worked example inputs.
 *
 * Pattern A (direct tilt, θ=30°):
 *   Mathematically correct output from the formulas — note that the doc's
 *   worked example has a calculation error (it states 54−13.2≈30° for V-angle,
 *   but 54−13.2 = 40.8°). Our code gives the arithmetically correct result.
 *   H-angle ≈ 73° (raw interpolated; doc uses datasheet-corrected 52°).
 *
 * Pattern B (target-driven tilt, H=4m, D=5m, Ht=1.7m):
 *   Computed tilt ≈ 24.8° → valid geometry
 */
export function runFovDemo(): void {
  const baseInput = {
    focalLengthMin: 2.8,
    focalLengthMax: 12,
    hFovMax: 97,   // degrees at wide (min focal)
    hFovMin: 28,   // degrees at tele (max focal)
    vFovMax: 54,   // degrees at wide (min focal)
    vFovMin: 16,   // degrees at tele (max focal)
    installationHeight: 4,
    focalLengthChosen: 6,
  }

  // ── Pattern A: direct tilt (doc §7 worked example, θ=30°) ─────────────────
  const resultA = calculateFov({ ...baseInput, tiltAngle: 30 })
  console.group('[FOV] Pattern A — direct tilt (θ=30°, doc worked example)')
  console.log('  H-angle:', resultA.hAngle.toFixed(1), '°  (doc uses datasheet-corrected 52°)')
  console.log('  V-angle:', resultA.vAngle.toFixed(1), '°')
  console.log('  D_near: ', resultA.dNear.toFixed(2), 'm')
  console.log('  D_far:  ', resultA.dFar.toFixed(2), 'm')
  console.log('  W_near: ', resultA.wNear.toFixed(2), 'm')
  console.log('  W_far:  ', resultA.wFar.toFixed(2), 'm')
  console.log('  Area:   ', resultA.areaSqMetres.toFixed(1), 'm²')
  console.log('  Trapezoid corners (camera-local, metres):')
  console.table(resultA.trapezoid)
  console.groupEnd()

  // ── Pattern B: target-driven tilt (H=4m, target D=5m at head height 1.7m) ─
  const tiltB = calculateTiltFromTarget(4, 5, 1.7)
  const resultB = calculateFov({ ...baseInput, tiltAngle: tiltB })
  console.group('[FOV] Pattern B — target-driven tilt (H=4m, D=5m, Ht=1.7m)')
  console.log('  Computed tilt:', tiltB.toFixed(2), '°')
  console.log('  H-angle:', resultB.hAngle.toFixed(1), '°')
  console.log('  V-angle:', resultB.vAngle.toFixed(1), '°')
  if (resultB.valid) {
    console.log('  D_near: ', resultB.dNear.toFixed(2), 'm')
    console.log('  D_far:  ', resultB.dFar.toFixed(2), 'm')
    console.log('  W_near: ', resultB.wNear.toFixed(2), 'm')
    console.log('  W_far:  ', resultB.wFar.toFixed(2), 'm')
    console.log('  Area:   ', resultB.areaSqMetres.toFixed(1), 'm²')
    console.log('  Trapezoid corners (camera-local, metres):')
    console.table(resultB.trapezoid)
  } else {
    console.warn('  Invalid:', resultB.error)
  }
  console.groupEnd()
}

const D_FAR_CAP = 500;
const EPSILON = 1e-6;

function interpolateAngle(
  fMin: number, fMax: number,
  angleAtFMin: number, angleAtFMax: number,
  fChosen: number
): number {
  const t = (fChosen - fMin) / (fMax - fMin);
  return angleAtFMin - t * (angleAtFMin - angleAtFMax);
}


export function computeFovCartesian(camera_height: number, target_distance: number, target_height: number,
  focal_length_min: number, focal_length_max: number, h_fov_min: number, h_fov_max: number,
  v_fov_min: number, v_fov_max: number, focal_length_chosen: number) {

  if (camera_height <= 0 || target_distance <= 0 || target_height < 0) {
    return { status: "invalid_input" }
  }

  const hAngleDeg = interpolateAngle(focal_length_min, focal_length_max, h_fov_min, h_fov_max, focal_length_chosen);
  const vAngleDeg = interpolateAngle(focal_length_min, focal_length_max, v_fov_min, v_fov_max, focal_length_chosen);
  const haRad = toRad(hAngleDeg);
  const vaRad = toRad(vAngleDeg);

  const topRayRad = Math.atan2(H - ht, dt);
  const tiltRad = topRayRad + vaRad / 2;
  const topRayDeg = toDeg(topRayRad);
  const tiltDeg = toDeg(tiltRad);







}