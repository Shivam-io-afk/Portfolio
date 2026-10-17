import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

def clamp(val, min_val=0, max_val=255):
    return max(min_val, min(max_val, int(val)))

def lerp_color(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(clamp(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def generate_painterly_kumo_frames():
    out_dir = os.path.join(os.getcwd(), 'public', 'frames')
    os.makedirs(out_dir, exist_ok=True)

    width = 1280
    height = 720
    total_frames = 90

    print(f"Generating {total_frames} high-fidelity painterly Kumo sequence frames...")
    random.seed(4242)

    # 1. Precompute layered buildings with lit windows for parallax background
    bg_buildings = []
    for layer in range(3): # 0: far, 1: mid, 2: near
        depth = 0.35 + layer * 0.3
        b_count = 12 + layer * 6
        layer_buildings = []
        for b in range(b_count):
            bx = (b * (width / (b_count - 2))) + random.uniform(-30, 30)
            bw = random.uniform(60, 110) * depth
            bh = random.uniform(110, 240) * depth
            # Window grid
            windows = []
            rows = int(bh // 18)
            cols = int(bw // 16)
            for r in range(1, max(2, rows - 1)):
                for c in range(1, max(2, cols - 1)):
                    if random.random() < 0.45:
                        windows.append((c * 15, r * 16))
            layer_buildings.append({
                'x': bx, 'w': bw, 'h': bh,
                'windows': windows,
                'depth': depth
            })
        bg_buildings.append(layer_buildings)

    # 2. Precompute organic tree canopy clusters (hundreds of tiny overlapping soft dabs)
    tree_canopies = []
    for side in [-1, 1]:
        for dist_idx in range(6):
            t_depth = 0.25 + dist_idx * 0.15
            cx = width * 0.5 + side * (width * 0.22 + t_depth * width * 0.35)
            cy = height * 0.48 + t_depth * height * 0.35
            leaf_blobs = []
            cluster_color = random.choice([
                (232, 119, 46), # Kumo orange
                (218, 75, 32),  # Crimson maple
                (245, 160, 40), # Golden amber
                (250, 190, 60), # Bright ochre
                (195, 50, 35)   # Deep vermilion
            ])
            # 35 small micro-dabs per canopy
            for _ in range(40):
                ang = random.uniform(0, math.pi * 2)
                rad = random.uniform(10, 75) * t_depth
                leaf_blobs.append({
                    'ox': math.cos(ang) * rad,
                    'oy': math.sin(ang) * rad * 0.8,
                    'size': random.uniform(12, 28) * t_depth,
                    'color': cluster_color
                })
            tree_canopies.append({
                'cx': cx, 'cy': cy, 'depth': t_depth,
                'trunk_w': int(10 * t_depth),
                'trunk_h': int(130 * t_depth),
                'blobs': leaf_blobs
            })
    tree_canopies.sort(key=lambda item: item['depth'])

    # 3. Micro leaf particles: reduced count by ~70% (14 total), 4-9px only, safe zone restricted
    leaves = []
    for i in range(16):
        # Keep leaves away from text blocks (center bottom safe zone)
        side = -1 if i % 2 == 0 else 1
        leaves.append({
            'x_seed': 0.5 + side * random.uniform(0.18, 0.48),
            'y_seed': random.uniform(0.05, 0.55), # upper half only
            'size': random.uniform(4, 9),         # 4 to 9px small
            'angle': random.uniform(0, math.pi * 2),
            'rot_speed': random.uniform(0.04, 0.1),
            'tumble_speed': random.uniform(1.2, 2.8),
            'color': random.choice([(232, 119, 46), (245, 140, 30), (218, 75, 32)])
        })

    # 4. Volumetric cloud banks
    cloud_clusters = [
        {
            'x': random.uniform(0.05, 0.95),
            'y': random.uniform(0.08, 0.88),
            'r': random.uniform(140, 320),
            'aspect': random.uniform(0.45, 0.72)
        }
        for _ in range(45)
    ]

    for frame_idx in range(1, total_frames + 1):
        progress = (frame_idx - 1) / (total_frames - 1)
        base = Image.new('RGB', (width, height), (27, 26, 25))
        draw = ImageDraw.Draw(base)

        if progress < 0.28:
            # ================= STAGE 1: PAINTERLY AUTUMN AVENUE =================
            t = progress / 0.28
            
            # Atmospheric sunset sky gradient
            c_top = lerp_color((42, 52, 85), (55, 70, 115), t)
            c_mid = lerp_color((215, 115, 60), (235, 135, 75), t)
            c_bot = lerp_color((250, 205, 130), (255, 230, 175), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.55:
                    col = lerp_color(c_top, c_mid, alpha / 0.55)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.55) / 0.45)
                draw.line([(0, y), (width, y)], fill=col)

            # Distant hazy atmospheric mountain ridge / skyline
            horizon_y = int(height * (0.50 - t * 0.08))
            haze_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            h_draw = ImageDraw.Draw(haze_layer)
            # Soft horizon mist
            for hy in range(horizon_y - 80, horizon_y + 40):
                h_alpha = int(90 * (1 - abs(hy - horizon_y) / 80))
                h_draw.line([(0, hy), (width, hy)], fill=(255, 215, 160, h_alpha))

            # Distant city buildings with lit amber windows
            for b_list in bg_buildings[:2]:
                for bld in b_list:
                    bx = bld['x']
                    bw = bld['w']
                    bh = bld['h']
                    by = horizon_y
                    b_col = (45, 36, 42, int(180 * bld['depth']))
                    h_draw.rectangle([bx, by - bh, bx + bw, by], fill=b_col)
                    # Lit windows (warm amber)
                    for wx, wy in bld['windows']:
                        if by - bh + wy < by - 8:
                            h_draw.rectangle([bx + wx, by - bh + wy, bx + wx + 3, by - bh + wy + 4], fill=(255, 205, 110, 190))

            haze_layer = haze_layer.filter(ImageFilter.GaussianBlur(radius=3))
            base.paste(haze_layer, (0, 0), haze_layer)

            # Wet asphalt avenue with soft golden horizon specular reflections
            road_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            r_draw = ImageDraw.Draw(road_layer)
            r_poly = [
                (int(width * 0.43), horizon_y + 8),
                (int(width * 0.57), horizon_y + 8),
                (width + 140, height),
                (-140, height)
            ]
            r_draw.polygon(r_poly, fill=(35, 28, 26, 245))
            # Soft ambient street specular center line
            for gw in range(16, 2, -2):
                g_alpha = int(35 * (1 - gw / 16))
                r_draw.line([(width * 0.5, horizon_y + 8), (width * 0.5, height)], fill=(232, 119, 46, g_alpha), width=gw)
            road_layer = road_layer.filter(ImageFilter.GaussianBlur(radius=2))
            base.paste(road_layer, (0, 0), road_layer)

            # Organic tree canopies with soft overlapping foliage blobs
            tree_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            t_draw = ImageDraw.Draw(tree_layer)
            for tree in tree_canopies:
                tcx = tree['cx']
                tcy = tree['cy'] - t * 35
                # Trunk
                tw = tree['trunk_w']
                th = tree['trunk_h']
                t_draw.rectangle([tcx - tw // 2, tcy - 10, tcx + tw // 2, tcy + th], fill=(42, 28, 24, 255))
                # Soft leaf dabs
                for lb in tree['blobs']:
                    lx = tcx + lb['ox']
                    ly = tcy + lb['oy']
                    sz = lb['size']
                    col = lb['color'] + (225,)
                    t_draw.ellipse([lx - sz, ly - sz * 0.75, lx + sz, ly + sz * 0.75], fill=col)

            tree_layer = tree_layer.filter(ImageFilter.GaussianBlur(radius=2.5))
            base.paste(tree_layer, (0, 0), tree_layer)

            # Micro leaves (4-9px only, safe zone respected, tumbling slow)
            leaf_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            l_draw = ImageDraw.Draw(leaf_layer)
            for lf in leaves:
                cur_ang = lf['angle'] + frame_idx * lf['rot_speed']
                lx = int(lf['x_seed'] * width + math.sin(cur_ang) * 45)
                ly = int((lf['y_seed'] * height + frame_idx * lf['tumble_speed']) % (height * 0.65))
                sz = lf['size']
                # Rotated leaf ellipse
                cos_a = math.cos(cur_ang)
                sin_a = math.sin(cur_ang)
                l_pts = []
                for step in range(8):
                    theta = step * (math.pi * 2 / 8)
                    px = math.cos(theta) * sz
                    py = math.sin(theta) * (sz * 0.45)
                    rx = lx + px * cos_a - py * sin_a
                    ry = ly + px * sin_a + py * cos_a
                    l_pts.append((rx, ry))
                l_draw.polygon(l_pts, fill=lf['color'] + (160,)) # 0.6 opacity

            base.paste(leaf_layer, (0, 0), leaf_layer)

        elif progress < 0.52:
            # ================= STAGE 2: RISING OVER ROOFTOPS =================
            t = (progress - 0.28) / 0.24
            c_top = lerp_color((55, 70, 115), (75, 110, 165), t)
            c_mid = lerp_color((235, 135, 75), (210, 150, 135), t)
            c_bot = lerp_color((255, 230, 175), (248, 235, 215), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.5:
                    col = lerp_color(c_top, c_mid, alpha * 2.0)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.5) * 2.0)
                draw.line([(0, y), (width, y)], fill=col)

            # Rooftop silhouettes gliding downward
            roof_offset = int(t * height * 0.75)
            base_y = int(height * 0.58 + roof_offset)

            roof_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            rf_draw = ImageDraw.Draw(roof_layer)

            # Layered rooftops with lit windows in facades
            for rx, rw, rh, has_win in [
                (20, 290, 110, True),
                (280, 360, 135, False),
                (610, 320, 115, True),
                (890, 370, 140, False)
            ]:
                pts = [
                    (rx, base_y),
                    (rx + rw // 2, base_y - rh),
                    (rx + rw, base_y),
                    (rx + rw, height + 40),
                    (rx, height + 40)
                ]
                rf_draw.polygon(pts, fill=(30, 26, 25, 255))
                # Terracotta ridge highlight
                rf_draw.line([(rx, base_y), (rx + rw // 2, base_y - rh), (rx + rw, base_y)], fill=(232, 119, 46, 230), width=2)
                # Lit windows in building body
                if has_win and base_y < height:
                    for wx in range(rx + 30, rx + rw - 30, 35):
                        rf_draw.rectangle([wx, base_y + 15, wx + 14, base_y + 24], fill=(255, 210, 120, 195))

            # Delicate overhead wires
            for wy in [base_y - 85, base_y - 65]:
                rf_draw.line([(0, wy), (width, wy + 20)], fill=(36, 32, 30, 170), width=1)

            roof_layer = roof_layer.filter(ImageFilter.GaussianBlur(radius=1.8))
            base.paste(roof_layer, (0, 0), roof_layer)

            # Soft evening clouds gathering
            cloud_mist = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            cm_draw = ImageDraw.Draw(cloud_mist)
            cm_alpha = int(t * 180)
            for cl in cloud_clusters[:22]:
                cx = int((cl['x'] + t * 0.08) * width) % width
                cy = int((cl['y'] + t * 0.15) * height) % height
                r = cl['r'] * (0.8 + t * 0.3)
                cm_draw.ellipse([cx - r, cy - r * cl['aspect'], cx + r, cy + r * cl['aspect']], fill=(243, 236, 224, cm_alpha))
            cloud_mist = cloud_mist.filter(ImageFilter.GaussianBlur(radius=25))
            base.paste(cloud_mist, (0, 0), cloud_mist)

        elif progress < 0.76:
            # ================= STAGE 3: THROUGH VOLUMETRIC CLOUDS =================
            t = (progress - 0.52) / 0.24
            c_top = lerp_color((48, 92, 170), (68, 128, 212), t)
            c_mid = lerp_color((135, 185, 235), (165, 205, 245), t)
            c_bot = lerp_color((245, 235, 220), (255, 248, 238), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.5:
                    col = lerp_color(c_top, c_mid, alpha * 2.0)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.5) * 2.0)
                draw.line([(0, y), (width, y)], fill=col)

            # Painterly billowing cumulus clouds with warm sunbeams
            c_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            cd_draw = ImageDraw.Draw(c_layer)

            # Diffuse sun glow
            sun_x = int(width * 0.68)
            sun_y = int(height * (0.34 - t * 0.08))
            cd_draw.ellipse([sun_x - 190, sun_y - 190, sun_x + 190, sun_y + 190], fill=(255, 232, 175, 160))

            for cl in cloud_clusters:
                cx = int(cl['x'] * width + math.sin(frame_idx * 0.02 + cl['x']) * 35)
                cy = int((cl['y'] * height - t * 220) % (height + 220) - 110)
                r = cl['r']
                # Cloud body
                cd_draw.ellipse([cx - r, cy - r * cl['aspect'], cx + r, cy + r * cl['aspect']], fill=(245, 240, 232, 220))
                # Golden sunlit rim
                cd_draw.ellipse([cx - r * 0.88, cy - r * cl['aspect'] * 1.08, cx + r * 0.88, cy], fill=(255, 225, 155, 95))

            c_layer = c_layer.filter(ImageFilter.GaussianBlur(radius=16))
            base.paste(c_layer, (0, 0), c_layer)

        else:
            # ================= STAGE 4: OPEN CELESTIAL SKY =================
            t = (progress - 0.76) / 0.24
            c_top = lerp_color((28, 72, 155), (18, 52, 125), t)
            c_mid = lerp_color((92, 158, 232), (82, 148, 222), t)
            c_bot = lerp_color((245, 225, 190), (255, 242, 215), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.6:
                    col = lerp_color(c_top, c_mid, alpha / 0.6)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.6) / 0.4)
                draw.line([(0, y), (width, y)], fill=col)

            # Radiant sunburst with atmospheric glow
            sun_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            s_draw = ImageDraw.Draw(sun_layer)

            sun_x = int(width * 0.5)
            sun_y = int(height * (0.36 - t * 0.06))

            for r in range(320, 25, -25):
                g_alpha = int(40 * (1 - r / 320))
                s_draw.ellipse([sun_x - r, sun_y - r, sun_x + r, sun_y + r], fill=(255, 222, 145, g_alpha))

            s_draw.ellipse([sun_x - 45, sun_y - 45, sun_x + 45, sun_y + 45], fill=(255, 252, 238, 255))
            s_draw.ellipse([sun_x - 70, sun_y - 70, sun_x + 70, sun_y + 70], fill=(255, 218, 125, 175))

            # Translucent cirrus wisps
            for cl in cloud_clusters[:14]:
                cx = int(cl['x'] * width)
                cy = int(height * 0.66 + cl['y'] * 70)
                r = cl['r'] * 1.6
                s_draw.ellipse([cx - r, cy - r * 0.16, cx + r, cy + r * 0.16], fill=(255, 250, 240, 70))

            sun_layer = sun_layer.filter(ImageFilter.GaussianBlur(radius=9))
            base.paste(sun_layer, (0, 0), sun_layer)

        # Save frame
        frame_name = f"frame_{frame_idx:03d}.jpg"
        base.save(os.path.join(out_dir, frame_name), 'JPEG', quality=84)

    print(f"Generated all {total_frames} painterly frames successfully!")

if __name__ == '__main__':
    generate_painterly_kumo_frames()
