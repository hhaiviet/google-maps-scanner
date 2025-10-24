@echo off
REM Build script for Google Maps Scanner Pro Extension (Windows)

echo 🚀 Building Google Maps Scanner Pro Extension...

REM Create build directories
if not exist "build" mkdir build
if not exist "dist" mkdir dist

REM Clean previous build
if exist "build\*" del /q build\*
if exist "build\icons" rmdir /s /q build\icons

echo 📦 Copying extension files...

REM Copy extension files to build directory
copy manifest.json build\ >nul
copy *.html build\ >nul 2>nul
copy *.js build\ >nul 2>nul

REM Copy icons directory if exists
if exist "icons" (
    mkdir build\icons
    copy icons\* build\icons\ >nul
    echo ✅ Icons copied
) else (
    echo ℹ️  No icons directory found
)

echo 🗜️  Creating extension package...

REM Create zip file using PowerShell
powershell -Command "Compress-Archive -Path 'build\*' -DestinationPath 'dist\google-maps-scanner-extension.zip' -Force"

echo 📋 Creating source code package...

REM Create source code zip (exclude build, dist, .git, node_modules)
powershell -Command "Get-ChildItem -Path '.' -Exclude @('build','dist','.git','node_modules','*.log') | Compress-Archive -DestinationPath 'dist\google-maps-scanner-source.zip' -Force"

echo ✅ Validating manifest.json...

REM Validate manifest using Node.js (if available)
node -e "try { const manifest = require('./manifest.json'); console.log('✅ Manifest is valid JSON'); console.log('📋 Extension name:', manifest.name); console.log('🔢 Version:', manifest.version); } catch (error) { console.log('❌ Invalid manifest.json:', error.message); }" 2>nul || (
    echo ⚠️  Node.js not found, skipping manifest validation
)

echo 📊 Build statistics:
dir dist\*.zip

echo 📁 Files in build:
dir build\

echo.
echo 🎉 Build completed successfully!
echo 📦 Extension package: dist\google-maps-scanner-extension.zip  
echo 📋 Source package: dist\google-maps-scanner-source.zip
echo.
echo Next steps:
echo 1. Test the extension by loading dist\google-maps-scanner-extension.zip
echo 2. Upload to Chrome Web Store for review
echo 3. Submit source code if requested by review team
echo.
pause