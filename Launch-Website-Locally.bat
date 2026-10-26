@echo off
title LeaveEase Website
echo ========================================================
echo               Starting LeaveEase Website...
echo ========================================================
echo.
cd /d "%~dp0project"
start http://localhost:4173
npm.cmd run preview -- --port 4173
pause
