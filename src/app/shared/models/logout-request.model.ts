import { LogoutType } from './logout-type.model';

/**
 * Información que el frontend enviará a la API
 * cuando finalice la sesión.
 */
export interface LogoutRequest {
  motivo: LogoutType;
}