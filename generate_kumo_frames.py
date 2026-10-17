import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

def clamp(val, min_val=0, max_val=255):
    return max(min_val, min(max_val, int(val)))

def lerp_color(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(clamp(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def generate_painterly_frames():
    out_dir = os.path.join(os.getcwd(), 'public', 'frames')
    os.makedirs(out_dir, exist_ok=True)
    
    width = 1280
    height = 720
    total_frames = 90
    
    print(f"Generating {total_frames} high-aesthetic Kumo sequence frames...")
    random.seed(1337)
    
    # 1. Precompute trees for Autumn Avenue
    trees = []
    for i in range(24):
        side = -1 if i % 2 == 0 else 1
        dist = 0.15 + (i // 2) * 0.075 # distance 0.15 to 1.05
        trees.append({
            'side': side,
            'dist': dist,
            'x': width * 0.5 + side * (width * 0.18 + dist * width * 0.38),
            'y': height * 0.48 + dist * height * 0.42,
            'scale': 0.35 + dist * 0.85,
            'hue': random.choice([
                (232, 119, 46), # Kumo orange
                (220, 80, 30),  # Crimson maple
                (245, 166, 35), # Gold amber
                (210, 60, 40),  # Deep scarlet
                (250, 195, 60)  # Bright marigold
            ])
        })
    # Sort distant to near
    trees.sort(key=lambda item: item['dist'])

    # 2. Precompute drifting leaves
    leaves = [
        {
            'x_seed': random.uniform(0.1, 0.9),
            'y_seed': random.uniform(0.0, 1.0),
            'size': random.uniform(6, 16),
            'speed': random.uniform(2.5, 5.0),
            'sway': random.uniform(0.05, 0.15),
            'color': random.choice([(232, 119, 46), (245, 140, 30), (215, 65, 35)])
        }
        for _ in range(80)
    ]

    # 3. Precompute cloud clusters
    clouds = [
        {
            'x': random.uniform(0.05, 0.95),
            'y': random.uniform(0.1, 0.85),
            'r': random.uniform(100, 260),
            'aspect': random.uniform(0.4, 0.7),
            'tint': random.choice([(255, 248, 238), (255, 235, 210), (243, 236, 224)])
        }
        for _ in range(40)
    ]

    for frame_idx in range(1, total_frames + 1):
        progress = (frame_idx - 1) / (total_frames - 1)
        base = Image.new('RGB', (width, height), (27, 26, 25))
        draw = ImageDraw.Draw(base)

        if progress < 0.28:
            # ================= STAGE 1: AUTUMN AVENUE =================
            t = progress / 0.28
            # Rich golden hour sky fading into warm evening atmosphere
            c_top = lerp_color((45, 65, 110), (55, 80, 135), t)
            c_mid = lerp_color((215, 115, 50), (235, 140, 60), t)
            c_bot = lerp_color((245, 190, 100), (255, 220, 150), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.5:
                    col = lerp_color(c_top, c_mid, alpha * 2.0)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.5) * 2.0)
                draw.line([(0, y), (width, y)], fill=col)

            # Distant mountain ridge / horizon glow
            mount_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            m_draw = ImageDraw.Draw(mount_layer)
            horizon_y = int(height * (0.50 - t * 0.08))
            m_pts = [(0, height)]
            for mx in range(0, width + 50, 40):
                my = horizon_y - int(math.sin(mx * 0.005) * 35 + math.cos(mx * 0.012) * 20)
                m_pts.append((mx, my))
            m_pts.append((width, height))
            m_draw.polygon(m_pts, fill=(90, 50, 45, 220))
            mount_layer = mount_layer.filter(ImageFilter.GaussianBlur(radius=8))
            base.paste(mount_layer, (0, 0), mount_layer)

            # Painted Autumn Avenue (Vanishing road with warm cobblestone reflections)
            road_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            r_draw = ImageDraw.Draw(road_layer)
            vanish_y = horizon_y + 10
            r_poly = [
                (int(width * 0.44), vanish_y),
                (int(width * 0.56), vanish_y),
                (width + 120, height),
                (-120, height)
            ]
            r_draw.polygon(r_poly, fill=(45, 32, 28, 245))
            # Road central specular line
            r_draw.line([(width * 0.5, vanish_y), (width * 0.5, height)], fill=(232, 119, 46, 120), width=4)
            base.paste(road_layer, (0, 0), road_layer)

            # Painterly Autumn Trees on both flanks
            tree_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            t_draw = ImageDraw.Draw(tree_layer)
            for tr in trees:
                tx = tr['x']
                ty = tr['y'] - t * 40
                sc = tr['scale']
                th = int(220 * sc)
                tw = int(170 * sc)
                # Trunk
                t_draw.rectangle([tx - int(8*sc), ty - int(40*sc), tx + int(8*sc), ty + int(100*sc)], fill=(48, 30, 24, 250))
                # Multilayered foliage puffs
                base_col = tr['hue']
                for ox, oy, pr, dim in [
                    (0, -th * 0.5, tw * 0.5, 1.0),
                    (-tw * 0.28, -th * 0.4, tw * 0.38, 0.9),
                    (tw * 0.28, -th * 0.42, tw * 0.4, 0.95),
                    (0, -th * 0.25, tw * 0.45, 1.05),
                ]:
                    f_col = tuple(clamp(base_col[k] * dim) for k in range(3)) + (235,)
                    t_draw.ellipse([tx + ox - pr, ty + oy - pr*0.8, tx + ox + pr, ty + oy + pr*0.8], fill=f_col)
            
            tree_layer = tree_layer.filter(ImageFilter.GaussianBlur(radius=3))
            base.paste(tree_layer, (0, 0), tree_layer)

            # Swirling golden/orange maple leaves in foreground
            leaf_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            l_draw = ImageDraw.Draw(leaf_layer)
            for lf in leaves:
                lx = int((lf['x_seed'] * width + math.sin(frame_idx * 0.08 + lf['x_seed']*10) * 60) % width)
                ly = int((lf['y_seed'] * height + frame_idx * lf['speed']) % height)
                sz = lf['size']
                l_draw.ellipse([lx - sz, ly - sz*0.5, lx + sz, ly + sz*0.5], fill=lf['color'] + (220,))
            base.paste(leaf_layer, (0, 0), leaf_layer)

        elif progress < 0.52:
            # ================= STAGE 2: ROOFTOPS RISING =================
            t = (progress - 0.28) / 0.24
            c_top = lerp_color((55, 80, 135), (75, 115, 175), t)
            c_mid = lerp_color((235, 140, 60), (210, 150, 140), t)
            c_bot = lerp_color((255, 220, 150), (250, 235, 215), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.5:
                    col = lerp_color(c_top, c_mid, alpha * 2.0)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.5) * 2.0)
                draw.line([(0, y), (width, y)], fill=col)

            # Rooftops gliding downward as viewpoint ascends
            roof_offset = int(t * height * 0.8)
            base_y = int(height * 0.55 + roof_offset)

            roof_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            rf_draw = ImageDraw.Draw(roof_layer)

            # Distinct traditional pitched tile roofs
            roof_configs = [
                (40, 320, 120),
                (310, 380, 140),
                (640, 340, 115),
                (920, 380, 150)
            ]
            for rx, rw, rh in roof_configs:
                pts = [
                    (rx, base_y),
                    (rx + rw // 2, base_y - rh),
                    (rx + rw, base_y),
                    (rx + rw, height + 50),
                    (rx, height + 50)
                ]
                rf_draw.polygon(pts, fill=(32, 28, 27, 255))
                # Terracotta ridge highlight
                rf_draw.line([(rx, base_y), (rx + rw // 2, base_y - rh), (rx + rw, base_y)], fill=(232, 119, 46, 255), width=3)
                # Chimney
                cx = rx + rw // 2 + 35
                rf_draw.rectangle([cx - 12, base_y - rh - 30, cx + 12, base_y - rh + 10], fill=(24, 21, 20, 255))

            # Telegraph wires
            for wy in [base_y - 90, base_y - 70, base_y - 50]:
                rf_draw.line([(0, wy), (width, wy + 20)], fill=(38, 34, 32, 190), width=1)

            roof_layer = roof_layer.filter(ImageFilter.GaussianBlur(radius=2))
            base.paste(roof_layer, (0, 0), roof_layer)

            # Clouds & vapor beginning to envelope
            vapor = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            v_draw = ImageDraw.Draw(vapor)
            v_alpha = int(t * 190)
            for cl in clouds[:20]:
                cx = int((cl['x'] + t * 0.1) * width) % width
                cy = int((cl['y'] + t * 0.2) * height) % height
                r = cl['r'] * (0.8 + t * 0.4)
                v_draw.ellipse([cx - r, cy - r * cl['aspect'], cx + r, cy + r * cl['aspect']], fill=(243, 236, 224, v_alpha))
            vapor = vapor.filter(ImageFilter.GaussianBlur(radius=28))
            base.paste(vapor, (0, 0), vapor)

        elif progress < 0.76:
            # ================= STAGE 3: THROUGH CLOUDS =================
            t = (progress - 0.52) / 0.24
            # Deep celestial sky blue to bright cloud mist
            c_top = lerp_color((50, 95, 175), (70, 130, 215), t)
            c_mid = lerp_color((135, 185, 235), (170, 205, 245), t)
            c_bot = lerp_color((245, 235, 220), (255, 250, 240), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.5:
                    col = lerp_color(c_top, c_mid, alpha * 2.0)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.5) * 2.0)
                draw.line([(0, y), (width, y)], fill=col)

            # Billowing cumulus clouds with warm sunlit rim
            cloud_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            c_draw = ImageDraw.Draw(cloud_layer)

            # Sun behind clouds
            sun_x = int(width * 0.65)
            sun_y = int(height * (0.35 - t * 0.1))
            c_draw.ellipse([sun_x - 180, sun_y - 180, sun_x + 180, sun_y + 180], fill=(255, 230, 170, 160))

            for cl in clouds:
                cx = int((cl['x'] * width + math.sin(frame_idx * 0.03 + cl['x']) * 40))
                cy = int((cl['y'] * height - t * 240) % (height + 200) - 100)
                r = cl['r']
                # Body of cloud
                c_draw.ellipse([cx - r, cy - r * cl['aspect'], cx + r, cy + r * cl['aspect']], fill=(245, 240, 230, 220))
                # Golden sunlit rim
                c_draw.ellipse([cx - r * 0.9, cy - r * cl['aspect'] * 1.05, cx + r * 0.9, cy], fill=(255, 225, 150, 95))

            cloud_layer = cloud_layer.filter(ImageFilter.GaussianBlur(radius=18))
            base.paste(cloud_layer, (0, 0), cloud_layer)

        else:
            # ================= STAGE 4: OPEN SKY & HORIZON =================
            t = (progress - 0.76) / 0.24
            # Boundless vivid anime sky
            c_top = lerp_color((30, 75, 160), (18, 55, 130), t)
            c_mid = lerp_color((95, 160, 235), (85, 150, 225), t)
            c_bot = lerp_color((245, 225, 190), (255, 240, 210), t)

            for y in range(height):
                alpha = y / height
                if alpha < 0.6:
                    col = lerp_color(c_top, c_mid, alpha / 0.6)
                else:
                    col = lerp_color(c_mid, c_bot, (alpha - 0.6) / 0.4)
                draw.line([(0, y), (width, y)], fill=col)

            # Radiant Sunburst & Light Flares
            sun_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            s_draw = ImageDraw.Draw(sun_layer)

            sun_x = int(width * 0.5)
            sun_y = int(height * (0.38 - t * 0.08))

            # Broad radial sun glow
            for r in range(320, 30, -30):
                g_alpha = int(45 * (1 - r / 320))
                s_draw.ellipse([sun_x - r, sun_y - r, sun_x + r, sun_y + r], fill=(255, 220, 140, g_alpha))

            # Intense warm core
            s_draw.ellipse([sun_x - 45, sun_y - 45, sun_x + 45, sun_y + 45], fill=(255, 252, 235, 255))
            s_draw.ellipse([sun_x - 70, sun_y - 70, sun_x + 70, sun_y + 70], fill=(255, 215, 120, 180))

            # Translucent cirrus wisps
            for cl in clouds[:15]:
                cx = int(cl['x'] * width)
                cy = int(height * 0.65 + cl['y'] * 80)
                r = cl['r'] * 1.5
                s_draw.ellipse([cx - r, cy - r * 0.18, cx + r, cy + r * 0.18], fill=(255, 250, 240, 75))

            sun_layer = sun_layer.filter(ImageFilter.GaussianBlur(radius=10))
            base.paste(sun_layer, (0, 0), sun_layer)

        # Save frame
        frame_name = f"frame_{frame_idx:03d}.jpg"
        base.save(os.path.join(out_dir, frame_name), 'JPEG', quality=84)

    print(f"Generated all {total_frames} painterly frames successfully!")

if __name__ == '__main__':
    generate_painterly_frames()
