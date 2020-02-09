import { Point, AnyPoint } from './Coordinate';
import { DevicePoint, DeviceCoordinate } from './DeviceCoordinate';
import { Lazy } from '../../lazy';
import { Vector } from '../vector';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';
import { CoordinateConvertionTpl } from './CoordinateConversionTpl';

const polarPointLazy = new Lazy<PolarPoint>();
const ACCURACY = 1e-13;
export class PolarPoint extends Point<PolarCoordinatate> {
    @polarPointLazy.property(p => Math.round(((Math.cos(p.sita) * p.r) / ACCURACY) * ACCURACY))
    private $x!: number;
    @polarPointLazy.property(p => Math.round((Math.sin(p.sita) * p.r) / ACCURACY) * ACCURACY)
    private $y!: number;
    constructor(public readonly sita: number, public readonly r: number, public readonly coord: PolarCoordinatate) {
        super();
    }
    public toDevice(coord = DeviceCoordinate.ORIGIN): DevicePoint {
        const deviceX = this.$x + this.coord.originX;
        const deviceY = this.coord.originY - this.$y;
        return coord.point(deviceX - coord.originX, deviceY - coord.originY);
    }
    public toPolar(coord: PolarCoordinatate = PolarCoordinatate.ORIGIN): PolarPoint {
        return coord.point(this.sita, this.r);
    }
    public toCartesian(coord: CartesianCoordinate = CartesianCoordinate.ORIGIN): CartesianPoint {
        const x = this.$x + this.coord.originX; // device axis-x
        const y = this.coord.originY - this.$y; // device axis-y
        return coord.point(x - coord.originX, coord.originY - y);
    }
    public vector(other: AnyPoint): Vector {
        const cartesian = this.coord.toCartesian();
        const otherPoint = other.toCartesian(cartesian);
        const thisPoint = this.toCartesian(cartesian);
        return thisPoint.vector(otherPoint);
    }
    public addVector(vec: Vector): PolarPoint {
        const nx = this.$x + vec.x;
        const ny = this.$y + vec.y;
        const sita = Math.atan2(ny, nx);
        const r = Math.sqrt(nx * nx + ny * ny);
        return this.coord.point(sita, r);
    }
    public expansion(r: number): PolarPoint {
        return this.coord.point(this.sita, this.r + r);
    }
    public scale(ratio: number): PolarPoint {
        return this.coord.point(this.sita, this.r * ratio);
    }
    public rotate(radian: number): PolarPoint {
        return this.coord.point(this.sita + radian, this.r);
    }
}

export class PolarCoordinatate extends CoordinateConvertionTpl<PolarPoint> {
    public static ORIGIN = new PolarCoordinatate(0, 0);
    public origin = this.point(0, 0);
    public point(sita: number, r: number): PolarPoint {
        return new PolarPoint(sita, r, this);
    }
    public convertFrom(point: AnyPoint): PolarPoint {
        return point.toPolar(this);
    }
}
