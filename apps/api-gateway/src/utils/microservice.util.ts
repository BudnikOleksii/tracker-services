import { lastValueFrom, timeout } from 'rxjs';
import type { ClientProxy } from '@nestjs/microservices';

const DEFAULT_TIMEOUT_MS = 5000;

export function sendWithTimeout<TResponse = unknown, TPayload = unknown>(
  client: ClientProxy,
  pattern: unknown,
  payload: TPayload,
): Promise<TResponse> {
  return lastValueFrom(
    client
      .send<TResponse, TPayload>(pattern, payload)
      .pipe(timeout(DEFAULT_TIMEOUT_MS)),
  );
}
