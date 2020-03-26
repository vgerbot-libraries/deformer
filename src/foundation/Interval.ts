export class Interval {
    public static readonly NATURAL_NUMBER = Interval.closed(0, Infinity);
    public static closed(min: number, max: number) {
        return Interval.createInstance(min, max, true, true);
    }
    public static open(min: number, max: number) {
        return Interval.createInstance(min, max, false, false);
    }
    public static leftOpen(min: number, max: number) {
        return Interval.createInstance(min, max, false, true);
    }
    public static rightOpen(min: number, max: number) {
        return Interval.createInstance(min, max, true, false);
    }
    private static createInstance(min, max, includeLeft, includeRight) {
        return new Interval(Math.min(min, max), Math.max(min, max), includeLeft, includeRight);
    }
    constructor(
        private min: number = -Infinity,
        private max: number = Infinity,
        private includeLeft: boolean = true,
        private includeRight: boolean = false
    ) {}
    public contains(num: number) {
        const left = this.includeLeft ? num >= this.min : num > this.min;
        const right = this.includeRight ? num <= this.max : num < this.max;
        return left && right;
    }
    public notContains(num: number) {
        return (
            (this.includeLeft ? num < this.min : num <= this.min) ||
            (this.includeRight ? num > this.max : num >= this.max)
        );
    }
    public lessThanTheMin(num: number) {
        return this.includeLeft ? num < this.min : num <= this.min;
    }
    public greaterThanTheMax(num: number) {
        return this.includeRight ? num > this.max : num >= this.max;
    }
    public lessThanTheMax(num: number) {
        return num < this.max;
    }
    public greaterThanTheMin(num: number) {
        return num > this.min;
    }
    public getMax() {
        return this.max;
    }
    public getMin() {
        return this.min;
    }
}
