// Time related pure helpers

export function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
}

export function parseHHMM(str: string): { hours: number; minutes: number } | null {
  const m = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function buildFinishDate(str: string, now = new Date()): Date | null {
  const parts = parseHHMM(str);
  if (!parts) return null;
  const { hours, minutes } = parts;
  const finish = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  if (finish.getTime() < now.getTime()) {
    finish.setDate(finish.getDate() + 1);
  }
  return finish;
}
