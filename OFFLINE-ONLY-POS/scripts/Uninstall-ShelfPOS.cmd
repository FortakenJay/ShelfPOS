@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title ShelfPOS Uninstaller

net session >nul 2>&1
if %errorLevel% NEQ 0 (
  echo.
  echo Administrator rights are required.
  echo Requesting elevation — approve the UAC prompt...
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uninstall-ShelfPOS.ps1" %*
set EXITCODE=%ERRORLEVEL%
if %EXITCODE% NEQ 0 (
  echo.
  echo Uninstall failed. See messages above.
  pause
)
exit /b %EXITCODE%
