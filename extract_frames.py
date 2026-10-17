import cv2
import os

cap = cv2.VideoCapture("flora_preview.mp4")
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Total frames: {total_frames}, FPS: {fps}, Dimensions: {width}x{height}")

os.makedirs("flora_frames", exist_ok=True)

# Sample 8 evenly spaced keyframes across the preview
step = max(1, total_frames // 8) if total_frames > 0 else 30
extracted = 0

for i in range(0, total_frames, step):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ret, frame = cap.read()
    if ret:
        filename = f"flora_frames/frame_{extracted:02d}_f{i}.jpg"
        cv2.imwrite(filename, frame)
        print(f"Extracted {filename} (at frame {i})")
        extracted += 1
    if extracted >= 8:
        break

cap.release()
print(f"Finished extracting {extracted} keyframes.")

