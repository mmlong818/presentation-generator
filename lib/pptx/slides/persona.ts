import type { PersonaSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: PersonaSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  const avatarSize = px(120);
  addRect(slide, t.paddingIn, py(80), avatarSize, avatarSize, '#' + t.accent);
  const initials = data.name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  addTextBox(slide, initials, {
    x: t.paddingIn, y: py(80), w: avatarSize, h: avatarSize,
    fontSize: Math.round(t.heroSize * 0.4), color: 'FFFFFF',
    fontFace: t.fontDisplay, bold: true, align: 'center', valign: 'middle',
  });

  const infoX = t.paddingIn + avatarSize + px(30);
  const infoW = SLIDE_W * 0.45 - avatarSize - px(30);

  addTextBox(slide, data.name, { x: infoX, y: py(90), w: infoW, fontSize: t.sectionSize, color: '#' + t.text, fontFace: t.fontDisplay, bold: true });
  addTextBox(slide, data.role, { x: infoX, y: py(170), w: infoW, fontSize: t.bodySize, color: '#' + t.muted, fontFace: t.fontBody });

  addLine(slide, t.paddingIn, py(250), SLIDE_W - t.paddingIn, py(250), '#' + t.rule, 1);

  const attrs = data.attributes ?? [];
  attrs.slice(0, 6).forEach((attr, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const attrX = t.paddingIn + col * (SLIDE_W * 0.45);
    const attrY = py(280) + row * py(100);
    addTextBox(slide, attr.label.toUpperCase(), { x: attrX, y: attrY, w: px(300), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
    addTextBox(slide, attr.value, { x: attrX, y: attrY + py(36), w: px(300), fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody });
  });

  const rightX = SLIDE_W * 0.55;
  const rightW = SLIDE_W - rightX - t.paddingIn;
  let ry = py(260);

  if (data.needs && data.needs.length > 0) {
    addTextBox(slide, 'NEEDS', { x: rightX, y: ry, w: rightW, fontSize: t.captionSize, color: '#' + t.accent, fontFace: t.fontBody });
    ry += py(40);
    data.needs.forEach(need => {
      addTextBox(slide, `✓ ${need}`, { x: rightX, y: ry, w: rightW, fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true });
      ry += py(70);
    });
  }

  if (data.pains && data.pains.length > 0) {
    ry += py(20);
    addTextBox(slide, 'PAINS', { x: rightX, y: ry, w: rightW, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
    ry += py(40);
    data.pains.forEach(pain => {
      addTextBox(slide, `✗ ${pain}`, { x: rightX, y: ry, w: rightW, fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true });
      ry += py(70);
    });
  }

  if (data.quote) {
    addLine(slide, t.paddingIn, py(760), t.paddingIn, py(880), '#' + t.accent, 4);
    addTextBox(slide, `"${data.quote}"`, {
      x: t.paddingIn + px(20), y: py(770), w: SLIDE_W * 0.5,
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, italic: true, wrap: true,
    });
  }

  addPageNumber(slide, n, total, t);
}
