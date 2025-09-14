export interface FoodItemInput {
  id: number;
  name: string;
  cookMins: number | null;
  restMins: number | null;
}

export interface ScheduledFoodItem extends FoodItemInput {
  putIn: Date;
  takeOut: Date;
  ready: Date;
}

export interface NarrativeEntry {
  item: ScheduledFoodItem;
  isFirst: boolean;
  deltaFromPrev: number | null;
  prevName: string | null;
}
