// Public wallet images: GET /billing/wallets/:id/logo and /qr.
//
// Wallet logos and the account-number / QR images are meant to be shown to
// every student who wants to pay, so they are served without auth (they
// contain no student data). Receipts are never served here.

import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentWalletService } from './payment-wallet.service';

@ApiTags('course-billing')
@Controller('billing/wallets')
export class PublicWalletImageController {
  constructor(private readonly wallets: PaymentWalletService) {}

  @Get(':id/logo')
  @ApiOperation({ summary: 'Wallet logo image.' })
  async logo(@Param('id') id: string, @Res() res: Response): Promise<void> {
    await this.send(id, 'logo', res);
  }

  @Get(':id/qr')
  @ApiOperation({ summary: 'Wallet account number / QR code image.' })
  async qr(@Param('id') id: string, @Res() res: Response): Promise<void> {
    await this.send(id, 'qr', res);
  }

  private async send(id: string, kind: 'logo' | 'qr', res: Response): Promise<void> {
    const image = await this.wallets.readImage(id, kind);
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    // Shown by the student web app, which may live on another origin than
    // the API (the default helmet policy would make browsers block it).
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(image.data);
  }
}
