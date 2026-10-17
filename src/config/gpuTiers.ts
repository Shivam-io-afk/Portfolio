import { getGPUTier, TierResult } from 'detect-gpu';

export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GpuTierConfig {
  tier: QualityTier;
  bitCount: number;
  dpr: number;
  materialType: 'physical' | 'standard' | 'basic';
  boxSegments: number; // 2 for HIGH, 0 (standard BoxGeometry) for MEDIUM/LOW
  dustCount: number;
  bloomEnabled: boolean;
  bloomMipmapBlur: boolean;
  bloomResolutionScale: number;
  chromaticAberration: boolean;
  noiseEnabled: boolean;
  vignetteEnabled: boolean;
  reflectiveFloor: boolean;
}

export const TIER_CONFIGS: Record<QualityTier, GpuTierConfig> = {
  HIGH: {
    tier: 'HIGH',
    bitCount: 12000,
    dpr: 1.5,
    materialType: 'physical',
    boxSegments: 1, // RoundedBoxGeometry(1, 1, 1, 1, 0.15)
    dustCount: 1000,
    bloomEnabled: true,
    bloomMipmapBlur: true,
    bloomResolutionScale: 0.5,
    chromaticAberration: true,
    noiseEnabled: true,
    vignetteEnabled: true,
    reflectiveFloor: false, // fake blurred reflection plane for steady 60fps
  },
  MEDIUM: {
    tier: 'MEDIUM',
    bitCount: 12000,
    dpr: 1.0, // Fixed 1.0 DPR for integrated GPUs
    materialType: 'standard', // MeshStandardMaterial without heavy clearcoat
    boxSegments: 0, // BoxGeometry (12 triangles)
    dustCount: 800,
    bloomEnabled: true,
    bloomMipmapBlur: true,
    bloomResolutionScale: 0.5, // 0.5 resolution
    chromaticAberration: false, // disabled for GPU saving
    noiseEnabled: false,
    vignetteEnabled: true,
    reflectiveFloor: false, // plain dark floor + fake flipped gradient plane
  },
  LOW: {
    tier: 'LOW',
    bitCount: 12000,
    dpr: 1.0,
    materialType: 'basic',
    boxSegments: 0,
    dustCount: 500,
    bloomEnabled: true,
    bloomMipmapBlur: true,
    bloomResolutionScale: 0.5,
    chromaticAberration: false,
    noiseEnabled: false,
    vignetteEnabled: true,
    reflectiveFloor: false,
  },
};

/**
 * Detect GPU capabilities synchronously using WebGL context inspection,
 * with async fallback to detect-gpu library.
 */
export function detectInitialGpuTier(): QualityTier {
  if (typeof window === 'undefined') return 'MEDIUM';

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as any);

    if (!gl) return 'LOW';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

      // Check for Intel integrated graphics, mobile devices, or Apple standard
      const isIntelIntegrated =
        renderer.includes('intel') ||
        renderer.includes('uhd') ||
        renderer.includes('iris') ||
        renderer.includes('hd graphics');

      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          navigator.userAgent.toLowerCase()
        ) ||
        renderer.includes('mali') ||
        renderer.includes('adreno') ||
        renderer.includes('powervr');

      if (isMobile) return 'LOW';
      if (isIntelIntegrated) return 'MEDIUM';

      // Check for dedicated GPU indicators (NVIDIA, AMD, Apple M-series Pro/Max)
      const isDedicated =
        renderer.includes('nvidia') ||
        renderer.includes('geforce') ||
        renderer.includes('rtx') ||
        renderer.includes('gtx') ||
        renderer.includes('radeon') ||
        renderer.includes('amd');

      if (isDedicated) return 'HIGH';
    }
  } catch (e) {
    console.warn('WebGL detection error:', e);
  }

  // Default to HIGH tier
  return 'HIGH';
}

/**
 * Async detect-gpu check to refine quality tier
 */
export async function refineGpuTierWithLibrary(): Promise<QualityTier> {
  try {
    const gpuTier: TierResult = await getGPUTier();
    if (gpuTier.isMobile) {
      return gpuTier.tier >= 3 ? 'MEDIUM' : 'LOW';
    }
    if (gpuTier.tier >= 3) return 'HIGH';
    if (gpuTier.tier === 2) return 'MEDIUM';
    return 'LOW';
  } catch {
    return detectInitialGpuTier();
  }
}

