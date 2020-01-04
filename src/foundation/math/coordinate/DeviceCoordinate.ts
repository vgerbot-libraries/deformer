import { Coordinate, Point } from './Coordinate';
import { Lazy } from '../../lazy';
import { Vector } from '../vector';
import { PolarCoordinatate, PolarPoint } from './PolarCoordinate';
import { CartesianCoordinate, CartesianPoint } from './CartesianCoordinate';

const devicePointLazy = new Lazy<DevicePoint>();

export class DevicePoint extends Point<DeviceCoordinate> {
    @devicePointLazy.property(p => Math.sqrt(p.x * p.x + p.y * p.y))
    private $sqrtLength: number = 0;
    constructor(public readonly x: number, public readonly y: number, public readonly coord: DeviceCoordinate) {
        super();
    }
    public getDeviceX() {
        return this.coord.originX + this.x;
    }
    public getDeviceY() {
        return this.coord.originY + this.y;
    }
    public rotate(radian: number): DevicePoint {
        const sita = Math.atan2(this.y, this.x) + radian;
        const r = this.$sqrtLength;
        const x = r * Math.cos(sita);
        const y = r * Math.sin(sita);
        return this.coord.point(x, y);
    }
    public toDevice(coord: DeviceCoordinate = DeviceCoordinate.ORIGIN): DevicePoint {
        return coord.point(this.x - coord.originX, this.y - coord.originY);
    }
    public toPolar(coord: PolarCoordinatate = PolarCoordinatate.ORIGIN): PolarPoint {
        const disX = this.getDeviceX() - coord.originX;
        const disY = this.getDeviceY() - coord.originY;
        const sita = Math.atan2(disY, disX);
        const r = Math.sqrt(disX * disX + disY * disY);
        return coord.point(sita, r);
    }
    public toCartesian(coord: CartesianCoordinate = CartesianCoordinate.ORITIN): CartesianPoint {
        return coord.point(this.getDeviceX() - coord.originX, this.getDeviceY() + coord.originY);
    }
    public addVector(vector: Vector): DevicePoint {
        return this.coord.point(this.x + vector.x, this.y + vector.y);
    }
}

export class DeviceCoordinate extends Coordinate<DevicePoint> {
    public static ORIGIN = new DeviceCoordinate(0, 0);
    public origin: DevicePoint = this.point(0, 0);
    public point(x: number, y: number): DevicePoint {
        return new DevicePoint(x, y, this);
    }
}
