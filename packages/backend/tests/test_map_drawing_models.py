"""Unit tests for map drawing validation and persistence metadata."""

import math
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.api_models.map_drawing import (
    CircleShape,
    DrawingPurpose,
    DrawingStyle,
    LineShape,
    MapDrawingCreate,
    MapDrawingResponse,
    MapDrawingUpdate,
    MarkerShape,
    PolygonShape,
    RectangleShape,
)
from app.db_schemas.map_drawing import MapDrawingDocument


def point(coordinates: list[float] | None = None) -> dict:
    return {
        "type": "Point",
        "coordinates": [77.5946, 12.9716] if coordinates is None else coordinates,
    }


def line(coordinates: list[list[float]] | None = None) -> dict:
    return {
        "type": "LineString",
        "coordinates": (
            [[77.0, 12.0], [78.0, 13.0]]
            if coordinates is None
            else coordinates
        ),
    }


def polygon(rings: list[list[list[float]]] | None = None) -> dict:
    return {
        "type": "Polygon",
        "coordinates": (
            [[[77.0, 12.0], [78.0, 12.0], [78.0, 13.0], [77.0, 12.0]]]
            if rings is None
            else rings
        ),
    }


def drawing(shape: dict, **overrides: object) -> dict:
    value = {"uid": "drawing-1", "shape": shape}
    value.update(overrides)
    return value


@pytest.mark.parametrize(
    ("shape", "expected_type"),
    [
        ({"shape_type": "line", "geometry": line()}, LineShape),
        ({"shape_type": "polygon", "geometry": polygon()}, PolygonShape),
        (
            {
                "shape_type": "rectangle",
                "geometry": polygon(
                    [
                        [
                            [77.0, 12.0],
                            [78.0, 12.0],
                            [78.0, 13.0],
                            [77.0, 13.0],
                            [77.0, 12.0],
                        ]
                    ]
                ),
            },
            RectangleShape,
        ),
        (
            {"shape_type": "circle", "geometry": point(), "radius_metres": 25},
            CircleShape,
        ),
        ({"shape_type": "marker", "geometry": point()}, MarkerShape),
    ],
)
def test_discriminator_parses_and_serializes_each_shape(shape, expected_type) -> None:
    model = MapDrawingCreate.model_validate(drawing(shape))

    assert isinstance(model.shape, expected_type)
    assert model.model_dump(mode="json")["shape"] == shape


@pytest.mark.parametrize(
    "shape",
    [
        {"geometry": line()},
        {"shape_type": "ellipse", "geometry": point()},
    ],
)
def test_missing_or_unknown_shape_discriminator_is_rejected(shape: dict) -> None:
    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(drawing(shape))


@pytest.mark.parametrize(
    "shape",
    [
        {"shape_type": "line", "geometry": point()},
        {"shape_type": "polygon", "geometry": line()},
        {"shape_type": "circle", "geometry": polygon(), "radius_metres": 25},
        {"shape_type": "marker", "geometry": line()},
    ],
)
def test_shape_rejects_mismatched_geometry_type(shape: dict) -> None:
    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(drawing(shape))


@pytest.mark.parametrize(
    "coordinates",
    [
        [181, 0],
        [-181, 0],
        [0, 91],
        [0, -91],
        [math.inf, 0],
        [0, math.nan],
        [77],
        [77, 12, 10],
        {"longitude": 77, "latitude": 12},
    ],
)
def test_position_validation_rejects_invalid_coordinates(coordinates) -> None:
    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(
            drawing({"shape_type": "marker", "geometry": point(coordinates)})
        )


@pytest.mark.parametrize("count", [1, 2_001])
def test_line_rejects_position_counts_outside_bounds(count: int) -> None:
    coordinates = [[77.0, 12.0]] * count

    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(
            drawing({"shape_type": "line", "geometry": line(coordinates)})
        )


