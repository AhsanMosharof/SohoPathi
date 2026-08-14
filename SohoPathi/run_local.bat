@echo off
echo Starting Sohopathi locally...

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed! Please install Node.js first.
    pause
    exit /b
)

:: Inform about database
echo IMPORTANT: Make sure your local PostgreSQL database is running on localhost:5432
echo and that your server/.env DATABASE_URL points to localhost, not 'db'.
echo.

:: Start Backend
echo Starting Backend...
start "Sohopathi Backend" cmd /k "cd server && npm install && npx prisma db push && npm run dev"

:: Start Frontend
echo Starting Frontend...
start "Sohopathi Frontend" cmd /k "cd client && npm install && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
pause
