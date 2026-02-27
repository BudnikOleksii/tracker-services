import { Inject, Injectable } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;

  constructor(
    @Inject(AppConfigService)
    private readonly appConfigService: AppConfigService,
  ) {
    const emailConfig = this.appConfigService.email;

    this.transporter = createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const emailConfig = this.appConfigService.email;

    await this.transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      text,
      html,
    });
  }
}
