import { Lazy } from '../lazy';
import { Vector } from './vector';
import { DeviceCoordinate } from './coordinate/DeviceCoordinate';

const lazy = new Lazy<LineSegment>();
export default class LineSegment {
    public static translate(line: LineSegment, vector: Vector) {
        return new LineSegment(line.getStartPoint().addVector(vector), line.getEndPoint().addVector(vector));
    }
    private startPoint: DevicePoint;
    private endPoint: DevicePoint;
    @lazy.detectFieldChange(
        ls => ls.startPoint,
        ls => ls.endPoint
    )
    @lazy.property(ls => ls.calcLength())
    private $length!: number;
    @lazy.detectFieldChange(
        ls => ls.startPoint,
        ls => ls.endPoint
    )
    @lazy.property(ls => ls.seVector())
    private $seVector!: Vector;
    @lazy.detectFieldChange(
        ls => ls.startPoint,
        ls => ls.endPoint
    )
    @lazy.property(ls => ls.esVector())
    private $esVector!: Vector;
    constructor(startPoint: AnyPoint, endPoint: AnyPoint) {
        this.startPoint = startPoint.toDevice();
        this.endPoint = endPoint.toDevice();
    }
    public isCross(other: LineSegment): boolean {
        return this.straddle(other) && other.straddle(this);
    }
    public getSEVector() {
        return this.$seVector;
    }
    public getESVector() {
        return this.$esVector;
    }
    public contains(point: AnyPoint, accuracy = 0) {
        const vectorOfFromToTarget = this.startPoint.vector(point);
        const vectorOfTarget2To = point.vector(this.endPoint);
        return vectorOfFromToTarget.length() + vectorOfTarget2To.length() - this.$length <= accuracy;
    }
    public getLength() {
        return this.$length;
    }
    public vector(point: AnyPoint) {
        const sx = this.startPoint.getDeviceX();
        const sy = this.startPoint.getDeviceY();
        const ex = this.endPoint.getDeviceX();
        const ey = this.endPoint.getDeviceY();

        const dpoint = point.toDevice();
        const dx = dpoint.getDeviceX();
        const dy = dpoint.getDeviceY();

        if (sx === ex) {
            return new Vector(sx - dx, 0);
        } else if (sy === ey) {
            return new Vector(0, sy - dy);
        } else {
            const se = this.startPoint.solveEquation(this.endPoint);
            const vlk = -1 / se.k;
            const vlb = dpoint.getDeviceY() - vlk * dpoint.getDeviceX();
            // x * k + a = x * vlk + vlb
            // x = (vlb - a) /  (k - vlk)
            const vlx = (vlb - se.b) / (se.k - vlk);
            const vly = vlx * se.k + se.b;
            return dpoint.vector(DeviceCoordinate.ORIGIN.point(vlx, vly));
        }
    }
    public translate(vector: Vector) {
        this.startPoint = this.startPoint.addVector(vector);
        this.endPoint = this.endPoint.addVector(vector);
    }
    public triangle(point: AnyPoint) {
        const Triangle = require('../Triangle'); // circular dependency
        return Triangle.create(this.startPoint, this.endPoint, point);
    }
    public getStartPoint() {
        return this.startPoint;
    }
    public getEndPoint() {
        return this.endPoint;
    }
    public clone() {
        return new LineSegment(this.getStartPoint(), this.getEndPoint());
    }
    private straddle(other: LineSegment) {
        const vf = this.startPoint.vector(other.startPoint);
        const vt = this.startPoint.vector(other.endPoint);
        const vm = this.getSEVector();
        return vf.cross(vm) * vt.cross(vm) < 0;
    }
    private calcLength() {
        return this.startPoint.vector(this.endPoint).length();
    }
    private seVector() {
        return this.startPoint.vector(this.endPoint);
    }
    private esVector() {
        return this.startPoint.vector(this.endPoint);
    }
}
