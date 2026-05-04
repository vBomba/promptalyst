import { HttpInterceptorFn } from '@angular/common/http';

/** Propagates X-Request-Id for correlation with Nest (nestjs-pino). */
export const requestIdInterceptor: HttpInterceptorFn = (req, next) => {
  const existing = req.headers.get('X-Request-Id');
  const id = existing && existing.length > 0 ? existing : crypto.randomUUID();
  return next(req.clone({ setHeaders: { 'X-Request-Id': id } }));
};
