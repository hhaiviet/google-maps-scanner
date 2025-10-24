# 📞 Phone Number Debug Guide

## Vấn Đề: Không Lấy Được Số Điện Thoại

Đây là vấn đề phổ biến khi scan Google Maps. Đây là cách fix!

---

## 🔍 Tại Sao Không Có Phone?

### Lý do chính:
1. **Google Maps không hiển thị phone ở danh sách** - Chỉ có khi click vào
2. **Selector đã thay đổi** - Google thường update HTML structure
3. **Delay quá ngắn** - Panel chưa load đủ
4. **Địa điểm không có phone** - Không phải tất cả đều có

---

## ✅ Solution 1: Dùng Full Mode (Khuyến nghị)

### Cách làm:
```
Settings trong Extension:
✅ Chi tiết: Chọn "Đầy đủ" 
✅ Tốc độ scroll: 2500-3000ms (chậm hơn)
✅ Số lượng: Giảm xuống 20-50 (để test)
```

**Giải thích:**
- Full mode sẽ click vào TỪNG địa điểm
- Đợi panel load
- Extract phone/website/hours
- Mất nhiều thời gian hơn nhưng data đầy đủ

---

## 🧪 Solution 2: Debug Để Tìm Selector Đúng

### Bước 1: Chạy Debug Script

1. Mở Google Maps
2. Search và click vào MỘT địa điểm có phone
3. Nhấn `F12` để mở Console
4. Copy toàn bộ nội dung file `DEBUG_PHONE_FINDER.js`
5. Paste vào Console và Enter

### Bước 2: Đọc Kết Quả

Script sẽ show:
```
=== SUMMARY ===
Total items found: 3

✅ PHONE NUMBERS FOUND:
1. +84 123 456 789 (via: a[href^="tel:"])
2. Call: 0123456789 (via: aria-label phone)

📞 CLEANED PHONE NUMBERS:
- +84 123 456 789
- 0123456789
```

### Bước 3: Update Extension

Nếu script tìm được phone, note lại `via: ...` (method nào work)

Ví dụ nếu work với `a[href^="tel:"]`, thì selector này OK!

---

## 🔧 Solution 3: Manual Update Selectors

### Nếu bạn biết code:

Edit file `content.js`, function `extractDetailedData()`:

```javascript
// Thêm selector mới vào đây:
const phoneSelectors = [
    'button[data-item-id*="phone"]',
    'a[href^="tel:"]',
    // THÊM SELECTOR MỚI Ở ĐÂY:
    'YOUR_NEW_SELECTOR_HERE',
];
```

### Cách tìm selector đúng:

1. Mở Google Maps, click vào place có phone
2. Right-click vào số phone → "Inspect"
3. Note lại selector (class, data-attribute, etc)
4. Add vào array `phoneSelectors`

**Ví dụ:**
```html
<!-- Nếu HTML là: -->
<button class="phone-btn" data-phone="123">Call</button>

<!-- Thì selector là: -->
'button.phone-btn'
hoặc
'button[data-phone]'
```

---

## ⚙️ Solution 4: Tăng Delay

### Trong Extension Settings:

```
Tốc độ scroll: 3000-4000ms
```

**Tại sao?**
- Panel cần thời gian load
- Kết nối chậm cần delay lớn
- Safe hơn để tránh miss data

---

## 🎯 Solution 5: Verify Mode Full Hoạt Động

### Check Console Logs:

1. Scan với Full mode
2. Mở Console (F12)
3. Xem logs:

```
📱 Clicking place 1/10...
📞 Found phone: +84 123 456 789
✅ Found phone for Highlands Coffee: +84 123 456 789
```

Nếu thấy `📞 Found phone` → Good!

Nếu KHÔNG thấy → Selector sai

---

## 🐛 Advanced Debug: Step by Step

### Test thủ công:

