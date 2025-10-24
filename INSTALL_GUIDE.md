# 📖 Hướng Dẫn Cài Đặt Chi Tiết

## 🎯 Yêu Cầu Hệ Thống
- ✅ Google Chrome phiên bản 88 trở lên
- ✅ Kết nối Internet
- ✅ Tài khoản Google (để dùng Google Maps)

---

## 🚀 Bước 1: Chuẩn Bị Files

### Option A: Download từ GitHub (Khuyến nghị)
```bash
git clone https://github.com/your-repo/google-maps-scanner.git
cd google-maps-scanner
```

### Option B: Tạo thủ công
1. Tạo folder mới tên `google-maps-scanner`
2. Copy tất cả các files sau vào folder:
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `content.js`
   - `background.js`
   - `README.md`
3. Tạo subfolder `icons` và copy 3 file icon vào

---

## 🔧 Bước 2: Load Extension vào Chrome

### 2.1. Mở Chrome Extensions Page
Có 3 cách:
- **Cách 1**: Gõ `chrome://extensions/` vào address bar
- **Cách 2**: Menu (⋮) → More Tools → Extensions
- **Cách 3**: Nhấn `Ctrl+Shift+E` (Windows) hoặc `Cmd+Shift+E` (Mac)

### 2.2. Bật Developer Mode
1. Tìm switch **"Developer mode"** ở góc trên bên phải
2. Toggle nó sang ON (màu xanh)

