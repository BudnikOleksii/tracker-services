import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '@tracker/shared';

import { SuspiciousLoginService } from './suspicious-login.service';
import { KnownDevicesRepository } from './repositories/known-devices.repository';
import { AuthConfigService } from '../config/auth-config.service';

describe('SuspiciousLoginService', () => {
  let service: SuspiciousLoginService;
  let knownDevicesRepository: {
    insertDeviceIfNew: ReturnType<typeof vi.fn>;
  };
  let emailService: { sendEmail: ReturnType<typeof vi.fn> };
  let authConfigService: { suspiciousLoginEnabled: boolean };

  beforeEach(() => {
    knownDevicesRepository = {
      insertDeviceIfNew: vi.fn(),
    };
    emailService = { sendEmail: vi.fn().mockResolvedValue(undefined) };
    authConfigService = { suspiciousLoginEnabled: true };

    service = new SuspiciousLoginService(
      knownDevicesRepository as unknown as KnownDevicesRepository,
      emailService as unknown as EmailService,
      authConfigService as unknown as AuthConfigService,
    );
  });

  it('should send email for a new device', async () => {
    knownDevicesRepository.insertDeviceIfNew.mockResolvedValue(true);

    await service.checkAndNotify({
      userId: 'user-1',
      email: 'user@example.com',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0',
    });

    // Wait for fire-and-forget email
    await new Promise((r) => setTimeout(r, 10));

    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'New sign-in to your account',
      text: expect.stringContaining('1.2.3.4') as unknown as string,
      html: expect.stringContaining('1.2.3.4') as unknown as string,
    });
  });

  it('should not send email for a known device', async () => {
    knownDevicesRepository.insertDeviceIfNew.mockResolvedValue(false);

    await service.checkAndNotify({
      userId: 'user-1',
      email: 'user@example.com',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0',
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should call insertDeviceIfNew with correct args', async () => {
    knownDevicesRepository.insertDeviceIfNew.mockResolvedValue(false);

    await service.checkAndNotify({
      userId: 'user-1',
      email: 'user@example.com',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0',
    });

    expect(knownDevicesRepository.insertDeviceIfNew).toHaveBeenCalledWith({
      userId: 'user-1',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0',
    });
  });

  it('should skip when feature is disabled', async () => {
    authConfigService.suspiciousLoginEnabled = false;

    await service.checkAndNotify({
      userId: 'user-1',
      email: 'user@example.com',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0',
    });

    expect(knownDevicesRepository.insertDeviceIfNew).not.toHaveBeenCalled();
  });

  it('should skip when ipAddress or userAgent is missing', async () => {
    await service.checkAndNotify({
      userId: 'user-1',
      email: 'user@example.com',
      ipAddress: undefined,
      userAgent: undefined,
    });

    expect(knownDevicesRepository.insertDeviceIfNew).not.toHaveBeenCalled();
  });

  it('should not fail login if email sending fails', async () => {
    knownDevicesRepository.insertDeviceIfNew.mockResolvedValue(true);
    emailService.sendEmail.mockRejectedValue(new Error('SMTP error'));

    await expect(
      service.checkAndNotify({
        userId: 'user-1',
        email: 'user@example.com',
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla/5.0',
      }),
    ).resolves.not.toThrow();
  });
});
