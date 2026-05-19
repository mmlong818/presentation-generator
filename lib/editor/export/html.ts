// Standalone single-file HTML export.
//
// Renders all slides as <section> with positioned divs, scaled to viewport.
// Includes keyboard navigation, progress bar, and animation playback.
// Self-contained: images already inlined as data URLs in ImageElement.src.

import type { EditorPresentation, SlideElement, TextElement } from '../types'
import { CANVAS_H, CANVAS_W } from '../types'

export function exportHTML(presentation: EditorPresentation): string {
  const slides = presentation.slides.map((s, i) => renderSlide(s.elements, i, s.background)).join('\n')
  const titleEsc = esc(presentation.title)
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titleEsc}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:100%;height:100%;background:#000;color:#fff;font-family:system-ui,sans-serif;overflow:hidden}
  .deck{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
  .stage{position:relative;width:min(96vw, calc(96vh * ${CANVAS_W / CANVAS_H}));aspect-ratio:${CANVAS_W} / ${CANVAS_H};background:#fff;box-shadow:0 20px 80px rgba(255,255,255,.08);overflow:hidden}
  .slide{position:absolute;inset:0;display:none}
  .slide.active{display:block}
  .progress{position:fixed;left:0;right:0;bottom:0;height:3px;background:#222;z-index:10}
  .progress > div{height:100%;background:#fff;transition:width .25s ease}
  .hint{position:fixed;right:12px;bottom:12px;font-size:11px;color:#666;z-index:10}
  .counter{position:fixed;left:12px;bottom:12px;font-size:11px;color:#666;z-index:10;font-variant-numeric:tabular-nums}
  /* Animations */
  @keyframes pg-fade{from{opacity:0}to{opacity:1}}
  @keyframes pg-slide-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pg-slide-down{from{opacity:0;transform:translateY(-40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pg-slide-left{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pg-slide-right{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pg-scale{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
  @keyframes pg-zoom{from{opacity:0;transform:scale(1.15)}to{opacity:1;transform:scale(1)}}
  .slide.active [data-anim]{opacity:0}
  .slide.active [data-anim="fade"]{animation:pg-fade var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
  .slide.active [data-anim="slide-up"]{animation:pg-slide-up var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
  .slide.active [data-anim="slide-down"]{animation:pg-slide-down var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
  .slide.active [data-anim="slide-left"]{animation:pg-slide-left var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
  .slide.active [data-anim="slide-right"]{animation:pg-slide-right var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
  .slide.active [data-anim="scale"]{animation:pg-scale var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
  .slide.active [data-anim="zoom"]{animation:pg-zoom var(--dur,400ms) var(--delay,0ms) both cubic-bezier(.16,1,.3,1)}
</style>
</head>
<body>
<div class="deck">
  <div class="stage" id="stage">
    ${slides}
  </div>
</div>
<div class="counter"><span id="cur">1</span> / ${presentation.slides.length}</div>
<div class="hint">← → 翻页 · Esc 退出全屏</div>
<div class="progress"><div id="prog" style="width:${(1 / presentation.slides.length) * 100}%"></div></div>
<script>
(function(){
  var slides=document.querySelectorAll('.slide');
  var total=slides.length;
  var idx=0;
  function render(){
    slides.forEach(function(s,i){s.classList.toggle('active', i===idx)});
    document.getElementById('cur').textContent=String(idx+1);
    document.getElementById('prog').style.width=((idx+1)/total*100)+'%';
  }
  function scale(){
    var stage=document.getElementById('stage');
    var w=stage.clientWidth;
    var s=w/${CANVAS_W};
    slides.forEach(function(slide){
      slide.style.transformOrigin='0 0';
      slide.style.transform='scale('+s+')';
      slide.style.width='${CANVAS_W}px';
      slide.style.height='${CANVAS_H}px';
    });
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();idx=Math.min(total-1,idx+1);render();}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();idx=Math.max(0,idx-1);render();}
    else if(e.key==='Home'){idx=0;render();}
    else if(e.key==='End'){idx=total-1;render();}
    else if(e.key.toLowerCase()==='f'){if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen();}
  });
  document.addEventListener('click',function(e){if(e.target.closest('.deck')&&!e.target.closest('a,button,input')){idx=Math.min(total-1,idx+1);render();}});
  window.addEventListener('resize',scale);
  scale();render();
})();
</script>
</body>
</html>`
}

function renderSlide(elements: SlideElement[], idx: number, bg: string): string {
  const sorted = [...elements].sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
  const body = sorted.map(renderElement).join('')
  return `<section class="slide${idx === 0 ? ' active' : ''}" style="background:${esc(bg)}">${body}</section>`
}

function renderElement(el: SlideElement): string {
  const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;` +
    (el.rotate ? `transform:rotate(${el.rotate}deg);` : '') +
    (el.opacity !== undefined ? `opacity:${el.opacity};` : '')
  const anim = el.animation && el.animation.kind !== 'none'
    ? ` data-anim="${el.animation.kind}" style="${base}--dur:${el.animation.duration ?? 400}ms;--delay:${el.animation.delay ?? 0}ms;`
    : ` style="${base}`
  if (el.type === 'text') return renderText(el as TextElement, anim)
  if (el.type === 'rect') {
    const css = `${anim}background:${esc((el as any).fill || 'transparent')};` +
      ((el as any).stroke ? `border:${(el as any).strokeWidth || 1}px solid ${esc((el as any).stroke)};` : '') +
      ((el as any).cornerRadius ? `border-radius:${(el as any).cornerRadius}px;` : '') + '"'
    return `<div${css}></div>`
  }
  if (el.type === 'ellipse') {
    const css = `${anim}background:${esc((el as any).fill || 'transparent')};border-radius:50%;` +
      ((el as any).stroke ? `border:${(el as any).strokeWidth || 1}px solid ${esc((el as any).stroke)};` : '') + '"'
    return `<div${css}></div>`
  }
  if (el.type === 'line') {
    const e: any = el
    const dx = e.x2 - e.x1, dy = e.y2 - e.y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ang = Math.atan2(dy, dx) * 180 / Math.PI
    return `<div style="position:absolute;left:${e.x1}px;top:${e.y1}px;width:${len}px;height:${e.strokeWidth}px;background:${esc(e.stroke)};transform-origin:0 50%;transform:rotate(${ang}deg)"></div>`
  }
  if (el.type === 'image') {
    return `<img src="${esc((el as any).src)}" alt="" ${anim}object-fit:contain;"/>`.replace('<img', '<img loading="lazy"')
  }
  return ''
}

function renderText(el: TextElement, openStyle: string): string {
  const fw = typeof el.fontWeight === 'number' ? el.fontWeight : (el.fontWeight === 'bold' ? 700 : el.fontWeight === 'normal' ? 400 : 400)
  const style = `${openStyle}font-family:${esc(el.fontFamily)};font-size:${el.fontSize}px;font-weight:${fw};` +
    (el.fontStyle === 'italic' ? 'font-style:italic;' : '') +
    `color:${esc(el.color)};text-align:${el.align ?? 'left'};line-height:${el.lineHeight ?? 1.2};` +
    (el.letterSpacing ? `letter-spacing:${el.letterSpacing}em;` : '') +
    'line-break:strict;word-break:normal;overflow-wrap:break-word;white-space:pre-wrap;"'
  let inner = esc(el.text)
  if (el.highlight && el.highlightColor) {
    const i = el.text.indexOf(el.highlight)
    if (i >= 0) {
      const before = esc(el.text.slice(0, i))
      const hl = esc(el.highlight)
      const after = esc(el.text.slice(i + el.highlight.length))
      inner = `${before}<span style="color:${esc(el.highlightColor)};white-space:nowrap">${hl}</span>${after}`
    }
  }
  return `<div${style}>${inner}</div>`
}

function esc(s: string | undefined | null): string {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))
}

/** Trigger download of the HTML file from the editor. */
export function downloadHTML(presentation: EditorPresentation) {
  const html = exportHTML(presentation)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${presentation.title || 'deck'}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