@pytest.mark.parametrize("count", [2, 2_000])
def test_line_accepts_position_counts_at_bounds(count: int) -> None:
    coordinates = [[77.0, 12.0]] * count

    model = MapDrawingCreate.model_validate(
        drawing({"shape_type": "line", "geometry": line(coordinates)})
    )

    assert len(model.shape.geometry.coordinates) == count


@pytest.mark.parametrize(
    "rings",
    [
        [],
        [
            [[77.0, 12.0], [78.0, 12.0], [78.0, 13.0], [77.0, 12.0]]
        ]
        * 17,
        [[[77.0, 12.0], [78.0, 12.0], [77.0, 12.0]]],
        [[[77.0, 12.0]] * 2_002],
        [[[77.0, 12.0], [78.0, 12.0], [78.0, 13.0], [77.0, 13.0]]],
        [[[77.0, 12.0], [78.0, 12.0], [77.0, 12.0], [77.0, 12.0]]],
    ],
)
def test_polygon_rejects_invalid_ring_structure(rings) -> None:
    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(
            drawing({"shape_type": "polygon", "geometry": polygon(rings)})
        )


def test_polygon_accepts_ring_and_position_count_bounds() -> None:
    minimum_ring = [[77.0, 12.0], [78.0, 12.0], [78.0, 13.0], [77.0, 12.0]]
    maximum_ring = (
        [[77.0 + index / 100_000, 12.0] for index in range(2_000)]
        + [[77.0, 12.0]]
    )

    one_ring = PolygonShape.model_validate(
        {"shape_type": "polygon", "geometry": polygon([minimum_ring])}
    )
    sixteen_rings = PolygonShape.model_validate(
        {"shape_type": "polygon", "geometry": polygon([minimum_ring] * 16)}
    )
    maximum_positions = PolygonShape.model_validate(
        {"shape_type": "polygon", "geometry": polygon([maximum_ring])}
    )

    assert len(one_ring.geometry.coordinates) == 1
    assert len(sixteen_rings.geometry.coordinates) == 16
    assert len(maximum_positions.geometry.coordinates[0]) == 2_001


@pytest.mark.parametrize(
    "rings",
    [
        [
            [[77, 12], [78, 12], [78, 13], [77, 13], [77, 12]],
            [[77.2, 12.2], [77.3, 12.2], [77.3, 12.3], [77.2, 12.2]],
        ],
        [[[77, 12], [78, 12], [78, 13], [77, 12]]],
        [[[77, 12], [78, 12], [78, 13], [78, 13], [77, 12]]],
    ],
)
def test_rectangle_requires_one_ring_and_four_distinct_corners(rings) -> None:
    with pytest.raises(ValidationError):
        RectangleShape.model_validate(
            {"shape_type": "rectangle", "geometry": polygon(rings)}
        )


@pytest.mark.parametrize("radius", [0, -1, 100_001, math.inf, math.nan])
def test_circle_rejects_invalid_radius(radius: float) -> None:
    with pytest.raises(ValidationError):
        CircleShape.model_validate(
            {
                "shape_type": "circle",
                "geometry": point(),
                "radius_metres": radius,
            }
        )


@pytest.mark.parametrize("radius", [0.0001, 100_000])
def test_circle_accepts_radius_bounds(radius: float) -> None:
    model = CircleShape.model_validate(
        {"shape_type": "circle", "geometry": point(), "radius_metres": radius}
    )

    assert model.radius_metres == radius


def test_style_defaults() -> None:
    assert DrawingStyle().model_dump() == {
        "stroke_color": "#3B82F6",
        "stroke_width": 3.0,
        "stroke_opacity": 1.0,
        "line_style": "solid",
        "fill_color": "#3B82F6",
        "fill_opacity": 0.16,
    }


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("stroke_color", "blue"),
        ("stroke_color", "#ABC"),
        ("fill_color", "#GG0000"),
        ("stroke_width", 0.9),
        ("stroke_width", 12.1),
        ("stroke_width", math.inf),
        ("stroke_opacity", -0.1),
        ("stroke_opacity", 1.1),
        ("fill_opacity", math.nan),
        ("line_style", "dash-array"),
    ],
)
def test_style_rejects_invalid_values(field: str, value) -> None:
    with pytest.raises(ValidationError):
        DrawingStyle.model_validate({field: value})


