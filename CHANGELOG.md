# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-24

### Added
- 🎉 Initial release của Google Maps Scanner Pro
- ✨ Auto-scroll tự động để load thêm kết quả
- 📊 Thu thập dữ liệu đầy đủ (tên, địa chỉ, phone, website, rating, reviews, etc.)
- 💾 Export dữ liệu ra CSV và JSON format
- 🎯 2 chế độ scan: Basic Mode và Full Mode
- 💪 Lưu trữ dữ liệu trong Chrome Storage
- 🔄 Tránh trùng lặp tự động
- 📈 Real-time progress tracking
- 📝 Activity logs chi tiết
- 🛠️ Debug tools cho developers
- 📚 Hướng dẫn cài đặt và sử dụng chi tiết

### Features
- Scan từ 10 đến 500+ địa điểm
- Tùy chỉnh tốc độ scan (500ms - 5000ms)
- Stop/Resume bất cứ lúc nào
- Advanced element finder
- Phone number debug tools
- Selector fix guides

### Documentation
- README.md với hướng dẫn đầy đủ
- INSTALL_GUIDE.md
- QUICKSTART.md
- PHONE_DEBUG_GUIDE.md
- SELECTOR_FIX_GUIDE.md
- TIPS_AND_TRICKS.md
- PROJECT_SUMMARY.md

### Technical
- Manifest V3 compatibility
- Support Google Maps Vietnam (google.com.vn)
- Chrome Storage API integration
- Content scripts optimization
- Background service worker

## [Unreleased]

### Planned
- [ ] Multi-language support
- [ ] Export to Excel format
- [ ] Batch processing
- [ ] API integration
- [ ] Advanced filtering options
- [ ] Custom templates
- [ ] Scheduling scans

---

## How to Update

### For Users
1. Chrome sẽ tự động update extension
2. Hoặc manual update từ Chrome Web Store

### For Developers
1. Pull latest changes: `git pull origin main`
2. Check CHANGELOG.md for breaking changes
3. Update extension in Chrome: `chrome://extensions/` > Reload

## Version Numbering

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)