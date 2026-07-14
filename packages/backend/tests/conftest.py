import os

os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/cctv_planner_test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")
os.environ.setdefault("FIRST_ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("FIRST_ADMIN_PASSWORD", "test-password")
