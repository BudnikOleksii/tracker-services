import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HibpService {
  private readonly logger = new Logger(HibpService.name);

  constructor(private readonly httpService: HttpService) {}

  async isPasswordBreached(password: string): Promise<boolean> {
    try {
      const sha1 = createHash('sha1')
        .update(password)
        .digest('hex')
        .toUpperCase();
      const prefix = sha1.substring(0, 5);
      const suffix = sha1.substring(5);

      const response = await firstValueFrom(
        this.httpService.get<string>(
          `https://api.pwnedpasswords.com/range/${prefix}`,
          { timeout: 5000, responseType: 'text' },
        ),
      );

      const lines = response.data.split('\n');

      return lines.some((line) => {
        const [hashSuffix] = line.split(':');

        return hashSuffix?.trim() === suffix;
      });
    } catch (error) {
      this.logger.warn(
        'HIBP password check failed, allowing registration to proceed',
        error instanceof Error ? error.message : error,
      );

      return false;
    }
  }
}
