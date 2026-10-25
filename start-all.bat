@echo off
echo ========================================================
echo   Starting AgriCloud-ML Full-Stack Platform
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Python ML Inference Engine on http://localhost:8000...
    start "AgriCloud ML Engine (Port 8000)" cmd /k "cd ml-service && python run.py"
    timeout /t 2 /nobreak >nul
)

echo Starting Backend Server on http://localhost:5000...
start "AgriCloud Backend (Port 5000)" cmd /k "cd backend && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend Dev Server on http://localhost:5173...
start "AgriCloud Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   AgriCloud-ML services launching!
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo   ML Engine: http://localhost:8000
echo ========================================================
