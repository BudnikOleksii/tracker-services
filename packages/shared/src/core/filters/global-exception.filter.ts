import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        const extractedMessage = (responseBody as { message?: unknown })
          .message;
        if (Array.isArray(extractedMessage)) {
          message = extractedMessage;
        } else if (typeof extractedMessage === 'string') {
          message = extractedMessage;
        }
      }
    } else if (exception instanceof DatabaseError) {
      status = HttpStatus.BAD_REQUEST;
      switch (exception.code) {
        case '23505':
          message = 'Unique constraint violation';
          break;
        case '23503':
          message = 'Foreign key constraint violation';
          break;
        case '23502':
          message = 'Required field missing';
          break;
        default:
          message = 'Database operation failed';
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
