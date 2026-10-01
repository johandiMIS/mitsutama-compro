import { isWebp } from './hero-images.service';

/** Builds a RIFF header: "RIFF" + 4 size bytes + a 4-char form type. */
function riff(formType: string, extra = 0): Uint8Array {
  const bytes = new Uint8Array(12 + extra);
  bytes.set(
    [...'RIFF'].map((c) => c.charCodeAt(0)),
    0,
  );
  bytes.set([0x24, 0x00, 0x00, 0x00], 4);
  bytes.set(
    [...formType].map((c) => c.charCodeAt(0)),
    8,
  );
  return bytes;
}

describe('isWebp', () => {
  it('accepts a RIFF/WEBP header', () => {
    expect(isWebp(riff('WEBP'))).toBe(true);
  });

  it('accepts a longer buffer that starts with the WebP markers', () => {
    expect(isWebp(riff('WEBP', 64))).toBe(true);
  });

  // The whole point of the check: a client can send Content-Type: image/webp with
  // any bytes it likes, and the presign policy would not catch it.
  it.each([
    ['a PNG', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]],
    ['a JPEG', [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]],
    ['a PDF', [...'%PDF-1.7'].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0])],
    ['HTML', [...'<html><body>x'].map((c) => c.charCodeAt(0))],
  ])('rejects %s', (_label, bytes) => {
    expect(isWebp(Uint8Array.from(bytes))).toBe(false);
  });

  // WAV and AVI are also RIFF containers, so checking only "RIFF" is not enough.
  it('rejects other RIFF containers', () => {
    expect(isWebp(riff('WAVE'))).toBe(false);
    expect(isWebp(riff('AVI '))).toBe(false);
  });

  it('rejects a truncated header', () => {
    expect(isWebp(riff('WEBP').slice(0, 11))).toBe(false);
    expect(isWebp(new Uint8Array(0))).toBe(false);
  });
});
