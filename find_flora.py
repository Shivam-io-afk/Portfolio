import re

path = r"C:\Users\sm255\.gemini\antigravity\brain\e8ca3446-7140-411d-ad77-183f9fc77901\.system_generated\steps\154\content.md"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

vids = re.findall(r"https?://[^\s\"']+\.(?:mp4|webm)", text)
print("VIDEOS FOUND:")
for v in set(vids):
    print(v)

flora_refs = [line for line in text.splitlines() if "flora" in line.lower()]
print(f"Lines mentioning flora: {len(flora_refs)}")
for line in flora_refs[:5]:
    print(line[:200])

