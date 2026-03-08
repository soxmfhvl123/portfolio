import os
from PIL import Image

def optimize_images(directory, max_size=(1024, 1024), quality=80):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                path = os.path.join(root, file)
                try:
                    with Image.open(path) as img:
                        # Skip if already small
                        if os.path.getsize(path) < 100 * 1024 and img.width <= max_size[0]:
                            continue
                            
                        # Resize
                        img.thumbnail(max_size, Image.Resampling.LANCZOS)
                        
                        # Save as WebP if it's a large PNG, else overwrite
                        if file.lower().endswith('.png') and os.path.getsize(path) > 500 * 1024:
                            new_path = os.path.splitext(path)[0] + '.webp'
                            img.save(new_path, 'WEBP', quality=quality)
                            print(f"Converted {file} to WebP: {new_path}")
                        else:
                            img.save(path, optimize=True, quality=quality)
                            print(f"Optimized {file}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

def generate_thumbs(src_dir, dest_dir, thumb_size=(128, 128)):
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    
    for file in os.listdir(src_dir):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            src_path = os.path.join(src_dir, file)
            dest_path = os.path.join(dest_dir, file)
            
            if os.path.exists(dest_path):
                continue
                
            try:
                with Image.open(src_path) as img:
                    img.thumbnail(thumb_size, Image.Resampling.LANCZOS)
                    img.save(dest_path, quality=60, optimize=True)
                    print(f"Generated thumb for {file}")
            except Exception as e:
                print(f"Error imaging {file}: {e}")

if __name__ == "__main__":
    # Optimize Portfolio MOIF
    portfolio_moif = r"c:\Users\soxmf\Downloads\jinprofile\portfolio\img\OTHERPROJECTS\MOIF"
    print("Optimizing Portfolio MOIF...")
    optimize_images(portfolio_moif)
    
    # Generate Thumbs for Digital Debris
    debris_src = r"c:\Users\soxmf\Downloads\jinprofile\DataFlowLiquid\poster\POSTERS"
    debris_dest = r"c:\Users\soxmf\Downloads\jinprofile\DataFlowLiquid\poster\THUMBS"
    print("\nGenerating Thumbs for Digital Debris...")
    generate_thumbs(debris_src, debris_dest)
