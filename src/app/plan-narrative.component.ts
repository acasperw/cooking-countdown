import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CookingPlannerService } from './planner.service';
import { NarrativeEntry } from './shared/models';

@Component({
  selector: 'plan-narrative',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (svc.groupedNarrativeEntries().length === 0) {
      <p>Add a food item and its cook time to see when to get started.</p>
    } @else {
      <div style="line-height:1.5;">
        @for (group of svc.groupedNarrativeEntries(); track group.putIn) {
          <p>
            At <strong>{{ svc.formatTime(group.putIn) }}</strong>, start cooking
            <strong>{{ itemNames(group.items) }}</strong>.
            @if (!group.isFirstGroup && group.deltaFromPrevGroup !== null && group.deltaFromPrevGroup > 0) {
              That's <strong>{{ group.deltaFromPrevGroup }}</strong> minutes after <strong>{{ group.prevGroupLastName }}</strong> goes in.
            }
            {{ cookingTimeText(group.items) }}
          </p>
          @for (entry of group.items; track entry.item.id) {
            @if (entry.item.restMins) {
              <p style="margin-left:1.25rem;">Take <strong>{{ entry.item.name }}</strong> out at <strong>{{ svc.formatTime(entry.item.takeOut) }}</strong> and let it rest for <strong>{{ entry.item.restMins }}</strong> minutes. It will be ready at <strong>{{ svc.formatTime(entry.item.ready) }}</strong>.</p>
            }
          }
        }
        <p>Everything will be ready to serve at <strong>{{ svc.finishTimeStr() }}</strong>.</p>
      </div>
    }
  `
})
export class PlanNarrativeComponent { 
  svc = inject(CookingPlannerService);

  itemNames(entries: NarrativeEntry[]): string {
    const names = entries.map(entry => entry.item.name);
    if (names.length < 2) return names[0] ?? '';
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  }

  cookingTimeText(entries: NarrativeEntry[]): string {
    const unique = Array.from(new Set(entries.map(e => e.item.cookMins)));
    if (unique.length === 1) {
      return entries.length === 1
        ? `It needs ${unique[0]} minutes to cook.`
        : `They each need ${unique[0]} minutes to cook.`;
    }
    return `Cooking times: ${entries.map(e => `${e.item.name}, ${e.item.cookMins} minutes`).join('; ')}.`;
  }
}
