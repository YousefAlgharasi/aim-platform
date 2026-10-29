import { BadRequestException } from '@nestjs/common';
import { detectImageType, MAX_PAYMENT_IMAGE_BYTES, PaymentImageService } from './payment-image.service';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP')]);

describe('detectImageType', () => {
  it('detects PNG, JPEG and WebP from magic bytes', () => {
    expect(detectImageType(PNG)).toBe('image/png');
    expect(detectImageType(JPEG)).toBe('image/jpeg');
    expect(detectImageType(WEBP)).toBe('image/webp');
  });

  it('rejects anything else', () => {
    expect(detectImageType(Buffer.from('%PDF-1.7'))).toBeNull();
    expect(detectImageType(Buffer.from('<svg></svg>'))).toBeNull();
  });
});

describe('PaymentImageService.store', () => {
  const db = { query: jest.fn().mockResolvedValue({ rows: [{ id: 'img-1' }] }) };
  const svc = new PaymentImageService(db as any);

  it('stores a valid image and returns its id', async () => {
    await expect(svc.store({ buffer: PNG, size: PNG.length }, 'receipt', 'u1')).resolves.toBe('img-1');
    expect(db.query.mock.calls[0][1]).toEqual(['receipt', 'image/png', PNG.length, PNG, 'u1']);
  });

  it('requires a file', async () => {
    await expect(svc.store(undefined, 'receipt', 'u1')).rejects.toThrow(BadRequestException);
  });

  it('rejects files over 5 MB', async () => {
    await expect(svc.store({ buffer: PNG, size: MAX_PAYMENT_IMAGE_BYTES + 1 }, 'receipt', 'u1')).rejects.toThrow('5 MB');
  });

  it('rejects non-images even with an image MIME type', async () => {
    const pdf = Buffer.from('%PDF-1.7 fake');
    await expect(svc.store({ buffer: pdf, size: pdf.length, mimetype: 'image/png' }, 'receipt', 'u1')).rejects.toThrow(
      'PNG, JPEG or WebP',
    );
  });
});
