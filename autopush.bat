@echo off
echo ---------------------------------------
echo 🔁 AutoPush to GitHub + Vercel
echo ---------------------------------------

:: Ensure you're in the project directory
cd /d "%~dp0"

:: Make sure Git is initialized
if not exist ".git" (
    echo ❌ Git repository not found.
    echo Initializing new repository...
    git init
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

:: Check current branch
for /f "delims=" %%b in ('git branch --show-current') do set BRANCH=%%b
if "%BRANCH%"=="" (
    echo⚙️ No branch detected, defaulting to main...
    git checkout -b main
) else (
    echo ✅ Current branch: %BRANCH%
)

:: Sync remote origin
git remote remove origin 2>nul
git remote add origin https://github.com/Vaulted-Values-X/AnimeVanguards-VVX.git

:: Stage all changes
echo 🧩 Adding all new/modified files...
git add .

:: Commit changes
set /p MSG=💬 Commit message (press Enter for default):
if "%MSG%"=="" set MSG=Auto update
git commit -m "%MSG%"

:: Pull remote main to merge latest updates
git fetch origin main
git pull origin main --rebase

:: Push changes forcefully to ensure sync
echo 🚀 Pushing to GitHub main branch...
git push -u origin main --force

:: Deploy trigger info
echo ---------------------------------------
echo ✅ Push complete! 
echo Vercel will auto-build your latest commit.
echo ---------------------------------------
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
