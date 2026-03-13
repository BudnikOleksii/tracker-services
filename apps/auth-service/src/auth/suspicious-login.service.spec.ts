import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '@tracker/shared';

import { SuspiciousLoginService } from './suspicious-login.service';
import { KnownDevicesRepository } from './repositories/known-devices.repository';
import { AuthConfigService } from '../config/auth-config.service';

describe('SuspiciousLoginService', () => {
  let service: SuspiciousLoginService;
  let knownDevicesRepository: {
    findDevice: ReturnType<typeof vi.fn>;
    upsertDevice: ReturnType<typeof vi.fn>;
  };
  let emailService: { sendEmail: ReturnType<typeof vi.fn> };
  let authConfigService: { suspiciousLoginEnabled: boolean };

  beforeEach(() => {
    knownDevicesRepository = {
      findDevice: vi.fn(),
      upsertDevice: vi.fn(),
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
    knownDevicesRepository.findDevice.mockResolvedValue(undefined);
    knownDevicesRepository.upsertDevice.mockResolvedValue({});

    await service.checkAndNotify(
      'user-1',
      'user@example.com',
      '1.2.3.4',
      'Mozilla/5.0',
    );

    // Wait for fire-and-forget email
    await new Promise((r) => setTimeout(r, 10));

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'user@example.com',
      'New sign-in to your account',
      expect.stringContaining('1.2.3.4'),
      expect.stringContaining('1.2.3.4'),
    );
  });

  it('should not send email for a known device', async () => {
    knownDevicesRepository.findDevice.mockResolvedValue({
      id: 'device-1',
      userId: 'user-1',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0',
    });
    knownDevicesRepository.upsertDevice.mockResolvedValue({});

    await service.checkAndNotify(
      'user-1',
      'user@example.com',
      '1.2.3.4',
      'Mozilla/5.0',
    );

    await new Promise((r) => setTimeout(r, 10));

    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should always upsert the device record', async () => {
    knownDevicesRepository.findDevice.mockResolvedValue({
      id: 'device-1',
    });
    knownDevicesRepository.upsertDevice.mockResolvedValue({});

    await service.checkAndNotify(
      'user-1',
      'user@example.com',
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(knownDevicesRepository.upsertDevice).toHaveBeenCalledWith(
      'user-1',
      '1.2.3.4',
      'Mozilla/5.0',
    );
  });

  it('should skip when feature is disabled', async () => {
    authConfigService.suspiciousLoginEnabled = false;

    await service.checkAndNotify(
      'user-1',
      'user@example.com',
      '1.2.3.4',
      'Mozilla/5.0',
    );

    expect(knownDevicesRepository.findDevice).not.toHaveBeenCalled();
  });

  it('should skip when ipAddress or userAgent is missing', async () => {
    await service.checkAndNotify(
      'user-1',
      'user@example.com',
      undefined,
      undefined,
    );

    expect(knownDevicesRepository.findDevice).not.toHaveBeenCalled();
  });

  it('should not fail login if email sending fails', async () => {
    knownDevicesRepository.findDevice.mockResolvedValue(undefined);
    knownDevicesRepository.upsertDevice.mockResolvedValue({});
    emailService.sendEmail.mockRejectedValue(new Error('SMTP error'));

    await expect(
      service.checkAndNotify(
        'user-1',
        'user@example.com',
        '1.2.3.4',
        'Mozilla/5.0',
      ),
    ).resolves.not.toThrow();
  });
});
