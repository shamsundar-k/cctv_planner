type geo_position = {
  lat: number;
  lng: number;
};

export type FovStatus =
  | 'valid'
  | 'valid_dfar_capped'
  | 'valid_partial_target'         // top ray hits target, bottom ray hits target body not ground
  | 'invalid_both_rays_up';        // both rays point skyward, no ground coverage

export interface FovCartesian {
  status: FovStatus;
  h_angle: number;        // degrees — interpolated horizontal FOV
  v_angle: number;        // degrees — interpolated vertical FOV
  top_ray_angle: number;  // degrees — top ray from horizontal (+down / -up)
  tilt_angle: number;           // degrees — derived tilt (+down / -up)
  d_near: number | null;  // m — closest ground point (dead zone edge)
  d_far: number | null;   // m — furthest ground point
  w_near: number | null;   // m — trapezoid width at d_near
  w_far: number | null;    // m — trapezoid width at d_far
  w_target: number | null; // m — FOV width at target_distance
  area: number | null;     // m²
}

export interface fov_input_params {
  camera_height: number;
  target_distance: number;
  target_height: number;
  focal_length_min: number;
  focal_length_max: number;
  h_fov_wide: number;    // widest H-FOV angle (degrees) — at focal_length_min
  h_fov_tele: number;    // narrowest H-FOV angle (degrees) — at focal_length_max
  v_fov_wide: number;    // widest V-FOV angle (degrees) — at focal_length_min
  v_fov_tele: number;    // narrowest V-FOV angle (degrees) — at focal_length_max
  focal_length_chosen: number;
}

export type FovCorners = [geo_position, geo_position, geo_position, geo_position];

// ── Internal helpers ──────────────────────────────────────────────────────────

function toRad(deg: number): number { return (deg * Math.PI) / 180; }
function toDeg(rad: number): number { return (rad * 180) / Math.PI; }

const D_FAR_CAP = 500;

function interpolateAngle(
  fMin: number, fMax: number,
  angleFovWide: number, angleFovTele: number,
  fChosen: number
): number {
  // Fixed-focal lens — no interpolation needed
  if (fMin === fMax) return angleFovWide;

  // Normalise position in 1/f space (not f space):
  //   u = 0 at fMin (wide), u = 1 at fMax (tele)
  const u = (1 / fChosen - 1 / fMin) / (1 / fMax - 1 / fMin);

  // Interpolate tan(half-angle) — the quantity that scales linearly with 1/f
  const tanHalfWide = Math.tan(toRad(angleFovWide / 2));
  const tanHalfTele = Math.tan(toRad(angleFovTele / 2));
  const tanHalfResult = tanHalfWide + u * (tanHalfTele - tanHalfWide);

  // Convert back to full angle in degrees
  return 2 * toDeg(Math.atan(tanHalfResult));
}

// ── Helper: build invalid return object ───────────────────────────────────────

function makeInvalidResult(
  status: FovStatus,
  h_angle: number,
  v_angle: number,
  top_ray_angle: number,
  tilt: number,
  d_near: number | null = null,
  d_far: number | null = null
): FovCartesian {
  return {
    status,
    h_angle,
    v_angle,
    top_ray_angle,
    tilt_angle: tilt,
    d_near,
    d_far,
    w_near: null,
    w_far: null,
    w_target: null,
    area: null,
  };
}

// ── Helper: build valid return object ─────────────────────────────────────────

function makeValidResult(
  status: FovStatus,
  h_angle: number,
  v_angle: number,
  top_ray_angle: number,
  tilt: number,
  d_near: number,
  d_far: number,
  target_distance: number
): FovCartesian {
  const w_near = 2 * d_near * Math.tan(toRad(h_angle / 2));
  const w_far = 2 * d_far * Math.tan(toRad(h_angle / 2));

  const w_target = 2 * target_distance * Math.tan(toRad(h_angle / 2));
  const area = 0.5 * (w_near + w_far) * (d_far - d_near);
  return {
    status, h_angle, v_angle, top_ray_angle, tilt_angle: tilt,
    d_near, d_far, w_near, w_far, w_target, area,
  };
}

// ── Function 1: Pure FOV mathematics (Cartesian) ──────────────────────────────

