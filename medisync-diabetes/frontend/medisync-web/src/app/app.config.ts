import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    // Outline es mas liviano que el "fill" (fondo gris) por defecto — mejor calce con el
    // tono minimalista pedido para toda la app.
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    // Snackbars breves y discretos para feedback de acciones (no de carga inicial de pagina).
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000, horizontalPosition: 'center', verticalPosition: 'bottom' } }
  ]
};
