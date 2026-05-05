// ============================================
// 魔女卡牌 — 图片生成服务 (简化版)
// 
// SD 生成暂时走手动：SD Forge Web UI 手动生成后放到 public/
// 豆包 API 仍可用于怪物批量生成
// ============================================
import type { FactorDef } from '../types';

export function buildCardPrompt(factors: FactorDef[], _cardName: string): string {
  const mainFactor = factors[0];
  const factorDescs = factors.slice(0, 6).map(f => f.promptEn || f.id).join(', ');
  const subject = mainFactor?.promptEn || 'cute magical apprentice';
  return [
    subject,
    'chibi cute magical creature or witch apprentice',
    'watercolor texture, hand-drawn style',
    'warm lighting, cream and brown color palette',
    'soft edges, cute',
    '2.5 head proportion, doe eyes',
    'simple parchment background',
    factorDescs,
  ].join(', ');
}

export async function generateCardImage(_prompt: string): Promise<string | null> {
  // TODO: SD Forge Gradio API 桥接待完成
  // 暂时走手动：SD Forge Web UI → 导出到 public/
  return null;
}

export async function starUpImg2Img(
  _currentImageDataUrl: string,
  _newFactor: FactorDef,
  _targetStars: number,
): Promise<string | null> {
  return null;
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
