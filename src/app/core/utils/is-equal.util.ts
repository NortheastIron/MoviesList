export function customIsEqual<T>(prev: T, curr: T): boolean {
    return JSON.stringify(prev) === JSON.stringify(curr);
}
