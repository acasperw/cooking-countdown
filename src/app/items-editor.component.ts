import { Component, inject } from '@angular/core';
import { CookingPlannerService } from './planner.service';
import { PtrButtonComponent } from '@patter/ngx-components';

@Component({
  selector: 'items-editor',
  imports: [PtrButtonComponent],
  template: `
    <div class="items">
      @for (item of svc.items(); track item.id) {
        <div style="margin-bottom:4px; display:flex; gap:4px; align-items:center;">
          <input placeholder="Food item" [value]="item.name" (input)="onName(item.id, $event)" />
          <input type="number" min="0" style="width:6ch" placeholder="Cook" [value]="item.cookMins ?? ''" (input)="onCook(item.id, $event)" />
          <span>cook</span>
          <input type="number" min="0" style="width:6ch" placeholder="Rest" [value]="item.restMins ?? ''" (input)="onRest(item.id, $event)" />
          <span>rest</span>
          <ptr-button (clicked)="svc.removeItem(item.id)" buttonStyle="error" [isSmallSize]="true">✕</ptr-button>
        </div>
      }
      <div style="display:flex; gap:.5rem;">
         <ptr-button (clicked)="svc.addItem()">Add Item</ptr-button>
         <ptr-button (clicked)="svc.clearAll()" buttonStyle="secondary">Clear</ptr-button>
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
