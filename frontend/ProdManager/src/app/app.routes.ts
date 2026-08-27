import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { AboutUsComponent } from './public/about-us/about-us.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { NewProductFormComponent } from './dashboard/admin/productos/new-product-form/new-product-form.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'about-us', component: AboutUsComponent }
    ],
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'new-product', component: NewProductFormComponent },
    ],
  },

];
