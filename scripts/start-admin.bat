@echo off
setlocal

REM Change directory to the project root
cd /d %~dp0..\

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

REM Start Next.js dev server in a new window if not already running
start "ChoiceMemo Dev" cmd /k "npm run dev"

REM Give the dev server a moment to boot before opening the browser
if not "%1"=="--no-wait" (
  timeout /t 5 /nobreak >nul
)

REM Resolve Chrome path (x64 or x86)
set "chromePath=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%chromePath%" set "chromePath=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%chromePath%" (
  start "" "%chromePath%" "http://localhost:3000/admin"
) else (
  echo Could not find Chrome. Please open http://localhost:3000/admin manually.
)

endlocal
