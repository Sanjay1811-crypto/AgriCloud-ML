@echo off
echo ========================================================
echo   Pushing AgriCloud-ML to GitHub (Sanjay1811-crypto)
echo ========================================================
echo.
cd /d "C:\Users\prabh\.gemini\antigravity\scratch\AgriCloud-ML"

echo Current remote:
git remote -v
echo.

echo Pushing branch 'main' to origin...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS! Project pushed to https://github.com/Sanjay1811-crypto/AgriCloud-ML
    echo ========================================================
) else (
    echo ========================================================
    echo   Note: If you got "Repository not found", make sure you have
    echo   created the empty repo at https://github.com/new
    echo ========================================================
)
echo.
pause
