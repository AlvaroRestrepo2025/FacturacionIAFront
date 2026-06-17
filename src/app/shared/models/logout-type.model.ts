/**
 * Motivo por el cual finaliza la sesión del usuario.
 *
 * Manual:
 * El usuario seleccionó la opción "Cerrar sesión".
 *
 * Inactividad:
 * El sistema cerró la sesión después de una hora sin actividad.
 */
export type LogoutType = 'Manual' | 'Inactividad';