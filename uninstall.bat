@echo off
chcp 65001 >nul
title Moworks Motion - go cai dat
rem Moves what install.bat put on this machine to the Recycle Bin, asking item by item (engine\uninstall.py); the kit folder itself is the
rem last question. Runs from %TEMP% so the kit folder is free to go; the last line runs Python, pause and "(goto) 2>nul" as one line: the
rem batch ends without cmd reading this file again (it is in the bin by then). Run from a Claude chat, engine\uninstall.py opens this file again outside the app.
cd /d "%TEMP%"
set "PY=python"
call :check
if not errorlevel 1 goto run
set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
call :check
if not errorlevel 1 goto run
echo  [LOI] Khong thay Python 3.11 tro len: go tay theo docs\GUIDE.md, muc "Go cai dat".
if defined AIMK_DONE >"%AIMK_DONE%" echo 1
echo.
echo Press any key to close . . .
pause >nul
exit /b 1
:check
"%PY%" -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>nul
exit /b %errorlevel%
:run
"%PY%" -B "%~dp0engine\uninstall.py" %* & echo. & echo Press any key to close . . . & pause >nul & (goto) 2>nul
