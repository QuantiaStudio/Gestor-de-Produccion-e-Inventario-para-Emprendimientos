import { Component } from '@angular/core';
import { FooterComponent } from '../../public/footer/footer.component';
import { NavbarComponent } from '../../public/navbar/navbar.component';
import { NewProductFormComponent } from '../../dashboard/admin/productos/new-product-form/new-product-form.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NewProductFormComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

}
