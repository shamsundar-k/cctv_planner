"""Tests for map drawing services, routes, and project authorization."""

from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

from beanie import PydanticObjectId
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from pymongo.errors import DuplicateKeyError
import pytest

from app.api_models.map_drawing import (
    DrawingStyle,
    MapDrawingCreate,
    MapDrawingUpdate,
    MarkerShape,
)
from app.core.deps import get_current_user
from app.mappers.map_drawing_mapper import to_map_drawing_response
from app.routers import map_drawings
from app.services import map_drawing_service


PROJECT_ID = PydanticObjectId("66584aef0f5f3e6d8f8a1234")
OWNER_ID = PydanticObjectId("66584aef0f5f3e6d8f8a5678")
OTHER_USER_ID = PydanticObjectId("66584aef0f5f3e6d8f8a9012")


def marker_shape() -> MarkerShape:
    return MarkerShape.model_validate(
        {
            "shape_type": "marker",
            "geometry": {
                "type": "Point",
                "coordinates": [77.5946, 12.9716],
            },
        }
    )


def drawing_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "uid": "drawing-1",
        "label": "Gate",
        "shape": marker_shape().model_dump(mode="json"),
    }
    payload.update(overrides)
    return payload


def drawing_record(**overrides: object) -> SimpleNamespace:
    now = datetime.now(timezone.utc)
    values: dict[str, object] = {
        "uid": "drawing-1",
        "label": "Gate",
        "purpose": "annotation",
        "shape": marker_shape(),
        "style": DrawingStyle(),
        "visible": True,
        "locked": False,
        "created_at": now,
        "updated_at": now,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def fake_user(user_id: PydanticObjectId = OWNER_ID) -> SimpleNamespace:
    return SimpleNamespace(id=user_id, system_role="user")


def fake_project(owner_id: PydanticObjectId = OWNER_ID) -> SimpleNamespace:
    return SimpleNamespace(
        id=PROJECT_ID,
        created_by=SimpleNamespace(ref=SimpleNamespace(id=owner_id)),
    )


@pytest.fixture
async def client() -> AsyncClient:
    app = FastAPI()
    app.include_router(map_drawings.router, prefix="/api/v1")

    async def current_user_override() -> SimpleNamespace:
        return fake_user()

    app.dependency_overrides[get_current_user] = current_user_override
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as test_client:
        yield test_client


def drawing_url(uid: str | None = None) -> str:
    base = f"/api/v1/projects/{PROJECT_ID}/drawings"
    return f"{base}/{uid}" if uid else base


async def test_crud_routes_return_expected_responses(
    monkeypatch: pytest.MonkeyPatch,
    client: AsyncClient,
) -> None:
    record = drawing_record()
    monkeypatch.setattr(
        map_drawing_service,
        "list_drawings",
        AsyncMock(return_value=[record]),
    )
    monkeypatch.setattr(
        map_drawing_service,
        "create_drawing",
        AsyncMock(return_value=record),
    )
    monkeypatch.setattr(
        map_drawing_service,
        "update_drawing",
        AsyncMock(return_value=drawing_record(label="Updated")),
    )
    monkeypatch.setattr(
        map_drawing_service,
        "delete_drawing",
        AsyncMock(return_value=None),
    )

    listed = await client.get(drawing_url())
    created = await client.post(drawing_url(), json=drawing_payload())
    updated = await client.patch(
        drawing_url("drawing-1"),
        json={"label": "Updated"},
    )
    deleted = await client.delete(drawing_url("drawing-1"))

    assert listed.status_code == 200
    assert listed.json()[0]["uid"] == "drawing-1"
    assert created.status_code == 201
    assert created.json()["shape"]["shape_type"] == "marker"
    assert updated.status_code == 200
    assert updated.json()["label"] == "Updated"
    assert deleted.status_code == 204
    assert deleted.content == b""


@pytest.mark.parametrize(
    ("method", "path", "service_name", "service_error", "expected_status"),
    [
        ("get", drawing_url(), "list_drawings", map_drawing_service.ProjectNotFoundError(), 404),
        ("get", drawing_url(), "list_drawings", map_drawing_service.ProjectAccessDeniedError(), 403),
        (
            "post",
            drawing_url(),
            "create_drawing",
            map_drawing_service.DuplicateDrawingUidError(),
            409,
        ),
        (
            "patch",
            drawing_url("missing"),
            "update_drawing",
            map_drawing_service.MapDrawingNotFoundError(),
            404,
        ),
        (
            "delete",
            drawing_url("missing"),
            "delete_drawing",
            map_drawing_service.MapDrawingNotFoundError(),
            404,
        ),
    ],
)
async def test_service_errors_are_translated_to_http_statuses(
    monkeypatch: pytest.MonkeyPatch,
    client: AsyncClient,
    method: str,
    path: str,
    service_name: str,
    service_error: Exception,
    expected_status: int,
) -> None:
    monkeypatch.setattr(
        map_drawing_service,
        service_name,
        AsyncMock(side_effect=service_error),
    )
    request = getattr(client, method)
    kwargs = {"json": drawing_payload()} if method == "post" else {}
    if method == "patch":
        kwargs = {"json": {"label": "Updated"}}

    response = await request(path, **kwargs)

    assert response.status_code == expected_status


@pytest.mark.parametrize(
    "payload",
    [
        {
            "uid": "bad-geometry",
            "shape": {
                "shape_type": "line",
                "geometry": {"type": "Point", "coordinates": [77, 12]},
            },
        },
        {
            "uid": "bad-discriminator",
            "shape": {
                "shape_type": "ellipse",
                "geometry": {"type": "Point", "coordinates": [77, 12]},
            },
        },
    ],
)
async def test_create_rejects_invalid_geometry_before_service_call(
    monkeypatch: pytest.MonkeyPatch,
    client: AsyncClient,
    payload: dict[str, object],
) -> None:
    create = AsyncMock()
    monkeypatch.setattr(map_drawing_service, "create_drawing", create)

    response = await client.post(drawing_url(), json=payload)

    assert response.status_code == 422
    create.assert_not_awaited()


@pytest.mark.parametrize("field", ["uid", "project", "created_at"])
async def test_patch_rejects_immutable_or_server_owned_fields(
    monkeypatch: pytest.MonkeyPatch,
    client: AsyncClient,
    field: str,
) -> None:
    update = AsyncMock()
    monkeypatch.setattr(map_drawing_service, "update_drawing", update)

    response = await client.patch(
        drawing_url("drawing-1"),
        json={field: "replacement"},
    )

    assert response.status_code == 422
    update.assert_not_awaited()


async def test_routes_require_authentication() -> None:
    app = FastAPI()
    app.include_router(map_drawings.router, prefix="/api/v1")

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as unauthenticated_client:
        response = await unauthenticated_client.get(drawing_url())

    assert response.status_code in {401, 403}


async def test_only_project_owner_can_access_drawings(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        map_drawing_service.Project,
        "get",
        AsyncMock(return_value=fake_project()),
    )

    with pytest.raises(map_drawing_service.ProjectAccessDeniedError):
        await map_drawing_service.get_project_for_owner(
            PROJECT_ID,
            fake_user(OTHER_USER_ID),
        )


async def test_missing_project_is_reported(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        map_drawing_service.Project,
        "get",
        AsyncMock(return_value=None),
    )

    with pytest.raises(map_drawing_service.ProjectNotFoundError):
        await map_drawing_service.get_project_for_owner(PROJECT_ID, fake_user())


async def test_update_is_scoped_to_project_and_replaces_complete_shape(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    project = fake_project()
    original = drawing_record()
    original.set = AsyncMock()
    refreshed = drawing_record(label="Refreshed")
    find_one = AsyncMock(side_effect=[original, refreshed])
    monkeypatch.setattr(
        map_drawing_service,
        "get_project_for_owner",
        AsyncMock(return_value=project),
    )
    monkeypatch.setattr(map_drawing_service.MapDrawingDocument, "find_one", find_one)
    replacement_shape = marker_shape().model_copy(
        update={
            "geometry": marker_shape().geometry.model_copy(
                update={"coordinates": (78.0, 13.0)}
            )
        }
    )

    result = await map_drawing_service.update_drawing(
        PROJECT_ID,
        "drawing-1",
        MapDrawingUpdate(shape=replacement_shape),
        fake_user(),
    )

    expected_query = {"project.$id": PROJECT_ID, "uid": "drawing-1"}
    assert find_one.await_args_list[0].args[0] == expected_query
    assert find_one.await_args_list[1].args[0] == expected_query
    updates = original.set.await_args.args[0]
    assert updates["shape"]["shape_type"] == "marker"
    assert updates["shape"]["geometry"]["coordinates"] == (78.0, 13.0)
    assert updates["updated_at"].tzinfo is timezone.utc
    assert result is refreshed


async def test_update_cannot_find_drawing_from_another_project(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        map_drawing_service,
        "get_project_for_owner",
        AsyncMock(return_value=fake_project()),
    )
    find_one = AsyncMock(return_value=None)
    monkeypatch.setattr(map_drawing_service.MapDrawingDocument, "find_one", find_one)

    with pytest.raises(map_drawing_service.MapDrawingNotFoundError):
        await map_drawing_service.update_drawing(
            PROJECT_ID,
            "drawing-in-another-project",
            MapDrawingUpdate(label="No access"),
            fake_user(),
        )

    assert find_one.await_args.args[0] == {
        "project.$id": PROJECT_ID,
        "uid": "drawing-in-another-project",
    }


async def test_duplicate_uid_is_translated_by_service(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        map_drawing_service,
        "get_project_for_owner",
        AsyncMock(return_value=fake_project()),
    )

    class DuplicateDrawing:
        def __init__(self, **values: object) -> None:
            self.__dict__.update(values)

        async def insert(self) -> None:
            raise DuplicateKeyError("duplicate")

    monkeypatch.setattr(map_drawing_service, "MapDrawingDocument", DuplicateDrawing)

    with pytest.raises(map_drawing_service.DuplicateDrawingUidError):
        await map_drawing_service.create_drawing(
            PROJECT_ID,
            MapDrawingCreate.model_validate(drawing_payload()),
            fake_user(),
        )


def test_mapper_excludes_mongo_and_project_fields() -> None:
    response = to_map_drawing_response(drawing_record(id="mongo-id", project="project"))

    assert response.uid == "drawing-1"
    assert "id" not in response.model_dump()
    assert "project" not in response.model_dump()
