# Map Drawing Backend Data Model Plan

## Goal

Model user-created map drawings as validated, project-scoped MongoDB documents.
The model must preserve both GeoJSON interoperability and application-level
shape semantics so a rectangle remains editable as a rectangle after it is
loaded again.

This phase defines only the Pydantic models, Beanie document, MongoDB indexes,
database registration, and model tests. It does not add HTTP routes, services,
frontend state, or map rendering changes.

## Design Decisions

### One collection for all drawing shapes

Store lines, polygons, rectangles, circles, markers, and future drawing types
in one `map_drawings` collection. Do not create a collection per shape type.
Every drawing has the same project ownership, presentation, visibility, audit,
and persistence lifecycle; only its shape payload varies.

### Use a discriminated union for shape data

Store shape-specific data inside a `shape` field. Its `shape_type` value is the
Pydantic discriminator:

```json
{
  "shape": {
    "shape_type": "circle",
    "geometry": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "radius_metres": 25.0
  }
}
```

This prevents invalid combinations such as a `line` containing Point geometry
or a `circle` without a radius. It also gives the generated JSON Schema and the
future frontend API client a stable discriminator.

### Keep shape and business purpose separate

`shape_type` describes how geometry is created and edited. `purpose` describes
what the drawing means. For example, both a polygon and a rectangle may be an
exclusion zone.

Initial purposes:

- `annotation`
- `coverage_zone`
- `exclusion_zone`
- `site_boundary`

Do not persist ruler measurements in the first version. They remain temporary
map UI artifacts unless a later requirement explicitly makes them project
data.

### Follow GeoJSON coordinate order

All stored coordinates use `[longitude, latitude]`, not the existing
`GeoLocation` object's `{latitude, longitude}` representation. Keeping native
GeoJSON order avoids custom conversion in exports, MongoDB geospatial queries,
and third-party GIS tools. Conversion to Leaflet's `[latitude, longitude]`
belongs at the frontend rendering boundary.

## Proposed Pydantic Model

Add an `app/api_models/map_drawing` package with separate geometry, style, and
drawing modules.

### GeoJSON primitives

Define a reusable validated position type containing exactly two finite
numbers:

```python
Position = tuple[float, float]  # longitude, latitude
```

Validation requirements:

- longitude is between `-180` and `180`;
- latitude is between `-90` and `90`;
- both values must be finite;
- altitude and other extra ordinates are out of scope for version 1.

Define strict GeoJSON models whose `type` field is a `Literal`:

```python
class PointGeometry(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: Position


class LineStringGeometry(BaseModel):
    type: Literal["LineString"] = "LineString"
    coordinates: list[Position]


class PolygonGeometry(BaseModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: list[list[Position]]
```

Set `extra="forbid"` on all public drawing models so misspelled or stale fields
cannot silently enter MongoDB.

### Shape variants

Define the following initial variants:

```python
class LineShape(BaseModel):
    shape_type: Literal["line"] = "line"
    geometry: LineStringGeometry


class PolygonShape(BaseModel):
    shape_type: Literal["polygon"] = "polygon"
    geometry: PolygonGeometry


class RectangleShape(BaseModel):
    shape_type: Literal["rectangle"] = "rectangle"
    geometry: PolygonGeometry


class CircleShape(BaseModel):
    shape_type: Literal["circle"] = "circle"
    geometry: PointGeometry
    radius_metres: float


class MarkerShape(BaseModel):
    shape_type: Literal["marker"] = "marker"
    geometry: PointGeometry
```

Combine them with a Pydantic discriminator:

```python
DrawingShape = Annotated[
    LineShape | PolygonShape | RectangleShape | CircleShape | MarkerShape,
    Field(discriminator="shape_type"),
]
```

Version 1 may expose only line, polygon, and rectangle in the UI while still
having backend models ready for circle and marker data. Text annotations should
be deferred until text formatting and accessibility requirements are known.

### Geometry validation

Apply validation inside the corresponding geometry or shape model:

- A line contains between 2 and 2,000 positions.
- A polygon contains between 1 and 16 rings.
- Every polygon ring contains between 4 and 2,001 positions.
- The first and last position of every polygon ring must be equal.
- A ring must have at least three distinct non-closing positions.
- A rectangle contains exactly one ring with four distinct corners plus the
  repeated closing position.
- A circle radius is finite and greater than zero, with a conservative maximum
  of 100,000 metres.
- Reject non-finite values, empty rings, malformed coordinate nesting, and
  geometry types that do not match `shape_type`.

Do not attempt to prove that rectangle edges form exact right angles in
longitude/latitude space. The frontend drawing tool is responsible for creating
a rectangle, while the backend enforces its closed four-corner structure.
Spherical right-angle validation would be fragile and would reject valid map
projections at some latitudes.

Self-intersection validation is also deferred. The current drawing tool already
prevents new self-intersecting polygons, and robust server-side topology checks
would require a deliberate Shapely policy for holes, touching edges, and repair.

### Style model

Use a structured style model instead of an unrestricted dictionary:

```python
class DrawingStyle(BaseModel):
    stroke_color: str = "#3B82F6"
    stroke_width: float = 3.0
    stroke_opacity: float = 1.0
    line_style: Literal["solid", "dashed", "dotted"] = "solid"
    fill_color: str = "#3B82F6"
    fill_opacity: float = 0.16
```

Validation requirements:

- colours use six-digit hexadecimal notation;
- stroke width is between 1 and 12 pixels;
- opacity values are between 0 and 1.

Keep layer-specific strings such as Leaflet `dashArray` out of persisted data.
The frontend maps `line_style` to renderer-specific options.

### API/domain schemas

Define schemas now even though routes are out of scope:

