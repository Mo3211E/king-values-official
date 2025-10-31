@echo off
chcp 65001 >nul
title Auto Push – AnimeVanguards-VVX
color 0a

echo =====================================
echo       Auto Push – AnimeVanguards-VVX
echo =====================================
echo.

REM --- Check for commit message file ---
set "msgFile=commitmsg.txt"
if exist "%msgFile%" (
    set /p msg=<"%msgFile%"
) else (
    set msg=Auto commit on %date% %time%
    echo %msg%>"%msgFile%"
)

REM --- Stage, commit, and push ---
git add -A
git commit -m "%msg%" >nul 2>&1

echo Pushing to remote...
git push origin main >nul 2>&1
if %errorlevel% neq 0 (
    echo Main branch protected. Creating temporary branch...
    set branch=temp-%RANDOM%
    git push origin HEAD:%branch% >nul 2>&1
    echo.
    echo ✅ Pushed to new branch: %branch%
    echo 🔗 Opening Pull Request link...
    echo https://github.com/Vaulted-Values-X/AnimeVanguards-VVX/compare/main...%branch%
    start https://github.com/Vaulted-Values-X/AnimeVanguards-VVX/compare/main...%branch%
) else (
    echo ✅ Push complete to main!
)

echo.
echo GitHub: https://github.com/Vaulted-Values-X/AnimeVanguards-VVX
echo Vercel: https://vvx-anime-vanguards-vvx.vercel.app
echo.
echo Press any key to continue . . .
pause >nul
exit
