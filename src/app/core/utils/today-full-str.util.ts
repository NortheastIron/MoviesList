export function getTodayFullString(numZeros: number = 2) {
    const date: Date = new Date(),
        year: number = date.getFullYear(),
        month: number = date.getMonth() + 1,
        day: number = date.getDate();

    return year + '/' +  String(month).padStart(numZeros, '0') + '/' + String(day).padStart(numZeros, '0');
}