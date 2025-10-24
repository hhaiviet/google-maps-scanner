# 🗺️ Google Maps Scanner Pro

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/hhaiviet/google-maps-scanner)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen.svg)](#)

Chrome Extension chuyên nghiệp để scan và thu thập dữ liệu từ Google Maps - được thiết kế đặc biệt cho developers Việt Nam! 🇻🇳

## 📸 Screenshots

![Google Maps Scanner Interface](https://via.placeholder.com/800x400?text=Google+Maps+Scanner+Interface)

## 🚀 Quick Start

1. **Cài đặt extension** từ Chrome Web Store hoặc load unpacked
2. **Mở Google Maps** và tìm kiếm địa điểm bạn muốn scan
3. **Click vào extension icon** trên thanh công cụ
4. **Chọn chế độ scan** và bấm "Start Scanning"
5. **Export dữ liệu** về CSV hoặc JSON

## ✨ Tính Năng Chính

### 🚀 Auto Scan Thông Minh
- **Auto-scroll** tự động để load thêm kết quả
- Scan từ 10 đến 500+ địa điểm
- Tùy chỉnh tốc độ scan (500ms - 5000ms)
- Stop/Resume bất cứ lúc nào

### 📊 Thu Thập Dữ Liệu Đầy Đủ
Extension thu thập các thông tin:
- ✅ Tên địa điểm / doanh nghiệp
- ✅ Địa chỉ đầy đủ
- ✅ Số điện thoại
- ✅ Website
- ✅ Rating (đánh giá sao)
- ✅ Số lượng reviews
- ✅ Loại hình kinh doanh / Category
- ✅ Giờ mở cửa
- ✅ Tọa độ GPS (Latitude/Longitude)
- ✅ Place ID
- ✅ URL Google Maps

### 💾 Export Dữ Liệu
- **CSV Format**: Mở được bằng Excel, Google Sheets
- **JSON Format**: Dùng cho lập trình, API, database
- Download trực tiếp về máy

### 🎯 2 Chế Độ Scan
1. **Basic Mode** (Nhanh): Chỉ lấy thông tin từ danh sách
2. **Full Mode** (Chi tiết): Click vào từng địa điểm để lấy thêm thông tin (phone, website, hours)

### 💪 Tính Năng Nâng Cao
- Lưu trữ dữ liệu trong Chrome Storage
- Không bị mất dữ liệu khi đóng browser
- Tránh trùng lặp tự động
- Real-time progress tracking
- Activity logs chi tiết

## 📦 Cài Đặt

### Bước 1: Download Extension
```bash
# Clone hoặc download folder này về máy
google-maps-scanner/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
└── icons/
```

### Bước 2: Tạo Icons
Tạo folder `icons` và thêm 3 file icon (hoặc dùng icon tạm):
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)  
- `icon128.png` (128x128px)

**Quick fix**: Tạo icon đơn giản bằng Python:
```python
from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Vẽ chữ "M" cho Maps
    font_size = int(size * 0.6)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "🗺️"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2)
    draw.text(position, text, fill='white', font=font)
    
    img.save(f'icons/icon{size}.png')

# Tạo icons
import os
os.makedirs('icons', exist_ok=True)
create_icon(16)
create_icon(48)
create_icon(128)
print("✅ Icons created!")
```

### Bước 3: Load Extension vào Chrome
1. Mở Chrome và vào: `chrome://extensions/`
2. Bật **Developer mode** (góc trên bên phải)
3. Click **"Load unpacked"**
4. Chọn folder `google-maps-scanner`
5. Done! Extension đã được cài đặt ✅

## 🎮 Hướng Dẫn Sử Dụng

### Bước 1: Tìm Kiếm Trên Google Maps
1. Mở [Google Maps](https://www.google.com/maps)
2. Tìm kiếm thứ bạn muốn scan, ví dụ:
   - "Quán cà phê quận 1"
   - "Nhà hàng Sài Gòn"
   - "Gym Hà Nội"
   - "Siêu thị Đà Nẵng"
3. Đợi kết quả xuất hiện ở sidebar bên trái

### Bước 2: Mở Extension
1. Click vào icon Extension trên thanh toolbar
2. Hoặc click chuột phải và chọn "Scan khu vực này"

### Bước 3: Cấu Hình Scan
**Cài đặt quan trọng:**
- **Số lượng tối đa**: Bao nhiêu địa điểm muốn scan (10-500)
- **Tốc độ scroll**: Thời gian đợi giữa mỗi lần scroll (khuyến nghị: 2000ms)
- **Lấy chi tiết**: 
  - `Cơ bản`: Nhanh, chỉ thông tin trên danh sách
  - `Đầy đủ`: Chậm hơn, click vào để lấy phone/website

### Bước 4: Bắt Đầu Scan
1. Click **"Bắt Đầu Scan"**
2. Extension sẽ tự động:
   - Scroll xuống để load thêm kết quả
   - Thu thập thông tin từ mỗi địa điểm
   - Cập nhật tiến độ real-time
3. Bạn có thể **Dừng Scan** bất cứ lúc nào

### Bước 5: Export Dữ Liệu
Sau khi scan xong:
1. Click **"Export CSV"** để mở bằng Excel
2. Hoặc **"Export JSON"** để dùng cho code

## 📊 Ví Dụ Output

### CSV Output
```csv
Tên,Địa chỉ,Điện thoại,Website,Rating,Số đánh giá,Loại hình,Giờ mở cửa,Latitude,Longitude,Place ID,URL
"Highlands Coffee","123 Nguyễn Huệ, Q1, TP.HCM","0901234567","https://highlandscoffee.com.vn",4.5,1234,"Quán cà phê","Mở cửa 7:00-22:00",10.7756,106.7019,"ChIJ...",https://maps.google.com/...
```

### JSON Output
```json
[
  {
    "placeId": "ChIJ...",
    "name": "Highlands Coffee",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "phone": "0901234567",
    "website": "https://highlandscoffee.com.vn",
    "rating": 4.5,
    "reviewCount": 1234,
    "category": "Quán cà phê",
    "hours": "Mở cửa 7:00-22:00",
    "latitude": 10.7756,
    "longitude": 106.7019,
    "url": "https://maps.google.com/...",
    "timestamp": "2025-10-23T10:30:00.000Z"
  }
]
```

## 💡 Tips & Tricks

### Tối Ưu Tốc Độ Scan
- **Fast scan** (1000-1500ms): Có thể bị miss data
- **Balanced** (2000-2500ms): Khuyến nghị ⭐
- **Safe scan** (3000-4000ms): Chắc chắn nhất nhưng chậm

### Tránh Bị Google Block
- Không scan quá nhanh (< 1000ms)
- Nghỉ giữa các lần scan lớn
- Không scan liên tục hàng giờ
- Dùng VPN nếu cần thiết

### Scan Nhiều Khu Vực
1. Scan khu vực 1 → Export
2. Xóa dữ liệu trong extension
3. Tìm kiếm khu vực 2 → Scan
4. Merge các file CSV/JSON sau

### Best Practices
- ✅ Scan trong giờ thấp điểm
- ✅ Kiểm tra dữ liệu sau khi scan
- ✅ Backup dữ liệu quan trọng
- ✅ Tôn trọng Terms of Service của Google

## 🔧 Troubleshooting

### Extension Không Hoạt Động
1. Reload extension: `chrome://extensions/` → Click reload
2. Refresh trang Google Maps
3. Kiểm tra console: F12 → Console tab

### Không Thu Thập Được Dữ Liệu
- ✅ Đảm bảo đã tìm kiếm và có kết quả
- ✅ Sidebar bên trái phải hiển thị danh sách
- ✅ Tăng thời gian delay lên 3000ms

### Export Không Hoạt Động
- ✅ Kiểm tra popup blocker
- ✅ Cho phép download trong Chrome settings
- ✅ Thử export JSON thay vì CSV

### Data Bị Trùng
- Extension tự động loại trùng bằng Place ID
- Nếu vẫn trùng, xóa dữ liệu và scan lại

## 🚀 Nâng Cấp & Custom

### Thêm Fields Mới
Edit `content.js`, thêm vào function `extractBasicData`:
```javascript
// Ví dụ: Thêm field price range
const priceElement = parentDiv.querySelector('.price-class');
if (priceElement) {
    data.priceRange = priceElement.textContent.trim();
}
```

### Thay Đổi UI
Edit `popup.html` và `popup.css` để custom giao diện

### Tích Hợp Database
Thêm code vào `popup.js` để gửi data lên server:
```javascript
async function sendToDatabase(data) {
    await fetch('https://your-api.com/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
```

## ⚖️ Legal & Ethics

**Disclaimer**: 
- Extension này chỉ dùng cho mục đích nghiên cứu và học tập
- Tuân thủ Google Maps Terms of Service
- Không dùng cho mục đích thương mại bất hợp pháp
- Không spam hoặc làm quá tải hệ thống Google

**Khuyến nghị**:
- Sử dụng có trách nhiệm
- Không chia sẻ dữ liệu cá nhân
- Tôn trọng quyền riêng tư

## 🐛 Known Issues

- ⚠️ Google thay đổi HTML structure → Cần update selectors
- ⚠️ Limit 500 kết quả/search do Google Maps
- ⚠️ Full mode có thể chậm với dataset lớn

## 🎯 Roadmap

- [ ] Export Excel với formatting
- [ ] Filter theo rating/reviews
- [ ] Schedule auto-scan
- [ ] Cloud backup
- [ ] Multi-language support
- [ ] Batch scan nhiều queries
- [ ] API integration

## 📞 Support

Gặp vấn đề? 
- Check console logs (F12)
- Đọc kỹ phần Troubleshooting
- Ensure Chrome được update bản mới nhất

## 📝 Changelog

### Version 1.0.0 (2025-10-23)
- ✨ Initial release
- ✅ Auto-scroll scanning
- ✅ Basic & Full detail modes
- ✅ CSV/JSON export
- ✅ Chrome Storage integration
- ✅ Vietnamese UI

## 🙏 Credits

Made with ❤️ for Vietnamese Python Developers

**Tech Stack:**
- Vanilla JavaScript
- Chrome Extension Manifest V3
- Chrome Storage API
- HTML5/CSS3

---

**Happy Scanning! 🚀🗺️**

*"Boost yourself x2 x4" - Collect data smarter, not harder!*
