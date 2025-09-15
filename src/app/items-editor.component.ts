import { Component, inject, effect } from '@angular/core';
import { CookingPlannerService } from './planner.service';
import { PtrButtonComponent, PtrInputComponent } from '@patter/ngx-components';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { FoodItemInput } from './shared/models';
@Component({
  selector: 'items-editor',
  imports: [PtrButtonComponent, PtrInputComponent, ReactiveFormsModule],
  template: `
    <form class="planner-editor gform_wrapper" [formGroup]="form" (submit)="$event.preventDefault()">
      <div formArrayName="items" class="planner-editor__items">
        @for (group of itemFGs(); track group.controls.id.value; let i = $index) {
          <div [formGroupName]="i" class="planner-editor__item">
            <div class="gfield gfield--label-inline">
              <ptr-input labelPosition="inline" formControlName="name" label="Food item"/>
            </div>
            <span>for</span>
            <div class="gfield gfield--label-inline" style="width: 14ch;">
              <ptr-input type="number" min="0" label="Cook (mins)" formControlName="cookMins" labelPosition="inline" />
            </div>
            <div class="gfield gfield--label-inline" style="width: 11.5ch;">
              <ptr-input type="number" min="0" label="Rest (mins)" formControlName="restMins" labelPosition="inline" />
            </div>
            <ptr-button (clicked)="remove(i, group.controls.id.value)" buttonStyle="error" [isSmallSize]="true">✕</ptr-button>
          </div>
        }
      </div>
      <div style="display:flex; gap:.5rem;">
        <ptr-button extraClasses="mt-1" (clicked)="add()">Add Item</ptr-button>
        <ptr-button extraClasses="mt-1" (clicked)="resetAll()" buttonStyle="secondary">Reset</ptr-button>
      </div>
    </form>
  `
})
export class ItemsEditorComponent {
  svc = inject(CookingPlannerService);

  // --- Typed reactive form setup ---
  form = new FormGroup({
    items: new FormArray<ItemFormGroup>([])
  });

  private updatingFromService = false;

  constructor() {
    // Initial sync
    this.syncFromService(this.svc.items());
    // Reactive sync when service items change (e.g. reset)
    effect(() => {
      const items = this.svc.items();
      this.syncFromService(items);
    });
  }

  itemFGs(): ItemFormGroup[] { return (this.form.controls.items as FormArray<ItemFormGroup>).controls; }

  add() {
    this.svc.addItem(); // service will emit new items, effect will sync
  }

  remove(index: number, id: number) {
    this.svc.removeItem(id);
    (this.form.controls.items as FormArray).removeAt(index);
  }

  resetAll() {
    this.svc.clearAll();
  }

  private buildGroup(item: FoodItemInput): ItemFormGroup {
    const g: ItemFormGroup = new FormGroup({
      id: new FormControl(item.id, { nonNullable: true }),
      name: new FormControl(item.name, { nonNullable: true }),
      cookMins: new FormControl<number | null>(item.cookMins ?? null),
      restMins: new FormControl<number | null>(item.restMins ?? null)
    });
    this.attachGroupSubscription(g);
    return g;
  }

  private attachGroupSubscription(group: ItemFormGroup) {
    group.valueChanges.subscribe(val => {
      if (this.updatingFromService) return;
      const id = group.controls.id.value;
      const cook = this.sanitizeNumber(val.cookMins);
      const rest = this.sanitizeNumber(val.restMins);
      this.svc.updateItem(id, { name: val.name ?? '', cookMins: cook, restMins: rest });
    });
  }

  private sanitizeNumber(n: number | null | undefined): number | null {
    if (n == null || !Number.isFinite(n)) return null;
    return Math.max(0, Math.round(n));
  }

  private syncFromService(items: FoodItemInput[]) {
    this.updatingFromService = true;
    const fa = this.form.controls.items as FormArray<ItemFormGroup>;
    const existingIds = new Set(fa.controls.map(c => c.controls.id.value));
    // Add new groups
    for (const item of items) {
      if (!existingIds.has(item.id)) {
        fa.push(this.buildGroup(item));
      }
    }
    // Remove groups not in service (e.g. reset)
    for (let i = fa.length - 1; i >= 0; i--) {
      const id = fa.at(i).controls.id.value;
      if (!items.find(it => it.id === id)) {
        fa.removeAt(i);
      }
    }
    // Update values for existing groups if changed
    for (const item of items) {
      const grp = fa.controls.find(c => c.controls.id.value === item.id)!;
      const dirtyNeeded = grp.controls.name.value !== item.name || grp.controls.cookMins.value !== (item.cookMins ?? null) || grp.controls.restMins.value !== (item.restMins ?? null);
      if (dirtyNeeded) {
        grp.patchValue({ name: item.name, cookMins: item.cookMins ?? null, restMins: item.restMins ?? null }, { emitEvent: false });
      }
    }
    this.updatingFromService = false;
  }
}

type ItemFormGroup = FormGroup<{
  id: FormControl<number>;
  name: FormControl<string>;
  cookMins: FormControl<number | null>;
  restMins: FormControl<number | null>;
}>;
