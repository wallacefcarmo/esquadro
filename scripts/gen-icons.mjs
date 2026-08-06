// Gera os ícones PWA (PNG) manualmente via zlib, sem depender de next/og
// (que está quebrado nesta versão do Next — ver commit da migration de PWA).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const NAVY = [0x0f, 0x2c, 0x4c];
const AMBER = [0xf2, 0xa0, 0x07];

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Desenha o esquadro (dois braços em ângulo reto) num bitmap RGB size x size. */
function drawIcon(size) {
  const arm = Math.round(size * 0.12);
  const inset = Math.round(size * 0.28);
  const armLen = size - inset * 2;
  const px = new Uint8Array(size * size * 3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3;
      const verticalArm = x >= inset && x < inset + arm && y >= inset && y < inset + armLen;
      const horizontalArm = y >= inset + armLen - arm && y < inset + armLen && x >= inset && x < inset + armLen;
      const [r, g, b] = verticalArm || horizontalArm ? AMBER : NAVY;
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  }
  return px;
}

function encodePng(size) {
  const px = drawIcon(size);
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    raw[rowStart] = 0; // filter: none
    Buffer.from(px.buffer, y * size * 3, size * 3).copy(raw, rowStart + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
for (const size of [32, 180, 192, 512]) {
  const png = encodePng(size);
  const path = `public/icons/icon-${size}.png`;
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
