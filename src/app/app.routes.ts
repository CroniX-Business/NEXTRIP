import { Routes } from '@angular/router';
import { AppRoutesConfig } from './config/routes.config';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { Error404Component } from './pages/error404/error404.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: AppRoutesConfig.routes.home, pathMatch: 'full' },
  {
    path: AppRoutesConfig.routeNames.home,
    component: HomeComponent,
    title: 'Home',
    //canActivate: [AuthGuard],
  },
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
  {
    path: AppRoutesConfig.routeNames.notFound,
    component: Error404Component,
    title: '404',
  },
];
