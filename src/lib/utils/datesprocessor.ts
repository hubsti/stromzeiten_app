
export function getDaysOfWeek(): string[] {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const nextDayOfWeek1 = (currentDayOfWeek + 1) % 7;
    const nextDayOfWeek2 = (currentDayOfWeek + 2) % 7;
    return [daysOfWeek[currentDayOfWeek], daysOfWeek[nextDayOfWeek1], daysOfWeek[nextDayOfWeek2]];
}