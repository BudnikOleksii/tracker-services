import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { createHash } from 'crypto';
import { HttpService } from '@nestjs/axios';

import { HibpService } from './hibp.service';

describe('HibpService', () => {
  let hibpService: HibpService;
  let httpService: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpService = { get: vi.fn() };
    hibpService = new HibpService(httpService as unknown as HttpService);
  });

  function getSha1Suffix(password: string): string {
    return createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase()
      .substring(5);
  }

  it('should return true when password is found in breach database', async () => {
    const suffix = getSha1Suffix('password123');
    httpService.get.mockReturnValue(
      of({
        data: `${suffix}:42\nABCDE12345678901234567890123456789A:10`,
      }),
    );

    const result = await hibpService.isPasswordBreached('password123');

    expect(result).toBe(true);
  });

  it('should return false when password is not found in breach database', async () => {
    httpService.get.mockReturnValue(
      of({
        data: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1234:5\nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB5678:3',
      }),
    );

    const result = await hibpService.isPasswordBreached(
      'some-unique-password-xyz!',
    );

    expect(result).toBe(false);
  });

  it('should return false (fail open) when HIBP API fails', async () => {
    httpService.get.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const result = await hibpService.isPasswordBreached('password123');

    expect(result).toBe(false);
  });

  it('should send only the first 5 chars of SHA-1 hash prefix', async () => {
    httpService.get.mockReturnValue(of({ data: '' }));

    await hibpService.isPasswordBreached('test-password');

    const sha1 = createHash('sha1')
      .update('test-password')
      .digest('hex')
      .toUpperCase();
    const prefix = sha1.substring(0, 5);

    expect(httpService.get).toHaveBeenCalledWith(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      expect.objectContaining({ timeout: 5000 }),
    );
  });
});
