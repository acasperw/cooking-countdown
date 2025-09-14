import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { FoodItemInput, ScheduledFoodItem, NarrativeEntry } from './shared/models';
import { buildFinishDate, formatTime } from './shared/time.util';

@Injectable({ providedIn: 'root' })
export class CookingPlannerService {
  private readonly STORAGE_KEY = 'cook-countdown-v1';
  private nextId = 1;

  finishTimeStr = signal<string>('18:00');
  items = signal<FoodItemInput[]>([{ id: this.nextId++, name: 'Turkey', cookMins: 180, restMins: 30 }]);
  showTable = signal<boolean>(false);

  finishDate = computed(() => buildFinishDate(this.finishTimeStr()) );

  schedule = computed<ScheduledFoodItem[]>(() => {
    const finish = this.finishDate();
    if (!finish) return [];
    return this.items()
      .filter(i => i.name.trim() && i.cookMins != null && i.cookMins > 0)
      .map(i => {
        const rest = (i.restMins ?? 0) * 60 * 1000;
        const cook = (i.cookMins ?? 0) * 60 * 1000;
        const ready = finish;
        const takeOut = new Date(ready.getTime() - rest);
        const putIn = new Date(takeOut.getTime() - cook);
        return { ...i, putIn, takeOut, ready } as ScheduledFoodItem;
      })
      .sort((a, b) => a.putIn.getTime() - b.putIn.getTime());
  });

  earliestPutIn = computed(() => {
    const s = this.schedule();
    return s.length ? s[0].putIn : null;
  });

  firstItem = computed(() => {
    const s = this.schedule();
    return s.length ? s[0] : null;
  });

  narrativeEntries = computed<NarrativeEntry[]>(() => {
    const sched = this.schedule();
    if (!sched.length) return [];
    return sched.map((item, idx) => {
      if (idx === 0) return { item, isFirst: true, deltaFromPrev: null, prevName: null };
      const prev = sched[idx - 1];
      const delta = Math.round((item.putIn.getTime() - prev.putIn.getTime()) / 60000);
      return { item, isFirst: false, deltaFromPrev: delta, prevName: prev.name };
    });
  });

  constructor() {
    this.loadFromStorage();
    effect(() => {
      const payload = JSON.stringify({ finishTime: this.finishTimeStr(), items: this.items() });
      try { sessionStorage.setItem(this.STORAGE_KEY, payload); } catch {}
    });
  }

  setFinishTime(value: string) {
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [hh, mm] = value.split(':').map(Number);
      if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) {
        this.finishTimeStr.set(`${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}`);
      }
    }
  }

  addItem() {
    this.items.update(list => [...list, { id: this.nextId++, name: '', cookMins: null, restMins: null }]);
  }
  removeItem(id: number) { this.items.update(list => list.filter(i => i.id !== id)); }
  updateItem(id: number, patch: Partial<Omit<FoodItemInput, 'id'>>) {
    this.items.update(list => list.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  clearAll() {
    this.finishTimeStr.set('18:00');
    this.items.set([{ id: this.nextId++, name: '', cookMins: null, restMins: null }]);
    try { sessionStorage.removeItem(this.STORAGE_KEY); } catch {}
  }

  private loadFromStorage() {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { finishTime?: string; items?: FoodItemInput[] };
      if (parsed.finishTime && /^\d{2}:\d{2}$/.test(parsed.finishTime)) this.finishTimeStr.set(parsed.finishTime);
      if (parsed.items && Array.isArray(parsed.items) && parsed.items.length) {
        this.items.set(parsed.items.map(it => ({ ...it })));
        const maxId = parsed.items.reduce((m, i) => Math.max(m, i.id), 0);
        this.nextId = maxId + 1;
      }
    } catch {}
  }

  formatTime(date: Date) { return formatTime(date); }
}
