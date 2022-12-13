import { Contour } from '../Contour';
import { Lazy } from '../lazy';
import { DeviceCoordinate } from '../math/coordinate/DeviceCoordinate';

const lazy = new Lazy<Triangle>();
export default class Triangle extends Contour {
    public static create(point1: AnyPoint, point2: AnyPoint, point3: AnyPoint) {
        return new Triangle(point1, point2, point3);
    }
    @lazy.detectFieldChange((t) => t.point1, (t) => t.point2, (t) => t.point3)
    @lazy.property((t) => t.resolveCenter())
    private $center!: AnyPoint;
    private constructor(private point1: AnyPoint, private point2: AnyPoint, private point3: AnyPoint) {
        super();
        super.addPoint(point1);
        super.addPoint(point2);
        super.addPoint(point3);
    }
    public addPoint(point: AnyPoint): number {
        throw new Error('Unsupported operation!');
    }
    public getCenter(): AnyPoint {
        return this.$center;
    }
    public clone(): Contour {
        return new Triangle(this.point1, this.point2, this.point3);
    }
    public getAcreage(): number {
        // S = |(x1y2+x2y3+x3y1-x1y3-x2y1-x3y2) / 2|;
        const dp1 = this.point1.toDevice();
        const dp2 = this.point2.toDevice();
        const dp3 = this.point3.toDevice();
        return (dp1.x * dp2.y + dp2.x * dp3.y + dp3.x * dp1.y - dp1.x * dp3.y - dp2.x * dp1.y - dp3.x * dp2.y) * 0.5;
        // const bottomEdge = new LineSegment(this.point1, this.point2);
        // const height = bottomEdge.vector(this.point3).length();
        // return bottomEdge.getLength() * height * 0.5;
    }
    private resolveCenter() {
        const dp1 = this.point1.toDevice();
        const dp2 = this.point2.toDevice();
        const dp3 = this.point3.toDevice();
        const cx = (dp1.x + dp2.x + dp3.x) / 3;
        const cy = (dp1.y + dp2.y + dp3.y) / 3;
        return DeviceCoordinate.ORIGIN.point(cx, cy);
    }
}
