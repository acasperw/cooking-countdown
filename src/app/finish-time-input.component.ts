import { Component, inject } from '@angular/core';
import { CookingPlannerService } from './planner.service';

@Component({
  selector: 'finish-time-input',
  template: `
    <label>Finish (Serve) Time:
      <input type="time" [value]="svc.finishTimeStr()" (input)="onChange($event)" />
    </label>
  `
})
export class FinishTimeInputComponent {
  svc = inject(CookingPlannerService);
  onChange(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.svc.setFinishTime(value);
  }
}
