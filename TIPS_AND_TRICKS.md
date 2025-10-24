# 💡 Tips & Tricks - Google Maps Scanner Pro

## 🚀 Boost Your Scanning x2 x4

### ⚡ Tối Ưu Tốc Độ

#### 1. Parallel Scanning Strategy
```
Thay vì scan tuần tự, scan song song nhiều khu vực:
- Tab 1: Quận 1, TP.HCM
- Tab 2: Quận 3, TP.HCM  
- Tab 3: Quận 5, TP.HCM
→ Tốc độ x3 nhanh hơn!
```

#### 2. Optimal Settings cho Speed
```javascript
maxResults: 100-200  // Sweet spot
scrollDelay: 1500ms  // Fast but safe
detailLevel: 'basic' // Skip detail clicks
```

#### 3. Peak Time Scanning
- ✅ Scan vào 2-5h sáng (ít traffic)
- ✅ Dùng VPN để rotate IP
- ❌ Tránh giờ cao điểm (9-11h, 13-15h)

---

## 🎯 Advanced Queries

### Google Maps Search Tricks

#### 1. Category + Location
```
"quán cà phê" + "quận 1, hồ chí minh"
"gym" + "hà nội"
"siêu thị" + "đà nẵng"
```

#### 2. Radius Search
```
Vào Maps → Click "Nearby" → Chọn radius
Hoặc: restaurants near me
```

#### 3. Filter by Rating
```
Sau khi search → Filter:
- Rating: 4.0+
- Price: $, $$, $$$, $$$$
- Hours: Open now
```

#### 4. Multiple Categories
```
Scan riêng từng category rồi merge:
1. "restaurant"
2. "cafe"  
3. "bar"
→ Merge 3 CSVs lại
```

---

## 📊 Data Processing với Python

### 1. Merge Multiple CSVs
```python
import pandas as pd
import glob

# Đọc tất cả CSV files
csv_files = glob.glob('google-maps-data*.csv')
dfs = [pd.read_csv(f) for f in csv_files]

# Merge và loại trùng
merged = pd.concat(dfs, ignore_index=True)
merged = merged.drop_duplicates(subset=['Place ID'])

# Save
merged.to_csv('merged_data.csv', index=False)
print(f"✅ Merged {len(merged)} unique places")
```

### 2. Filter by Rating/Reviews
```python
import pandas as pd

df = pd.read_csv('google-maps-data.csv')

# Filter rating >= 4.5 và reviews >= 100
quality_places = df[
    (df['Rating'] >= 4.5) & 
    (df['Số đánh giá'] >= 100)
]

quality_places.to_csv('high_quality_places.csv', index=False)
print(f"✅ Found {len(quality_places)} high quality places")
```

### 3. Geocoding & Distance
```python
import pandas as pd
from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lon1, lat2, lon2):
    """Tính khoảng cách giữa 2 điểm (km)"""
    R = 6371  # Bán kính Trái Đất (km)
    
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c

# Load data
df = pd.read_csv('google-maps-data.csv')

# Tính khoảng cách từ vị trí của bạn
my_lat, my_lng = 10.7769, 106.7009  # Saigon

df['Distance_km'] = df.apply(
    lambda row: haversine_distance(my_lat, my_lng, row['Latitude'], row['Longitude'])
    if pd.notna(row['Latitude']) else None,
    axis=1
)

# Sort theo khoảng cách
df_sorted = df.sort_values('Distance_km')
df_sorted.to_csv('places_by_distance.csv', index=False)
```

### 4. Data Enrichment
```python
import pandas as pd
import requests

def enrich_with_wikipedia(place_name):
    """Tìm thông tin Wikipedia"""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{place_name}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return data.get('extract', '')
    except:
        pass
    return ''

df = pd.read_csv('google-maps-data.csv')
df['Wikipedia_Info'] = df['Tên'].apply(enrich_with_wikipedia)
df.to_csv('enriched_data.csv', index=False)
```

---

## 🗺️ Visualization với Python

