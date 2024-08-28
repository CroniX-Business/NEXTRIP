import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { TopAppBarComponent } from '../topAppBar/topAppBar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { emailRegex } from '../../common/regex_constants';
import { ContactFormService } from '../../services/contactForm.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TopAppBarComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  public successSentMessage$ = new BehaviorSubject<string>('');

  public contactForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(emailRegex),
    ]),
    subject: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
  });

  public constructor(private contactService: ContactFormService) {}

  onSubmit() {
    if (this.contactForm.valid) {
      this.contactService
        .sendContactForm(
          this.contactForm.controls.email.value!,
          this.contactForm.controls.subject.value!,
          this.contactForm.controls.message.value!,
        )
        .subscribe({
          next: (responseMessage: string) => {
            this.contactForm.reset();
            this.successSentMessage$.next(responseMessage);
          },
          error: (error: string) => {
            this.successSentMessage$.next(error);
          },
        });
    }
  }
}
