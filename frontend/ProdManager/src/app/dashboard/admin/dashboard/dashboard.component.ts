import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardResumen } from '../../../models/dashboard/dashboard-resumen.model';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  resumen: DashboardResumen | null = null;
  errorResumen = false;

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: resumen => this.resumen = resumen,
      error: () => this.errorResumen = true
    });
  }
}
