import { http, HttpResponse } from "msw";

const project = {
  id: "project-001",
  name: "Downtown Parking Survey",
  description: "Camera coverage plan for the west parking structure.",
  center_lat: 40.7128,
  center_lng: -74.006,
  default_zoom: 18,
  created_by_id: "user-001",
  camera_count: 8,
  created_at: "2024-03-10T09:00:00Z",
  updated_at: "2024-04-01T11:45:00Z",
};

const cameraSpec = {
  id: "camera-001",
  name: "Perimeter 4K Bullet",
  manufacturer: "Axis",
  model: "P1468-LE",
  camera_type: "bullet",
  lens_spec: {
    lens_type: "varifocal",
    focal_length: { min: 3.9, max: 10 },
    h_fov: { min: 38, max: 96 },
    v_fov: { min: 21, max: 53 },
  },
  sensor_spec: {
    resolution: { horizontal: 3840, vertical: 2160 },
    megapixel: 8,
    sensor_size: '1/2"',
  },
  ir_range: 40,
  created_at: "2024-03-01T08:00:00Z",
  updated_at: "2024-03-20T08:00:00Z",
};

export const mswHandlers = {
  auth: [
    http.post("/api/v1/auth/login", () =>
      HttpResponse.json({ detail: "Invalid email or password" }, { status: 401 })
    ),
  ],
  projects: [
    http.get("/api/v1/projects", () => HttpResponse.json([project])),
    http.get("/api/v1/projects/:id", () => HttpResponse.json(project)),
    http.post("/api/v1/projects", async ({ request }) => {
      const body = (await request.json()) as Partial<typeof project>;
      return HttpResponse.json(
        {
          ...project,
          ...body,
          id: "project-created",
          created_at: "2024-04-01T12:00:00Z",
          updated_at: "2024-04-01T12:00:00Z",
        },
        { status: 201 }
      );
    }),
  ],
  cameras: [
    http.get("/api/v1/camera-specs", () => HttpResponse.json([cameraSpec])),
    http.get("/api/v1/camera-specs/:id", () => HttpResponse.json(cameraSpec)),
  ],
};
