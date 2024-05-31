import { Routes } from '@angular/router';
import { AppRoutesConfig } from './config/routes.config';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: AppRoutesConfig.routes.login, pathMatch: 'full' },
  {
    path: AppRoutesConfig.routeNames.login,
    component: LoginComponent,
    title: 'Login',
  },
  {
    path: AppRoutesConfig.routeNames.register,
    component: RegisterComponent,
    title: 'Register',
  },
  /*{
    path: AppRoutesConfig.routeNames.notFound,
    component: ,
    title: '404',
  },*/
];
