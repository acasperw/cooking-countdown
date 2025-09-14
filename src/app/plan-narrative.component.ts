import { Component, inject } from '@angular/core';
import { CookingPlannerService } from './planner.service';

@Component({
  selector: 'plan-narrative',
  template: `
    @if (svc.narrativeEntries().length === 0) {
      <p>No valid items yet. Add cooking times.</p>
    } @else {
      <div style="line-height:1.5;">
        @for (entry of svc.narrativeEntries(); track entry.item.id) {
          @if (entry.isFirst) {
            <p>At <strong>{{ svc.formatTime(entry.item.putIn) }}</strong> put <strong>{{ entry.item.name }}</strong> in for <strong>{{ entry.item.cookMins }}</strong> minutes.</p>
            @if (entry.item.restMins) {
              <p style="margin-left:1.25rem;">Take <strong>{{ entry.item.name }}</strong> out at <strong>{{ svc.formatTime(entry.item.takeOut) }}</strong> then rest <strong>{{ entry.item.restMins }}</strong> minutes (ready {{ svc.formatTime(entry.item.ready) }}).</p>
            }
          } @else {
            <p>
              At <strong>{{ svc.formatTime(entry.item.putIn) }}</strong>, 
              <strong>{{ entry.item.name }}</strong> goes in
              @if (entry.deltaFromPrev !== null && entry.deltaFromPrev > 0) { (<strong>{{ entry.deltaFromPrev }}</strong> min after <strong>{{ entry.prevName }}</strong>) }
              for <strong>{{ entry.item.cookMins }}</strong> minutes.
            </p>
            @if (entry.item.restMins) {
              <p style="margin-left:1.25rem;">Take <strong>{{ entry.item.name }}</strong> out at <strong>{{ svc.formatTime(entry.item.takeOut) }}</strong> then rest <strong>{{ entry.item.restMins }}</strong> minutes (ready {{ svc.formatTime(entry.item.ready) }}).</p>
            }
          }
        }
        <p>Everything is ready to serve at <strong>{{ svc.finishTimeStr() }}</strong>.</p>
      </div>
    }
  `
})
export class PlanNarrativeComponent { svc = inject(CookingPlannerService); }
