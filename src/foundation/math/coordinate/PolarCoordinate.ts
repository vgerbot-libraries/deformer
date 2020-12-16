import { AnyPoint, Point } from './Coordinate';
import { DeviceCoordinate, DevicePoint } from './DeviceCoordinate';
import { Lazy } from '../../lazy';
import { Vector } from '../vector';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';
import { CoordinateConvertionTpl } from './CoordinateConversionTpl';

const polarPointLazy = new Lazy<PolarPoint>();

export class PolarPoint extends Point<PolarCoordinatate> {
    @polarPointLazy.property(p => Math.cos(p.sita) * p.r)
    private $x!: number;
    @polarPointLazy.property(p => Math.sin(p.sita) * p.r)
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
        const devicePoint = this.toDevice();
        const vec = coord.origin.vector(devicePoint);
        const sita = Math.atan2(vec.y, vec.x);
        const r = vec.length();
        return coord.point(sita, r);
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
    public rotate(radian: number, originPoint: AnyPoint = this.coord.origin): PolarPoint {
        const coordinate = PolarCoordinatate.by(originPoint);
        return this.toPolar(coordinate).rotateByOrigin(radian);
    }
    private rotateByOrigin(radian) {
        return this.coord.point(this.sita + radian, this.r);
    }
}

export class PolarCoordinatate extends CoordinateConvertionTpl<PolarPoint> {
    public static ORIGIN = new PolarCoordinatate(0, 0);
    public static by(point: AnyPoint): PolarCoordinatate {
        const devicePoint = point.toDevice();
        return new PolarCoordinatate(devicePoint.x, devicePoint.y);
    }
    public origin = this.point(0, 0);
    public point(sita: number, r: number): PolarPoint {
        return new PolarPoint(sita, r, this);
    }
    public convertFrom(point: AnyPoint): PolarPoint {
        return point.toPolar(this);
    }
}
