import re
import urllib.request
import json

url = "https://www.getlayers.ai/layer/flora"
req = urllib.request.Request(url, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.getlayers.ai/"
})

try:
    with urllib.request.urlopen(req) as r:
        content = r.read().decode("utf-8", errors="ignore")
        
    prompts = re.findall(r'"prompt":"(.*?)(?<!\\)"', content)
    print(f"Prompts found: {len(prompts)}")
    for i, p in enumerate(prompts):
        print(f"\n--- PROMPT {i} ---")
        # unescape json string
        try:
            print(json.loads(f'"{p}"')[:1000])
        except:
            print(p[:1000])
except Exception as e:
    print(f"Error: {e}")

