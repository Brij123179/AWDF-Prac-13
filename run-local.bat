@echo off
title Practical 13: Capstone Platform (Portfolio + TaskFlow Pro)
echo ====================================================================
echo   Launching Practical 13 Full-Stack Application
echo   Charotar University of Science and Technology (CHARUSAT)
echo   Developer: Brij Patel
echo ====================================================================
echo.

echo 🚀 Starting Express Backend on http://localhost:5000 ...
start "Practical 13 Backend" cmd /k "cd /d %~dp0backend && npm start"

echo ⚡ Starting Vite React Frontend on http://localhost:5173 ...
start "Practical 13 Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ⏳ Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo 🌐 Opening Web Browser to http://localhost:5173 ...
start http://localhost:5173

echo.
echo ====================================================================
echo  Servers are running in background console windows!
echo  Frontend URL: http://localhost:5173
echo  Backend URL:  http://localhost:5000/api
echo ====================================================================

