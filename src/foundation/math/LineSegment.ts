import { Lazy } from '../lazy';

const lazy = new Lazy<LineSegment>();
export default class LineSegment {
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
        return this.straddle(other) || other.straddle(this);
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
    private straddle(other: LineSegment) {
        const vf = this.startPoint.vector(other.startPoint);
        const vt = this.startPoint.vector(other.endPoint);
        const vm = this.getSEVector();
        return vf.cross(vm) * vt.cross(vm) <= 0;
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
