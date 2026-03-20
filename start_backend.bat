@echo off
setlocal

set "REPO_ROOT=%~dp0"
if "%REPO_ROOT:~-1%"=="\" set "REPO_ROOT=%REPO_ROOT:~0,-1%"

echo Starting backend...
cd /d "%REPO_ROOT%\packages\backend"

echo.
echo Backend ^> http://localhost:8000
echo.
echo Press Ctrl+C to stop.
echo.

uv run uvicorn app.main:app --reload
