// ============================================
// 魔女卡牌 — SD 图片生成服务
// 通过 Vite 代理 /sd-api → Windows SD Forge/A1111
// ============================================
import type { FactorDef } from '../types';

const SD_BASE = import.meta.env.DEV ? '/sd-api' : '';
const SD_URL = `${SD_BASE}/sdapi/v1/txt2img`;
const SD_IMG2IMG_URL = `${SD_BASE}/sdapi/v1/img2img`;

const STYLE = [
  'chibi cute magical creature or witch apprentice',
  'watercolor texture, hand-drawn style',
  'warm lighting, cream and brown color palette',
  'soft edges, cute but slightly clumsy',
  'Ghibli background style, tarot card frame',
  '2.5 head proportion, doe eyes',
  'matte texture',
  'simple warm parchment background',
].join(', ');

const NEGATIVE = [
  'realistic, 3d render, dark gothic, sharp edges',
  'cyberpunk, cool tone, complex background',
  'humanoid, sexy, ugly, deformed, bad anatomy',
  'nsfw, text, watermark, signature',
].join(', ');

export function buildCardPrompt(factors: FactorDef[], cardName: string): string {
  const mainFactor = factors[0];
  const factorDescs = factors.slice(0, 6).map(f => f.promptEn || f.id).join(', ');
  let subject = '';
  if (mainFactor?.category === 'element') {
    subject = `${mainFactor.promptEn} witch apprentice girl`;
  } else if (mainFactor?.category === 'trait') {
    subject = `cute creature with ${mainFactor.promptEn}`;
  } else if (mainFactor?.category === 'magic') {
    subject = `little witch casting ${mainFactor.promptEn}`;
  } else {
    subject = `${mainFactor?.promptEn || 'cute magical apprentice'}`;
  }
  return `${subject}, ${STYLE}, ${factorDescs}`;
}

export async function generateCardImage(prompt: string): Promise<string | null> {
  try {
    const resp = await fetch(SD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        negative_prompt: NEGATIVE,
        seed: -1,
        width: 512,
        height: 768,
        steps: 25,
        cfg_scale: 6.0,
        sampler_name: 'DPM++ 2M',
        scheduler: 'Karras',
      }),
    });

    const data = await resp.json();
    if (data?.images?.[0]) {
      return `data:image/png;base64,${data.images[0]}`;
    }
    console.warn('SD gen failed:', JSON.stringify(data).slice(0, 200));
    return null;
  } catch (e) {
    console.warn('SD gen error:', e);
    return null;
  }
}

export async function starUpImg2Img(
  currentImageDataUrl: string,
  newFactor: FactorDef,
  targetStars: number,
): Promise<string | null> {
  const denoisingMap: Record<number, number> = { 2: 0.35, 3: 0.45, 4: 0.55, 5: 0.65, 6: 0.75 };
  const denoising = denoisingMap[targetStars] || 0.45;

  const tierDesc = targetStars >= 6 ? 'ultimate divine form'
    : targetStars >= 5 ? 'dramatic power surge'
    : targetStars >= 4 ? 'stronger aura, evolved appearance'
    : targetStars >= 3 ? 'enhanced glow, more intricate'
    : 'slightly enhanced';

  const starPrompt = [
    `evolved version gaining ${newFactor.promptEn}`,
    tierDesc,
    `star level ${targetStars}`,
    STYLE,
  ].join(', ');

  try {
    const b64 = currentImageDataUrl.split(',')[1];
    const resp = await fetch(SD_IMG2IMG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        init_images: [b64],
        prompt: starPrompt,
        negative_prompt: NEGATIVE,
        seed: -1,
        width: 512,
        height: 768,
        steps: 25,
        cfg_scale: 7.0,
        denoising_strength: denoising,
        sampler_name: 'DPM++ 2M',
        scheduler: 'Karras',
      }),
    });

    const data = await resp.json();
    if (data?.images?.[0]) {
      return `data:image/png;base64,${data.images[0]}`;
    }
    console.warn('SD img2img failed:', JSON.stringify(data).slice(0, 200));
    return null;
  } catch (e) {
    console.warn('SD img2img error:', e);
    return null;
  }
}

export function base64ToBlobUrl(b64DataUrl: string): string {
  const byteString = atob(b64DataUrl.split(',')[1]);
  const mimeType = b64DataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });
  return URL.createObjectURL(blob);
}
