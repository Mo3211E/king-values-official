@echo off
cd /d "C:\Users\hamex\OneDrive\Desktop\av-values"

git add .
git commit -m "Auto Update"
git push -f https://github.com/Vaulted-Values-X/AnimeVanguards-VVX.git main

echo.
echo ================================
echo   Auto Push - AnimeVanguards-VVX
echo ================================
echo Push Complete!
echo.
echo GitHub: https://github.com/Vaulted-Values-X/AnimeVanguards-VVX
echo Vercel: https://vvx-anime-vanguards.anime-vanguards-vvx.vercel.app
echo.
pause
