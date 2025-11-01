@echo off
:: === AutoPush with PR Support for Protected Branch ===
:: Runs inside your project folder

:: Step 1: Save all current changes
echo Adding all files...
git add .

:: Step 2: Create commit
set datetime=%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%
set datetime=%datetime: =0%
set branch=update-%datetime%

git commit -m "Auto update at %datetime%"
echo.

:: Step 3: Create and switch to new branch
echo Creating branch: %branch%
git checkout -b %branch%

:: Step 4: Push new branch to origin
echo Pushing branch to GitHub...
git push origin %branch%
echo.

:: Step 5: Create pull request to main using GitHub CLI
echo Opening pull request...
gh pr create --base main --head %branch% --title "Auto Update %datetime%" --body "Automatic update triggered by autopush.bat"

:: Step 6: Done
echo.
echo ✅ Pull request created successfully! 
echo 🔗 Open GitHub to review and merge changes into main.
pause
