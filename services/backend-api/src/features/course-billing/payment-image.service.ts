// Stores payment-related images (wallet logos, wallet QR/number images and
// payment receipts) in Postgres so they survive API redeploys.
//
// Only PNG, JPEG and WebP up to 5 MB are accepted. The type is decided from
// the file's magic bytes, not the client-supplied MIME type.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UploadedImage } from './course-billing.types';

export const MAX_PAYMENT_IMAGE_BYTES = 5 * 1024 * 1024;

export type PaymentImagePurpose = 'wallet_logo' | 'wallet_qr' | 'receipt';

export function detectImageType(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

@Injectable()
export class PaymentImageService {
  constructor(private readonly db: DatabaseService) {}

  async store(file: UploadedImage | undefined, purpose: PaymentImagePurpose, uploadedBy: string | null): Promise<string> {
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException('An image file is required');
    }
    if (file.size > MAX_PAYMENT_IMAGE_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }
    const contentType = detectImageType(file.buffer);
    if (!contentType) {
      throw new BadRequestException('Image must be a PNG, JPEG or WebP file');
    }
    const result = await this.db.query<{ id: string }>(
      `INSERT INTO payment_images (purpose, content_type, byte_size, data, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [purpose, contentType, file.size, file.buffer, uploadedBy],
    );
    return result.rows[0].id;
  }

  async read(id: string): Promise<{ contentType: string; data: Buffer }> {
    const result = await this.db.query<{ content_type: string; data: Buffer }>(
      `SELECT content_type, data FROM payment_images WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Image not found');
    return { contentType: row.content_type, data: row.data };
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM payment_images WHERE id = $1`, [id]);
  }
}
