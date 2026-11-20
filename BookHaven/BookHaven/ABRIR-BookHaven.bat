@echo off
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8000
  python -m http.server 8000
  goto :fim
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files --user-data-dir="%TEMP%\bookhaven-chrome" "%~dp0index.html"
  goto :fim
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files --user-data-dir="%TEMP%\bookhaven-chrome" "%~dp0index.html"
  goto :fim
)
echo Abra o index.html no Firefox, ou instale o Python e rode este arquivo de novo.
pause
:fim
