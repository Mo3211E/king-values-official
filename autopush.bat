@echo off
:: === AutoPush without GitHub CLI ===
:: Works even if main is protected or CLI isn't installed

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo 🔄 Cleaning up local branches...
git fetch --prune
git branch | findstr /v "main" | findstr /v "*" > tmp_branches.txt
for /f "tokens=*" %%b in (tmp_branches.txt) do (
    git branch -D %%b >nul 2>&1
)
del tmp_branches.txt >nul 2>&1
echo ✅ Local branches cleaned.
echo.

for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%c-%%a-%%b
for /f "tokens=1-3 delims=: " %%a in ("%time%") do set t=%%a%%b
set "branch=update-%d%-%t%"
set "branch=%branch: =0%"

echo 🚀 Creating branch: %branch%
git checkout main
git pull origin main
git checkout -b %branch%
echo.

echo 💾 Adding all changes...
git add .
git commit -m "Auto update %branch%" || echo (No new commits)
echo.

echo 📤 Pushing branch to GitHub...
git push origin %branch% --force
if errorlevel 1 (
    echo ❌ Push failed. You might not have permission.
    pause
    exit /b
)
echo ✅ Pushed successfully.
echo.

:: Get remote URL
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set repoURL=%%i

:: Convert SSH or HTTPS remote URL into browser link
set repoURL=%repoURL:git@github.com:=% 
set repoURL=%repoURL:https://github.com/=% 
set repoURL=https://github.com/%repoURL:.git=%

echo 🌐 Opening Pull Request page...
start "" "%repoURL%/compare/main...%branch%"

echo ✅ Pull request page opened. Click "Create Pull Request" to finish.
pause
