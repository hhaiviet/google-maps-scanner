#!/usr/bin/env python3
"""
Script test và phân tích dữ liệu từ Google Maps Scanner
Dùng để validate và visualize data đã scan
"""

import json
import csv
from datetime import datetime
from collections import Counter
import os

def load_json_data(filename):
    """Load dữ liệu từ file JSON"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"❌ File không tồn tại: {filename}")
        return None
    except json.JSONDecodeError:
        print(f"❌ File JSON không hợp lệ: {filename}")
        return None

def analyze_data(data):
    """Phân tích dữ liệu đã scan"""
    if not data:
        print("⚠️ Không có dữ liệu để phân tích")
        return
    
    print("\n" + "="*60)
    print("📊 PHÂN TÍCH DỮ LIỆU GOOGLE MAPS")
    print("="*60)
    
    # Thống kê tổng quan
    print(f"\n📍 Tổng số địa điểm: {len(data)}")
    
    # Thống kê theo rating
    ratings = [p['rating'] for p in data if p.get('rating')]
    if ratings:
        avg_rating = sum(ratings) / len(ratings)
        print(f"⭐ Rating trung bình: {avg_rating:.2f}")
        print(f"⭐ Rating cao nhất: {max(ratings)}")
        print(f"⭐ Rating thấp nhất: {min(ratings)}")
    
    # Thống kê theo reviews
    reviews = [p['reviewCount'] for p in data if p.get('reviewCount')]
    if reviews:
        avg_reviews = sum(reviews) / len(reviews)
        print(f"💬 Số review trung bình: {avg_reviews:.0f}")
        print(f"💬 Review nhiều nhất: {max(reviews)}")
    
    # Top categories
    categories = [p['category'] for p in data if p.get('category')]
    if categories:
        cat_counter = Counter(categories)
        print(f"\n🏷️  Top 5 Loại hình kinh doanh:")
        for cat, count in cat_counter.most_common(5):
            print(f"   {count:3d}x - {cat}")
    
    # Thống kê có thông tin contact
    has_phone = sum(1 for p in data if p.get('phone'))
    has_website = sum(1 for p in data if p.get('website'))
    has_coords = sum(1 for p in data if p.get('latitude') and p.get('longitude'))
    
    print(f"\n📞 Có số điện thoại: {has_phone}/{len(data)} ({has_phone/len(data)*100:.1f}%)")
    print(f"🌐 Có website: {has_website}/{len(data)} ({has_website/len(data)*100:.1f}%)")
    print(f"🗺️  Có tọa độ GPS: {has_coords}/{len(data)} ({has_coords/len(data)*100:.1f}%)")
    
    # Top rated places
    top_rated = sorted([p for p in data if p.get('rating')], 
                      key=lambda x: (x['rating'], x.get('reviewCount', 0)), 
                      reverse=True)[:5]
    
    if top_rated:
        print(f"\n🏆 Top 5 địa điểm rating cao nhất:")
        for i, place in enumerate(top_rated, 1):
            name = place.get('name', 'N/A')[:40]
            rating = place.get('rating', 0)
            reviews = place.get('reviewCount', 0)
            print(f"   {i}. {name}")
            print(f"      ⭐ {rating} ({reviews} reviews)")

def validate_data(data):
    """Kiểm tra tính hợp lệ của dữ liệu"""
    print("\n" + "="*60)
    print("🔍 KIỂM TRA DỮ LIỆU")
    print("="*60)
    
    issues = []
    
    for i, place in enumerate(data):
        place_name = place.get('name', f'Place {i}')
        
        # Kiểm tra các trường bắt buộc
        if not place.get('name'):
            issues.append(f"#{i+1}: Thiếu tên")
        
        if not place.get('placeId'):
            issues.append(f"#{i+1} ({place_name}): Thiếu Place ID")
        
        if not place.get('url'):
            issues.append(f"#{i+1} ({place_name}): Thiếu URL")
        
        # Kiểm tra rating
        rating = place.get('rating')
        if rating and (rating < 0 or rating > 5):
            issues.append(f"#{i+1} ({place_name}): Rating không hợp lệ: {rating}")
        
        # Kiểm tra coordinates
        lat = place.get('latitude')
        lng = place.get('longitude')
        if lat and (lat < -90 or lat > 90):
            issues.append(f"#{i+1} ({place_name}): Latitude không hợp lệ: {lat}")
        if lng and (lng < -180 or lng > 180):
            issues.append(f"#{i+1} ({place_name}): Longitude không hợp lệ: {lng}")
    
    if issues:
        print(f"\n⚠️  Tìm thấy {len(issues)} vấn đề:")
        for issue in issues[:10]:  # Hiển thị tối đa 10 issues
            print(f"   - {issue}")
        if len(issues) > 10:
            print(f"   ... và {len(issues) - 10} vấn đề khác")
    else:
        print("\n✅ Dữ liệu hợp lệ! Không có vấn đề nào.")

def export_to_excel_format(data, output_file='output_formatted.csv'):
    """Export sang CSV với format đẹp cho Excel"""
    if not data:
        print("⚠️ Không có dữ liệu để export")
        return
    
    fieldnames = [
        'STT', 'Tên', 'Địa chỉ', 'Điện thoại', 'Website',
        'Rating', 'Số reviews', 'Loại hình', 'Giờ mở cửa',
        'Latitude', 'Longitude', 'Google Maps URL'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for i, place in enumerate(data, 1):
            writer.writerow({
                'STT': i,
                'Tên': place.get('name', ''),
                'Địa chỉ': place.get('address', ''),
                'Điện thoại': place.get('phone', ''),
                'Website': place.get('website', ''),
                'Rating': place.get('rating', ''),
                'Số reviews': place.get('reviewCount', ''),
                'Loại hình': place.get('category', ''),
                'Giờ mở cửa': place.get('hours', ''),
                'Latitude': place.get('latitude', ''),
                'Longitude': place.get('longitude', ''),
                'Google Maps URL': place.get('url', '')
            })
    
    print(f"\n✅ Đã export sang: {output_file}")
    print(f"   Mở bằng Excel để xem dữ liệu được format đẹp!")

def generate_html_report(data, output_file='report.html'):
    """Tạo báo cáo HTML với map"""
    if not data:
        return
    
    # Lấy places có coordinates
    places_with_coords = [p for p in data if p.get('latitude') and p.get('longitude')]
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Google Maps Scanner Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 30px; border-radius: 10px; text-align: center; }}
        .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }}
        .stat-box {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .stat-value {{ font-size: 32px; font-weight: bold; color: #667eea; }}
        .stat-label {{ color: #666; margin-top: 5px; }}
        .places {{ background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }}
        .place-card {{ border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; 
                       background: #f9f9f9; }}
        .place-name {{ font-size: 18px; font-weight: bold; color: #333; }}
        .place-info {{ color: #666; margin-top: 5px; }}
        .rating {{ color: #ffa500; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🗺️ Google Maps Scanner Report</h1>
        <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <div class="stat-value">{len(data)}</div>
            <div class="stat-label">Tổng địa điểm</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{sum(1 for p in data if p.get('phone'))}</div>
            <div class="stat-label">Có số ĐT</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{sum(1 for p in data if p.get('website'))}</div>
            <div class="stat-label">Có Website</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{len(places_with_coords)}</div>
            <div class="stat-label">Có tọa độ</div>
        </div>
    </div>
    
    <div class="places">
        <h2>📍 Danh sách địa điểm</h2>
"""
    
    for place in data[:50]:  # Hiển thị tối đa 50 places
        rating_str = f"⭐ {place.get('rating', 'N/A')}" if place.get('rating') else ''
        reviews_str = f"({place.get('reviewCount', 0)} reviews)" if place.get('reviewCount') else ''
        
        html += f"""
        <div class="place-card">
            <div class="place-name">{place.get('name', 'N/A')}</div>
            <div class="place-info">📍 {place.get('address', 'N/A')}</div>
            <div class="place-info">🏷️ {place.get('category', 'N/A')}</div>
            <div class="place-info rating">{rating_str} {reviews_str}</div>
            {f'<div class="place-info">📞 {place.get("phone")}</div>' if place.get('phone') else ''}
            {f'<div class="place-info">🌐 <a href="{place.get("website")}" target="_blank">{place.get("website")}</a></div>' if place.get('website') else ''}
        </div>
"""
    
    html += """
    </div>
</body>
</html>
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"\n✅ Đã tạo báo cáo HTML: {output_file}")
    print(f"   Mở file bằng browser để xem!")

def main():
    """Main function"""
    print("🎯 Google Maps Scanner - Data Analyzer")
    print("="*60)
    
    # Tìm file JSON gần nhất
    json_files = [f for f in os.listdir('.') if f.endswith('.json') and 'google-maps-data' in f]
    
    if not json_files:
        print("\n⚠️  Không tìm thấy file data nào!")
        print("\n💡 Hướng dẫn:")
        print("   1. Scan dữ liệu bằng extension")
        print("   2. Export JSON")
        print("   3. Đặt file vào cùng thư mục với script này")
        print("   4. Chạy lại script")
        return
    
    # Dùng file mới nhất
    latest_file = max(json_files, key=os.path.getmtime)
    print(f"\n📂 Đang phân tích: {latest_file}")
    
    # Load data
    data = load_json_data(latest_file)
    
    if data:
        # Phân tích
        analyze_data(data)
        
        # Validate
        validate_data(data)
        
        # Export
        print("\n" + "="*60)
        print("📤 EXPORT DỮ LIỆU")
        print("="*60)
        
        export_to_excel_format(data)
        generate_html_report(data)
        
        print("\n" + "="*60)
        print("✅ HOÀN TẤT!")
        print("="*60)
        print("\n📁 Files đã tạo:")
        print("   - output_formatted.csv (mở bằng Excel)")
        print("   - report.html (mở bằng browser)")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Đã hủy bởi người dùng")
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
