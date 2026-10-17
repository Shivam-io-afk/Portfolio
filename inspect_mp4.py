import re

with open("flora_preview.mp4", "rb") as f:
    data = f.read(1024 * 1024)

# Look for text strings in the mp4 (e.g. metadata)
strings = re.findall(b"[\x20-\x7E]{4,}", data)
print(f"Total ASCII strings in MP4 header: {len(strings)}")
for s in strings[:15]:
    print(s.decode('ascii', errors='ignore'))

