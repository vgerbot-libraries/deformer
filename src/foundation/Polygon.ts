import { Contour } from './Contour';
import UnsupportedError from './error/UnsupportedError';
import { Lazy } from './lazy';
import { PolarPoint } from './math/coordinate/PolarCoordinate';
import { Vector } from './math/vector';
import IllegalArgumentError from './error/IllegalArgumentError';

export class IrregularPolygon extends Contour {
    public getCenter(): AnyPoint {
        throw new Error('Method not implemented.');
    }
    public clone(): Contour {
        throw new Error('Method not implemented.');
    }
    public getAcreage(): number {
        throw new Error('Method not implemented.');
    }
}
const regularLazy = new Lazy<RegularPolygon>();

export class RegularPolygon extends Contour {
    @regularLazy.property(p => p.resolvePoints(), false)
    @regularLazy.detectFieldChange('radian', 'sides', 'r', 'center')
    protected points: PolarPoint[] = [];
    private radian = 0;
    constructor(private center: AnyPoint, private r: number, private sides: number = 2) {
        super();
        this.center = center.toPolar();
    }
    public save() {
        this.saveStack.push({
            center: this.center,
            r: this.r,
            radian: this.radian,
            sides: this.sides
        });
    }
    public restore() {
        const last = this.saveStack.pop();
        if (last) {
            this.center = last.center;
            this.r = last.r;
            this.radian = last.radian;
            this.sides = last.sides;
        }
    }
    public getAllPoints() {
        return this.points.slice(0);
    }
    public resetAllPoints() {
        //
    }
    public move(vector: Vector) {
        this.center = this.center.addVector(vector);
    }
    public addPoint(): number {
        throw new UnsupportedError();
    }
    public setPoint(index: number, point: AnyPoint) {
        throw new UnsupportedError('Unsupported operation');
    }
    public removePoint(index: number): boolean {
        return false;
    }
    public rotate(radian: number, origin: AnyPoint = this.getCenter()) {
        this.radian += radian;
    }
    public expansion(r: number) {
        this.r += r;
    }
    public scale(ratio: number) {
        this.r *= ratio;
    }
    public getCenter(): AnyPoint {
        return this.center;
    }
    public clone(): Contour {
        throw new Error('Method not implemented.');
    }
    public getAcreage(): number {
        throw new Error('Method not implemented.');
    }
    public setSideNumber(sides: number) {
        if (sides < 3) {
            throw new IllegalArgumentError('side number should be an integer and greater than 2!');
        }
        this.sides = Math.floor(sides);
    }
    private resolvePoints() {
        const avgRadian = (Math.PI * 2) / this.sides;
        const vector = new Vector(0, this.r);
        console.info((this.radian / Math.PI) * 180);
        return Array(this.sides)
            .fill(0)
            .map((_, s) => {
                const radian = this.radian + s * avgRadian;
                return this.center.addVector(vector.rotate(radian));
            });
    }
}
