import { Point, Coordinate, AnyPoint } from './Coordinate';
import { DevicePoint, DeviceCoordinate } from './DeviceCoordinate';
import { Lazy } from '../../lazy';
import { Vector } from '../vector';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';

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
        return coord.point(this.sita, this.r);
    }
    public toCartesian(coord: CartesianCoordinate = CartesianCoordinate.ORIGIN): CartesianPoint {
        const x = this.$x + this.coord.originX; // device axis-x
        const y = this.$y - this.coord.originY; // device axis-y
        return coord.point(x - coord.originX, coord.originY - y);
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

export class PolarCoordinatate extends Coordinate<PolarPoint> {
    public static ORIGIN = new PolarCoordinatate(0, 0);
    public origin = this.point(0, 0);
    public point(sita: number, r: number): PolarPoint {
        return new PolarPoint(sita, r, this);
    }
    public convertFrom(point: AnyPoint): PolarPoint {
        return point.toPolar(this);
    }
}
