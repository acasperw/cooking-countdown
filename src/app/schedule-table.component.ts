import { Component, inject } from '@angular/core';
import { CookingPlannerService } from './planner.service';

@Component({
  selector: 'schedule-table',
  template: `
    @if (svc.firstItem()) {
      <p>Earliest action: at <strong>{{ svc.formatTime(svc.firstItem()!.putIn) }}</strong> put <strong>{{ svc.firstItem()!.name }}</strong> in.</p>
    }
    <table border="1" cellpadding="4" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th>Food</th>
          <th>Put In</th>
          <th>Take Out</th>
          <th>Ready (After Rest)</th>
          <th>Cook (m)</th>
          <th>Rest (m)</th>
        </tr>
      </thead>
      <tbody>
        @for (s of svc.schedule(); track s.id) {
          <tr>
            <td>{{ s.name }}</td>
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
