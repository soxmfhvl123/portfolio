import os
from PIL import Image

def super_compress(directory):
    total_saved = 0
    count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            path = os.path.join(root, file)
            # Only compress very large files (e.g. over 150KB)
            if not file.lower().endswith(('.png', '.jpg', '.jpeg')) or os.path.getsize(path) < 150 * 1024:
                continue
                
            try:
                orig_size = os.path.getsize(path)
                with Image.open(path) as img:
                    # Convert to RGB to ensure compatibility and strip heavy palettes/alpha channels
                    img = img.convert('RGB')
                    
                    # Target 600px width maximum
                    if img.width > 600 or img.height > 600:
                        img.thumbnail((600, 600), Image.Resampling.LANCZOS)
                        
                    # Force save as highly compressed JPEG, overriding original file
                    # Browsers parse magic bytes, not extensions, so .png extension with JPEG data works flawlessly
                    img.save(path, 'JPEG', quality=40, optimize=True)
                        
                new_size = os.path.getsize(path)
                saved = orig_size - new_size
                if saved > 0:
                    total_saved += saved
                    count += 1
                    print(f"Squashed {file}: {orig_size//1024}KB -> {new_size//1024}KB")
            except Exception as e:
                pass
                
    print(f"\nSuper-compressed {count} files, saved {total_saved//1024//1024}MB")

if __name__ == "__main__":
    super_compress(r"c:\Users\soxmf\Downloads\jinprofile\portfolio\img")
