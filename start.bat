@echo off
echo Starting English Quest...
cd /d "%~dp0"

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo Starting Next.js development server...
start "English Quest Server" cmd /c "npm run dev"

echo Waiting for server to be ready...
:waitloop
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "$tcp = New-Object Net.Sockets.TcpClient; try { $tcp.Connect('localhost', 3000); $tcp.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 goto waitloop

start "" http://localhost:3000
echo Server is running at http://localhost:3000
pause
