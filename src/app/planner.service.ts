import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { FoodItemInput, ScheduledFoodItem, NarrativeEntry } from './shared/models';
import { AnalyticsService } from './analytics.service';
import { buildFinishDate, formatTime } from './shared/time.util';

@Injectable({ providedIn: 'root' })
export class CookingPlannerService {
  private readonly STORAGE_KEY = 'cook-countdown-session';
  private nextId = 1;

  finishTimeStr = signal<string>('18:00');
  items = signal<FoodItemInput[]>([{ id: this.nextId++, name: 'Turkey', cookMins: 180, restMins: 30 }]);
  showTable = signal<boolean>(false);

  finishDate = computed(() => buildFinishDate(this.finishTimeStr()));

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

  // Group items that share the same putIn time for unified narrative sentences
  groupedNarrativeEntries = computed(() => {
    const entries = this.narrativeEntries();
    if (!entries.length) return [] as Array<{
      putIn: Date;
      items: NarrativeEntry[];
      isFirstGroup: boolean;
      deltaFromPrevGroup: number | null; // minutes from previous group start
      prevGroupLastName: string | null;
    }>;
    const groups: Array<{
      putIn: Date;
      items: NarrativeEntry[];
      isFirstGroup: boolean;
      deltaFromPrevGroup: number | null;
      prevGroupLastName: string | null;
    }> = [];
    entries.forEach((entry, idx) => {
      if (!groups.length) {
        groups.push({ putIn: entry.item.putIn, items: [entry], isFirstGroup: true, deltaFromPrevGroup: null, prevGroupLastName: null });
        return;
      }
      const last = groups[groups.length - 1];
      if (last.putIn.getTime() === entry.item.putIn.getTime()) {
        last.items.push(entry);
      } else {
        const prevLastItem = last.items[last.items.length - 1].item;
        const delta = Math.round((entry.item.putIn.getTime() - last.putIn.getTime()) / 60000);
        groups.push({ putIn: entry.item.putIn, items: [entry], isFirstGroup: false, deltaFromPrevGroup: delta, prevGroupLastName: prevLastItem.name });
      }
    });
    return groups;
  });

  private analytics = inject(AnalyticsService);

  constructor() {
    this.loadFromStorage();
    effect(() => {
      const payload = JSON.stringify({ finishTime: this.finishTimeStr(), items: this.items() });
      try { sessionStorage.setItem(this.STORAGE_KEY, payload); } catch { }
    });
  }

  setFinishTime(value: string) {
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [hh, mm] = value.split(':').map(Number);
      if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) {
        this.finishTimeStr.set(`${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`);
        this.analytics.logEvent('finish_time_changed', { finishTime: this.finishTimeStr() });
      }
    }
  }

  addItem() {
    let newId = this.nextId++;
    this.items.update(list => [...list, { id: newId, name: '', cookMins: null, restMins: 0 }]);
    this.analytics.logEvent('item_added', { id: newId, count: this.items().length });
  }
  removeItem(id: number) {
    this.items.update(list => list.filter(i => i.id !== id));
    this.analytics.logEvent('item_removed', { id, count: this.items().length });
  }
  updateItem(id: number, patch: Partial<Omit<FoodItemInput, 'id'>>) {
    this.items.update(list => list.map(i => i.id === id ? { ...i, ...patch } : i));
    this.analytics.logEvent('item_updated', { id, patch });
  }

  clearAll() {
    this.finishTimeStr.set('18:00');
    this.items.set([{ id: this.nextId++, name: 'Turkey', cookMins: 180, restMins: 0 }]);
    try { sessionStorage.removeItem(this.STORAGE_KEY); } catch { }
    this.analytics.logEvent('items_cleared');
  }

  toggleTable() {
    const next = !this.showTable();
    this.showTable.set(next);
    this.analytics.logEvent('table_toggled', { visible: next });
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
    } catch { }
  }

  formatTime(date: Date) { return formatTime(date); }
}
