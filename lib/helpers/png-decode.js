/**
 * Minimal PNG decoder for the shell's own icon assets: parses IHDR/IDAT,
 * inflates the scanlines, and reverses the five filter types. Supports 8-bit
 * grayscale (0), truecolour (2) and truecolour-alpha (6) — exactly what
 * resvg-js emits. Returns raw 32bpp RGBA pixels for the window/tray bindings,
 * which take pixels, not encoded images.
 */
import { inflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
export function decodePngRgba(path) {
    const bytes = readFileSync(path);
    if (bytes.length < 8 || bytes.readUInt32BE(0) !== 0x89504e47) {
        throw new Error(`decodePngRgba: not a PNG: ${path}`);
    }
    let offset = 8;
    let width = 0;
    let height = 0;
    let bitDepth = 0;
    let colorType = 0;
    const idatChunks = [];
    while (offset < bytes.length) {
        const length = bytes.readUInt32BE(offset);
        const type = bytes.toString('ascii', offset + 4, offset + 8);
        const data = bytes.subarray(offset + 8, offset + 8 + length);
        if (type === 'IHDR') {
            width = data.readUInt32BE(0);
            height = data.readUInt32BE(4);
            bitDepth = data[8];
            colorType = data[9];
        }
        else if (type === 'IDAT') {
            idatChunks.push(data);
        }
        else if (type === 'IEND') {
            break;
        }
        offset += 12 + length;
    }
    if (bitDepth !== 8)
        throw new Error(`decodePngRgba: unsupported bit depth ${bitDepth}`);
    const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
    if (channels === 0)
        throw new Error(`decodePngRgba: unsupported colour type ${colorType}`);
    const raw = inflateSync(Buffer.concat(idatChunks));
    const stride = width * channels;
    const out = Buffer.alloc(width * height * 4);
    let prev = Buffer.alloc(stride);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)];
        const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
        const cur = Buffer.alloc(stride);
        for (let x = 0; x < stride; x++) {
            const left = x >= channels ? cur[x - channels] : 0;
            const up = prev[x];
            const upLeft = x >= channels ? prev[x - channels] : 0;
            let value = line[x];
            switch (filter) {
                case 1:
                    value = (value + left) & 0xff;
                    break; // Sub
                case 2:
                    value = (value + up) & 0xff;
                    break; // Up
                case 3:
                    value = (value + ((left + up) >> 1)) & 0xff;
                    break; // Average
                case 4: { // Paeth
                    const p = left + up - upLeft;
                    const pa = Math.abs(p - left);
                    const pb = Math.abs(p - up);
                    const pc = Math.abs(p - upLeft);
                    const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
                    value = (value + predictor) & 0xff;
                    break;
                }
                default: break; // None
            }
            cur[x] = value;
        }
        // Expand to RGBA.
        for (let x = 0; x < width; x++) {
            const src = x * channels;
            const dst = (y * width + x) * 4;
            out[dst] = cur[src];
            out[dst + 1] = channels >= 2 ? cur[src + 1] : cur[src];
            out[dst + 2] = channels >= 3 ? cur[src + 2] : cur[src];
            out[dst + 3] = channels === 4 ? cur[src + 3] : 255;
        }
        prev = cur;
    }
    return { data: out, width, height };
}
