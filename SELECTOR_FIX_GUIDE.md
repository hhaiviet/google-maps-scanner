# 🔍 Hướng Dẫn Fix Phone & Website Thiếu

## 🎯 Vấn Đề

Bạn báo:
- ✅ Tên, địa chỉ: OK
- ❌ Phone: Thiếu nhiều
- ❌ Website: Thiếu nhiều

## 💡 Nguyên Nhân

Google Maps thay đổi HTML structure thường xuyên.
→ Selectors cũ không còn work
→ Cần tìm selectors MỚI

---

## 🛠️ Solution: Tự Tìm Selectors Đúng

### Bước 1: Chạy Advanced Debug Tool

**Chuẩn bị:**
```
1. Mở Google Maps
2. Search bất kỳ (vd: "quán cà phê")
3. Click vào 1 place CÓ phone VÀ website
4. Đợi panel load đầy đủ
```

**Chạy tool:**
```
1. Nhấn F12 (mở Console)
2. Mở file: ADVANCED_ELEMENT_FINDER.js
3. Copy TOÀN BỘ nội dung
4. Paste vào Console
5. Nhấn Enter
```

**Đợi kết quả:**
```
Tool sẽ scan và show:
📞 Phone tìm được
🌐 Website tìm được
✅ Recommended selectors
🔧 Code để add vào extension
```

---

### Bước 2: Đọc Kết Quả

Tool sẽ show output như này:

```
═══════════════════════════════════════════════════════
📊 SUMMARY
═══════════════════════════════════════════════════════

📞 PHONE RESULTS:
Total found: 2
  1. +84 123 456 789
  2. 0123 456 789

🌐 WEBSITE RESULTS:
Total found: 1
  1. https://example.com

✅ RECOMMENDED SELECTORS:

📞 For Phone:
  1. a[href^="tel:"]
  2. [data-item-id="phone:tel:xxx"]
  3. button[aria-label*="Phone"]
  4. .DkEaL
  5. .CsEnBe

🌐 For Website:
  1. [data-item-id="authority"]
  2. a.CsEnBe[href^="http"]
  3. [aria-label*="Website"]

🔧 CODE TO ADD TO EXTENSION:

// Phone selectors
const phoneSelectors = [
    'a[href^="tel:"]',
    '[data-item-id="phone:tel:xxx"]',
    'button[aria-label*="Phone"]',
    '.DkEaL',
    '.CsEnBe',
];

// Website selectors
const websiteSelectors = [
    '[data-item-id="authority"]',
    'a.CsEnBe[href^="http"]',
    '[aria-label*="Website"]',
];
```

---

### Bước 3: Update Extension

**Option A: Tự update (nếu biết code):**

1. Mở file `content.js` trong extension folder
2. Tìm function `extractDetailedData()`
3. Tìm phần:
```javascript
const phoneSelectors = [
    // OLD SELECTORS HERE
];
```

4. Replace bằng selectors MỚI từ tool:
```javascript
const phoneSelectors = [
    'a[href^="tel:"]',
    '[data-item-id="phone:tel:xxx"]', // NEW!
    'button[aria-label*="Phone"]',
    '.DkEaL', // NEW CLASS!
];
```

5. Tương tự cho `websiteSelectors`

6. Save file

7. Reload extension:
```
chrome://extensions/ → Click reload (↻)
```

8. Test lại!

---

**Option B: Share kết quả với tôi:**

1. Copy TOÀN BỘ output từ Console
2. Paste và gửi cho tôi
3. Tôi sẽ update code và tạo version mới!

**Cách copy output:**
```
1. Right-click trong Console
2. Chọn "Save as..."
3. Hoặc Ctrl+A, Ctrl+C
4. Paste vào text file
5. Share file
```

---

## 🧪 Test Selectors Thủ Công

Nếu muốn test từng selector xem có work không:

### Test Phone Selector:

```javascript
// Paste trong Console (khi đang ở place details):

// Test selector
const selector = 'a[href^="tel:"]'; // Replace với selector muốn test
const elements = document.querySelectorAll(selector);

console.log(`Found ${elements.length} elements`);
elements.forEach((el, i) => {
    console.log(`Element ${i + 1}:`, {
        text: el.textContent,
        href: el.href,
        ariaLabel: el.getAttribute('aria-label')
    });
});

// Nếu found > 0 → Selector này WORK!
```

### Test Website Selector:

```javascript
// Test website selector
const selector = '[data-item-id="authority"]'; // Replace
const elements = document.querySelectorAll(selector);

console.log(`Found ${elements.length} elements`);
elements.forEach((el, i) => {
    const link = el.href || el.querySelector('a')?.href;
    console.log(`Element ${i + 1}:`, link);
});

// Nếu có link và không phải google.com → WORK!
```

---

## 🔄 Workflow Khuyến Nghị

### Test Nhiều Places:

```
1. Click place A (có phone)
   → Run ADVANCED_ELEMENT_FINDER.js
   → Note selectors

2. Click place B (có phone)
   → Run lại tool
   → Check selectors có giống không?

3. Click place C (có phone)
   → Run lại
   → Tìm selectors COMMON (xuất hiện ở cả 3)

4. Click place D (KHÔNG có phone)
   → Verify tool không tìm thấy gì

5. Dùng selectors COMMON để update extension
```

