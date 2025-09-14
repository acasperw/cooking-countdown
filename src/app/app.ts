import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FinishTimeInputComponent } from './finish-time-input.component';
import { ItemsEditorComponent } from './items-editor.component';
import { PlanNarrativeComponent } from './plan-narrative.component';
import { ScheduleTableComponent } from './schedule-table.component';
import { CookingPlannerService } from './planner.service';

@Component({
  selector: 'app-root',
  imports: [FinishTimeInputComponent, ItemsEditorComponent, PlanNarrativeComponent, ScheduleTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h1>Cooking Countdown Helper</h1>
      <finish-time-input />
      <hr />
      <h2>Items</h2>
      <items-editor />
      <hr />
      <h2>Plan</h2>
      <plan-narrative />
      <button type="button" (click)="svc.showTable.set(!svc.showTable())">{{ svc.showTable() ? 'Hide' : 'Show' }} detailed table</button>
      @if (svc.showTable()) {
        <div style="margin-top:1rem;">
          <schedule-table />
        </div>
      }
    </div>
  `
})
export class App {
  svc = inject(CookingPlannerService);
}
