
type geo_position =
  {
    lat: number,
    lng: number

  }


export type FovStatus =
  | 'valid'
  | 'valid_dfar_capped'
  | 'invalid_both_rays_up'
  | 'invalid_dnear_beyond_target';

export interface FovCartesian {
  status: FovStatus;
  h_angle: number;        // degrees — interpolated horizontal FOV
  v_angle: number;        // degrees — interpolated vertical FOV
  top_ray_angle: number;  // degrees — top ray from horizontal (+down / -up)
  tilt: number;           // degrees — derived tilt (+down / -up)
  d_near: number | null;  // m — closest ground point (dead zone edge)
  d_far: number | null;  // m — furthest ground point
  w_near: number | null;  // m — trapezoid width at d_near
  w_far: number | null;  // m — trapezoid width at d_far
  area: number | null;  // m²
}

interface fov_input_params {
  camera_height: number;
  target_distance: number;
  target_height: number;
  focal_length_min: number;
  focal_length_max: number;
  h_angle_min: number;
  h_angle_max: number;
  v_angle_min: number;
  v_angle_max: number;
  focal_length_chosen: number;

}

export type FovCorners = [geo_position, geo_position, geo_position, geo_position];

// ── Internal helpers ──────────────────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}


const D_FAR_CAP = 500;


function interpolateAngle(
  fMin: number, fMax: number,
  angleMin: number, angleMax: number,
  fChosen: number
): number {
  const t = (fChosen - fMin) / (fMax - fMin);
  return angleMax - t * (angleMax - angleMin);
}


export function computeFovCartesian(params: fov_input_params): FovCartesian {
  const fmin = params.focal_length_min
  const fmax = params.focal_length_max
  const hmin = params.h_angle_min
  const hmax = params.h_angle_max
  const vmin = params.v_angle_min
  const vmax = params.v_angle_max
  const focus = params.focal_length_chosen
  const hAngle = interpolateAngle(fmin, fmax, hmin, hmax, focus);
  const vAngle = interpolateAngle(fmin, fmax, vmin, vmax, focus)

//target above camera case - need to cap d_far and check if rays point up or down, and if d_near is beyond target distance

  if(params.target_height > params.camera_height) {
    const d_far = D_FAR_CAP;
    // negative top ray angle means it points up, positive means it points down
    const topRayAngle = toDeg(Math.atan((params.camera_height - params.target_height) / params.target_distance));
    const tilt = topRayAngle + vAngle / 2;
    const bottomRayAngle = topRayAngle + vAngle;
    if(bottomRayAngle <= 0){
      const status = 'invalid_both_rays_up';
      const d_near = 0;
      const w_near = 0;
      const w_far = 0;
      const area = 0;

      return {
        status: status,
        h_angle: hAngle,
        v_angle: vAngle,
        top_ray_angle: topRayAngle,
        tilt: tilt,
        d_near: d_near,
        d_far: d_far,
        w_near: w_near,
        w_far: w_far,
        area: area,
      }
      

    }

    const d_near = params.camera_height / Math.tan(toRad(bottomRayAngle));
    if(d_near > params.target_distance + 100){ // add some buffer to avoid edge cases where d_near is just slightly beyond target distance
      const status = 'invalid_dnear_beyond_target';
      const w_near = 0;
      const w_far = 0;
      const area = 0;

      return {
        status: status,
        h_angle: hAngle,
        v_angle: vAngle,
        top_ray_angle: topRayAngle,
        tilt: tilt,
        d_near: d_near,
        d_far: d_far,
        w_near: w_near,
        w_far: w_far,
        area: area,
      }
    }
    else{
      const status = 'valid';
      const w_near = 2 * d_near * Math.tan(toRad(hAngle / 2));
      const w_far = 2 * d_far * Math.tan(toRad(hAngle / 2));
      const area = 0.5 * (w_near + w_far) * (d_far - d_near); 
      return {
        status: status,
        h_angle: hAngle,
        v_angle: vAngle,
        top_ray_angle: topRayAngle,
        tilt: tilt,
        d_near: d_near,
        d_far: d_far,
        w_near: w_near,
        w_far: w_far,
        area: area,
      }
    }

  }

  // target at same height as camera case - need to cap d_far and set top ray angle to 0, tilt to half v_angle, and calculate d_near based on bottom ray angle


  else if (params.target_height === params.camera_height) {
    const d_far = D_FAR_CAP;
    const topRayAngle = 0;
    const tilt = vAngle / 2;
    const bottomRayAngle = topRayAngle + vAngle;
    const d_near = params.camera_height / Math.tan(toRad(bottomRayAngle));
    if(d_near > params.target_distance + 100){
      const status = 'invalid_dnear_beyond_target';
      const w_near = 0;
      const w_far = 0;
      const area = 0;

      return {
        status: status,
        h_angle: hAngle,
        v_angle: vAngle,
        top_ray_angle: topRayAngle,
        tilt: tilt,
        d_near: d_near,
        d_far: d_far,
        w_near: w_near,
        w_far: w_far,
        area: area,
      }
    }
    else{
      const status = 'valid_dfar_capped';
      const w_near = 2 * d_near * Math.tan(toRad(hAngle / 2));
    
      const w_far = 2 * d_far * Math.tan(toRad(hAngle / 2));
      const area = 0.5 * (w_near + w_far) * (d_far - d_near); 
      return {
        status: status,
        h_angle: hAngle,
        v_angle: vAngle,
        top_ray_angle: topRayAngle,
        tilt: tilt,
        d_near: d_near,
        d_far: d_far,
        w_near: w_near,
        w_far: w_far,
        area: area,
      }

  }
}
else{
  // target below camera case - standard calculations
  const topRayAngle = toDeg(Math.atan((params.camera_height - params.target_height) / params.target_distance));
  const tilt = topRayAngle + vAngle / 2;
  const bottomRayAngle = topRayAngle + vAngle;
  const d_far = params.camera_height / Math.tan(toRad(topRayAngle));
  const d_near = params.camera_height / Math.tan(toRad(bottomRayAngle));
  const w_near = 2 * d_near * Math.tan(toRad(hAngle / 2));
  const w_far = 2 * d_far * Math.tan(toRad(hAngle / 2));
  const area = 0.5 * (w_near + w_far) * (d_far - d_near); 
  const status = 'valid';
  return {
    status: status,
    h_angle: hAngle,
    v_angle: vAngle,
    top_ray_angle: topRayAngle,
    tilt: tilt,
    d_near: d_near,
    d_far: d_far,
    w_near: w_near,
    w_far: w_far,
    area: area,
  }
}


  



}