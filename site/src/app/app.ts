import { Component, ViewChild } from '@angular/core';
import { LandingComponent } from './components/landing/landing';
import { ScenarioPlayerComponent } from './components/scenario-player/scenario-player';
import { PlaygroundComponent } from './components/playground/playground';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LandingComponent, ScenarioPlayerComponent, PlaygroundComponent],
  templateUrl: './app.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent {
  @ViewChild(PlaygroundComponent) playground?: PlaygroundComponent;

  onLoadInPlayground(code: string): void {
    this.playground?.loadCode(code);
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' });
  }
}
