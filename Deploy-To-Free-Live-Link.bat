@echo off
title Publish LeaveEase to Live Web Link
echo ========================================================
echo       Publish LeaveEase to a Free Public Live Link
echo ========================================================
echo.
echo 1. Opening Netlify Drop in your default web browser...
start https://app.netlify.com/drop
echo.
echo 2. Opening the LeaveEase-Website-Export folder...
explorer.exe "%~dp0LeaveEase-Website-Export"
echo.
echo ========================================================
echo INSTRUCTIONS:
echo Drag and drop the opened 'LeaveEase-Website-Export' folder
echo directly into the Netlify Drop browser window.
echo.
echo Netlify will instantly create your public live website URL!
echo ========================================================
echo.
pause
