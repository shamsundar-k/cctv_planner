from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="CCTV Survey Planner API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}
