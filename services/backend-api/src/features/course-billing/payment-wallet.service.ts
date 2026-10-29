// PaymentWalletService — the wallets students can pay with. Admins manage
// them (name, account details, logo, QR/number image, active flag, order);
// students see active wallets only.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UploadedImage, WalletView } from './course-billing.types';
import { PaymentImageService } from './payment-image.service';

interface WalletRow {
  readonly id: string;
  readonly name: string;
  readonly account_name: string | null;
  readonly account_number: string | null;
  readonly instructions: string | null;
  readonly logo_image_id: string | null;
  readonly qr_image_id: string | null;
  readonly is_active: boolean;
  readonly sort_order: number;
}

export interface WalletInput {
  name?: string;
  accountName?: string | null;
  accountNumber?: string | null;
  instructions?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type WalletImageKind = 'logo' | 'qr';

function clean(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function toWalletView(row: WalletRow): WalletView {
  return {
    id: row.id,
    name: row.name,
    accountName: row.account_name,
    accountNumber: row.account_number,
    instructions: row.instructions,
    logoUrl: row.logo_image_id ? `/billing/wallets/${row.id}/logo?v=${row.logo_image_id.slice(0, 8)}` : null,
    qrImageUrl: row.qr_image_id ? `/billing/wallets/${row.id}/qr?v=${row.qr_image_id.slice(0, 8)}` : null,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

@Injectable()
export class PaymentWalletService {
  constructor(
    private readonly db: DatabaseService,
    private readonly images: PaymentImageService,
  ) {}

  async list(activeOnly: boolean): Promise<WalletView[]> {
    const result = await this.db.query<WalletRow>(
      `SELECT * FROM payment_wallets
       ${activeOnly ? 'WHERE is_active = true' : ''}
       ORDER BY sort_order ASC, created_at ASC`,
    );
    return result.rows.map(toWalletView);
  }

  private async getRow(id: string): Promise<WalletRow> {
    const result = await this.db.query<WalletRow>(`SELECT * FROM payment_wallets WHERE id::text = $1`, [id]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Wallet not found');
    return row;
  }

  async getActive(id: string): Promise<WalletView> {
    const row = await this.getRow(id);
    if (!row.is_active) throw new BadRequestException('This wallet is no longer available');
    return toWalletView(row);
  }

  async create(input: WalletInput): Promise<WalletView> {
    const name = clean(input.name);
    if (!name) throw new BadRequestException('Wallet name is required');
    const result = await this.db.query<WalletRow>(
      `INSERT INTO payment_wallets (name, account_name, account_number, instructions, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, clean(input.accountName), clean(input.accountNumber), clean(input.instructions), input.isActive ?? true, input.sortOrder ?? 0],
    );
    return toWalletView(result.rows[0]);
  }

  async update(id: string, input: WalletInput): Promise<WalletView> {
    const current = await this.getRow(id);
    const name = input.name !== undefined ? clean(input.name) : current.name;
    if (!name) throw new BadRequestException('Wallet name is required');
    const result = await this.db.query<WalletRow>(
      `UPDATE payment_wallets
       SET name = $2, account_name = $3, account_number = $4, instructions = $5, is_active = $6, sort_order = $7
       WHERE id = $1
       RETURNING *`,
      [
        current.id,
        name,
        input.accountName !== undefined ? clean(input.accountName) : current.account_name,
        input.accountNumber !== undefined ? clean(input.accountNumber) : current.account_number,
        input.instructions !== undefined ? clean(input.instructions) : current.instructions,
        input.isActive ?? current.is_active,
        input.sortOrder ?? current.sort_order,
      ],
    );
    return toWalletView(result.rows[0]);
  }

  /** Deletes a wallet, or deactivates it when payments already reference it. */
  async remove(id: string): Promise<{ deleted: boolean; deactivated: boolean }> {
    const row = await this.getRow(id);
    const used = await this.db.query(`SELECT 1 FROM course_payment_requests WHERE wallet_id = $1 LIMIT 1`, [row.id]);
    if (used.rowCount) {
      await this.db.query(`UPDATE payment_wallets SET is_active = false WHERE id = $1`, [row.id]);
      return { deleted: false, deactivated: true };
    }
    await this.db.query(`DELETE FROM payment_wallets WHERE id = $1`, [row.id]);
    for (const imageId of [row.logo_image_id, row.qr_image_id]) {
      if (imageId) await this.images.delete(imageId);
    }
    return { deleted: true, deactivated: false };
  }

  async setImage(id: string, kind: WalletImageKind, file: UploadedImage | undefined, adminId: string): Promise<WalletView> {
    const row = await this.getRow(id);
    const imageId = await this.images.store(file, kind === 'logo' ? 'wallet_logo' : 'wallet_qr', adminId);
    const column = kind === 'logo' ? 'logo_image_id' : 'qr_image_id';
    const previous = kind === 'logo' ? row.logo_image_id : row.qr_image_id;
    const result = await this.db.query<WalletRow>(
      `UPDATE payment_wallets SET ${column} = $2 WHERE id = $1 RETURNING *`,
      [row.id, imageId],
    );
    if (previous) await this.images.delete(previous);
    return toWalletView(result.rows[0]);
  }

  async clearImage(id: string, kind: WalletImageKind): Promise<WalletView> {
    const row = await this.getRow(id);
    const column = kind === 'logo' ? 'logo_image_id' : 'qr_image_id';
    const previous = kind === 'logo' ? row.logo_image_id : row.qr_image_id;
    const result = await this.db.query<WalletRow>(
      `UPDATE payment_wallets SET ${column} = NULL WHERE id = $1 RETURNING *`,
      [row.id],
    );
    if (previous) await this.images.delete(previous);
    return toWalletView(result.rows[0]);
  }

  async readImage(id: string, kind: WalletImageKind): Promise<{ contentType: string; data: Buffer }> {
    const row = await this.getRow(id);
    const imageId = kind === 'logo' ? row.logo_image_id : row.qr_image_id;
    if (!imageId) throw new NotFoundException('Image not found');
    return this.images.read(imageId);
  }
}
