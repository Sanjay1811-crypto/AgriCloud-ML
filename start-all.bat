@echo off
echo ========================================================
echo   Starting AgriCloud-ML Full-Stack Platform
echo ========================================================
echo.

echo Starting Backend Server on http://localhost:5000...
start "AgriCloud Backend (Port 5000)" cmd /k "cd backend && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend Dev Server on http://localhost:5173...
start "AgriCloud Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Both services are launching in separate windows!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ========================================================
