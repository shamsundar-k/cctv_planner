@echo off
setlocal

set "REPO_ROOT=%~dp0"
set "REPO_ROOT=%REPO_ROOT:~0,-1%"

echo Starting frontend...
cd /d "%REPO_ROOT%\packages\frontend"
start /b pnpm dev
set FRONTEND_PID=%ERRORLEVEL%

echo.
echo Frontend ^> http://localhost:5173
echo.
echo Press Ctrl+C to stop.

pause >nul
