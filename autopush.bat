@echo off
title Auto Push - AnimeVanguards-VVX
color 0a

echo ===================================
echo   Auto Push – AnimeVanguards-VVX
echo ===================================
echo.

set repoURL=https://github.com/Vaulted-Values-X/AnimeVanguards-VVX.git
set vercelURL=https://vvx-anime-vanguards.anime-vanguards-vvx.vercel.app

:: Check if there's a commit message text file
if exist commitmsg.txt (
    set /p msg=<commitmsg.txt
) else (
    set msg=Auto commit on %date% %time%
)

echo Committing with message: "%msg%"
git add -A
git commit -m "%msg%" >nul 2>&1

echo.
echo Pushing to remote...

:: Try pushing to main first
git push origin main >nul 2>&1
if %errorlevel% neq 0 (
    echo Main branch protected. Creating temporary branch...
    set branch=temp-%RANDOM%
    git push origin HEAD:%branch% >nul 2>&1
    echo.
    echo ✅ Pushed to new branch: %branch%
    echo 🔗 Open this to make a Pull Request:
    echo %repoURL%/compare/main...%branch%
) else (
    echo ✅ Push complete to main!
)

echo.
echo GitHub: %repoURL%
echo Vercel: %vercelURL%
echo.
pause
exit
