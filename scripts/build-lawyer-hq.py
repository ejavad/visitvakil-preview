from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

source = Path("assets/approved-lawyers.jpg")
target = Path("assets/approved-lawyers-hq.webp")
with Image.open(source) as original:
    if original.format != "JPEG":
        raise ValueError("Expected existing approved JPEG illustration")
    image = original.convert("RGB")
    width, height = image.size
    # Higher-density output for retina displays. This does not invent the missing
    # detail of a real high-resolution source; replace when approved originals exist.
    upgraded = image.resize((1180, 280), Image.Resampling.LANCZOS)
    upgraded = ImageEnhance.Contrast(upgraded).enhance(1.035)
    upgraded = upgraded.filter(ImageFilter.UnsharpMask(radius=1.15, percent=95, threshold=2))
    upgraded.save(target, "WEBP", quality=95, method=6)
with Image.open(target) as result:
    result.verify()
with Image.open(target) as result:
    assert result.format == "WEBP"
    assert result.size == (1180, 280)
print(f"Image upgraded from {width}x{height} to 1180x280: {target.stat().st_size} bytes")