```javascript
// Paste vào Console khi đang ở place details:

// Test 1: Tel links
console.log('Tel links:', document.querySelectorAll('a[href^="tel:"]'));

// Test 2: Phone buttons
console.log('Phone buttons:', document.querySelectorAll('button[data-item-id*="phone"]'));

// Test 3: Aria labels
console.log('Aria phone:', document.querySelectorAll('button[aria-label*="Phone"]'));

// Test 4: All buttons
document.querySelectorAll('button').forEach(btn => {
    const text = btn.getAttribute('aria-label') || btn.textContent;
    if (text.toLowerCase().includes('phone') || text.toLowerCase().includes('call')) {
        console.log('Phone button:', btn, text);
    }
});

// Test 5: Search in text
const panel = document.querySelector('[role="main"]');
if (panel) {
    const text = panel.textContent;
    const phoneMatch = text.match(/\+?\d{1,3}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g);
    console.log('Phones in text:', phoneMatch);
}
```

Note lại method nào return phone!

---

## 📊 Expected Results

### Mode Basic (nhanh):
```
✅ Tên: 100%
✅ Địa chỉ: 90%
✅ Rating: 95%
✅ Category: 90%
❌ Phone: 0-10% (hầu như không có)
❌ Website: 0-10%
```

### Mode Full (chậm):
```
✅ Tên: 100%
✅ Địa chỉ: 100%
✅ Rating: 95%
✅ Category: 90%
✅ Phone: 60-80% (nếu có trong GM)
✅ Website: 50-70%
✅ Hours: 80-90%
```

**Note:** Không phải địa điểm nào cũng có phone trên Google Maps!

---

## 🔄 Workflow Khuyến Nghị

### Step 1: Test với 5-10 places
```
Settings:
- Số lượng: 10
- Delay: 3000ms
- Chi tiết: Đầy đủ
```

### Step 2: Check kết quả
- Export CSV
- Mở Excel
- Count bao nhiêu có phone

### Step 3: Nếu < 50% có phone
- Chạy DEBUG_PHONE_FINDER.js
- Xem method nào work
- Report lại để update extension

### Step 4: Production scan
```
Settings:
- Số lượng: 50-100
- Delay: 2500-3000ms
- Chi tiết: Đầy đủ
```

---

## 💡 Pro Tips

### Tip 1: Scan từng loại địa điểm
```
Restaurants → Usually have phone (80%)
Cafes → Sometimes (60%)
Parks → Rarely (20%)
Landmarks → Almost never (5%)
```

### Tip 2: Filter sau khi scan
```python
import pandas as pd

df = pd.read_csv('data.csv')
# Chỉ giữ places có phone
has_phone = df[df['Điện thoại'].notna()]
has_phone.to_csv('with_phone.csv')
```

### Tip 3: Combine sources
- Scan Google Maps (address + name + rating)
- Search trên Google: "place_name phone number"
- Use APIs: Google Places API
- Manual lookup

---

## 🆘 Vẫn Không Work?

### Option 1: Share Results
Chạy DEBUG_PHONE_FINDER.js và share output để tôi fix!

### Option 2: Use Google Places API
```python
import googlemaps

gmaps = googlemaps.Client(key='YOUR_API_KEY')
place = gmaps.place(place_id='ChIJ...')
phone = place['result'].get('formatted_phone_number')
```

Free tier: 100 requests/day

### Option 3: Alternative Tools
- Outscraper.com (paid)
- Apify Google Maps scraper (paid)
- Manual copy-paste 😅

---

## 📝 Update Log

**Version 1.1 (Current)**
- Added multiple phone selectors
- Increased delay to 3000ms
- Added tel: link detection
- Added text search fallback
- Better error handling

**Known Issues:**
- Google Maps HTML changes frequently
- Some places hide phone from public
- Rate limiting on heavy scans

---

## ✅ Checklist: Phone Not Working

- [ ] Đã dùng Full mode (không phải Basic)?
- [ ] Delay >= 2500ms?
- [ ] Scan ít places (10-20) để test?
- [ ] Đã chạy DEBUG_PHONE_FINDER.js?
- [ ] Console có show "📞 Found phone"?
- [ ] Place thật sự có phone trên GM?
- [ ] Đã reload extension sau khi update?
- [ ] Đã refresh Google Maps page?

**All checked và vẫn không work?** 
Contact để update selectors mới!

---

**Remember:** Không phải 100% places đều có phone public trên Google Maps. Expected rate: 60-80% cho restaurants/businesses.
