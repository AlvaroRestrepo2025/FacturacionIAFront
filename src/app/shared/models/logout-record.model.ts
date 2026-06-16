import { LogoutType } from './logout-type.model';

/**
 * Representa la información registrada
 * cuando finaliza una sesión.
 */
export interface LogoutRecord {
  tipoCierre: LogoutType;
  fechaHoraUtc: string;
}