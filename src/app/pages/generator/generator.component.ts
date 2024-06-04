import { CommonModule  } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratorComponent {}