// generate-titlebar-icons.mjs — 生成窗口主题图标（白鲸/黑鲸，128×128 PNG）
//
// 职责：读 dsh web 的 favicon.svg（50×50 viewBox 鲸鱼 path），用 @resvg/resvg-js
//       渲染两个变体到 src-tauri/icons/：
//         icon-dark.png  白鲸（#ffffff，深色窗口图标）
//         icon-light.png 黑鲸（#0f1115，浅色窗口图标）
//       透明背景。Rust 侧 theme.rs 经 include_bytes! 内嵌（tauri image-png 解码）。
//
// 用法：node scripts/generate-titlebar-icons.mjs [favicon.svg 路径]
//       默认路径 = 兄弟仓库 deepseek-harness/apps/web/public/favicon.svg。
//       产物非空即成功；脚本保留以便再生成（favicon 更新后重跑即可）。

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const defaultSvg = resolve(here, '../../deepseek-harness/apps/web/public/favicon.svg');
const svgPath = process.argv[2] ? resolve(process.argv[2]) : defaultSvg;

const OUT_W = 128;
const OUT_H = 128;

/** 从 favicon.svg 提取鲸鱼 path 的 d 属性（首个 <path d="...">）。 */
function extractWhalePath(svgText) {
  const m = svgText.match(/<path\b[^>]*\bd="([^"]+)"/);
  if (!m) throw new Error(`no <path d="..."> found in ${svgPath}`);
  return m[1];
}

/** 渲染一个单色鲸鱼 SVG 到 PNG 字节。 */
function renderPng(d, fill) {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT_W}" height="${OUT_H}" viewBox="0 0 50 50">`,
    `<path d="${d}" fill="${fill}" fill-opacity="1" fill-rule="nonzero"/>`,
    `</svg>`,
  ].join('');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OUT_W },
    background: 'rgba(0,0,0,0)', // 透明背景
  });
  const png = resvg.render().asPng();
  if (!png || png.length === 0) throw new Error(`render produced empty png (fill=${fill})`);
  return png;
}

const svgText = readFileSync(svgPath, 'utf8');
const d = extractWhalePath(svgText);

const outDir = resolve(here, '../src-tauri/icons');
const variants = [
  ['icon-dark.png', '#ffffff'],
  ['icon-light.png', '#0f1115'],
];

for (const [name, fill] of variants) {
  const out = resolve(outDir, name);
  writeFileSync(out, renderPng(d, fill));
  const size = readFileSync(out).length;
  console.log(`generated ${out} (${size} bytes, fill=${fill})`);
}
console.log('titlebar icons OK');