```python
class MapDrawingBase(BaseModel):
    uid: str
    label: str = ""
    purpose: DrawingPurpose = DrawingPurpose.ANNOTATION
    shape: DrawingShape
    style: DrawingStyle = Field(default_factory=DrawingStyle)
    visible: bool = True
    locked: bool = False


class MapDrawingCreate(MapDrawingBase):
    pass


class MapDrawingUpdate(BaseModel):
    label: str | None = None
    purpose: DrawingPurpose | None = None
    shape: DrawingShape | None = None
    style: DrawingStyle | None = None
    visible: bool | None = None
    locked: bool | None = None


class MapDrawingResponse(MapDrawingBase):
    created_at: datetime
    updated_at: datetime
```

Rules:

- `uid` is frontend-generated, non-blank, at most 120 characters, and immutable.
- `label` is at most 120 characters.
- Updating geometry replaces the complete `shape` value atomically. Do not
  support partial coordinate patches that could leave invalid geometry.
- `project`, audit timestamps, and any future creator identity are server-owned
  and therefore absent from create/update request bodies.

## MongoDB Document

Add `app/db_schemas/map_drawing.py`:

```python
class MapDrawingDocument(Document):
    uid: str
    project: Link[Project]
    label: str = ""
    purpose: DrawingPurpose = DrawingPurpose.ANNOTATION
    shape: DrawingShape
    style: DrawingStyle = Field(default_factory=DrawingStyle)
    visible: bool = True
    locked: bool = False
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "map_drawings"
        indexes = [
            IndexModel(
                [("project.$id", ASCENDING), ("uid", ASCENDING)],
                unique=True,
            ),
            IndexModel(
                [("project.$id", ASCENDING), ("updated_at", DESCENDING)]
            ),
        ]
```

Use timezone-aware UTC datetimes, following the existing project and camera
placement documents.

Do not add a `2dsphere` index in this phase. Listing drawings by project does
not need one, and a geospatial index should be introduced alongside a concrete
spatial-query requirement. The nested `shape.geometry` structure remains valid
GeoJSON and can be indexed later.

## File Changes

1. Add `packages/backend/app/api_models/map_drawing/__init__.py`.
2. Add `packages/backend/app/api_models/map_drawing/geometry.py` for Position
   and strict GeoJSON models.
3. Add `packages/backend/app/api_models/map_drawing/shape.py` for the
   discriminated shape variants.
4. Add `packages/backend/app/api_models/map_drawing/style.py` for drawing
   presentation fields.
5. Add `packages/backend/app/api_models/map_drawing/map_drawing.py` for base,
   create, update, and response schemas.
6. Add `packages/backend/app/db_schemas/map_drawing.py` for the Beanie document.
7. Register `MapDrawingDocument` in the `init_beanie` model list in
   `packages/backend/app/core/database.py`.
8. Add `packages/backend/tests/test_map_drawing_models.py`.

No router is imported into `app/main.py` in this phase.

## Testing Plan

Model tests should not require a running MongoDB instance. Cover:

- successful parsing and serialization of every supported shape variant;
- discriminator selection based on `shape_type`;
- rejection of a missing or unknown discriminator;
- rejection of mismatched GeoJSON types;
- longitude, latitude, finiteness, and nesting validation;
- minimum and maximum line position counts;
- polygon closure, distinct-point, ring-count, and point-count rules;
- rectangle ring structure;
- circle radius bounds;
- style defaults and field bounds;
- forbidden extra fields;
- create/update separation and immutable `uid` behaviour;
- JSON output retains native GeoJSON `[longitude, latitude]` order;
- Beanie collection name and required index definitions.

Run:

```text
cd packages/backend && uv run pytest tests/test_map_drawing_models.py
cd packages/backend && uv run pytest
```

Also compile the application package to catch registration/import cycles.

## Implementation Sequence

1. Implement and test the Position and GeoJSON geometry models.
2. Implement each shape variant and the discriminated union.
3. Add the purpose enum and structured style model.
4. Add create, update, and response schemas.
5. Add the Beanie document and indexes.
6. Register the document during database initialization.
7. Complete focused model tests, then run the backend suite.

Keeping geometry validation independent from Beanie first makes failures easier
to diagnose and allows the same Pydantic types to be reused by future routes,
imports, exports, and service code.

## Migration and Compatibility

No data migration is required. The current frontend drawings live only in the
Leaflet map instance and are never persisted. The previously removed zone API
client did not have a corresponding backend model or router in the current
application.

Use the new collection name `map_drawings` rather than reviving `zones`. A
drawing may be an annotation or boundary rather than a zone, so `map_drawings`
is the more accurate long-term domain name.

## Acceptance Criteria

- Every supported drawing shape parses through one discriminated Pydantic
  union and serializes without losing shape semantics.
- Invalid coordinate ranges, geometry nesting, shape/geometry combinations,
  polygon rings, rectangles, circles, and styles are rejected.
- A Beanie `MapDrawingDocument` stores a project link and the validated drawing
  data in the `map_drawings` collection.
- `(project, uid)` uniqueness is enforced by a MongoDB index.
- The model is registered in Beanie initialization.
- Focused model tests and the existing backend test suite pass.
- No CRUD route, router registration, frontend code, or live-map behaviour is
  added or changed.

## Explicitly Out of Scope

- CRUD routes and route authorization tests
- frontend types, Zustand state, and API hooks
- Leaflet rendering, selection, editing, and deletion
- integration with the project Save button
- persisted ruler measurements
- text annotations and rich text formatting
- polygon self-intersection or topology repair
- spatial queries and MongoDB `2dsphere` indexes
- drawing import/export and schema migration tooling
