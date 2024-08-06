import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  emailRegex,
  passwordRegex,
  usernameRegex,
} from '../../common/regex_constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.getUserInfo();
  }

  isFormVisible = false;

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }

  public editUserInfoForm = new FormGroup({
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
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(emailRegex),
    ]),
    firstName: new FormControl(
      '', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20)
    ]),
    lastName: new FormControl(
      '', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20)
    ]),
  });

  getUserInfo(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user = user;
        console.log(this.user);
        this.cdr.markForCheck(); // Notify Angular to check this component for updates
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  public onSubmit(): void {
    // if (
    //   this.editUserInfoForm.controls.username.value !== null &&
    //   this.editUserInfoForm.controls.email.value !== null &&
    //   this.editUserInfoForm.controls.password.value !== null
    // ) {
    //   this.authService
    //     .register(
    //       this.editUserInfoForm.controls.username.value,
    //       this.editUserInfoForm.controls.email.value,
    //       this.editUserInfoForm.controls.password.value,
    //     )
    //     .subscribe((value) => {
    //       console.log(value)
    //     });
    // }
  }
}
