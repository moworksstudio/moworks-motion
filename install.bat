@echo off
chcp 65001 >nul
title Moworks Motion - cai dat
echo.
echo  Cai dat Moworks Motion tren may nay (lam 1 lan, can internet).
echo.
set "YES="
rem A fresh Windows 11 has a "python" that only opens the Microsoft Store (2D rebuild test, 09/10/2026): "where python" found it, so the
rem check passed and the install failed. The check now runs Python; the user install of Python 3.12 is the fallback, then winget.
rem Run from a Claude chat, engine\install.py opens this file again in a window outside the app (AIMK_LOG / AIMK_DONE: engine\outside.py).
rem One question in all (user 10/10/2026): with Python missing, yes to installing Python is yes to the kit too (--yes).
set "PY=python"
call :check
if not errorlevel 1 goto run
set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
call :check
if not errorlevel 1 goto run
echo  [!] May chua co Python 3.11 tro len. Lenh "python" o day co the chi la loi tat mo Microsoft Store, khong phai Python that.
where winget >nul 2>nul
if errorlevel 1 goto manual
choice /c CK /n /m "  Cai Python 3.12 (winget, chi cho tai khoan nay) roi cai Moworks Motion? [C = co, K = khong] "
if errorlevel 2 goto manual
set "YES=--yes"
winget install -e --id Python.Python.3.12 --scope user --accept-package-agreements --accept-source-agreements --override "/quiet InstallAllUsers=0 PrependPath=1 Include_launcher=1 InstallLauncherAllUsers=0"
call :check
if not errorlevel 1 goto run
:manual
echo  Tai Python 3.12 tai https://www.python.org/downloads/ , khi cai nho tick "Add python.exe to PATH",
echo  roi bam dup lai file nay.
if defined AIMK_DONE >"%AIMK_DONE%" echo 1
echo.
echo Press any key to close . . .
pause >nul
exit /b 1
:run
"%PY%" --version
"%PY%" "%~dp0engine\install.py" %* %YES%
echo.
echo Press any key to close . . .
pause >nul
exit /b

:check
"%PY%" -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>nul
exit /b %errorlevel%
