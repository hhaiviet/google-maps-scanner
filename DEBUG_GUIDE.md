# Debug Guide - Console Errors

## Cách Debug Extension

### 1. Mở Chrome Developer Tools
- Nhấn **F12** trên trang Google Maps
- Hoặc **Right-click → Inspect → Console**

### 2. Xem Console Messages
Khi chạy extension, sẽ thấy các messages:
```
🚀 Starting Google Maps Scanner...
🔍 Found X places in sidebar
📊 Starting detailed scan for X places...
🔄 Opening place details...
✅ Place opened successfully (Xms)
📞 Phone: +84xxx
🌐 Website: xxx
⬅️ Returning to list...
✅ Returned to list (Xms)
```

### 3. Các Lỗi Thường Gặp

#### ❌ **"Cannot read properties of null"**
- **Nguyên nhân**: Element không tìm thấy
- **Giải pháp**: Đợi page load đủ rồi mới chạy

#### ❌ **"Element not found"** 
- **Nguyên nhân**: Google Maps thay đổi structure
- **Giải pháp**: Update selectors

#### ❌ **"Place didn't open"**
- **Nguyên nhân**: Click không work hoặc network chậm
- **Giải pháp**: Thử tăng wait time

#### ❌ **"Script context lost"**
- **Nguyên nhân**: Page bị refresh
- **Giải pháp**: Đã fix bằng container click

### 4. Copy Console Output
Nếu có lỗi, copy toàn bộ console output và gửi cho tôi để debug.

### 5. Network Tab Debug
Nếu data không load:
- Chuyển sang **Network** tab  
- Reload page và chạy extension
- Xem có request nào fail không