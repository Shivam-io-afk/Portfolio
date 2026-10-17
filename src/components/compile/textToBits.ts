/**
 * Generates 3D bit positions sampling the pixel contours of arbitrary text
 * rendered on an offscreen 2D canvas.
 */
export function generateTextBitPositions(
  text: string,
  count: number,
  options: {
    fontSize?: number;
    scale?: number;
    depthJitter?: number;
  } = {}
): Float32Array {
  const { fontSize = 180, scale = 0.022, depthJitter = 0.4 } = options;

  const positions = new Float32Array(count * 3);
  if (typeof document === 'undefined') return positions;

  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return positions;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `900 ${fontSize}px "Space Grotesk", "JetBrains Mono", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Collect all coordinates with solid text fill
  const sampleCoords: [number, number][] = [];
  const step = 4; // Subsample for performance
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      if (data[idx] > 128) {
        sampleCoords.push([x, y]);
      }
    }
  }

  const numSamples = sampleCoords.length;
  if (numSamples === 0) {
    // Fallback scattered plane if font hasn't rasterized yet
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * depthJitter;
    }
    return positions;
  }

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  for (let i = 0; i < count; i++) {
    // Distribute bits over text sample points with slight random offset
    const sample = sampleCoords[i % numSamples];
    const jitterX = (Math.random() - 0.5) * step * 0.9;
    const jitterY = (Math.random() - 0.5) * step * 0.9;
    const jitterZ = (Math.random() - 0.5) * depthJitter;

    // Flip Y for 3D coordinates
    const px = (sample[0] + jitterX - cx) * scale;
    const py = -(sample[1] + jitterY - cy) * scale;
    const pz = jitterZ;

    positions[i * 3 + 0] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
  }

  return positions;
}

