@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting optional MinerU fallback service...
start "MinerU fallback" cmd /k "%~dp0start_mineru_server.bat"
timeout /t 2 /nobreak >nul
echo Starting web app at http://127.0.0.1:5500
start "" http://127.0.0.1:5500/index.html
python -m http.server 5500
pause
