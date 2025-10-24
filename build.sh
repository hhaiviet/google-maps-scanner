#!/bin/bash
# Build script for Google Maps Scanner Pro Extension

echo "🚀 Building Google Maps Scanner Pro Extension..."

# Create build directory
mkdir -p build
mkdir -p dist

# Copy extension files to build directory
echo "📦 Copying extension files..."
cp manifest.json build/
cp *.html build/
cp *.js build/
cp -r icons build/ 2>/dev/null || echo "ℹ️  No icons directory found"

# Create zip file for Chrome Web Store
echo "🗜️  Creating extension package..."
cd build
zip -r ../dist/google-maps-scanner-extension.zip .
cd ..

# Create source code package (for review)
echo "📋 Creating source code package..."
zip -r dist/google-maps-scanner-source.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "build/*" \
  -x "dist/*" \
  -x "*.DS_Store" \
  -x "*.log"

# Validate manifest
echo "✅ Validating manifest.json..."
node -e "
  try {
    const manifest = require('./manifest.json');
    console.log('✅ Manifest is valid JSON');
    console.log('📋 Extension name:', manifest.name);
    console.log('🔢 Version:', manifest.version);
    console.log('🎯 Manifest version:', manifest.manifest_version);
    
    // Check required fields
    const required = ['name', 'version', 'manifest_version', 'action'];
    const missing = required.filter(field => !manifest[field]);
    
    if (missing.length > 0) {
      console.log('❌ Missing required fields:', missing);
      process.exit(1);
    }
    
    console.log('✅ All required fields present');
  } catch (error) {
    console.log('❌ Invalid manifest.json:', error.message);
    process.exit(1);
  }
"

# Check file sizes
echo "📊 Build statistics:"
echo "Extension package: $(du -h dist/google-maps-scanner-extension.zip | cut -f1)"
echo "Source package: $(du -h dist/google-maps-scanner-source.zip | cut -f1)"

# List files in build
echo "📁 Files in build:"
ls -la build/

echo "🎉 Build completed successfully!"
echo "📦 Extension package: dist/google-maps-scanner-extension.zip"
echo "📋 Source package: dist/google-maps-scanner-source.zip"
echo ""
echo "Next steps:"
echo "1. Test the extension by loading dist/google-maps-scanner-extension.zip"
echo "2. Upload to Chrome Web Store for review"
echo "3. Submit source code if requested by review team"