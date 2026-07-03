import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  success(message: string, title = '¡Éxito!') {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#16a34a',
      buttonsStyling: false,
      customClass: {
        popup: 'app-alert',
        confirmButton: 'app-alert-btn-success'
      }
    });
  }

  error(message: string, title = 'Error') {
    return Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#dc2626',
      buttonsStyling: false,
      customClass: {
        popup: 'app-alert',
        confirmButton: 'app-alert-btn-error'
      }
    });
  }

  warning(message: string, title = 'Advertencia') {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#d97706',
      buttonsStyling: false,
      customClass: {
        popup: 'app-alert',
        confirmButton: 'app-alert-btn-warning'
      }
    });
  }

  info(message: string, title = 'Información') {
    return Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      buttonsStyling: false,
      customClass: {
        popup: 'app-alert',
        confirmButton: 'app-alert-btn-info'
      }
    });
  }

  confirm(
    message: string,
    title = '¿Estás seguro?'
  ) {
    return Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'app-alert',
        confirmButton: 'app-alert-btn-success',
        cancelButton: 'app-alert-btn-cancel'
      }
    });
  }

}