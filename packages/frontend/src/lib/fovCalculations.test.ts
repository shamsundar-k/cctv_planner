import { computeFovCartesian } from './fovCalculations';

const result = computeFovCartesian({
  camera_height: 5,
  target_distance: 50,
  target_height: 2,
  focal_length_min: 12,
  focal_length_max: 40,
  h_fov_wide: 24.2,
  h_fov_tele: 8.3,
  v_fov_wide: 18,
  v_fov_tele: 6.3,
  focal_length_chosen: 26,
});

console.log('Result:', JSON.stringify(result, null, 2));
