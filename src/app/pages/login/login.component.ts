import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  public appRoutesConfig = AppRoutesConfig;

  public show: boolean = true;
  public loginMessage: string = '';

  public constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  public loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  public onSubmit(): void {
    if (
      this.loginForm.controls.email.value !== null &&
      this.loginForm.controls.password.value !== null
    ) {
      this.authService
        .login(
          this.loginForm.controls.email.value,
          this.loginForm.controls.password.value
        )
        .subscribe((value) => {
          if (value) {
            this.router.navigate([AppRoutesConfig.routes.notFound]);
          } else {
            this.loginMessage = 'Login Failed';
          }
        });
    }
  }
}
