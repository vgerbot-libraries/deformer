import { AnyPoint, Point } from './Coordinate';
import { Lazy } from '../../lazy';
import { Vector } from '../vector';
import { PolarCoordinatate, PolarPoint } from './PolarCoordinate';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';
import { LinearEquation } from '../LinearEquation';
import { CoordinateConvertionTpl } from './CoordinateConversionTpl';
import { fixAccuracy } from '../fixAccuracy';

const devicePointLazy = new Lazy<DevicePoint>();

export class DevicePoint extends Point<DeviceCoordinate> {
    @devicePointLazy.property(p => Math.sqrt(p.x * p.x + p.y * p.y))
    private $sqrtLength!: number;
    constructor(public readonly x: number, public readonly y: number, public readonly coord: DeviceCoordinate) {
        super();
    }
    public getDeviceX() {
        return this.coord.originX + this.x;
    }
    public getDeviceY() {
        return this.coord.originY + this.y;
    }
    public rotate(radian: number, origin: AnyPoint = this.coord.origin): DevicePoint {
        return this.toDevice(DeviceCoordinate.by(origin)).rotateBaseOrigin(radian);
    }
    public toDevice(coord: DeviceCoordinate = DeviceCoordinate.ORIGIN): DevicePoint {
        return coord.point(this.getDeviceX() - coord.originX, this.getDeviceY() - coord.originY);
    }
    public toPolar(coord: PolarCoordinatate = PolarCoordinatate.ORIGIN): PolarPoint {
        const disX = this.x - (coord.originX - this.coord.originX);
        const disY = coord.originY - this.getDeviceY();
        const sita = Math.atan2(disY, disX);
        const r = Math.sqrt(disX * disX + disY * disY);
        return coord.point(sita, r);
    }
    public toCartesian(coord: CartesianCoordinate = CartesianCoordinate.ORIGIN): CartesianPoint {
        return coord.point(this.getDeviceX() - coord.originX, coord.originY - this.getDeviceY());
    }
    public addVector(vector: Vector): DevicePoint {
        return this.coord.point(this.x + vector.x, this.y + vector.y);
    }
    public solveEquation(point: Point<any>): LinearEquation {
        const dpoint = point.toDevice(this.coord);
        const dx = dpoint.x - this.x;
        const dy = dpoint.y - this.y;
        const k = dy / dx;
        const b = dpoint.y - k * dpoint.x;
        return new LinearEquation(k, b);
    }
    private rotateBaseOrigin(radian: number) {
        const sita = Math.atan2(this.y, this.x) + radian;
        const r = this.$sqrtLength;
        const x = r * Math.cos(sita);
        const y = r * Math.sin(sita);
        return this.coord.point(x, y);
    }
}
export class DeviceCoordinate extends CoordinateConvertionTpl<DevicePoint> {
    public static ORIGIN = new DeviceCoordinate(0, 0);
    public static by(point: AnyPoint): DeviceCoordinate {
        const devicePoint = point.toDevice();
        return new DeviceCoordinate(devicePoint.x, devicePoint.y);
    }
    public origin: DevicePoint = this.point(0, 0);
    public point(x: number, y: number): DevicePoint {
        return new DevicePoint(fixAccuracy(x), fixAccuracy(y), this);
    }
    public convertFrom(point: AnyPoint): DevicePoint {
        return point.toDevice(this);
    }
}
