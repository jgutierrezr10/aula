import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let request = req;
  if (token) {
    request = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    catchError(error => {
      // Si el token expiró o es inválido (401/403), cerrar sesión y redirigir
      if (error.status === 401 || error.status === 403) {
        // No redirigir si es una llamada al endpoint de auth
        if (!req.url.includes('/api/auth/')) {
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};