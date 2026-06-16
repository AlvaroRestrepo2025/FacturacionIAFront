import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { SessionInactivityService } from '../../core/services/session-inactivity.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly sessionInactivityService =
    inject(SessionInactivityService);

  /**
   * Comienza a contar la inactividad cuando
   * el usuario entra al área protegida.
   */
  ngOnInit(): void {
    this.sessionInactivityService.startMonitoring();
  }

  /**
   * Detiene el temporizador cuando el usuario
   * sale del área protegida.
   */
  ngOnDestroy(): void {
    this.sessionInactivityService.stopMonitoring();
  }
}