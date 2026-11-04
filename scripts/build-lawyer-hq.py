from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import pillow_avif  # registers AVIF decoding with Pillow

source = Path("assets/lawyer-avatars-bright-v2.avif")
target = Path("assets/lawyer-avatars-bright-hq.webp")
with Image.open(source) as original:
    image = original.convert("RGB")
    width, height = image.size
    if width < 400 or height < 80:
        raise ValueError(f"Unexpected portrait strip dimensions: {width}x{height}")
    target_width = max(2362, width * 2)
    target_height = round(height * target_width / width)
    upgraded = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    upgraded = upgraded.filter(ImageFilter.UnsharpMask(radius=1.25, percent=115, threshold=2))
    upgraded = ImageEnhance.Contrast(upgraded).enhance(1.025)
    upgraded.save(target, "WEBP", quality=98, method=6)
with Image.open(target) as result:
    result.verify()
with Image.open(target) as result:
    assert result.format == "WEBP"
    assert result.width >= 2362
print(f"High-density lawyer model 2: {width}x{height} -> {target_width}x{target_height}; {target.stat().st_size} bytes")
