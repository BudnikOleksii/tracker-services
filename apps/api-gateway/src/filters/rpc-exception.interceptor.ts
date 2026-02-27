import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpException) {
          throw error;
        }

        if (typeof error === 'string') {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const rpcError = error as Record<string, unknown>;
        const statusCode =
          typeof rpcError.statusCode === 'number'
            ? rpcError.statusCode
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = rpcError.message ?? 'Internal server error';

        throw new HttpException({ statusCode, message }, statusCode);
      }),
    );
  }
}
