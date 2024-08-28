import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  passwordRegex,
  usernameRegex,
  emailRegex,
} from '../../common/regex_constants';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  public appRoutesConfig = AppRoutesConfig;

  public show: boolean = true;
  public showRepeat: boolean = true;
  public registerMessage$ = new BehaviorSubject<string>('');

  public constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  public registerForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
      Validators.pattern(usernameRegex),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(passwordRegex),
    ]),
    repeatPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(passwordRegex),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(emailRegex),
    ]),
  });

  public onSubmit(): void {
    if (
      this.registerForm.controls.username.value !== null &&
      this.registerForm.controls.email.value !== null &&
      this.registerForm.controls.password.value !== null
    ) {
      this.authService
        .register(
          this.registerForm.controls.username.value,
          this.registerForm.controls.email.value,
          this.registerForm.controls.password.value,
        )
        .subscribe((value) => {
          if (value) {
            this.router.navigate([
              `${AppRoutesConfig.routeNames.generator}/${AppRoutesConfig.routeNames.map}`,
            ]);
          } else {
            this.registerMessage$.next('Register Failed');
          }
        });
    }
  }
}
