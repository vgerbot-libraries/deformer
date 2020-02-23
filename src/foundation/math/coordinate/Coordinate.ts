import { Vector } from '../vector';
import { DevicePoint, DeviceCoordinate } from './DeviceCoordinate';
import { PolarCoordinatate, PolarPoint } from './PolarCoordinate';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';
import { LinearEquation } from '../LinearEquation';

export type AnyPoint = PolarPoint | DevicePoint | CartesianPoint;

export abstract class Point<C extends Coordinate<any>> {
    public abstract coord: C;
    public abstract toDevice(coord?: DeviceCoordinate): DevicePoint;
    public abstract toPolar(coord?: PolarCoordinatate): PolarPoint;
    public abstract toCartesian(coord: CartesianCoordinate): CartesianPoint;
    public vector(other: AnyPoint): Vector {
        const from = this.toDevice();
        const to = other.toDevice();
        return new Vector(to.x - from.x, to.y - from.y);
    }
    public abstract addVector(vec: Vector): Point<C>;
    public abstract rotate(radian: number, originPoint?: AnyPoint): Point<C>;
    public solveEquation(point: Point<any>): LinearEquation {
        return this.toDevice().solveEquation(point.toDevice());
    }
    public closeTo(other: AnyPoint): boolean {
        const ACCURACY = 0.001;
        const thisPoint = this.toDevice();
        const otherPoint = other.toDevice();
        return Math.abs(thisPoint.x - otherPoint.x) < ACCURACY && Math.abs(thisPoint.y - otherPoint.y) < ACCURACY;
    }
}

export abstract class Coordinate<P extends Point<any>> {
    public abstract origin: P;
    constructor(public originX: number, public originY: number) {}
    public moveOrigin(x: number, y: number) {
        this.originX += x;
        this.originY += y;
        return this;
    }
    public moveOriginByVector(vector: Vector) {
        this.originX += vector.x;
        this.originY += vector.y;
        return this;
    }
    public moveOriginTo(x: number, y: number) {
        this.originX = x;
        this.originY = y;
        return this;
    }
    public abstract toDevice(): DeviceCoordinate;
    public abstract toCartesian(): CartesianCoordinate;
    public abstract toPolar(): PolarCoordinatate;
    public abstract point(...args: number[]): P;
    public abstract convertFrom(point: AnyPoint): P;
}
