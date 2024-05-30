import { Routes } from '@angular/router';
import { AppRoutesConfig } from './config/routes.config';
import { LoginComponent } from './pages/login/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: AppRoutesConfig.routes.login, pathMatch: 'full' },
  {
    path: AppRoutesConfig.routeNames.login,
    component: LoginComponent,
    title: 'Login',
  },
  /*{
    path: AppRoutesConfig.routeNames.register,
    component: ,
    title: 'Register',
  },
  {
    path: AppRoutesConfig.routeNames.notFound,
    component: ,
    title: '404',
  },*/
];
