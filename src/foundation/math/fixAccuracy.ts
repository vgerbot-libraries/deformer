export function fixAccuracy(num: number, accuracy = 1e-3) {
    const fix = 1 / accuracy;
    return Math.round(num * fix) / fix;
}
