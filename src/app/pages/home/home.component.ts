import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TopAppBarComponent } from '../topAppBar/topAppBar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TopAppBarComponent],
})
export class HomeComponent {
  onHover(side: string, videoElement: HTMLVideoElement): void {
    if (side === 'left') {
      videoElement.classList.add('scale-105', 'shadow-xl', 'skew-y-1');
    } else if (side === 'right') {
      videoElement.classList.add('scale-105', 'shadow-xl', '-skew-y-1');
    }
  }

  onLeave(videoElement: HTMLVideoElement): void {
    videoElement.classList.remove(
      'scale-105',
      'shadow-xl',
      'skew-y-1',
      '-skew-y-1',
    );
  }

  toggleFullScreen(videoElement: HTMLVideoElement): void {
    if (window.innerWidth <= 768) { // Only for mobile devices
      if (!document.fullscreenElement) {
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        } 
        else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    }
  }
}