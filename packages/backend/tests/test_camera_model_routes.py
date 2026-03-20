"""Integration tests for camera model routes.

Endpoints covered
-----------------
GET    /api/v1/camera-models
POST   /api/v1/camera-models
GET    /api/v1/camera-models/{model_id}
PUT    /api/v1/camera-models/{model_id}
DELETE /api/v1/camera-models/{model_id}

Token-saving pattern
--------------------
TestCreateCameraModel stores the IDs of created models in class variables so
later test classes (Get, Update, Delete) can reference them without
re-creating.  Tests within each class are numbered where ordering matters.

Authorisation rules under test
--------------------------------
- Any authenticated user can GET (list or single).
- Only admins can POST, PUT, DELETE.
- Unauthenticated requests (no Authorization header) → 401
- Requests with an invalid/expired JWT              → 401
- Requests by a regular (non-admin) user on write endpoints → 403
"""

import pytest_asyncio
from httpx import AsyncClient

from app.models.camera_model import CameraModel

# ---------------------------------------------------------------------------
# Name prefix shared by every camera model created in this module.
# Used for targeted pre/post-run cleanup so test pollution is avoided.
# ---------------------------------------------------------------------------

_NAME_PREFIX = "IntTest-Cam"

# ---------------------------------------------------------------------------
# Minimal valid payloads reused across tests
# ---------------------------------------------------------------------------

#: Fixed-lens bullet camera — focal/FOV min == max per schema constraint.
_FIXED_PAYLOAD: dict = {
    "name": f"{_NAME_PREFIX}-Fixed",
    "manufacturer": "Acme Corp",
    "model_number": "ACM-F100",
    "camera_type": "bullet",
    "focal_length_min": 4.0,
    "focal_length_max": 4.0,   # fixed lens: must equal min
    "h_fov_min": 90.0,
    "h_fov_max": 90.0,          # fixed lens: must equal min
    "v_fov_min": 50.0,
    "v_fov_max": 50.0,          # fixed lens: must equal min
    "lens_type": "fixed",
    "resolution_h": 1920,
    "resolution_v": 1080,
    "ir_range": 30.0,
}

#: Varifocal PTZ camera — all optional sensor fields populated for coverage.
_VARIFOCAL_PAYLOAD: dict = {
    "name": f"{_NAME_PREFIX}-Varifocal",
    "manufacturer": "Acme Corp",
    "model_number": "ACM-V200",
    "camera_type": "ptz",
    "focal_length_min": 2.8,
    "focal_length_max": 12.0,
    "h_fov_min": 30.0,
    "h_fov_max": 100.0,
    "v_fov_min": 20.0,
    "v_fov_max": 60.0,
    "lens_type": "varifocal",
    "resolution_h": 2560,
    "resolution_v": 1440,
    "megapixels": 3.68,
    "sensor_size": "1/2.8\"",
    "min_illumination": 0.01,
    "wdr": True,
    "wdr_db": 120.0,
    "ir_range": 30.0,
}

# Reusable fake JWT for "invalid token" tests
_FAKE_JWT = "eyJhbGciOiJIUzI1NiJ9.e30.fake-signature"


# ---------------------------------------------------------------------------
# Module fixture — cleanup before and after the full test module
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture(scope="module", autouse=True)
async def cleanup_cameras():
    """Remove any camera models whose name starts with _NAME_PREFIX.

    Pre-run cleanup guards against stale data from a previous failed run.
    Uses raw Motor because Beanie is not initialized in the test process.
    """
    import motor.motor_asyncio
    from app.core.config import settings
    
    motor_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
    db = motor_client.get_default_database()
    col = db["camera_models"]
    
    await col.delete_many({"name": {"$regex": f"^{_NAME_PREFIX}"}})

    yield

    await col.delete_many({"name": {"$regex": f"^{_NAME_PREFIX}"}})
    motor_client.close()


# ---------------------------------------------------------------------------
# List camera models
# ---------------------------------------------------------------------------


