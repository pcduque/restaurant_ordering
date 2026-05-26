import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { maskPii } from '../utils/pii-mask.util';

@Injectable()
export class MaskedLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { body: unknown }>();
    const startedAt = Date.now();
    console.log('request', {
      method: request.method,
      path: request.url,
      body: maskPii(request.body),
    });

    return next.handle().pipe(
      tap(() => {
        console.log('response', {
          method: request.method,
          path: request.url,
          durationMs: Date.now() - startedAt,
        });
      }),
    );
  }
}