@pytest.mark.parametrize(
    "payload",
    [
        drawing(
            {"shape_type": "marker", "geometry": point()},
            stale_field=True,
        ),
        drawing(
            {
                "shape_type": "marker",
                "geometry": {**point(), "altitude": 10},
            }
        ),
        drawing(
            {"shape_type": "marker", "geometry": point()},
            style={"renderer_option": "5 5"},
        ),
    ],
)
def test_public_models_forbid_extra_fields(payload: dict) -> None:
    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(payload)


@pytest.mark.parametrize("uid", ["", "   ", "x" * 121])
def test_create_rejects_invalid_uid(uid: str) -> None:
    with pytest.raises(ValidationError):
        MapDrawingCreate.model_validate(
            drawing({"shape_type": "marker", "geometry": point()}, uid=uid)
        )


def test_update_cannot_change_uid_or_server_owned_fields() -> None:
    for forbidden_field, value in [
        ("uid", "replacement"),
        ("project", "project-id"),
        ("created_at", datetime.now(timezone.utc)),
    ]:
        with pytest.raises(ValidationError):
            MapDrawingUpdate.model_validate({forbidden_field: value})


def test_update_replaces_and_validates_the_complete_shape() -> None:
    update = MapDrawingUpdate.model_validate(
        {"shape": {"shape_type": "marker", "geometry": point()}}
    )

    assert isinstance(update.shape, MarkerShape)
    with pytest.raises(ValidationError):
        MapDrawingUpdate.model_validate({"shape": {"radius_metres": 10}})


def test_response_timestamps_and_native_geojson_coordinate_order() -> None:
    now = datetime.now(timezone.utc)
    response = MapDrawingResponse.model_validate(
        drawing(
            {"shape_type": "marker", "geometry": point([77.5946, 12.9716])},
            purpose=DrawingPurpose.SITE_BOUNDARY,
            created_at=now,
            updated_at=now,
        )
    )

    dumped = response.model_dump(mode="json")
    assert dumped["shape"]["geometry"]["coordinates"] == [77.5946, 12.9716]
    assert dumped["purpose"] == "site_boundary"
    assert response.created_at.tzinfo is not None


def test_map_drawing_document_collection_and_indexes() -> None:
    assert MapDrawingDocument.Settings.name == "map_drawings"

    indexes = [index.document for index in MapDrawingDocument.Settings.indexes]
    assert indexes[0]["key"] == {"project.$id": 1, "uid": 1}
    assert indexes[0]["unique"] is True
    assert indexes[1]["key"] == {"project.$id": 1, "updated_at": -1}
    assert all("2dsphere" not in index["key"].values() for index in indexes)


@pytest.mark.asyncio
async def test_map_drawing_document_is_registered_with_beanie(monkeypatch) -> None:
    from app.core import database

    registered_models = []

    class FakeMotorClient:
        admin = None

        class Database:
            name = "test"

        def __init__(self, _uri: str) -> None:
            self.admin = self

        async def command(self, command_name: str) -> None:
            assert command_name == "ping"

        def get_default_database(self) -> object:
            return self.Database()

    async def fake_init_beanie(*, database: object, document_models: list) -> None:
        assert database is not None
        registered_models.extend(document_models)

    monkeypatch.setattr(
        database.motor.motor_asyncio,
        "AsyncIOMotorClient",
        FakeMotorClient,
    )
    monkeypatch.setattr(database, "init_beanie", fake_init_beanie)

    await database.init_db()

    assert MapDrawingDocument in registered_models