class TestListCameraModels:
    """GET /api/v1/camera-models"""

    async def test_list_returns_array(self, client: AsyncClient, admin_tokens: dict):
        resp = await client.get(
            "/api/v1/camera-models",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_list_regular_user_success(
        self, client: AsyncClient, regular_user_token: str
    ):
        """Regular (non-admin) users can list camera models."""
        resp = await client.get(
            "/api/v1/camera-models",
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_list_no_auth(self, client: AsyncClient):
        """Missing Authorization header → 401."""
        resp = await client.get("/api/v1/camera-models")
        assert resp.status_code == 401

    async def test_list_invalid_token(self, client: AsyncClient):
        resp = await client.get(
            "/api/v1/camera-models",
            headers={"Authorization": f"Bearer {_FAKE_JWT}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Create camera model
# ---------------------------------------------------------------------------


class TestCreateCameraModel:
    """POST /api/v1/camera-models

    The IDs of successfully created models are saved in class variables so
    later test classes (Get, Update, Delete) can reference them.
    """

    # Class-level stores populated by the first two tests.
    _fixed_model_id: str = ""
    _varifocal_model_id: str = ""

    async def test_01_create_fixed_camera_success(
        self, client: AsyncClient, admin_tokens: dict
    ):
        resp = await client.post(
            "/api/v1/camera-models",
            json=_FIXED_PAYLOAD,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == _FIXED_PAYLOAD["name"]
        assert data["lens_type"] == "fixed"
        assert data["focal_length_min"] == data["focal_length_max"]
        assert data["h_fov_min"] == data["h_fov_max"]
        assert data["v_fov_min"] == data["v_fov_max"]
        # Save for downstream classes
        TestCreateCameraModel._fixed_model_id = data["id"]

    async def test_02_create_varifocal_camera_success(
        self, client: AsyncClient, admin_tokens: dict
    ):
        resp = await client.post(
            "/api/v1/camera-models",
            json=_VARIFOCAL_PAYLOAD,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == _VARIFOCAL_PAYLOAD["name"]
        assert data["lens_type"] == "varifocal"
        assert data["wdr"] is True
        assert data["wdr_db"] == 120.0
        assert data["ir_range"] == 30.0
        # Save for downstream classes
        TestCreateCameraModel._varifocal_model_id = data["id"]

    async def test_create_response_shape(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """All expected response fields must be present on a created model."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "test_01 must run first"

        resp = await client.get(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        for field in (
            "id", "name", "manufacturer", "model_number", "camera_type",
            "focal_length_min", "focal_length_max",
            "h_fov_min", "h_fov_max", "v_fov_min", "v_fov_max",
            "lens_type", "ir_cut_filter",
            "resolution_h", "resolution_v",
            "wdr", "created_by", "created_at", "updated_at",
        ):
            assert field in data, f"Response missing field: {field}"

    async def test_create_created_by_matches_caller(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """created_by in the response must be a non-empty string (the caller's user ID)."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "test_01 must run first"

        resp = await client.get(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        data = resp.json()
        assert isinstance(data["created_by"], str)
        assert len(data["created_by"]) > 0

    async def test_create_missing_required_fields(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Omitting mandatory lens/sensor fields must return 422."""
        resp = await client.post(
            "/api/v1/camera-models",
            json={"name": "Incomplete Camera"},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_focal_length_max_less_than_min(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """focal_length_max < focal_length_min violates schema — must return 422."""
        payload = {**_VARIFOCAL_PAYLOAD, "focal_length_min": 12.0, "focal_length_max": 2.8}
        resp = await client.post(
            "/api/v1/camera-models",
            json=payload,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_h_fov_max_less_than_min(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """h_fov_max < h_fov_min must be rejected."""
        payload = {**_VARIFOCAL_PAYLOAD, "h_fov_min": 100.0, "h_fov_max": 30.0}
        resp = await client.post(
            "/api/v1/camera-models",
            json=payload,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_v_fov_max_less_than_min(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """v_fov_max < v_fov_min must be rejected."""
        payload = {**_VARIFOCAL_PAYLOAD, "v_fov_min": 60.0, "v_fov_max": 20.0}
        resp = await client.post(
            "/api/v1/camera-models",
            json=payload,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_fixed_lens_mismatched_focal_lengths(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Fixed lens with focal_length_min != focal_length_max must be rejected."""
        payload = {**_FIXED_PAYLOAD, "focal_length_min": 4.0, "focal_length_max": 6.0}
        resp = await client.post(
            "/api/v1/camera-models",
            json=payload,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_fixed_lens_mismatched_h_fov(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Fixed lens with h_fov_min != h_fov_max must be rejected."""
        payload = {**_FIXED_PAYLOAD, "h_fov_min": 70.0, "h_fov_max": 90.0}
        resp = await client.post(
            "/api/v1/camera-models",
            json=payload,
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_create_regular_user_forbidden(
        self, client: AsyncClient, regular_user_token: str
    ):
        """Non-admin users must not be able to create camera models → 403."""
        resp = await client.post(
            "/api/v1/camera-models",
            json=_FIXED_PAYLOAD,
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 403

    async def test_create_no_auth(self, client: AsyncClient):
        """Missing Authorization header → 401."""
        resp = await client.post(
            "/api/v1/camera-models",
            json=_FIXED_PAYLOAD,
        )
        assert resp.status_code == 401

    async def test_create_invalid_token(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/camera-models",
            json=_FIXED_PAYLOAD,
            headers={"Authorization": f"Bearer {_FAKE_JWT}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Get single camera model
# ---------------------------------------------------------------------------


class TestGetCameraModel:
    """GET /api/v1/camera-models/{model_id}"""

    async def test_get_model_success(
        self, client: AsyncClient, admin_tokens: dict
    ):
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.get(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == model_id
        assert data["name"] == _FIXED_PAYLOAD["name"]

    async def test_get_regular_user_success(
        self, client: AsyncClient, regular_user_token: str
    ):
        """Regular (non-admin) users can fetch a single camera model."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.get(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["id"] == model_id

    async def test_get_not_found(self, client: AsyncClient, admin_tokens: dict):
        """A valid-format but non-existent ObjectId must return 404."""
        fake_id = "000000000000000000000001"
        resp = await client.get(
            f"/api/v1/camera-models/{fake_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()

    async def test_get_no_auth(self, client: AsyncClient):
        model_id = TestCreateCameraModel._fixed_model_id
        resp = await client.get(f"/api/v1/camera-models/{model_id}")
        assert resp.status_code == 401

    async def test_get_invalid_token(self, client: AsyncClient):
        model_id = TestCreateCameraModel._fixed_model_id
        resp = await client.get(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {_FAKE_JWT}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Update camera model
# ---------------------------------------------------------------------------


class TestUpdateCameraModel:
    """PUT /api/v1/camera-models/{model_id}"""

    async def test_01_update_single_field(
        self, client: AsyncClient, admin_tokens: dict
    ):
        model_id = TestCreateCameraModel._varifocal_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        new_name = f"{_NAME_PREFIX}-Varifocal-Updated"
        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={"name": new_name},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == new_name

    async def test_02_update_multiple_fields(
        self, client: AsyncClient, admin_tokens: dict
    ):
        model_id = TestCreateCameraModel._varifocal_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={"manufacturer": "NewBrand", "model_number": "NB-999", "wdr_db": 130.0},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["manufacturer"] == "NewBrand"
        assert data["model_number"] == "NB-999"
        assert data["wdr_db"] == 130.0

    async def test_update_empty_body_is_noop(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """An empty update body must succeed and leave the model unchanged."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        before_resp = await client.get(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        before = before_resp.json()

        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        after = resp.json()
        assert after["name"] == before["name"]
        assert after["focal_length_min"] == before["focal_length_min"]

    async def test_update_invalid_focal_length_order(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Patching so that focal_length_max < focal_length_min must return 422."""
        model_id = TestCreateCameraModel._varifocal_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={"focal_length_min": 20.0, "focal_length_max": 1.0},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 422

    async def test_update_not_found(
        self, client: AsyncClient, admin_tokens: dict
    ):
        fake_id = "000000000000000000000001"
        resp = await client.put(
            f"/api/v1/camera-models/{fake_id}",
            json={"name": "Ghost Camera"},
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 404

    
    async def test_update_regular_user_forbidden(
        self, client: AsyncClient, regular_user_token: str
    ):
        """Non-admin users must not be able to update camera models → 403."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={"name": "Regular User Update"},
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 403

    async def test_update_no_auth(self, client: AsyncClient):
        model_id = TestCreateCameraModel._fixed_model_id
        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={"name": "No Auth Update"},
        )
        assert resp.status_code == 401

    async def test_update_invalid_token(self, client: AsyncClient):
        model_id = TestCreateCameraModel._fixed_model_id
        resp = await client.put(
            f"/api/v1/camera-models/{model_id}",
            json={"name": "Bad Token Update"},
            headers={"Authorization": f"Bearer {_FAKE_JWT}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Delete camera model
# ---------------------------------------------------------------------------


class TestDeleteCameraModel:
    """DELETE /api/v1/camera-models/{model_id}

    Auth / forbidden / not-found tests run before the successful deletion so
    the model still exists when those assertions are made.  The actual deletion
    tests run last and verify the model cannot be fetched afterwards.
    """

    async def test_delete_not_found(
        self, client: AsyncClient, admin_tokens: dict
    ):
        fake_id = "000000000000000000000001"
        resp = await client.delete(
            f"/api/v1/camera-models/{fake_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 404



    async def test_delete_regular_user_forbidden(
        self, client: AsyncClient, regular_user_token: str
    ):
        """Non-admin users must not be able to delete camera models → 403."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.delete(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {regular_user_token}"},
        )
        assert resp.status_code == 403

    async def test_delete_no_auth(self, client: AsyncClient):
        model_id = TestCreateCameraModel._fixed_model_id
        resp = await client.delete(f"/api/v1/camera-models/{model_id}")
        assert resp.status_code == 401

    async def test_delete_invalid_token(self, client: AsyncClient):
        model_id = TestCreateCameraModel._fixed_model_id
        resp = await client.delete(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {_FAKE_JWT}"},
        )
        assert resp.status_code == 401

    async def test_delete_varifocal_model_success(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Owner deletes a model — expect 204 with empty body."""
        model_id = TestCreateCameraModel._varifocal_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.delete(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 204
        assert resp.content == b""

    async def test_delete_already_deleted_returns_404(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Re-deleting an already-deleted model must return 404."""
        model_id = TestCreateCameraModel._varifocal_model_id
        assert model_id, "test_delete_varifocal_model_success must run first"

        resp = await client.delete(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 404

    async def test_deleted_model_no_longer_in_list(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Deleted model must not appear in the listing."""
        model_id = TestCreateCameraModel._varifocal_model_id
        assert model_id, "test_delete_varifocal_model_success must run first"

        resp = await client.get(
            "/api/v1/camera-models",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 200
        ids = [m["id"] for m in resp.json()]
        assert model_id not in ids

    async def test_delete_fixed_model_success(
        self, client: AsyncClient, admin_tokens: dict
    ):
        """Delete the remaining fixed-lens model — also expect 204."""
        model_id = TestCreateCameraModel._fixed_model_id
        assert model_id, "TestCreateCameraModel tests must run first"

        resp = await client.delete(
            f"/api/v1/camera-models/{model_id}",
            headers={"Authorization": f"Bearer {admin_tokens['access_token']}"},
        )
        assert resp.status_code == 204
        assert resp.content == b""
