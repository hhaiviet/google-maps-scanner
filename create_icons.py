#!/usr/bin/env python3
"""
Script tạo icons cho Chrome Extension
Chạy: python3 create_icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient_background(size, color1='#667eea', color2='#764ba2'):
    """Tạo gradient background"""
    img = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(img)
    
    # Convert hex to RGB
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    # Draw gradient
    for y in range(size):
        ratio = y / size
        r = int(rgb1[0] * (1 - ratio) + rgb2[0] * ratio)
        g = int(rgb1[1] * (1 - ratio) + rgb2[1] * ratio)
        b = int(rgb1[2] * (1 - ratio) + rgb2[2] * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    return img

def create_map_icon(size):
    """Tạo icon map với pin location"""
    # Create gradient background
    img = create_gradient_background(size)
    draw = ImageDraw.Draw(img)
    
    # Vẽ hình tròn trắng ở giữa
    padding = size // 4
    circle_bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(circle_bbox, fill='white')
    
    # Vẽ location pin
    center_x = size // 2
    center_y = size // 2
    
    # Pin head (circle)
    pin_radius = size // 8
    pin_top = center_y - size // 10
    pin_circle = [
        center_x - pin_radius,
        pin_top - pin_radius,
        center_x + pin_radius,
        pin_top + pin_radius
    ]
    draw.ellipse(pin_circle, fill='#667eea', outline='#667eea')
    
    # Pin inner circle (white dot)
    inner_radius = pin_radius // 3
    inner_circle = [
        center_x - inner_radius,
        pin_top - inner_radius,
        center_x + inner_radius,
        pin_top + inner_radius
    ]
    draw.ellipse(inner_circle, fill='white')
    
    # Pin point (triangle)
    pin_height = size // 6
    triangle = [
        (center_x, pin_top + pin_radius + pin_height),  # Bottom point
        (center_x - pin_radius // 2, pin_top + pin_radius),  # Left
        (center_x + pin_radius // 2, pin_top + pin_radius)   # Right
    ]
    draw.polygon(triangle, fill='#667eea')
    
    return img

def create_simple_icon(size):
    """Tạo icon đơn giản với chữ M"""
    img = create_gradient_background(size)
    draw = ImageDraw.Draw(img)
    
    # Vẽ chữ M
    font_size = int(size * 0.6)
    try:
        # Thử load font hệ thống
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    text = "M"
    
    # Tính vị trí text ở giữa
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2 - bbox[1])
    
    # Vẽ shadow
    shadow_offset = max(1, size // 32)
    draw.text(
        (position[0] + shadow_offset, position[1] + shadow_offset),
        text,
        fill='rgba(0,0,0,0.3)',
        font=font
    )
    
    # Vẽ text chính
    draw.text(position, text, fill='white', font=font)
    
    return img

def main():
    """Main function"""
    print("🎨 Google Maps Scanner - Icon Creator")
    print("=" * 50)
    
    # Tạo folder icons
    os.makedirs('icons', exist_ok=True)
    print("📁 Created 'icons' directory")
    
    sizes = [16, 48, 128]
    
    print("\n🎯 Creating icons...")
    
    for size in sizes:
        # Tạo icon với pin location
        icon = create_map_icon(size)
        filename = f'icons/icon{size}.png'
        icon.save(filename, 'PNG')
        print(f"  ✅ Created {filename} ({size}x{size}px)")
    
    print("\n" + "=" * 50)
    print("🎉 All icons created successfully!")
    print("\n📝 Files created:")
    for size in sizes:
        print(f"  - icons/icon{size}.png")
    
    print("\n💡 Next steps:")
    print("  1. Check the icons folder")
    print("  2. Load the extension in Chrome")
    print("  3. Enjoy scanning Google Maps! 🚀")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("  - Make sure Pillow is installed: pip install Pillow")
        print("  - Run from the extension directory")
        exit(1)