export function computeFovCartesian(params: fov_input_params): FovCartesian {

  // Guard: target_distance must be > 0 to avoid atan2 returning NaN (0/0 case)

  if (params.target_distance <= 0) {
    console.log("Invalid target distance", params.target_distance);
    return makeInvalidResult('invalid_both_rays_up', 0, 0, 0, 0);
  }

  // Step 1A: Interpolate H and V angles for the chosen focal length
  const hAngle = interpolateAngle(
    params.focal_length_min, params.focal_length_max,
    params.h_fov_wide, params.h_fov_tele,
    params.focal_length_chosen
  );
  const vAngle = interpolateAngle(
    params.focal_length_min, params.focal_length_max,
    params.v_fov_wide, params.v_fov_tele,
    params.focal_length_chosen
  );

  //console.log("H Angle", hAngle);
  //console.log("V Angle", vAngle);

  // Derive tilt from target position.
  // Top FOV ray is aimed to pass through (target_distance, target_height).
  // top_ray_angle = atan2((H - h_t) / d_t)
  //   +ve → ray points downward (target below camera)
  //   -ve → ray points upward   (target at or above camera)
  // Using atan2 instead of atan to safely handle target_height === camera_height (numerator = 0)
  const topRayAngle = toDeg(
    Math.atan2(params.camera_height - params.target_height, params.target_distance)
  );

  //console.log("Top Ray Angle", topRayAngle);

  // Optical axis sits V/2 below the top ray
  const tilt = topRayAngle + vAngle / 2;

  // console.log("Tilt", tilt);

  // Bottom ray angle from horizontal = top ray angle + full vAngle
  // (both angles measured downward from horizontal)
  const bottomRayAngle = topRayAngle + vAngle;

  // console.log("Bottom Ray Angle", bottomRayAngle);

  // Case 1: both rays point skyward — no ground intersection possible
  if (bottomRayAngle <= 0) {
    //console.log("Both rays point skyward")
    return makeInvalidResult('invalid_both_rays_up', hAngle, vAngle, topRayAngle, tilt);
  }

  // Step 1B: D_near — where the bottom ray hits the ground
  // Right triangle: opposite = camera_height, angle = bottomRayAngle from horizontal
  const d_near = params.camera_height / Math.tan(toRad(bottomRayAngle));
  //console.log("D Near", d_near);

  // Cases 2, 3, 5: target at or above camera height — top ray points upward or horizontal
  // D_far is infinite so cap to D_FAR_CAP
  if (params.target_height >= params.camera_height) {
    //console.log("Target at or above camera height")

    const d_far = D_FAR_CAP;
    //console.log("D Far", d_far);

    // Guard: d_near must not reach or exceed d_far cap
    if (d_near >= d_far) {
      //console.log("D Near >= D Far")
      return makeInvalidResult('invalid_both_rays_up', hAngle, vAngle, topRayAngle, tilt);
    }

    // Partial coverage: bottom ray hits target body instead of ground
    // (dead zone edge is beyond target base)
    const status: FovStatus = d_near > params.target_distance
      ? 'valid_partial_target'
      : 'valid_dfar_capped';

    //console.log("Status", status);

    return makeValidResult(status, hAngle, vAngle, topRayAngle, tilt, d_near, d_far, params.target_distance);
  }

  // Case 6: target below camera — top ray points downward, compute D_far directly.
  // Both near and far rays hit ground at finite distances.
  // top_ray_angle is +ve here so tan is always positive and d_far is finite.
  const d_far_raw = params.camera_height / Math.tan(toRad(topRayAngle));
  //console.log("D Far Raw", d_far_raw);

  // Cap d_far in case top ray is very shallow (near-horizontal), producing very large values
  const d_far = d_far_raw > D_FAR_CAP ? D_FAR_CAP : d_far_raw;
  const status: FovStatus = d_far === D_FAR_CAP ? 'valid_dfar_capped' : 'valid';

  //console.log("Status", status);

  return makeValidResult(status, hAngle, vAngle, topRayAngle, tilt, d_near, d_far, params.target_distance);
}

// ── Function 2: Translate FOV trapezoid to geo coordinates ───────────────────

export function computeFovGeoCorners(
  fov: Pick<FovCartesian, 'd_near' | 'd_far' | 'w_near' | 'w_far'>,
  camera_lat: number,
  camera_lng: number,
  bearing: number   // degrees clockwise from North
): FovCorners | null {

  if (fov.d_near == null || fov.d_far == null ||
    fov.w_near == null || fov.w_far == null) return null;

  const b = toRad(bearing);
  const R = 6_371_000; // Earth radius in metres

  // Offset origin by (east, north) metres → geo_position
  function move(east: number, north: number): geo_position {
    return {
      lat: camera_lat + toDeg(north / R),
      lng: camera_lng + toDeg(east / (R * Math.cos(toRad(camera_lat)))),
    };
  }

  // Rotate camera-local (forward, lateral) by bearing → (east, north) world offsets
  // forward  = distance along bearing axis (away from camera)
  // lateral  = perpendicular offset (right = +ve, left = -ve)
  function corner(forward: number, lateral: number): geo_position {
    return move(
      lateral * Math.cos(b) + forward * Math.sin(b),
      -lateral * Math.sin(b) + forward * Math.cos(b),
    );
  }

  // Return four trapezoid corners: [NearLeft, NearRight, FarRight, FarLeft]
  return [
    corner(fov.d_near, -fov.w_near / 2),
    corner(fov.d_near, fov.w_near / 2),
    corner(fov.d_far, fov.w_far / 2),
    corner(fov.d_far, -fov.w_far / 2),
  ];
}
