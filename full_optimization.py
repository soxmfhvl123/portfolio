import os
from PIL import Image

def optimize_images(directory, max_size=(1920, 1920), quality=75):
    """
    Recursively optimizes images in the given directory.
    - Resizes to max_size if larger.
    - Compresses in place.
    - Skips hidden directories (like .git).
    """
    count = 0
    skipped = 0
    errors = 0
    
    for root, dirs, files in os.walk(directory):
        # Skip hidden directories like .git
        if any(part.startswith('.') for part in root.split(os.sep)):
            continue
            
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                path = os.path.join(root, file)
                try:
                    size_mb = os.path.getsize(path) / (1024 * 1024)
                    
                    # Only process images over 1MB
                    if size_mb < 0.8: # Using 0.8 to be safe and catch near-1MB files
                        skipped += 1
                        continue
                        
                    with Image.open(path) as img:
                        original_size = img.size
                        # Resize if larger than max_size
                        if img.width > max_size[0] or img.height > max_size[1]:
                            img.thumbnail(max_size, Image.Resampling.LANCZOS)
                            print(f"Resized {file}: {original_size} -> {img.size}")
                        
                        # Save in place with compression
                        save_format = img.format if img.format else 'JPEG'
                        if save_format == 'PNG':
                            # For PNG, we can use optimize=True and potentially reduce colors if needed, 
                            # but for now we just optimize.
                            img.save(path, format='PNG', optimize=True)
                        elif save_format in ['JPEG', 'MPO']:
                            img.save(path, format='JPEG', quality=quality, optimize=True)
                        else:
                            img.save(path, quality=quality, optimize=True)
                            
                    new_size_mb = os.path.getsize(path) / (1024 * 1024)
                    print(f"Optimized {file}: {size_mb:.2f}MB -> {new_size_mb:.2f}MB")
                    count += 1
                except Exception as e:
                    print(f"Error processing {file}: {e}")
                    errors += 1

    print(f"\nOptimization complete.")
    print(f"Processed: {count}")
    print(f"Skipped (<1MB): {skipped}")
    print(f"Errors: {errors}")

if __name__ == "__main__":
    base_dir = r"c:\Users\soxmf\Downloads\jinprofile"
    print(f"Starting optimization in {base_dir}...")
    optimize_images(base_dir)
