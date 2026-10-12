@echo off
chcp 65001 >nul
title Moworks Motion - cap nhat
rem Git and Python installed from a Claude chat may be missing from PATH outside the app (it keeps that PATH change in its own copy):
rem the usual install folders are tried too. Run from a chat, engine\update.py opens this file again outside the app (engine\outside.py).
where git >nul 2>nul
if not errorlevel 1 goto git_ok
for %%G in ("%ProgramFiles%\Git\cmd" "%LOCALAPPDATA%\Programs\Git\cmd") do if exist "%%~G\git.exe" set "PATH=%%~G;%PATH%"
where git >nul 2>nul
if not errorlevel 1 goto git_ok
echo  [LOI] May chua co Git: tai tai https://git-scm.com/download/win , cai xong bam dup lai file nay.
if defined AIMK_DONE >"%AIMK_DONE%" echo 1
echo.
echo Press any key to close . . .
pause >nul
exit /b 1
:git_ok
set "PY=python"
call :check
if not errorlevel 1 goto run
set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
call :check
if not errorlevel 1 goto run
echo  [LOI] May chua co Python 3.11 tro len: bam dup install.bat truoc.
if defined AIMK_DONE >"%AIMK_DONE%" echo 1
echo.
echo Press any key to close . . .
pause >nul
exit /b 1
:run
"%PY%" "%~dp0engine\update.py" %*
echo.
echo Press any key to close . . .
pause >nul
exit /b

:check
"%PY%" -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>nul
exit /b %errorlevel%
