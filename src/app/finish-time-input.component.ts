import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CookingPlannerService } from './planner.service';
import { PtrInputComponent } from '@patter/ngx-components';

@Component({
  selector: 'finish-time-input',
  imports: [PtrInputComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form>
      <ptr-input label="Finish (Serve) Time" type="time" [formControl]="finishTimeCtrl" />
    </form>
  `
})
export class FinishTimeInputComponent {
  readonly svc = inject(CookingPlannerService);

  readonly finishTimeCtrl = new FormControl<string>(this.svc.finishTimeStr(), { nonNullable: true });

  constructor() {
    this.finishTimeCtrl.valueChanges.subscribe(v => this.svc.setFinishTime(v));
    effect(() => {
      const current = this.svc.finishTimeStr();
      if (current !== this.finishTimeCtrl.value) {
        this.finishTimeCtrl.setValue(current, { emitEvent: false });
      }
    });
  }
}