### 1. Plot Map với Folium
```python
import pandas as pd
import folium

df = pd.read_csv('google-maps-data.csv')

# Tạo map centered ở trung tâm
center_lat = df['Latitude'].mean()
center_lng = df['Longitude'].mean()

m = folium.Map(location=[center_lat, center_lng], zoom_start=12)

# Thêm markers
for idx, row in df.iterrows():
    if pd.notna(row['Latitude']) and pd.notna(row['Longitude']):
        popup_text = f"""
        <b>{row['Tên']}</b><br>
        Rating: {row['Rating']} ⭐<br>
        {row['Địa chỉ']}<br>
        <a href="{row['URL']}" target="_blank">View on Maps</a>
        """
        
        folium.Marker(
            location=[row['Latitude'], row['Longitude']],
            popup=popup_text,
            icon=folium.Icon(color='red', icon='info-sign')
        ).add_to(m)

m.save('map_visualization.html')
print("✅ Map saved to map_visualization.html")
```

### 2. Heatmap Density
```python
import pandas as pd
import folium
from folium.plugins import HeatMap

df = pd.read_csv('google-maps-data.csv')

# Prepare data
heat_data = df[['Latitude', 'Longitude']].dropna().values.tolist()

# Create map
m = folium.Map(location=[df['Latitude'].mean(), df['Longitude'].mean()], zoom_start=11)

# Add heatmap
HeatMap(heat_data).add_to(m)

m.save('heatmap.html')
print("✅ Heatmap saved!")
```

### 3. Bar Chart - Top Categories
```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('google-maps-data.csv')

# Count categories
category_counts = df['Loại hình'].value_counts().head(10)

# Plot
plt.figure(figsize=(12, 6))
category_counts.plot(kind='barh', color='#667eea')
plt.title('Top 10 Loại Hình Kinh Doanh', fontsize=16, weight='bold')
plt.xlabel('Số lượng', fontsize=12)
plt.ylabel('Loại hình', fontsize=12)
plt.tight_layout()
plt.savefig('top_categories.png', dpi=300)
print("✅ Chart saved to top_categories.png")
```

---

## 🔗 Integration Ideas

### 1. Google Sheets Auto-Upload
```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd

# Setup credentials
scope = ['https://spreadsheets.google.com/feeds']
creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
client = gspread.authorize(creds)

# Load data
df = pd.read_csv('google-maps-data.csv')

# Upload to Google Sheets
sheet = client.open('Google Maps Data').sheet1
sheet.clear()
sheet.update([df.columns.values.tolist()] + df.values.tolist())

print("✅ Uploaded to Google Sheets!")
```

### 2. Airtable Integration
```python
import requests
import pandas as pd

AIRTABLE_API_KEY = 'your_api_key'
BASE_ID = 'your_base_id'
TABLE_NAME = 'Places'

df = pd.read_csv('google-maps-data.csv')

for idx, row in df.iterrows():
    data = {
        "fields": {
            "Name": row['Tên'],
            "Address": row['Địa chỉ'],
            "Rating": row['Rating'],
            "Phone": row['Điện thoại']
        }
    }
    
    response = requests.post(
        f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}',
        headers={'Authorization': f'Bearer {AIRTABLE_API_KEY}'},
        json=data
    )
    print(f"✅ Added: {row['Tên']}")
```

### 3. WhatsApp Blast List
```python
import pandas as pd

df = pd.read_csv('google-maps-data.csv')

# Filter có số điện thoại
has_phone = df[df['Điện thoại'].notna()]

# Format cho WhatsApp
phones = has_phone['Điện thoại'].str.replace(r'\D', '', regex=True)  # Remove non-digits
phones = '+84' + phones.str[-9:]  # Add country code

# Save
with open('whatsapp_list.txt', 'w') as f:
    for phone in phones:
        f.write(f"{phone}\n")

print(f"✅ Exported {len(phones)} phone numbers")
```

---

## 🎨 Advanced Customization

### Custom Content Script Selectors
Nếu Google thay đổi HTML, update selectors trong `content.js`:

```javascript
// Trong extractBasicData()
const SELECTORS = {
    name: '.fontHeadlineSmall, .qBF1Pd, [class*="fontHead"]',
    rating: 'span[role="img"], [aria-label*="stars"]',
    address: '.W4Efsd span, [class*="address"]',
    phone: 'button[data-item-id*="phone"]',
    website: 'a[data-item-id*="authority"]'
};
```

### Add Custom Fields
```javascript
// Trong extractBasicData(), thêm:
data.priceRange = '';
const priceElement = parentDiv.querySelector('[aria-label*="Price"]');
if (priceElement) {
    data.priceRange = priceElement.textContent.trim();
}
```

### Custom Export Formats

#### Excel với Styling
```javascript
// Trong popup.js
function exportToExcel(data) {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add styling
    ws['!cols'] = [
        {wch: 30},  // Name column width
        {wch: 40},  // Address
        {wch: 15}   // Phone
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Places');
    XLSX.writeFile(wb, 'data.xlsx');
}
```

---

## 🛡️ Anti-Detection Tips

### 1. Human-like Behavior
```javascript
// Trong content.js, thêm random delays:
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

await sleep(randomDelay(1500, 2500));  // Random 1.5-2.5s
```

### 2. Rotate User Agents
```javascript
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    'Mozilla/5.0 (X11; Linux x86_64)...'
];

// Rotate randomly
```

### 3. Respect Rate Limits
```javascript
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 30;

setInterval(() => {
    requestCount = 0;  // Reset every minute
}, 60000);
```

---

## 📈 Analytics Dashboard

### Create Simple Dashboard
```python
import pandas as pd
import dash
from dash import dcc, html
import plotly.express as px

df = pd.read_csv('google-maps-data.csv')

app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1('Google Maps Scanner Dashboard'),
    
    dcc.Graph(
        figure=px.bar(
            df['Loại hình'].value_counts().head(10),
            title='Top Categories'
        )
    ),
    
    dcc.Graph(
        figure=px.scatter_mapbox(
            df, 
            lat='Latitude', 
            lon='Longitude',
            hover_name='Tên',
            zoom=11
        )
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
```

---

## 🚀 Pro Automation Scripts

### 1. Auto-Schedule Scanning
```python
import schedule
import time
from selenium import webdriver

def scan_and_export():
    # Open Chrome with extension
    driver = webdriver.Chrome()
    driver.get('https://www.google.com/maps')
    
    # Trigger extension scan
    # ... automation code ...
    
    driver.quit()

# Schedule daily at 3 AM
schedule.every().day.at("03:00").do(scan_and_export)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### 2. Monitor Changes
```python
import pandas as pd
import time

def check_new_places():
    old_df = pd.read_csv('old_data.csv')
    new_df = pd.read_csv('new_data.csv')
    
    new_places = new_df[~new_df['Place ID'].isin(old_df['Place ID'])]
    
    if len(new_places) > 0:
        print(f"🆕 Found {len(new_places)} new places!")
        # Send notification
        # send_email(new_places)
    
    return new_places

# Run every hour
while True:
    check_new_places()
    time.sleep(3600)
```

---

## 💰 Business Use Cases

### 1. Lead Generation
- Scan competitors' customers
- Find businesses without websites
- Cold call/email outreach

### 2. Market Research
- Analyze competitor density
- Find underserved areas
- Price analysis

### 3. Sales Territory Planning
- Map sales regions
- Assign leads to reps
- Track coverage

### 4. Real Estate Analysis
- Find properties near businesses
- Analyze foot traffic
- Investment decisions

---

## 🎓 Learning Resources

### APIs to Explore
- Google Places API (official)
- Yelp Fusion API
- Foursquare API
- OpenStreetMap Overpass API

### Tools to Combine
- Puppeteer (headless browser)
- Scrapy (web scraping)
- BeautifulSoup (HTML parsing)
- Pandas (data analysis)

---

**Remember**: Với Python + Chrome Extension, bạn có thể boost productivity x2, x4 hoặc hơn nữa! 🚀

*"Work smarter, not harder!"*
