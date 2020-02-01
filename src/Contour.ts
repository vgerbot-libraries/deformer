import { DeviceCoordinate, DevicePoint } from './foundation/math/coordinate/DeviceCoordinate';
import { PolarCoordinatate, PolarPoint } from './foundation/math/coordinate/PolarCoordinate';
import { Vector } from './foundation/math/vector';
import { Boundary } from './foundation/Boundary';
import { CartesianCoordinate, CartesianPoint } from './foundation/math/coordinate/CartesianCoordinate';
import { AnyPoint } from './foundation/math/coordinate/Coordinate';

const DEVICE_ORIGIN = DeviceCoordinate.ORIGIN;
const CARTESIAN_ORIGIN = CartesianCoordinate.ORIGIN;

export abstract class Contour {
    protected readonly coordinate: PolarCoordinatate;
    protected points: PolarPoint[] = [];
    constructor(center: AnyPoint) {
        const origin = center.toDevice(DEVICE_ORIGIN);
        this.coordinate = new PolarCoordinatate(origin.getDeviceX(), origin.getDeviceY());
    }
    public moveByVector(vector: Vector) {
        this.coordinate.moveOriginByVector(vector);
    }
    public move(x: number, y: number) {
        this.coordinate.moveOrigin(x, y);
    }
    public moveTo(point: AnyPoint) {
        const dpoint = point.toDevice(DEVICE_ORIGIN);
        this.coordinate.moveOriginTo(dpoint.getDeviceX(), dpoint.getDeviceY());
    }
    public addPoint(point: AnyPoint) {
        this.points.push(point.toPolar(this.coordinate));
        return this.points.length - 1;
    }
    public setPoint(index: number, point: AnyPoint) {
        this.points[index] = point.toPolar(this.coordinate);
    }
    public removePoint(index: number): boolean {
        return this.points.splice(index, 1).length > 0;
    }
    public rotate(radian: number) {
        this.points = this.points.map(it => it.rotate(radian));
    }
    public expansion(r: number) {
        this.points = this.points.map(it => it.expansion(r));
    }
    public scale(ratio: number) {
        this.points = this.points.map(it => it.scale(ratio));
    }
    public devicePoints(baseCoordinate: DeviceCoordinate = DEVICE_ORIGIN): DevicePoint[] {
        return this.points.map(it => it.toDevice(baseCoordinate));
    }
    public cartesianPoints(baseCoordinate: CartesianCoordinate = CARTESIAN_ORIGIN): CartesianPoint[] {
        return this.points.map(it => it.toCartesian(baseCoordinate));
    }
    public getDeviceBoundary(coordinate: DeviceCoordinate = DEVICE_ORIGIN): Boundary {
        const points = this.devicePoints(coordinate);
        const aAxisX = points.map(it => it.getDeviceX());
        const aAxisY = points.map(it => it.getDeviceY());
        const left = Math.min(...aAxisX);
        const right = Math.max(...aAxisX);
        const top = Math.min(...aAxisY);
        const bottom = Math.max(...aAxisY);
        return new Boundary(left, top, right, bottom);
    }
    public getCartesianBoundary(coordinate: CartesianCoordinate = CARTESIAN_ORIGIN): Boundary {
        const points = this.cartesianPoints(coordinate);
        const aAxisX = points.map(it => it.x);
        const aAxisY = points.map(it => it.y);
        const left = Math.min(...aAxisX);
        const right = Math.max(...aAxisX);
        const top = Math.min(...aAxisY);
        const bottom = Math.max(...aAxisY);
        return new Boundary(left, top, right, bottom);
    }
}
