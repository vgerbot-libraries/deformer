import { Point, AnyPoint } from './Coordinate';
import { DeviceCoordinate, DevicePoint } from './DeviceCoordinate';
import { PolarCoordinatate, PolarPoint } from './PolarCoordinate';
import { Lazy } from '../../lazy';
import { Vector } from '../vector';
import { CoordinateConvertionTpl } from './CoordinateConversionTpl';
import { fixAccuracy } from '../fixAccuracy';

const cartesianPointLazy = new Lazy<CartesianPoint>();

export class CartesianPoint extends Point<CartesianCoordinate> {
    @cartesianPointLazy.property(p => Math.atan2(p.x, p.y))
    private sita!: number;
    @cartesianPointLazy.property(p => Math.sqrt(p.x * p.x + p.y * p.y))
    private r!: number;
    constructor(public readonly x: number, public readonly y: number, public coord: CartesianCoordinate) {
        super();
    }
    public toDevice(coord: DeviceCoordinate = DeviceCoordinate.ORIGIN): DevicePoint {
        return coord.point(this.x + this.coord.originX - coord.originX, this.coord.originY - this.y - coord.originY);
    }
    public toPolar(coord: PolarCoordinatate = PolarCoordinatate.ORIGIN): PolarPoint {
        const x = this.x - (coord.originX - this.coord.originX);
        const y = this.y - (this.coord.originY - coord.originY);
        const sita = Math.atan2(x, y) + Math.PI * 0.5;
        const r = Math.sqrt(x * x + y * y);
        return coord.point(sita, r);
    }
    public toCartesian(coord: CartesianCoordinate = CartesianCoordinate.ORIGIN): CartesianPoint {
        const x = this.x - (coord.originX - this.coord.originX);
        const y = this.y - (this.coord.originY - coord.originY);
        return coord.point(x, y);
    }
    public vector(other: AnyPoint): Vector {
        const otherPoint = other.toCartesian(this.coord);
        return new Vector(otherPoint.x - this.x, otherPoint.y - this.y);
    }
    public addVector(vector: Vector): CartesianPoint {
        return this.coord.point(this.x + vector.x, this.y + vector.y);
    }
    public rotate(radian: number, origin: AnyPoint = this.coord.origin): CartesianPoint {
        return this.toCartesian(CartesianCoordinate.by(origin)).rotateByOrigin(radian);
    }
    private rotateByOrigin(radian: number) {
        const sita = this.sita + radian;
        const r = this.r;
        const x = r * Math.cos(sita);
        const y = r * Math.sin(sita);
        return this.coord.point(x, y);
    }
}
export class CartesianCoordinate extends CoordinateConvertionTpl<CartesianPoint> {
    public static readonly ORIGIN = new CartesianCoordinate(0, 0);
    public static by(point: AnyPoint): CartesianCoordinate {
        const devicePoint = point.toDevice();
        return new CartesianCoordinate(devicePoint.x, devicePoint.y);
    }
    public origin = this.point(0, 0);
    public point(x: number, y: number): CartesianPoint {
        return new CartesianPoint(fixAccuracy(x), fixAccuracy(y), this);
    }
    public convertFrom(point: AnyPoint): CartesianPoint {
        return point.toCartesian(this);
    }
}
