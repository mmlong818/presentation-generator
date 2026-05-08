// ─── PDF / PPTX 导出（客户端，图片版）───────────────────────────────────────
// 流程：把现有 1920×1080 渲染节点截成 PNG → 嵌入 PDF/PPTX 每页
// 需要 deck 页里所有 slide 节点先依次渲染并截图

import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import type { Deck } from './types';
import { applyBrand } from './brand';
import { THEMES } from './themes';

/** 创建一个离屏渲染容器，依次塞入 React 节点截图 */
async function captureSlide(node: HTMLElement): Promise<string> {
  // 关键：尺寸 1920×1080，pixel ratio 控制清晰度
  return toPng(node, {
    width: 1920,
    height: 1080,
    pixelRatio: 1.5,  // 1.5 = 2880px 宽，足够清晰且体积合理
    cacheBust: true,
    style: {
      transform: 'none',  // 截图时强制重置 transform（避免缩放预览时被截到缩略尺寸）
      width: '1920px',
      height: '1080px',
    },
    backgroundColor: undefined, // 让主题自己的 bg 接管
  });
}

/** 找到 deck 页所有可渲染节点 */
function getSlideNodes(): HTMLElement[] {
  const nodes = Array.from(document.querySelectorAll('[data-export-slide="1"]'));
  return nodes as HTMLElement[];
}

/** 渲染并依次截图所有 slide。需调用方先把所有 slide 都挂到 DOM 上。 */
async function captureAllSlides(): Promise<string[]> {
  const nodes = getSlideNodes();
  if (nodes.length === 0) {
    throw new Error('未找到 export-slide 节点。请确认 deck 页已加载所有幻灯片。');
  }
  const dataUrls: string[] = [];
  for (const node of nodes) {
    const url = await captureSlide(node);
    dataUrls.push(url);
  }
  return dataUrls;
}

// ─── PDF ────────────────────────────────────────────────────────────────────
export async function exportPDF(deck: Deck, filename: string): Promise<void> {
  const images = await captureAllSlides();
  // 横向 16:9 PDF，标准 1920×1080 比例（用 mm 单位 → 一英寸 25.4mm，96 dpi 标准）
  // 直接用 1920×1080 px 当 PDF page size（jsPDF 支持自定义）
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
    hotfixes: ['px_scaling'],
  });
  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage([1920, 1080], 'landscape');
    pdf.addImage(images[i], 'PNG', 0, 0, 1920, 1080, undefined, 'FAST');
  }
  pdf.save(`${filename}.pdf`);
}

// ─── PPTX ───────────────────────────────────────────────────────────────────
export async function exportPPTX(deck: Deck, filename: string): Promise<void> {
  const images = await captureAllSlides();
  // pptxgenjs 是浏览器友好的库
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'PG_HD', width: 13.333, height: 7.5 }); // 16:9 inches
  pptx.layout = 'PG_HD';
  pptx.title = deck.title;

  for (let i = 0; i < images.length; i++) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: images[i],
      x: 0, y: 0, w: 13.333, h: 7.5,
    });
  }

  // 注：图片版 PPTX 在 PowerPoint 里不可直接编辑文字
  // 真实编辑请回应用内（点击文字修改后再下载）
  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

// ─── 工具：给主题预热（在导出之前确保字体加载完成） ─────────────────────────
export async function waitFontsReady(): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
    } catch {
      // ignore
    }
  }
}

// 暴露当前主题工具，方便 deck 页选择性使用
export { applyBrand, THEMES };
