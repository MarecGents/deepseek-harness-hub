#!/usr/bin/env python3
# generate-desktop-icons.py — 生成桌面图标 .ico 资产（S6 桌面图标切换）
#
# 职责：把 src-tauri/icons/ 下的 PNG 源重新生成为多尺寸 32bpp .ico，供
#       Windows .lnk IconLocation / AUMID IconUri / 任务栏图标源使用。
#       （.lnk 的 IconLocation 只认 .ico，不接受 .png。）
#
# 背景（踩坑）：早期用 PowerShell [Bitmap]::GetHicon() + Icon.Save() 生成，
# 产出为 4bpp/16 色、无 Alpha 的劣质 ICO（256×256 彩色插画被抖动失真）。
# 本脚本用 Pillow 生成标准形态：每档尺寸独立条目、32bpp、PNG 压缩、保留
# Alpha；whale-girl 源图是不透明 RGB 方图，先加圆角透明遮罩再生成。
#
# 用法：python scripts/generate-desktop-icons.py   （在仓库根执行，幂等）
# 产出：src-tauri/icons/whale-girl-{sad,happy,duo,maid,blue}.ico
#       src-tauri/icons/whale.ico（default 选择，黑色虎鲸剪影=icon.png 源）

import struct
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ICONS_DIR = Path(__file__).resolve().parent.parent / "src-tauri" / "icons"

# 每档尺寸一个条目；Windows 资源管理器/任务栏按槽位取最佳档。
SIZES = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]

WHALE_GIRLS = ["sad", "happy", "duo", "maid", "blue"]


def rounded_alpha(im: Image.Image, radius_ratio: float = 0.225) -> Image.Image:
    """给不透明方图加圆角透明遮罩（4x 超采样抗锯齿）。"""
    base = im.convert("RGBA")
    w, h = base.size
    ss = 4
    mask = Image.new("L", (w * ss, h * ss), 0)
    draw = ImageDraw.Draw(mask)
    r = int(min(w, h) * ss * radius_ratio)
    draw.rounded_rectangle((0, 0, w * ss - 1, h * ss - 1), radius=r, fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)
    base.putalpha(mask)
    return base


def parse_ico(path: Path) -> str:
    """解析生成物并返回可读摘要（自校验：尺寸档位/压缩格式）。"""
    data = path.read_bytes()
    _, _, count = struct.unpack("<HHH", data[:6])
    parts = []
    for i in range(count):
        off = 6 + i * 16
        w, h = data[off], data[off + 1]
        w = 256 if w == 0 else w
        h = 256 if h == 0 else h
        size, dataoff = struct.unpack("<II", data[off + 8 : off + 16])
        is_png = data[dataoff : dataoff + 4] == b"\x89PNG"
        parts.append(f"{w}x{h}{'(png)' if is_png else '(bmp)'}")
    return f"{count} entries: {', '.join(parts)}"


def main() -> int:
    for girl in WHALE_GIRLS:
        src = ICONS_DIR / f"whale-girl-{girl}.png"
        if not src.exists():
            print(f"missing source: {src}", file=sys.stderr)
            return 1
        master = rounded_alpha(Image.open(src))
        out = ICONS_DIR / f"whale-girl-{girl}.ico"
        master.save(out, format="ICO", sizes=SIZES)
        print(f"{out.name}: {out.stat().st_size}B | {parse_ico(out)}")

    # default（主题翻转鲸鱼）→ 黑色虎鲸剪影：深/浅任务栏和桌面上均清晰
    #（白色鲸鱼在浅色桌面不可见，黑色鲸鱼在两态都可辨；与 exe 内嵌品牌图一致）。
    src = ICONS_DIR / "icon.png"
    master = Image.open(src).convert("RGBA")
    out = ICONS_DIR / "whale.ico"
    master.save(out, format="ICO", sizes=SIZES)
    print(f"{out.name}: {out.stat().st_size}B | {parse_ico(out)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
