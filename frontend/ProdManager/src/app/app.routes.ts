import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { AboutUsComponent } from './public/about-us/about-us.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { UserLayoutComponent } from './layout/user-layout/user-layout/user-layout.component';
import { Component } from '@angular/core';
import { MateriasPrimasComponent } from './features/materias-primas/materias-primas.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'about-us', component: AboutUsComponent },
    ],  
  },
  {
    path: 'dashboard', component: UserLayoutComponent,
    children:[
      {path: 'materias-primas', component:MateriasPrimasComponent},]
  },
];