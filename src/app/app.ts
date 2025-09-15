import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FinishTimeInputComponent } from './finish-time-input.component';
import { ItemsEditorComponent } from './items-editor.component';
import { PlanNarrativeComponent } from './plan-narrative.component';
import { ScheduleTableComponent } from './schedule-table.component';
import { CookingPlannerService } from './planner.service';
import { PtrButtonComponent } from '@patter/ngx-components';

@Component({
  selector: 'app-root',
  imports: [FinishTimeInputComponent, ItemsEditorComponent, PlanNarrativeComponent, ScheduleTableComponent, PtrButtonComponent],
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
      <ptr-button extraClasses="mt-3" (clicked)="svc.toggleTable()">{{ svc.showTable() ? 'Hide' : 'Show' }} detailed table</ptr-button>
      @if (svc.showTable()) {
        <div class="mt-2">
          <schedule-table />
        </div>
      }
    </div>
  `
})
export class App {
  svc = inject(CookingPlannerService);
}
