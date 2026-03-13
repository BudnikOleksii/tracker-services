import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

describe('AuthService - login lockout integration', () => {
  let authService: AuthService;
  let usersRepository: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let refreshTokensRepository: { create: ReturnType<typeof vi.fn> };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let emailService: { sendEmail: ReturnType<typeof vi.fn> };
  let authConfigService: {
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshExpiresIn: string;
  };
  let hibpService: { isPasswordBreached: ReturnType<typeof vi.fn> };
  let lockoutService: {
    checkLockout: ReturnType<typeof vi.fn>;
    recordAttempt: ReturnType<typeof vi.fn>;
  };
  let suspiciousLoginService: { checkAndNotify: ReturnType<typeof vi.fn> };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    emailVerified: true,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };
    refreshTokensRepository = {
      create: vi.fn().mockResolvedValue({ id: 'token-1' }),
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValue('mock-token'),
    };
    emailService = {
      sendEmail: vi.fn().mockResolvedValue(undefined),
    };
    authConfigService = {
      jwtAccessSecret: 'secret',
      jwtRefreshSecret: 'refresh-secret',
      jwtAccessExpiresIn: '15m',
      jwtRefreshExpiresIn: '7d',
    };
    hibpService = {
      isPasswordBreached: vi.fn().mockResolvedValue(false),
    };
    lockoutService = {
      checkLockout: vi.fn(),
      recordAttempt: vi.fn().mockResolvedValue(undefined),
    };
    suspiciousLoginService = {
      checkAndNotify: vi.fn().mockResolvedValue(undefined),
    };

    authService = new AuthService(
      usersRepository as never,
      refreshTokensRepository as never,
      jwtService as never,
      emailService as never,
      authConfigService as never,
      hibpService as never,
      lockoutService as never,
      suspiciousLoginService as never,
    );
  });

  it('should return 429 when account is locked out', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    lockoutService.checkLockout.mockResolvedValue({
      locked: true,
      retryAfterSeconds: 60,
    });

    try {
      await authService.login({
        email: 'test@example.com',
        password: 'password',
      });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(RpcException);
      const rpcError = (error as RpcException).getError() as Record<
        string,
        unknown
      >;
      expect(rpcError['statusCode']).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(rpcError['retryAfter']).toBe(60);
    }
  });

  it('should record failed attempt on invalid password', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    lockoutService.checkLockout.mockResolvedValue({
      locked: false,
      retryAfterSeconds: 0,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    try {
      await authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla',
      });
      expect.unreachable('Should have thrown');
    } catch {
      expect(lockoutService.recordAttempt).toHaveBeenCalledWith({
        userId: 'user-1',
        successful: false,
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla',
      });
    }
  });

  it('should record successful attempt and check suspicious login on valid login', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    lockoutService.checkLockout.mockResolvedValue({
      locked: false,
      retryAfterSeconds: 0,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'ValidPass1!',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla',
    });

    expect(result.accessToken).toBeDefined();
    expect(lockoutService.recordAttempt).toHaveBeenCalledWith({
      userId: 'user-1',
      successful: true,
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla',
    });
    expect(suspiciousLoginService.checkAndNotify).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'test@example.com',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla',
    });
  });

  it('should still throw invalid credentials when recordAttempt fails on invalid password', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    lockoutService.checkLockout.mockResolvedValue({
      locked: false,
      retryAfterSeconds: 0,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    lockoutService.recordAttempt.mockRejectedValue(
      new Error('Redis connection lost'),
    );

    try {
      await authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla',
      });
      expect.unreachable('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(RpcException);
      const rpcError = (error as RpcException).getError() as Record<
        string,
        unknown
      >;
      expect(rpcError['statusCode']).toBe(HttpStatus.UNAUTHORIZED);
      expect(rpcError['message']).toBe('Invalid credentials');
      expect(lockoutService.recordAttempt).toHaveBeenCalledWith({
        userId: 'user-1',
        successful: false,
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla',
      });
    }
  });

  it('should still return accessToken when recordAttempt and checkAndNotify fail on valid login', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    lockoutService.checkLockout.mockResolvedValue({
      locked: false,
      retryAfterSeconds: 0,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    lockoutService.recordAttempt.mockRejectedValue(
      new Error('Redis connection lost'),
    );
    suspiciousLoginService.checkAndNotify.mockRejectedValue(
      new Error('Notification service unavailable'),
    );

    const result = await authService.login({
      email: 'test@example.com',
      password: 'ValidPass1!',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla',
    });

    expect(result.accessToken).toBeDefined();
    expect(lockoutService.recordAttempt).toHaveBeenCalledWith({
      userId: 'user-1',
      successful: true,
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla',
    });
    expect(suspiciousLoginService.checkAndNotify).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'test@example.com',
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla',
    });
  });

  it('should check lockout before validating credentials', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    lockoutService.checkLockout.mockResolvedValue({
      locked: true,
      retryAfterSeconds: 30,
    });

    try {
      await authService.login({
        email: 'test@example.com',
        password: 'ValidPass1!',
      });
      expect.unreachable('Should have thrown');
    } catch {
      // Lockout was checked and threw before bcrypt.compare was ever called
      expect(lockoutService.checkLockout).toHaveBeenCalledOnce();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    }
  });
});
