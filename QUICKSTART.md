# ⚡ Quick Start Guide

## 3 Bước để Bắt Đầu Scan Google Maps trong 5 Phút!

---

## 🎯 Bước 1: Cài Đặt Extension (2 phút)

### 1.1. Vào Chrome Extensions
Gõ vào address bar:
```
chrome://extensions/
```

### 1.2. Bật Developer Mode
Toggle công tắc "Developer mode" ở góc trên bên phải

### 1.3. Load Extension
1. Click **"Load unpacked"**
2. Chọn folder `google-maps-scanner`
3. Done! ✅

**Troubleshooting**: Nếu thiếu icons, chạy:
```bash
cd google-maps-scanner
python3 create_icons.py
```

---

## 🗺️ Bước 2: Scan Dữ Liệu Đầu Tiên (2 phút)

### 2.1. Mở Google Maps
```
https://www.google.com/maps
```

### 2.2. Tìm Kiếm
Ví dụ: `quán cà phê quận 1`

### 2.3. Mở Extension & Scan
1. Click icon 🗺️ trên toolbar
2. Settings:
   - Số lượng: `20` (để test nhanh)
   - Tốc độ: `2000ms`
   - Chi tiết: `Cơ bản`
3. Click **"Bắt Đầu Scan"**
4. Đợi 30-60 giây

### 2.4. Export Data
1. Click **"Export CSV"**
2. Mở file bằng Excel
3. Thấy dữ liệu → Success! 🎉

---

## 📊 Bước 3: Phân Tích Data (1 phút)

### Option A: Xem bằng Excel
- Mở file CSV
- Sort theo Rating
- Filter theo Số reviews

### Option B: Dùng Python Script
```bash
# Copy file CSV vào folder extension
python3 test_extension.py
```

Xem report HTML được tạo ra!

---

## 🚀 Next Steps

### Scan Nhiều Hơn
- Tăng "Số lượng tối đa" lên 100-200
- Chọn "Đầy đủ" để có thêm phone/website
- Scan nhiều khu vực khác nhau

### Tối Ưu
- Đọc `README.md` để biết full features
- Xem `TIPS_AND_TRICKS.md` cho advanced tips
- Check `INSTALL_GUIDE.md` nếu có vấn đề

### Automation
```python
# Merge nhiều CSV files
import pandas as pd
import glob

files = glob.glob('google-maps-data*.csv')
df = pd.concat([pd.read_csv(f) for f in files])
df.drop_duplicates(subset=['Place ID']).to_csv('merged.csv')
```

---

## ❓ FAQ Nhanh

**Q: Extension không hoạt động?**
- Reload extension: Chrome Extensions → Click ↻
- Refresh Google Maps: Ctrl+R

**Q: Không thu thập được data?**
- Đảm bảo đã search và có kết quả ở sidebar trái
- Tăng delay lên 3000ms

**Q: Muốn scan lại?**
- Click "Xóa Dữ Liệu" trước
- Hoặc export ra rồi scan thêm (sẽ merge tự động)

**Q: Export bị lỗi?**
- Check popup blocker
- Thử Export JSON thay vì CSV

---

## 💡 Pro Tips

### Scan Nhanh x2
```
Settings:
✅ Số lượng: 50-100
✅ Tốc độ: 1500ms
✅ Chi tiết: Cơ bản

= Scan trong < 2 phút!
```

### Scan Chất Lượng
```
Settings:
✅ Số lượng: 200-500
✅ Tốc độ: 2500ms
✅ Chi tiết: Đầy đủ

= Thu thập phone/website đầy đủ
```

### Tránh Bị Block
- Không scan liên tục > 1 giờ
- Nghỉ 5-10 phút giữa các lần scan lớn
- Dùng delay >= 2000ms

---

## 🎯 Use Cases Phổ Biến

### 1. Lead Generation
```
Search: "nhà hàng không có website" + địa phương
→ Tiềm năng bán website/marketing
```

### 2. Market Research
```
Search: competitor name + các chi nhánh
→ Phân tích địa điểm kinh doanh
```

### 3. Sales Territory
```
Search: customers + từng khu vực
→ Map và assign cho sales team
```

### 4. Cold Outreach
```
Export số điện thoại
→ Gọi điện/WhatsApp marketing
```

---

## 📞 Need Help?

1. **Check Logs**: F12 → Console
2. **Read Docs**: README.md & INSTALL_GUIDE.md
3. **Debug**: Test với query đơn giản trước

---

## ✅ Checklist

- [ ] Extension đã cài đặt
- [ ] Icons hiển thị OK
- [ ] Test scan 10 places thành công
- [ ] Export CSV được
- [ ] Data hợp lệ khi mở bằng Excel
- [ ] Đọc README để hiểu full features

**All checked?** Chúc mừng! Bạn đã sẵn sàng scan Google Maps chuyên nghiệp! 🚀

---

## 🎓 Learning Path

1. ✅ **Beginner**: Scan 20-50 places, export CSV
2. 🔄 **Intermediate**: Scan 100-200 places, merge CSVs, filter data
3. 🚀 **Advanced**: Auto-schedule, integrate APIs, build dashboards
4. 💪 **Pro**: Custom selectors, anti-detection, parallel scanning

**Current level?** Start from step 1 và boost lên! 💪

---

**Total Time**: 5 minutes
**Difficulty**: ⭐⭐☆☆☆ (Easy)
**Boost**: x2 x4 productivity! 🚀

*Happy Scanning!* 🗺️
