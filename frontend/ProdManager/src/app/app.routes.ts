import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { AboutUsComponent } from './public/about-us/about-us.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { DashboardComponent } from './dashboard/admin/dashboard/dashboard.component'; 
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { MateriasPrimasComponent } from './dashboard/admin/features/materias-primas/materias-primas.component';
import { ProductoTerminadoListadoComponent } from './dashboard/admin/features/productos/producto-terminado-listado/producto-terminado-listado.component';
import { UsersComponent } from './dashboard/admin/features/users/users.component';
import { NotFoundComponent } from './public/not-found/not-found.component';
import { MateriaPrimaListadoComponent } from './materia-prima/materia-prima-listado/materia-prima-listado.component';
import { LoginComponent } from './auth/components/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'about-us', component: AboutUsComponent },
      { path: 'login', component: LoginComponent },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'materias-primas', component: MateriasPrimasComponent },
      { path: 'users', component: UsersComponent },
      { path: 'productos-terminados', component: ProductoTerminadoListadoComponent },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];