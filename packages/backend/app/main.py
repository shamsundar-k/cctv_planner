"""FastAPI application entry point: lifespan wiring (DB + Redis), router registration, and health check."""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference

from app.core.database import close_db, init_db
from app.core.seed import seed_first_admin
from app.routers import admin, auth, camera_models, projects, camera_spec

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_first_admin()
    yield
    await close_db()


app = FastAPI(
    title="CCTV Survey Planner API",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(camera_models.router, prefix="/api/v1")
app.include_router(camera_spec.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}

@app.get("/scalar", include_in_schema=False)
def scalar_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="My API Docs",
    )
