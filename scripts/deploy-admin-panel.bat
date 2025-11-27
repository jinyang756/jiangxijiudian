@echo off
echo === Jiangxi Hotel Admin Panel Deployment Tool ===
echo.

echo Checking Supabase CLI...
npx supabase --version >nul 2>&1
if %errorlevel% == 0 (
    echo Supabase CLI is available
) else (
    echo Supabase CLI not found
    echo Please visit https://supabase.com/docs/guides/cli/getting-started
    exit /b 1
)

echo.
echo Checking admin-panel directory...
if exist "admin-panel\index.html" (
    echo Found admin-panel directory
) else (
    echo admin-panel directory not found
    exit /b 1
)

echo.
echo === Deployment Instructions ===
echo 1. Login to Supabase:
echo    npx supabase login
echo.
echo 2. Deploy to Supabase static hosting:
echo    cd admin-panel
echo    npx supabase deploy
echo.
echo Or manually upload files via Supabase Dashboard
echo.
echo Security Recommendations:
echo - Set up authentication for the admin panel
echo - Use HTTPS to protect data transmission
echo - Limit access to the admin panel
echo - Regularly update access tokens