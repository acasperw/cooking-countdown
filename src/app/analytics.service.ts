import { Injectable } from '@angular/core';

export type AnalyticsEventName =
  | 'finish_time_changed'
  | 'item_added'
  | 'item_removed'
  | 'item_updated'
  | 'items_cleared'
  | 'table_toggled';

export interface AnalyticsEventPayload {
  [key: string]: unknown;
}

declare const gtag: Function;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  logEvent(name: AnalyticsEventName, payload: AnalyticsEventPayload = {}): void {
    // Placeholder for future GA4 / gtag integration
    // e.g., gtag('event', name, payload)
    // For now, just console log
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, payload);

    // gtag('event', name, payload);
  }
}
