
@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title ShelfPOS Uninstaller

if exist "%~dp0Uninstall-ShelfPOS.ps1" (
  set "UNINSTALL_PS1=%~dp0Uninstall-ShelfPOS.ps1"
) else (
  set "UNINSTALL_PS1=%~dp0uninstall-shelfpos.ps1"
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%UNINSTALL_PS1%" %*
set EXITCODE=%ERRORLEVEL%
if %EXITCODE% NEQ 0 (
  echo.
  echo Uninstall failed. See messages above.
  pause
  exit /b %EXITCODE%
)
echo.
echo Uninstall finished.
pause
exit /b %EXITCODE%
