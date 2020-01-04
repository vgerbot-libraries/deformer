import { Vector } from '../vector';
import { DevicePoint, DeviceCoordinate } from './DeviceCoordinate';
import { PolarCoordinatate, PolarPoint } from './PolarCoordinate';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';

export abstract class Point<C extends Coordinate<any>> {
    public abstract coord: C;
    public abstract toDevice(coord?: DeviceCoordinate): DevicePoint;
    public abstract toPolar(coord?: PolarCoordinatate): PolarPoint;
    public abstract toCartesian(coord: CartesianCoordinate): CartesianPoint;
    public vector<T extends Point<Coordinate<T>>>(other: T): Vector {
        const from = this.toDevice();
        const to = other.toDevice();
        return new Vector(to.x - from.x, to.y - from.y);
    }
    public abstract addVector(vec: Vector): Point<C>;
    public abstract rotate(radian: number): Point<C>;
}

export abstract class Coordinate<P extends Point<any>> {
    public abstract origin: P;
    constructor(public originX: number, public originY: number) {}
    public moveOrigin(vector: Vector) {
        this.originX += vector.x;
        this.originY += vector.y;
        return this;
    }
    public moveOriginTo(x: number, y: number) {
        this.originX = x;
        this.originY = y;
        return this;
    }
    public abstract point(...args: number[]): P;
}