**Tại sao?**
- Ensure selectors work cho NHIỀU places
- Không phải chỉ 1 place đặc biệt
- Tránh false positives

---

## 📊 Expected Results Sau Khi Fix

### Trước khi fix:
```
50 places scanned:
- Phone found: 15 (30%) ❌
- Website found: 20 (40%) ❌
```

### Sau khi fix với selectors đúng:
```
50 places scanned:
- Phone found: 40 (80%) ✅
- Website found: 35 (70%) ✅
```

**Lưu ý:** Không phải 100% vì:
- Một số places thật sự KHÔNG có phone/website
- Một số business ẩn thông tin
- Google Maps không có data đầy đủ

---

## 🎯 Checklist: Tìm Selectors

### Preparation:
- [ ] Đã mở Google Maps
- [ ] Đã search và click vào place CÓ phone/website
- [ ] Place details panel đã load đầy đủ
- [ ] Có thể thấy phone/website trên UI

### Run Tool:
- [ ] Đã mở Console (F12)
- [ ] Đã copy ADVANCED_ELEMENT_FINDER.js
- [ ] Đã paste và run
- [ ] Tool show kết quả (không error)

### Verify Results:
- [ ] Tool tìm được phone? (match với UI)
- [ ] Tool tìm được website? (match với UI)
- [ ] Có list recommended selectors?
- [ ] Đã copy CODE TO ADD section?

### Test Selectors:
- [ ] Test ít nhất 3 places khác nhau
- [ ] Selectors work cho tất cả 3 places?
- [ ] Note lại selectors COMMON

### Update Extension:
- [ ] Đã update content.js với selectors mới
- [ ] Đã reload extension
- [ ] Test scan 10 places
- [ ] Phone rate > 70%?
- [ ] Website rate > 60%?

**All checked?** Selectors đã đúng! 🎉

---

## 💡 Pro Tips

### Tip 1: Test Nhiều Loại Business
```
Different businesses có different HTML:
- Restaurants: Usually full info
- Shops: Maybe no website
- Services: Usually have phone
- Parks: Usually no phone

→ Test ít nhất 2-3 loại khác nhau
```

### Tip 2: Check Class Names
```
Google Maps dùng random class names:
- .DkEaL (có thể change)
- .CsEnBe (có thể change)

→ Ưu tiên data-item-id & aria-label
→ Class names là last resort
```

### Tip 3: Combine Multiple Selectors
```javascript
// Don't rely on just 1 selector
const phoneSelectors = [
    'a[href^="tel:"]',              // Method 1
    '[data-item-id*="phone"]',      // Method 2
    'button[aria-label*="Phone"]',  // Method 3
    '.common-class',                // Method 4
];

// Try all methods để maximize success rate
```

### Tip 4: Pattern Priority
```
Priority order (most reliable first):
1. href="tel:" → Always reliable
2. data-item-id → Usually stable
3. aria-label → Pretty stable
4. Class names → Changes often
5. Text search → Last resort
```

---

## 🆘 Troubleshooting

### Tool không tìm được gì?

**Check:**
1. Đã click vào place chưa? (không phải ở list)
2. Place có phone/website trên UI không?
3. Panel đã load xong chưa? (đợi 2-3 giây)
4. Console có errors không?

**Try:**
- Refresh trang và run lại
- Try place khác
- Clear cache

### Tool tìm được nhưng update vẫn không work?

**Check:**
1. Đã reload extension chưa?
2. Đã refresh Google Maps page chưa?
3. Selector có typo không?
4. Test selector manually (xem phần Test Selectors)

### Phone/Website rate vẫn thấp sau khi update?

**Possible reasons:**
1. Selectors chỉ test với 1-2 places
   → Test nhiều places hơn
2. Delay quá ngắn (panel chưa load)
   → Increase delay to 4000ms
3. Business thật sự không có info
   → Normal, expect 70-80% max
4. Google HTML changed again
   → Re-run tool với places mới

---

## 📝 Template Report

Khi share kết quả với tôi, dùng template này:

```
🔍 SELECTOR FINDER RESULTS

Test Date: [Date]
Number of places tested: [X]

📞 PHONE:
Selectors found:
1. [selector 1]
2. [selector 2]
3. [selector 3]

Success rate when tested manually: X/X places

🌐 WEBSITE:
Selectors found:
1. [selector 1]
2. [selector 2]

Success rate: X/X places

📋 Full Console Output:
[Paste toàn bộ output từ ADVANCED_ELEMENT_FINDER.js]

Notes:
[Any observations, issues, or patterns noticed]
```

---

## 🎊 Sau Khi Fix Xong

### Verify:
```
1. Scan 50 places với extension updated
2. Export CSV
3. Check phone rate:
   - Count places có phone
   - Should be 70-80%+
4. Check website rate:
   - Count places có website
   - Should be 60-70%+
```

### Share Success:
```
Nếu work tốt, share:
- Selectors mới
- Test results
- Screenshots

→ Helps cộng đồng khác!
```

---

**Remember:** Google Maps HTML thay đổi thường xuyên. Có thể cần update selectors mỗi vài tháng. Keep ADVANCED_ELEMENT_FINDER.js để re-run khi cần!

Made with ❤️ for Vietnamese Developers
Find the right selectors = Get the data! 🎯📞
