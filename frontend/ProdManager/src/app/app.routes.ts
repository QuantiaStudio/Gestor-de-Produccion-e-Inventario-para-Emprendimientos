import { Routes } from '@angular/router';
import { HomeComponent } from './public/home//home.component';
import { AboutUsComponent } from './public/about-us/about-us.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'about-us',
        component: AboutUsComponent
    }

];
