import os
from PIL import Image

def optimize_images_in_place(directory, max_size=(800, 800), quality=75):
    total_saved = 0
    count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_lower = file.lower()
            if file_lower.endswith(('.png', '.jpg', '.jpeg')):
                path = os.path.join(root, file)
                try:
                    orig_size = os.path.getsize(path)
                    if orig_size < 300 * 1024:
                        continue
                        
                    with Image.open(path) as img:
                        fmt = img.format
                        
                        # Fix for PNGs with palette -> RGB/RGBA
                        if img.mode not in ('RGB', 'RGBA'):
                            img = img.convert('RGBA') if 'A' in img.getbands() else img.convert('RGB')
                            
                        # Resize if too large
                        need_resize = img.width > max_size[0] or img.height > max_size[1]
                        
                        if need_resize:
                            img.thumbnail(max_size, Image.Resampling.LANCZOS)
                        
                        # Save in place with optimization
                        save_kwargs = {'optimize': True}
                        if fmt in ('JPEG', 'JPG'):
                            save_kwargs['quality'] = quality
                            img.save(path, 'JPEG', **save_kwargs)
                        elif fmt == 'PNG':
                            # Quantize heavy PNGs for massive savings
                            img = img.quantize(colors=256, method=2) if orig_size > 1 * 1024 * 1024 else img
                            img.save(path, 'PNG', optimize=True)
                        else:
                            img.save(path, fmt, **save_kwargs)
                            
                    new_size = os.path.getsize(path)
                    saved = orig_size - new_size
                    if saved > 0:
                        total_saved += saved
                        count += 1
                        print(f"Optimized {file}: {orig_size//1024}KB -> {new_size//1024}KB (-{saved//1024}KB)")
                except Exception as e:
                    print(f"Failed {file}: {e}")
                    
    print(f"\nFinished! Optimized {count} images, saved a total of {total_saved // (1024*1024)} MB")

if __name__ == "__main__":
    print("Starting intensive image optimization for portfolio/img...")
    optimize_images_in_place(r"c:\Users\soxmf\Downloads\jinprofile\portfolio\img")
