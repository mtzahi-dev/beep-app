@echo off
title Beep Launcher

rem If the server is already running, just open the browser
call :check
if %errorlevel%==0 goto open

rem Start the dev server minimized
start "Beep Server" /min cmd /c "cd /d C:\Users\12\lomi && npm run dev"

rem Wait for the server to come up (about 60 seconds max)
set /a tries=0
:wait
timeout /t 1 /nobreak >nul
call :check
if %errorlevel%==0 goto open
set /a tries+=1
if %tries% lss 60 goto wait
echo Could not start the Beep server. Check that npm is installed.
pause
exit /b 1

:open
start "" http://localhost:5199
exit /b 0

:check
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5199' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
exit /b %errorlevel%