![Developer Mode](https://i.imgur.com/example.png)

### 2.3. Load Extension
1. Click nút **"Load unpacked"** (góc trên bên trái)
2. Chọn folder `google-maps-scanner` bạn vừa tạo
3. Click **"Select Folder"**

### 2.4. Xác Nhận Cài Đặt Thành Công
Bạn sẽ thấy:
- ✅ Extension xuất hiện trong danh sách
- ✅ Icon 🗺️ trên toolbar
- ✅ Không có lỗi màu đỏ

---

## 🎨 Bước 3: Pin Extension (Tùy chọn nhưng khuyến nghị)

1. Click vào icon puzzle 🧩 trên Chrome toolbar
2. Tìm "Google Maps Scanner Pro"
3. Click vào icon pin 📌 để ghim extension
4. Bây giờ icon sẽ luôn hiển thị trên toolbar

---

## ✅ Bước 4: Test Extension

### 4.1. Mở Google Maps
1. Vào [https://www.google.com/maps](https://www.google.com/maps)
2. Tìm kiếm một thứ gì đó, ví dụ: "Quán cà phê Hà Nội"

### 4.2. Mở Extension
1. Click vào icon 🗺️ trên toolbar
2. Popup sẽ hiện ra với giao diện đẹp

### 4.3. Test Scan Nhỏ
1. Để tất cả settings mặc định
2. Thay đổi "Số lượng tối đa" thành `10` (để test nhanh)
3. Click **"Bắt Đầu Scan"**
4. Quan sát:
   - Status bar thay đổi
   - Số "Đã Scan" tăng dần
   - Progress bar chạy

### 4.4. Export Test Data
1. Sau khi scan xong, click **"Export JSON"**
2. File sẽ được download về máy
3. Mở file bằng text editor để xem dữ liệu

---

## 🐛 Troubleshooting Cài Đặt

### Lỗi: "Manifest file is missing or unreadable"
**Nguyên nhân**: File `manifest.json` bị lỗi hoặc không đúng format

**Giải quyết**:
1. Mở `manifest.json` bằng text editor
2. Copy lại nội dung từ source code
3. Đảm bảo JSON valid (có thể check tại jsonlint.com)
4. Save và reload extension

### Lỗi: "Could not load icon 'icons/icon16.png'"
**Nguyên nhân**: Thiếu icon files

**Giải quyết**:
```bash
# Chạy Python script để tạo icons
cd google-maps-scanner
python3 create_icons.py
```

Hoặc tạm thời comment các dòng icon trong `manifest.json`:
```json
// Xóa hoặc comment các dòng này
"default_icon": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

### Extension Load Nhưng Không Chạy
**Kiểm tra**:
1. Reload extension: Click biểu tượng ↻ trong `chrome://extensions/`
2. Refresh trang Google Maps: `Ctrl+R` hoặc `Cmd+R`
3. Mở Console để xem errors: `F12` → Tab Console

**Xem logs**:
```javascript
// Trong Console, gõ:
chrome.runtime.lastError
```

### Popup Không Hiện
1. Right-click vào icon extension
2. Chọn "Inspect popup"
3. Xem console errors
4. Thường do lỗi trong `popup.js` hoặc `popup.html`

---

## 🔐 Permissions Explained

Extension cần các quyền sau:

### activeTab
- Để đọc nội dung trang Google Maps hiện tại
- Không truy cập tabs khác

### storage
- Lưu dữ liệu đã scan
- Lưu settings của bạn
- Data chỉ lưu local, không gửi đi đâu

### scripting
- Inject content script vào Google Maps
- Để có thể tương tác với DOM

### host_permissions
- Chỉ chạy trên google.com/maps
- Không chạy trên website khác

---

## 🔄 Update Extension

### Cách 1: Manual Update
1. Download version mới
2. Vào `chrome://extensions/`
3. Click **Remove** extension cũ
4. **Load unpacked** version mới

### Cách 2: Reload (nếu chỉnh sửa code)
1. Vào `chrome://extensions/`
2. Tìm extension
3. Click icon ↻ (reload)
4. Refresh trang Google Maps

**Note**: Khi reload extension:
- ✅ Code mới được áp dụng
- ⚠️ Data trong storage vẫn giữ nguyên
- ⚠️ Tabs đang mở cần refresh

---

## 📊 Kiểm Tra Extension Hoạt Động Đúng

### Check Console Logs

**Background Service Worker**:
1. Vào `chrome://extensions/`
2. Click "Service worker" dưới extension
3. Xem logs:
```
🚀 Google Maps Scanner Pro - Background Service Worker Ready!
```

**Content Script** (trên Google Maps):
1. Mở Google Maps
2. Nhấn `F12` → Console
3. Xem logs:
```
🗺️ Google Maps Scanner Pro - Content Script Loaded!
```

**Popup Script**:
1. Right-click icon extension → Inspect popup
2. Xem console không có lỗi

### Check Storage
```javascript
// Trong console của popup hoặc background
chrome.storage.local.get(null, (data) => {
    console.log('Current storage:', data);
});
```

---

## 🎓 Tips cho Developers

### Debug Content Script
```javascript
// Thêm vào content.js để debug
console.log('Current URL:', window.location.href);
console.log('Sidebar found:', document.querySelector('[role="feed"]'));
```

### Monitor Messages
```javascript
// Trong background.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('📨 Message received:', msg);
    console.log('📍 From tab:', sender.tab?.id);
});
```

### Test với Sample Data
```javascript
// Trong popup.js console
chrome.storage.local.set({
    scannedData: [
        {
            name: "Test Place",
            address: "123 Test St",
            rating: 4.5
        }
    ]
});
```

---

## 🛡️ Security Best Practices

1. **Chỉ load extensions từ nguồn tin cậy**
2. **Review code trước khi cài** (đặc biệt manifest.json và permissions)
3. **Không share Chrome profile** có extension nhạy cảm
4. **Regular updates** để fix security issues

---

## 📱 Sử Dụng Trên Nhiều Máy

### Cách 1: Chrome Sync (Không khuyến nghị cho dev extensions)
- Dev extensions không sync qua Chrome accounts
- Phải cài thủ công trên mỗi máy

### Cách 2: Git Repository (Khuyến nghị)
```bash
# Máy 1: Push code
git add .
git commit -m "Update extension"
git push origin main

# Máy 2: Pull và reload
git pull origin main
# Vào chrome://extensions/ và reload
```

### Cách 3: Zip File
```bash
# Nén extension
zip -r maps-scanner.zip google-maps-scanner/

# Gửi qua email/USB
# Giải nén và load unpacked trên máy khác
```

---

## 🎉 Hoàn Tất!

Giờ bạn đã có một Chrome Extension chuyên nghiệp để scan Google Maps! 

**Next Steps**:
1. ✅ Đọc `README.md` để biết cách dùng
2. ✅ Test với queries thực tế
3. ✅ Customize theo nhu cầu
4. ✅ Share với team (nếu muốn)

**Vấn đề gì không hiểu?**
- Check lại từng bước trong guide này
- Xem phần Troubleshooting
- Debug bằng Console logs

---

**Made with ❤️ for Vietnamese Developers**

*Happy Coding! 🚀*
