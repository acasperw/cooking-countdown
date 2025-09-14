import { Component, inject } from '@angular/core';
import { CookingPlannerService } from './planner.service';

@Component({
  selector: 'items-editor',
  template: `
    <div class="items">
      @for (item of svc.items(); track item.id) {
        <div style="margin-bottom:4px; display:flex; gap:4px; align-items:center;">
          <input placeholder="Food item" [value]="item.name" (input)="onName(item.id, $event)" />
          <input type="number" min="0" style="width:6ch" placeholder="Cook" [value]="item.cookMins ?? ''" (input)="onCook(item.id, $event)" />
          <span>cook</span>
          <input type="number" min="0" style="width:6ch" placeholder="Rest" [value]="item.restMins ?? ''" (input)="onRest(item.id, $event)" />
          <span>rest</span>
          <button type="button" (click)="svc.removeItem(item.id)">✕</button>
        </div>
      }
      <div style="display:flex; gap:.5rem;">
        <button type="button" (click)="svc.addItem()">Add Item</button>
        <button type="button" (click)="svc.clearAll()">Clear</button>
      </div>
    </div>
  `
})
export class ItemsEditorComponent {
  svc = inject(CookingPlannerService);
  onName(id: number, ev: Event){ this.svc.updateItem(id,{ name: (ev.target as HTMLInputElement).value }); }
  onCook(id: number, ev: Event){
    const raw = (ev.target as HTMLInputElement).valueAsNumber;
    const v = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : null;
    this.svc.updateItem(id,{ cookMins: v });
  }
  onRest(id: number, ev: Event){
    const raw = (ev.target as HTMLInputElement).valueAsNumber;
    const v = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : null;
    this.svc.updateItem(id,{ restMins: v });
  }
}
