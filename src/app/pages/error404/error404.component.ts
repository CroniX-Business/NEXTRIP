import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppRoutesConfig } from '../../config/routes.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Error404Component {

  public constructor(
    private router: Router
  ) {}
  onSubmit(): void {
    this.router.navigate([AppRoutesConfig.routes.home]);
  }
}
