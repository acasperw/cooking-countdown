import { Component, inject } from '@angular/core';
import { CookingPlannerService } from './planner.service';
import { NarrativeEntry } from './shared/models';

@Component({
  selector: 'plan-narrative',
  template: `
    @if (svc.groupedNarrativeEntries().length === 0) {
      <p>Add cooking times</p>
    } @else {
      <div style="line-height:1.5;">
        @for (group of svc.groupedNarrativeEntries(); track group.putIn) {
          <p>
            At <strong>{{ svc.formatTime(group.putIn) }}</strong>,
            <span>
              @for (entry of group.items; track entry.item.id; let i = $index) {
                <strong>{{ entry.item.name }}</strong>{{ i < group.items.length - 2 ? ', ' : (i === group.items.length - 2 ? ' & ' : '') }}
              }
            </span>
            {{ verbFor(group.items) }} in
            @if (!group.isFirstGroup && group.deltaFromPrevGroup !== null && group.deltaFromPrevGroup > 0) { (<strong>{{ group.deltaFromPrevGroup }}</strong> min after <strong>{{ group.prevGroupLastName }}</strong>) }
            for <strong>{{ durationText(group.items) }}</strong> minutes.
          </p>
          @for (entry of group.items; track entry.item.id) {
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
export class PlanNarrativeComponent { 
  svc = inject(CookingPlannerService);

  verbFor(entries: NarrativeEntry[]): string {
    return entries.length === 1 ? 'goes' : 'go';
  }

  durationText(entries: NarrativeEntry[]): string {
    const unique = Array.from(new Set(entries.map(e => e.item.cookMins)));
    if (unique.length === 1) return String(unique[0]);
    return entries
      .map(e => `${e.item.cookMins} (${e.item.name})`)
      .join(', ');
  }
}
