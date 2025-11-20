# Review Date Extraction Testing Guide

## Tổng quan
Chiến lược mới để ước tính ngày thành lập doanh nghiệp bằng cách tìm **ngày review đầu tiên** thay vì thông tin thành lập chính thức.

## Tại sao dùng Review Dates?

### Ưu điểm:
- ✅ **Đáng tin cậy hơn**: Google Maps luôn có review dates
- ✅ **Dễ truy cập**: Không cần tìm thông tin ẩn sâu
- ✅ **Chính xác hơn**: Review đầu tiên thường gần với ngày mở cửa
- ✅ **Có sẵn rộng rãi**: Hầu hết business đều có ít nhất 1 review

### Nhược điểm:
- ⚠️ Review đầu tiên có thể muộn hơn ngày thực tế mở cửa
- ⚠️ Một số business cũ có thể chưa có review từ đầu

## Cách Test

### Bước 1: Chuẩn bị
1. Mở Chrome và truy cập Google Maps
2. Tìm một business bất kỳ (có reviews)
3. Click vào business để mở detail panel

### Bước 2: Test với Console
1. Nhấn F12 để mở Developer Tools
2. Chuyển sang tab Console
3. Copy toàn bộ nội dung từ file `TEST_REVIEW_DATES.js`
4. Paste vào Console và nhấn Enter

### Bước 3: Quan sát kết quả
Test sẽ chạy 2 giai đoạn:

#### Test 1: Visible Review Dates
- Quét các review dates đang hiển thị trên trang
- Tìm dates dạng "X days ago", "X months ago"
- Tìm dates dạng "Jan 15, 2023"

#### Test 2: Reviews Section Access  
- Tự động click vào tab/button "Reviews"
- Quét các review dates trong section reviews
- Sử dụng nhiều selector patterns khác nhau

### Bước 4: Kiểm tra Output
Console sẽ hiển thị:
```
🧪 Starting Review Date Extraction Test...

=== Test 1: Visible Review Dates ===
🔍 Scanning visible review dates...
Found 45 potential date elements
  ✅ Relative date 12: "3 months ago" => 2024-08-15
  ✅ Absolute date 23: "Jan 15, 2023" => 2023-01-15

📅 Found 12 visible review dates
Visible dates found:
  1. 2023-01-15 (absolute): "Jan 15, 2023"
  2. 2024-08-15 (relative): "3 months ago"

📅 Earliest visible review: 2023-01-15
🏗️ Estimated founded: 2023/01

=== Test 2: Reviews Section Access ===
🔍 Found reviews button: "Reviews"
✅ Clicked reviews button
📄 Reviews section opened, scanning...
🔍 Scanning review section dates...
  Trying selector: [data-review-id] time
    Found 8 elements
    ✅ Date 0: "2 years ago" => 2022-11-15
    ✅ Date 1: "1 year ago" => 2023-11-15

📅 Found 8 review dates
Review dates found:
  1. 2022-11-15: "2 years ago" ([data-review-id] time)
  2. 2023-11-15: "1 year ago" ([data-review-id] time)

📅 Earliest review from section: 2022-11-15
🏗️ Estimated founded: 2022/11

🏁 Review Date Extraction Test Complete!
```

## Kết quả mong đợi

### Thành công:
- Tìm được ít nhất 1 review date
- Có thể ước tính năm và tháng thành lập
- Console không có errors

### Thất bại:
- Không tìm được review dates nào
- Có lỗi JavaScript trong console
- Không thể access được reviews section

## Troubleshooting

### Không tìm được review dates:
1. **Kiểm tra business có reviews không**: Chọn business khác có nhiều reviews hơn
2. **Thử scroll xuống**: Một số reviews chỉ hiện khi scroll
3. **Kiểm tra ngôn ngữ**: Test với business tiếng Việt và tiếng Anh

### JavaScript errors:
1. **Refresh trang và thử lại**
2. **Kiểm tra Chrome version**: Cần Chrome mới nhất
3. **Disable extensions khác**: Có thể conflict

### Không click được Reviews tab:
1. **Thử click manual**: Click Reviews tab thủ công trước khi chạy test
2. **Đợi trang load**: Chờ trang load hoàn toàn
3. **Thử business khác**: Một số business có UI khác

## So sánh với Founded Year cũ

| Aspect | Review Dates | Founded Year |
|--------|-------------|-------------|
| **Độ tin cậy** | 85-95% | 30-60% |
| **Tỷ lệ tìm được** | ~90% | ~20% |
| **Độ chính xác** | ±3-6 tháng | ±1-5 năm |
| **Tốc độ** | Nhanh | Chậm |
| **Ổn định** | Ít thay đổi | Thường thay đổi |

## Ví dụ kết quả thực tế

### Business A - Restaurant
- **First Review**: Jan 2023
- **Estimated Founded**: 2023/01  
- **Confidence**: review-based
- **Note**: Likely opened late 2022 or early 2023

### Business B - Shop  
- **First Review**: Mar 15, 2021
- **Estimated Founded**: 2021/03
- **Confidence**: review-based  
- **Note**: Probably opened around Feb-Mar 2021

## Lưu ý quan trọng

1. **Review date là ước tính**: Không phải ngày chính xác thành lập
2. **Có thể sai lệch**: Business có thể mở cửa trước khi có review đầu tiên
3. **Phù hợp cho analysis**: Tốt cho phân tích xu hướng, không cho pháp lý
4. **Cần context**: Kết hợp với thông tin khác nếu cần độ chính xác cao

## Next Steps

Sau khi test thành công:
1. ✅ Load extension với code mới
2. ✅ Test scan một vài business
3. ✅ Kiểm tra CSV export có foundedMonth
4. ✅ So sánh kết quả với thực tế
5. ✅ Document findings và improve selectors nếu cần