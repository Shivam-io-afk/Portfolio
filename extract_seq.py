import cv2

cap = cv2.VideoCapture("flora_preview.mp4")
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

# Let's extract 12 frames spanning the entire video timeline
targets = [
    0,
    int(total_frames * 0.1),
    int(total_frames * 0.2),
    int(total_frames * 0.3),
    int(total_frames * 0.4),
    int(total_frames * 0.5),
    int(total_frames * 0.6),
    int(total_frames * 0.7),
    int(total_frames * 0.8),
    int(total_frames * 0.9),
    total_frames - 2
]

for idx, f_no in enumerate(targets):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_no)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f"flora_frames/seq_{idx:02d}_pct{int(f_no/total_frames*100)}.jpg", frame)

cap.release()
print("Done extracting timeline sequence.")

