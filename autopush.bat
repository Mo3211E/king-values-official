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
)

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
pause
