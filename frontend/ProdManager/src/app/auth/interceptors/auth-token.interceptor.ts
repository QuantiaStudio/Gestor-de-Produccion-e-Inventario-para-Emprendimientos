import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).getToken();
  const isBackendRequest = request.url.startsWith(environment.djangoApiUrl);

  if (!token || !isBackendRequest) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Token ${token}` },
  }));
};
