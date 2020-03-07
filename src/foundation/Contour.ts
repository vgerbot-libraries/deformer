import { DeviceCoordinate, DevicePoint } from './math/coordinate/DeviceCoordinate';
import { PolarCoordinatate, PolarPoint } from './math/coordinate/PolarCoordinate';
import { Vector } from './math/vector';
import { Boundary } from './Boundary';
import { CartesianCoordinate, CartesianPoint } from './math/coordinate/CartesianCoordinate';
import { AnyPoint } from './math/coordinate/Coordinate';

const DEVICE_ORIGIN = DeviceCoordinate.ORIGIN;
const CARTESIAN_ORIGIN = CartesianCoordinate.ORIGIN;

export abstract class Contour {
    protected coordinate: PolarCoordinatate;
    protected points: PolarPoint[] = [];
    private saveStack: PolarPoint[][] = [];
    constructor(center: AnyPoint) {
        this.coordinate = PolarCoordinatate.by(center);
    }
    public save() {
        this.saveStack.push(this.points.slice(0));
    }
    public restore() {
        const last = this.saveStack.pop();
        if (last) {
            this.points = last;
        }
    }
    public apply() {
        this.saveStack.length = 0;
    }
    public move(vector: Vector) {
        this.points = this.points.map(it => it.addVector(vector));
    }
    public moveTo(point: AnyPoint) {
        const vector = this.getCenter().vector(point);
        this.move(vector);
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
    public rotate(radian: number, origin: AnyPoint = this.getCenter()) {
        this.points = this.points.map(it => it.rotate(radian, origin));
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
    public abstract getCenter(): AnyPoint;
    public abstract clone(): Contour;
}