@echo off
setlocal enabledelayedexpansion

:: ─────────────────────────────────────────────────────────
:: CONFIG — change if your paths are different
set PROJECT=C:\Users\hamex\OneDrive\Desktop\av-values
set CSV=AV_AIO.csv
set SCRIPT=updateUnitsFromCSV.js
:: ─────────────────────────────────────────────────────────

echo.
echo ========================================================
echo   AV Values - CSV -> MongoDB + units.json Sync Runner
echo ========================================================
echo.

:: Go to project dir
cd /d "%PROJECT%" || (echo ❌ Cannot cd into %PROJECT% & pause & exit /b 1)

:: Quick presence checks
if not exist "%SCRIPT%" (echo ❌ %SCRIPT% not found here. & dir *.js & pause & exit /b 1)
if not exist "%CSV%" (echo ❌ %CSV% not found here. & dir *.csv & pause & exit /b 1)

:: Node check
for /f "delims=" %%v in ('node -v 2^>nul') do set NODEVER=%%v
if not defined NODEVER (
  echo ❌ Node.js not found. Install from https://nodejs.org/ and retry.
  pause & exit /b 1
) else (
  echo ✅ Node %NODEVER% detected.
)

:: Install deps if missing (papaparse + mongodb)
call npm ls papaparse >nul 2>nul || (echo 📦 Installing papaparse... & call npm i papaparse -E)
call npm ls mongodb   >nul 2>nul || (echo 📦 Installing mongodb driver... & call npm i mongodb -E)

echo.
echo 🔎 CSV head (first 12 lines) just to confirm headers:
powershell -NoLogo -NoProfile -Command "Get-Content -TotalCount 12 '%CSV%'" || echo (Unable to preview CSV via PowerShell)

echo.
echo 🚀 Running %SCRIPT% ...
echo --------------------------------------------------------
node "%SCRIPT%"
set EXITCODE=%ERRORLEVEL%
echo --------------------------------------------------------

if %EXITCODE% NEQ 0 (
  echo ❌ Script exited with code %EXITCODE%.
  echo    If it says "Parsed 0 rows", verify the CSV really begins with:
  echo      Name,Value  (or)  Name,Value (RR)
  echo    and that the file name is exactly "%CSV%" in "%PROJECT%".
  echo.
  echo    To quickly re-check headers:
  echo    powershell -NoProfile -Command "Get-Content -TotalCount 20 '%CSV%'"
  echo.
  pause & exit /b %EXITCODE%
)

echo ✅ Finished.
pause
