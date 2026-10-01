@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo xqksh-zxxq local server + MinerU proxy
echo ============================================
echo.

echo [1/3] Checking Python...
python --version
if errorlevel 1 (
  echo Python not found. Please install Python 3.10+ first.
  pause
  exit /b 1
)

echo [2/3] Checking dependencies...
python -c "import flask,requests" 2>nul
if errorlevel 1 (
  echo Installing dependencies...
  python -m pip install -r requirements-mineru.txt
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo [3/3] Starting same-origin web app and MinerU proxy...
echo Open: http://127.0.0.1:5500/index.html
echo Health: http://127.0.0.1:5500/health
echo.
set MINERU_PORT=5500
set MINERU_SERVE_APP=1
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5500/index.html"
python mineru_server.py
pause
