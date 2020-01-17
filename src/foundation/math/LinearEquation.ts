export interface IntersectionPoint {
    x: number;
    y: number;
}
export class LinearEquation {
    constructor(public readonly k: number, public readonly b: number) {}
    public intersection(other: LinearEquation): IntersectionPoint {
        const x = (other.b - this.b) / (this.k - other.k);
        const y = this.k * x + this.b;
        return { x, y };
    }
}
