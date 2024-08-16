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
import { EditUserInfoService } from '../../services/editUserInfo.service';

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
    private cdr: ChangeDetectorRef,
    private editUserInfoService: EditUserInfoService,
  ) {
    this.getUserInfo();
  }

  isFormVisible = false;

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }

  public editUserInfoForm = new FormGroup({
    username: new FormControl('', [
      Validators.minLength(4),
      Validators.maxLength(20),
      Validators.pattern(usernameRegex),
    ]),
    password: new FormControl('', [
      Validators.minLength(8),
      Validators.pattern(passwordRegex),
    ]),
    email: new FormControl('', [Validators.pattern(emailRegex)]),
    firstName: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(20),
    ]),
    lastName: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(20),
    ]),
  });

  getUserInfo(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user = user;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  public onSubmit(): void {
    if (this.editUserInfoForm.valid && this.user?._id) {
      this.editUserInfoService
        .editUserInfo(this.user._id, this.editUserInfoForm.value)
        .subscribe({
          next: (success) => {
            if (success) {
              this.getUserInfo();
              console.log('User information updated successfully.');
            } else {
              console.error('Failed to update user information.');
            }
          },
          error: (error) => {
            console.error('Error updating user information:', error);
          },
        });
    } else {
      console.warn('Form is invalid or user ID is missing.');
    }
  }
}
