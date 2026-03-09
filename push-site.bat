@echo off
cd /d C:\Users\Administrator\Desktop\kodindigiapu-main

set /p msg=Anna commit-viesti: 

git add .
git diff --cached --quiet
if %errorlevel%==0 (
    echo Ei uusia muutoksia commitattavaksi.
) else (
    git commit -m "%msg%"
)

git pull --rebase origin main
git push

pause