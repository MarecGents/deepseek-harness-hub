/**
 * Minimal PNG decoder for the shell's own icon assets: parses IHDR/IDAT,
 * inflates the scanlines, and reverses the five filter types. Supports 8-bit
 * grayscale (0), truecolour (2) and truecolour-alpha (6) — exactly what
 * resvg-js emits. Returns raw 32bpp RGBA pixels for the window/tray bindings,
 * which take pixels, not encoded images.
 */
export declare function decodePngRgba(path: string): {
    data: Buffer;
    width: number;
    height: number;
};
