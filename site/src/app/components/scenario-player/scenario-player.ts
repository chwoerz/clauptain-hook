import { Component, output } from '@angular/core';
import { ScenarioCardComponent } from './scenario-card/scenario-card';
import { SCENARIOS } from '../../models/scenarios';

@Component({
  selector: 'app-scenario-player',
  standalone: true,
  imports: [ScenarioCardComponent],
  templateUrl: './scenario-player.html',
  styleUrl: './scenario-player.scss',
})
export class ScenarioPlayerComponent {
  readonly scenarios = SCENARIOS;
  readonly loadInPlayground = output<string>();
}
