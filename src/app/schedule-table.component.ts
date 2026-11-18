import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CookingPlannerService } from './planner.service';

@Component({
  selector: 'schedule-table',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (svc.firstItem()) {
      <p>Start with <strong>{{ svc.firstItem()!.name }}</strong>: put it in at <strong>{{ svc.formatTime(svc.firstItem()!.putIn) }}</strong>.</p>
    }
    <table border="1" cellpadding="4" style="border-collapse:collapse;">
      <caption class="screen-reader-text">Cooking schedule for each food item</caption>
      <thead>
        <tr>
          <th scope="col">Food item</th>
          <th scope="col">Start cooking</th>
          <th scope="col">Take out</th>
          <th scope="col">Ready to serve</th>
          <th scope="col">Cook time (mins)</th>
          <th scope="col">Rest time (mins)</th>
        </tr>
      </thead>
      <tbody>
        @for (s of svc.schedule(); track s.id) {
          <tr>
            <th scope="row">{{ s.name }}</th>
            <td>{{ svc.formatTime(s.putIn) }}</td>
            <td>{{ svc.formatTime(s.takeOut) }}</td>
            <td>{{ svc.formatTime(s.ready) }}</td>
            <td style="text-align:end">{{ s.cookMins }}</td>
            <td style="text-align:end">{{ s.restMins ?? 0 }}</td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class ScheduleTableComponent { svc = inject(CookingPlannerService); }
