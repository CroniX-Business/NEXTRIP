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
  nameRegex,
} from '../../common/regex_constants';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';
import { Router } from '@angular/router';


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

  public constructor(private router: Router) {}

  public registerForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern(nameRegex),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern(nameRegex),
    ]),
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
    this.router.navigate([]);
  }
}
