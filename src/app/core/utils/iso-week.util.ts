export function getISOWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
  
    const day = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - day);
  
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const jan1Day = yearStart.getDay() || 7;
    const firstThursday = new Date(yearStart);
  
    firstThursday.setDate(yearStart.getDate() + ((4 - jan1Day + 7) % 7));
  
    if (d < firstThursday) {
        const prevYearStart = new Date(d.getFullYear() - 1, 0, 1);
        const prevJan1Day = prevYearStart.getDay() || 7;
        const prevFirstThursday = new Date(prevYearStart);
        prevFirstThursday.setDate(prevYearStart.getDate() + ((4 - prevJan1Day + 7) % 7));
        return Math.ceil((d.getTime() - prevFirstThursday.getTime()) / 604800000);
    }
  
    return Math.ceil((d.getTime() - firstThursday.getTime()) / 604800000) + 1;
  }