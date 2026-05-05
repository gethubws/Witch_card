// ============================================
// 魔女卡牌 — 图片生成服务 (豆包 Seedream)
// API: https://ark.cn-beijing.volces.com/api/v3/images/generations
// 模型: doubao-seedream-4-0-250828 (200张/天, 1024×1024)
// ============================================
import type { FactorDef } from '../types';

const DOUBAO_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const DOUBAO_KEY = 'ark-917189ab-74ce-48e4-b03a-5caf088ff2a7-1cac1';
const DOUBAO_MODEL = 'doubao-seedream-4-5-251128';

const STYLE = [
  'chibi cute magical creature, watercolor texture, hand-drawn style',
  'warm lighting, cream and brown palette, soft edges',
  'Ghibli background, tarot card frame',
  '2.5 head proportion, doe eyes, matte texture',
  'simple parchment background',
].join(', ');

const NEGATIVE = [
  'realistic, 3d render, dark gothic, sharp edges',
  'cyberpunk, cool tone, complex background',
  'humanoid, sexy, ugly, deformed, bad anatomy',
  'nsfw, text, watermark, signature',
].join(', ');

export function buildCardPrompt(factors: FactorDef[], _cardName: string): string {
  const main = factors[0];
  const subject = main?.promptEn || main?.promptZh || 'cute magical creature';
  return `${subject}, ${STYLE}`;
}

export async function generateCardImage(prompt: string): Promise<string | null> {
  try {
    const resp = await fetch(DOUBAO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_KEY}`,
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL,
        prompt: `${prompt}, ${NEGATIVE}`,
        size: '2048x2048', // 4.5 要求 2048×2048
        response_format: 'b64_json',
        n: 1,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.warn('豆包 API error:', resp.status, err.slice(0, 200));
      return null;
    }

    const data = await resp.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    console.warn('豆包: no image in response');
    return null;
  } catch (e) {
    console.warn('豆包 gen error:', e);
    return null;
  }
}

export async function starUpImg2Img(
  _currentImageDataUrl: string,
  newFactor: FactorDef,
  targetStars: number,
): Promise<string | null> {
  const tiers: Record<number, string> = {
    2: 'slightly enhanced glow',
    3: 'refined details, intricate glow',
    4: 'stronger aura, evolved appearance',
    5: 'dramatic power surge, radiant energy',
    6: 'ultimate divine form, legendary transformation',
  };
  const prompt = [
    `${newFactor.promptEn || newFactor.id} evolved to star ${targetStars}`,
    tiers[targetStars] || 'evolved',
    STYLE,
  ].join(', ');
  return generateCardImage(prompt);
}

export function base64ToBlobUrl(b64DataUrl: string): string {
  const byteString = atob(b64DataUrl.split(',')[1]);
  const mimeType = b64DataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: mimeType });
  return URL.createObjectURL(blob);
}
