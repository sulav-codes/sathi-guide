import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface VerificationEmailPayload {
  to: string;
  userName?: string;
  verificationUrl: string;
  expiresInMinutes: number;
}

export interface PasswordResetEmailPayload {
  to: string;
  userName?: string;
  resetUrl: string;
  expiresInMinutes: number;
  requestedFromIp?: string;
}

export interface PasswordChangedEmailPayload {
  to: string;
  userName?: string;
  changedAt: Date;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly appName: string;
  private readonly frontendUrl: string;
  private readonly mailFrom: string;
  private readonly resend: Resend | null;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    this.appName = this.configService.get<string>('APP_NAME', 'SathiGuide');
    this.frontendUrl = this.normalizeUrl(
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    );

    const mailFrom = this.configService.get<string>('MAIL_FROM')?.trim();
    if (!mailFrom && nodeEnv === 'production') {
      throw new Error('MAIL_FROM environment variable is not set');
    }
    this.mailFrom = mailFrom || `${this.appName} <onboarding@resend.dev>`;

    const resendApiKey = this.configService
      .get<string>('RESEND_API_KEY')
      ?.trim();
    if (!resendApiKey) {
      if (nodeEnv === 'production') {
        throw new Error('RESEND_API_KEY environment variable is not set');
      }
      this.logger.warn('RESEND_API_KEY is not set. Email sending is disabled.');
      this.resend = null;
    } else {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendVerificationEmail(
    payload: VerificationEmailPayload,
  ): Promise<void> {
    const subject = `Verify your ${this.appName} email address`;
    const html = this.buildVerificationEmailHtml(payload);
    const text = this.buildVerificationEmailText(payload);

    this.logger.debug(
      `Verification link expires in ${this.formatExpiry(payload.expiresInMinutes)}`,
    );

    await this.sendEmail({
      to: payload.to,
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'verification' }],
      context: 'verification',
    });
  }

  async sendPasswordReset(payload: PasswordResetEmailPayload): Promise<void> {
    const subject = `Reset your ${this.appName} password`;
    const html = this.buildPasswordResetEmailHtml(payload);
    const text = this.buildPasswordResetEmailText(payload);

    this.logger.debug(
      `Password reset link expires in ${this.formatExpiry(payload.expiresInMinutes)}`,
    );
    if (payload.requestedFromIp) {
      this.logger.debug(
        `Password reset requested from IP: ${payload.requestedFromIp}`,
      );
    }

    await this.sendEmail({
      to: payload.to,
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'password_reset' }],
      context: 'password reset',
    });
  }

  async sendPasswordChangedNotification(
    payload: PasswordChangedEmailPayload,
  ): Promise<void> {
    const subject = `Your ${this.appName} password was changed`;
    const html = this.buildPasswordChangedEmailHtml(payload);
    const text = this.buildPasswordChangedEmailText(payload);

    await this.sendEmail({
      to: payload.to,
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'password_changed' }],
      context: 'password changed',
    });
  }

  buildVerificationUrl(rawToken: string): string {
    return `${this.frontendUrl}/auth/verify-link?token=${encodeURIComponent(rawToken)}`;
  }

  buildPasswordResetUrl(rawToken: string): string {
    return `${this.frontendUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    tags?: Array<{ name: string; value: string }>;
    context: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `Email not sent (Resend disabled): ${options.context} -> ${options.to}`,
      );
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.mailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        tags: options.tags,
      });

      if (error) {
        this.logger.error(
          `Resend failed for ${options.context} email to ${options.to}: ${error.message}`,
        );
        throw new Error(error.message);
      }

      this.logger.log(
        `Resend accepted ${options.context} email to ${options.to} (id: ${data?.id ?? 'unknown'})`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email error';
      this.logger.error(
        `Failed to send ${options.context} email to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  private buildVerificationEmailHtml(
    payload: VerificationEmailPayload,
  ): string {
    return this.buildEmailHtml({
      title: `Verify your ${this.appName} email`,
      greeting: this.formatGreeting(payload.userName),
      paragraphs: [
        `Thanks for creating a ${this.appName} account.`,
        'Please verify your email address to finish setup.',
        `This link expires in ${this.formatExpiry(payload.expiresInMinutes)}.`,
      ],
      ctaLabel: 'Verify email',
      ctaUrl: payload.verificationUrl,
      footnote: 'If you did not create an account, you can ignore this email.',
    });
  }

  private buildVerificationEmailText(
    payload: VerificationEmailPayload,
  ): string {
    return this.buildEmailText({
      title: `Verify your ${this.appName} email`,
      greeting: this.formatGreeting(payload.userName),
      paragraphs: [
        `Thanks for creating a ${this.appName} account.`,
        'Please verify your email address to finish setup.',
        `This link expires in ${this.formatExpiry(payload.expiresInMinutes)}.`,
      ],
      ctaLabel: 'Verify email',
      ctaUrl: payload.verificationUrl,
      footnote: 'If you did not create an account, you can ignore this email.',
    });
  }

  private buildPasswordResetEmailHtml(
    payload: PasswordResetEmailPayload,
  ): string {
    const paragraphs = [
      'We received a request to reset your password.',
      `This link expires in ${this.formatExpiry(payload.expiresInMinutes)}.`,
    ];

    if (payload.requestedFromIp) {
      paragraphs.push(
        `Request originated from IP: ${payload.requestedFromIp}.`,
      );
    }

    return this.buildEmailHtml({
      title: `Reset your ${this.appName} password`,
      greeting: this.formatGreeting(payload.userName),
      paragraphs,
      ctaLabel: 'Reset password',
      ctaUrl: payload.resetUrl,
      footnote: 'If you did not request a reset, you can ignore this email.',
    });
  }

  private buildPasswordResetEmailText(
    payload: PasswordResetEmailPayload,
  ): string {
    const paragraphs = [
      'We received a request to reset your password.',
      `This link expires in ${this.formatExpiry(payload.expiresInMinutes)}.`,
    ];

    if (payload.requestedFromIp) {
      paragraphs.push(
        `Request originated from IP: ${payload.requestedFromIp}.`,
      );
    }

    return this.buildEmailText({
      title: `Reset your ${this.appName} password`,
      greeting: this.formatGreeting(payload.userName),
      paragraphs,
      ctaLabel: 'Reset password',
      ctaUrl: payload.resetUrl,
      footnote: 'If you did not request a reset, you can ignore this email.',
    });
  }

  private buildPasswordChangedEmailHtml(
    payload: PasswordChangedEmailPayload,
  ): string {
    const formattedDate = this.formatTimestamp(payload.changedAt);

    return this.buildEmailHtml({
      title: `Your ${this.appName} password was changed`,
      greeting: this.formatGreeting(payload.userName),
      paragraphs: [
        `Your password was changed on ${formattedDate} UTC.`,
        'If this was not you, reset your password immediately and contact support.',
      ],
      footnote: 'If this was you, no further action is required.',
    });
  }

  private buildPasswordChangedEmailText(
    payload: PasswordChangedEmailPayload,
  ): string {
    const formattedDate = this.formatTimestamp(payload.changedAt);

    return this.buildEmailText({
      title: `Your ${this.appName} password was changed`,
      greeting: this.formatGreeting(payload.userName),
      paragraphs: [
        `Your password was changed on ${formattedDate} UTC.`,
        'If this was not you, reset your password immediately and contact support.',
      ],
      footnote: 'If this was you, no further action is required.',
    });
  }

  private buildEmailHtml(options: {
    title: string;
    greeting: string;
    paragraphs: string[];
    ctaLabel?: string;
    ctaUrl?: string;
    footnote?: string;
  }): string {
    const safeTitle = this.escapeHtml(options.title);
    const safeGreeting = this.escapeHtml(options.greeting);
    const paragraphHtml = options.paragraphs
      .map(
        (paragraph) =>
          `<p style="margin: 0 0 16px;">${this.escapeHtml(paragraph)}</p>`,
      )
      .join('');
    const ctaHtml =
      options.ctaUrl && options.ctaLabel
        ? `<p style="margin: 24px 0 16px;">
            <a href="${this.escapeAttribute(options.ctaUrl)}" style="background-color: #0b5fff; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; display: inline-block;">
              ${this.escapeHtml(options.ctaLabel)}
            </a>
          </p>
          <p style="margin: 0 0 16px; font-size: 12px; color: #6b7280; word-break: break-all;">
            ${this.escapeHtml(options.ctaUrl)}
          </p>`
        : '';
    const footnoteHtml = options.footnote
      ? `<p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">${this.escapeHtml(options.footnote)}</p>`
      : '';

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f8fb; color: #111827; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f6f8fb; padding: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 10px; padding: 24px;">
            <tr>
              <td>
                <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #111827;">${safeTitle}</h1>
                <p style="margin: 0 0 16px;">${safeGreeting}</p>
                ${paragraphHtml}
                ${ctaHtml}
                ${footnoteHtml}
              </td>
            </tr>
          </table>
          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">${this.escapeHtml(this.appName)}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private buildEmailText(options: {
    title: string;
    greeting: string;
    paragraphs: string[];
    ctaLabel?: string;
    ctaUrl?: string;
    footnote?: string;
  }): string {
    const lines = [
      options.title,
      '',
      options.greeting,
      '',
      ...options.paragraphs,
    ];

    if (options.ctaLabel && options.ctaUrl) {
      lines.push('', `${options.ctaLabel}: ${options.ctaUrl}`);
    }

    if (options.footnote) {
      lines.push('', options.footnote);
    }

    lines.push('', this.appName);

    return lines.join('\n');
  }

  private formatGreeting(userName?: string): string {
    const name = this.resolveRecipientName(userName);
    return `Hi ${name},`;
  }

  private resolveRecipientName(userName?: string): string {
    const trimmed = userName?.trim();
    if (!trimmed) {
      return 'there';
    }

    return trimmed.replace(/\s+/g, ' ');
  }

  private formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(date);
  }

  private normalizeUrl(url: string): string {
    return url.trim().replace(/\/+$/, '');
  }

  private formatExpiry(minutes: number): string {
    const safeMinutes = Math.max(1, Math.round(minutes));
    return `${safeMinutes} minute${safeMinutes === 1 ? '' : 's'}`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value);
  }
}
