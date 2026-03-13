import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '@tracker/shared';

import { AuthConfigService } from '../config/auth-config.service';
import { KnownDevicesRepository } from './repositories/known-devices.repository';

@Injectable()
export class SuspiciousLoginService {
  private readonly logger = new Logger(SuspiciousLoginService.name);

  constructor(
    private readonly knownDevicesRepository: KnownDevicesRepository,
    private readonly emailService: EmailService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async checkAndNotify(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    if (!this.authConfigService.suspiciousLoginEnabled) {
      return;
    }

    if (!ipAddress || !userAgent) {
      return;
    }

    const existingDevice = await this.knownDevicesRepository.findDevice(
      userId,
      ipAddress,
      userAgent,
    );

    await this.knownDevicesRepository.upsertDevice(
      userId,
      ipAddress,
      userAgent,
    );

    if (!existingDevice) {
      this.sendSuspiciousLoginEmail(email, ipAddress, userAgent).catch(
        (error) => {
          this.logger.error(
            'Failed to send suspicious login notification email',
            error instanceof Error ? error.message : error,
          );
        },
      );
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private async sendSuspiciousLoginEmail(
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const safeIpAddress = this.escapeHtml(ipAddress);
    const safeUserAgent = this.escapeHtml(userAgent);
    const timestamp = new Date().toISOString();
    const subject = 'New sign-in to your account';
    const text = [
      'We noticed a sign-in to your account from an unrecognized device.',
      '',
      `IP Address: ${ipAddress}`,
      `Device: ${userAgent}`,
      `Time: ${timestamp}`,
      '',
      'If this was you, you can ignore this email. If you did not sign in, please secure your account immediately.',
    ].join('\n');

    const html = [
      '<p>We noticed a sign-in to your account from an unrecognized device.</p>',
      '<table style="border-collapse: collapse; margin: 16px 0;">',
      `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">IP Address</td><td style="padding: 4px 0;">${safeIpAddress}</td></tr>`,
      `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Device</td><td style="padding: 4px 0;">${safeUserAgent}</td></tr>`,
      `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Time</td><td style="padding: 4px 0;">${timestamp}</td></tr>`,
      '</table>',
      '<p>If this was you, you can ignore this email. If you did not sign in, please secure your account immediately.</p>',
    ].join('\n');

    await this.emailService.sendEmail(email, subject, text, html);
  }
}
