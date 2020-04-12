import { Contour, ContourState } from '../Contour';
import UnsupportedError from '../error/UnsupportedError';
import { Lazy } from '../lazy';
import { PolarPoint } from '../math/coordinate/PolarCoordinate';
import { Vector } from '../math/vector';
import IllegalArgumentError from '../error/IllegalArgumentError';
import IllegalOperationError from '../error/IllegalOperationError';

const regularLazy = new Lazy<RegularPolygon>();

export interface RegularPolygonState extends ContourState {
    center: PolarPoint;
    r: number;
    sides: number;
    radian: number;
}

export class RegularPolygon extends Contour {
    @regularLazy.property(p => p.resolvePoints(), false)
    @regularLazy.detectFieldChange('radian', 'sides', 'r', 'center')
    protected points: PolarPoint[] = [];
    private radian = 0;
    private center: PolarPoint;
    constructor(center: AnyPoint, private r: number, private sides: number = 2) {
        super();
        this.center = center.toPolar();
    }
    public getSavableState(): RegularPolygonState {
        return {
            center: this.center,
            r: this.r,
            radian: this.radian,
            sides: this.sides,
            points: this.points
        };
    }
    public resetState(state: RegularPolygonState) {
        this.center = state.center;
        this.r = state.r;
        this.radian = state.radian;
        this.sides = state.sides;
    }
    public getAllPoints() {
        return this.points.slice(0);
    }
    public resetAllPoints() {
        throw new IllegalOperationError();
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
    public clone(): RegularPolygon {
        return new RegularPolygon(this.center, this.r, this.sides);
    }
    public getAcreage(): number {
        const perRadian = Math.PI / this.sides;
        const h = Math.cos(perRadian) * this.r;
        const w = Math.sin(perRadian) * this.r;
        return ((w * h) / 2) * this.sides;
    }
    public setSideNumber(sides: number) {
        if (sides < 3) {
            throw new IllegalArgumentError('side number should be an integer and greater than 2!');
        }
        this.sides = Math.floor(sides);
    }
    public getEdgeLength() {
        return this.points[0].vector(this.points[1]).length();
    }
    private resolvePoints() {
        const avgRadian = (Math.PI * 2) / this.sides;
        const vector = new Vector(0, this.r);
        return Array(this.sides)
            .fill(0)
            .map((_, s) => {
                const radian = this.radian + s * avgRadian;
                return this.center.addVector(vector.rotate(radian));
            });
    }
}
