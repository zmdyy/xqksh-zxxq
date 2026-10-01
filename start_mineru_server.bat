@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [1/2] Checking Python dependencies...
python -c "import flask,requests" 2>nul
if errorlevel 1 (
  echo Installing MinerU proxy dependencies...
  python -m pip install -r requirements-mineru.txt
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
echo [2/2] Starting MinerU compatibility proxy at http://127.0.0.1:8765
python mineru_server.py
pause
