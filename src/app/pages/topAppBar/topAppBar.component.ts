import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';

@Component({
  selector: 'app-top-app-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './topAppBar.component.html',
  styleUrl: './topAppBar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopAppBarComponent {
  @Input() route: string | undefined;
  loginPageRoute: string = AppRoutesConfig.routes.login;
  homePageRoute: string = AppRoutesConfig.routes.home;
  generatorPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}`;
  contactPageRoute: string = AppRoutesConfig.routes.contact;
}
