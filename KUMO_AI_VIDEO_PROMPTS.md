# Kumo Visual Style — AI Video Generation & Frame Extraction Guide

To upgrade the generated placeholder frames to cinematic AI video renders, use this prompt sequence with any modern video model (**Runway Gen-3 Alpha**, **Luma Dream Machine**, **Kling 1.5**, or **Midjourney v6 + Hailuo**).

---

## 1. Cinematic Scene Prompts (Single Continuous Camera Flight)

For the seamless scroll scrub to feel cinematic, the video should feel like a single vertical ascension from street level into the upper atmosphere.

### Scene 1: Street-Level Autumn Avenue (Hero • Frames 01–25)
* **Prompt**:
  > *Cinematic anime painted style, Makoto Shinkai aesthetic, autumn avenue in Tokyo lined with vibrant glowing golden-orange ginkgo and Japanese maple trees. Warm amber morning sunlight casting soft long shadows on damp cobblestones. Swirling red and golden leaves gently drifting across the camera. Slow, continuous smooth vertical tilt and upward crane rising from asphalt towards tree canopies. 4k resolution, 60fps, rich painterly color palette, film grain.*
* **Motion / Camera**: Vertical Pan / Crane Up (Motion Speed: 4 / 10).

### Scene 2: Ascending Above Rooftops (Works • Frames 26–48)
* **Prompt**:
  > *Anime cinematic style, camera rising continuously above traditional charcoal Japanese tiled rooftops, chimney vents, and delicate telegraph wires at golden hour sunset. A soft warm peach and apricot haze begins gathering as the camera climbs into the lower mist. Warm orange sunset reflections catching roof edges. Studio Ghibli atmosphere, ultra-clean line art, soft atmospheric depth.*
* **Motion / Camera**: Smooth continuous upward elevation (Up 0.6).

### Scene 3: Climbing Through Dreamy Cloud Layer (Arsenal & Skills • Frames 49–72)
* **Prompt**:
  > *Volumetric painted clouds, camera gliding directly through towering, fluffy cream cumulus cloud banks. Brilliant warm golden sunbeams breaking through cloud crevices, illuminating cloud edges with glowing amber and peach rim-light. Deep cerulean and royal blue sky opening between vapor gaps. Floating dust specks catching the light, painterly high-definition cloud textures.*
* **Motion / Camera**: Forward and upward drift through clouds.

### Scene 4: Breaking into Boundless Open Sky (Contact & Footer • Frames 73–90)
* **Prompt**:
  > *Ascending above the entire cloud deck into boundless crystal-clear open sky. Blinding radiant golden sunburst with subtle anamorphic lens flare and golden dust particles. Distant soft cloud sea stretching towards infinity below. Pure, peaceful, limitless horizon. Anime cinematic painted film still, breathtaking lighting.*
* **Motion / Camera**: Leveling off into a steady, majestic hover overlooking the sunlit horizon.

---

## 2. Converting Video Clips to Sequence Frames

Once you download your generated MP4 (e.g., `kumo_video.mp4`):

1. Place the video file in the project root: `c:\WEB\React\3d'ss\portfolio\kumo_video.mp4`
2. Run the extraction script:
```bash
python -c "
import cv2, os

cap = cv2.VideoCapture('kumo_video.mp4')
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
out_dir = 'public/frames'
os.makedirs(out_dir, exist_ok=True)

TARGET_FRAMES = 90
for i in range(1, TARGET_FRAMES + 1):
    f_idx = int((i - 1) / (TARGET_FRAMES - 1) * (total - 1))
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_idx)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f'{out_dir}/frame_{i:03d}.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])

cap.release()
print('Successfully extracted 90 custom frames to public/frames!')
"
```
3. Refresh your browser at `http://localhost:5173/` — your custom AI video will instantly scrub with the scroll!

