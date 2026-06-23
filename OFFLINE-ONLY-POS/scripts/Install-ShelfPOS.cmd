@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title ShelfPOS Sync Installer

net session >nul 2>&1
if %errorLevel% NEQ 0 (
  echo.
  echo Administrator rights are required.
  echo Requesting elevation - approve the UAC prompt...
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 0
)

if exist "%~dp0Install-ShelfPOS.ps1" (
  set "INSTALL_PS1=%~dp0Install-ShelfPOS.ps1"
) else (
  set "INSTALL_PS1=%~dp0install-shelfpos.ps1"
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_PS1%" %*
set EXITCODE=%ERRORLEVEL%
if %EXITCODE% NEQ 0 (
  echo.
  echo Install failed. See messages above.
  pause
)
exit /b %EXITCODE%
