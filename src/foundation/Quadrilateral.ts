import { DeviceCoordinate } from './math/coordinate/DeviceCoordinate';
import { Contour } from '../Contour';
import { Vector } from './math/vector';
import { CartesianCoordinate } from './math/coordinate/CartesianCoordinate';
import { PolarPoint } from './math/coordinate/PolarCoordinate';
import { AnyPoint } from './math/coordinate/Coordinate';
import { Lazy } from './lazy';

const DEVICE_ORIGIN = DeviceCoordinate.ORIGIN;

const lazy = new Lazy<Quadrilateral>();
export class Quadrilateral extends Contour {
    public static fromDOMElement(elm: Element) {
        const rect = elm.getBoundingClientRect();
        const centerX = (rect.right + rect.left) * 0.5;
        const centerY = (rect.top + rect.bottom) * 0.5;
        const coordinate = new CartesianCoordinate(centerX, centerY);
        const left = -rect.width / 2;
        const right = rect.width / 2;
        const top = rect.height / 2;
        const bottom = -rect.height / 2;
        const leftTop = coordinate.point(left, top);
        const rightTop = coordinate.point(right, top);
        const leftBottom = coordinate.point(left, bottom);
        const rightBottom = coordinate.point(right, bottom);
        const center = coordinate.point(0, 0);
        return new Quadrilateral(leftTop, rightTop, rightBottom, leftBottom, center);
    }
    public static fromCoordinate(
        coordinate: DeviceCoordinate | CartesianCoordinate,
        left: number,
        right: number,
        top: number,
        bottom: number
    ) {
        const leftTop = coordinate.point(left, top);
        const rightTop = coordinate.point(right, top);
        const leftBottom = coordinate.point(left, bottom);
        const rightBottom = coordinate.point(right, bottom);
        const center = leftTop.addVector(leftTop.vector(rightBottom).multiply(0.5));
        return new Quadrilateral(leftTop, rightTop, rightBottom, leftBottom, center);
    }
    public static fromPoints(point1: AnyPoint, point2: AnyPoint, point3: AnyPoint, point4: AnyPoint): Quadrilateral {
        const [leftTop, rightTop, rightBottom, leftBottom] = Quadrilateral.collatePoints([
            point1.toDevice(),
            point2.toDevice(),
            point3.toDevice(),
            point4.toDevice()
        ]);
        const leLTRB = leftTop.solveEquation(rightBottom);
        const leLBRT = leftBottom.solveEquation(rightTop);
        const p = leLBRT.intersection(leLTRB);
        const center = DEVICE_ORIGIN.point(p.x, p.y);
        return new Quadrilateral(leftTop, rightTop, rightBottom, leftBottom, center);
    }
    protected static collatePoints<T extends AnyPoint>(points: T[]): T[] {
        const devicePoints = points.map(point => point.toDevice(DEVICE_ORIGIN));
        const leftTopPoint = devicePoints.reduce((prePoint, point) => {
            if (prePoint.x < point.x || prePoint.y < point.y) {
                return prePoint;
            }
            return point;
        });
        const rightTopPoint = devicePoints.reduce((prePoint, point) => {
            if (prePoint.x > point.x || prePoint.y < point.y) {
                return prePoint;
            }
            return point;
        });
        const leftBottomPoint = devicePoints.reduce((prePoint, point) => {
            if (prePoint.x < point.x || prePoint.y > point.y) {
                return prePoint;
            }
            return point;
        });
        const rightBottomPoint = devicePoints.reduce((prePoint, point) => {
            if (prePoint.x > point.x || prePoint.y > point.y) {
                return prePoint;
            }
            return point;
        });
        const leftTopIndex = devicePoints.indexOf(leftTopPoint);
        const rightTopIndex = devicePoints.indexOf(rightTopPoint);
        const rightBottomIndex = devicePoints.indexOf(rightBottomPoint);
        const leftBottomIndex = devicePoints.indexOf(leftBottomPoint);
        return [points[leftTopIndex], points[rightTopIndex], points[rightBottomIndex], points[leftBottomIndex]];
    }
    private leftTopIndex: number = 0;
    private rightTopIndex: number = 1;
    private rightBottomIndex: number = 2;
    private leftBottomIndex: number = 3;
    @lazy.resetOnChange(
        q => q.getLeftTop(),
        q => q.getLeftBottom()
    )
    @lazy.property(q => q.initLeftCenter())
    private leftCenter!: PolarPoint;
    @lazy.resetOnChange(
        q => q.getRightTop(),
        q => q.getRightBottom()
    )
    @lazy.property(q => q.initRightCenter())
    private rightCenter!: PolarPoint;
    @lazy.resetOnChange(
        q => q.getLeftTop(),
        q => q.getRightTop()
    )
    @lazy.property(q => q.initTopCenter())
    private topCenter!: PolarPoint;
    @lazy.resetOnChange(
        q => q.getLeftBottom(),
        q => q.getRightBottom()
    )
    @lazy.property(q => q.initBottomCenter())
    private bottomCenter!: PolarPoint;
    protected constructor(point1: AnyPoint, point2: AnyPoint, point3: AnyPoint, point4: AnyPoint, center: AnyPoint) {
        super(center);
        super.addPoint(point1);
        super.addPoint(point2);
        super.addPoint(point3);
        super.addPoint(point4);
        this.collate();
    }
    public getLeftCenter(): PolarPoint {
        return this.leftCenter;
    }
    public getRightCenter(): PolarPoint {
        return this.rightCenter;
    }
    public getTopCenter(): PolarPoint {
        return this.topCenter;
    }
    public getBottomCenter(): PolarPoint {
        return this.bottomCenter;
    }
    public getLeftTop(): PolarPoint {
        return this.points[this.leftTopIndex];
    }
    public getLeftBottom(): PolarPoint {
        return this.points[this.leftBottomIndex];
    }
    public getRightTop(): PolarPoint {
        return this.points[this.rightTopIndex];
    }
    public getRightBottom(): PolarPoint {
        return this.points[this.rightBottomIndex];
    }
    public addRightv(vector: Vector) {
        const rightTop = this.getRightTop();
        const rightBottom = this.getRightBottom();
        super.setPoint(this.rightTopIndex, rightTop.addVector(vector));
        super.setPoint(this.rightBottomIndex, rightBottom.addVector(vector));
        this.collate();
    }
    public addRightOffset(offset: number) {
        this.addRightv(new Vector(offset, 0));
    }
    public addLeftv(vector: Vector) {
        const leftTop = this.getLeftTop();
        const leftBottom = this.getLeftBottom();
        super.setPoint(this.leftTopIndex, leftTop.addVector(vector));
        super.setPoint(this.leftBottomIndex, leftBottom.addVector(vector));
        this.collate();
    }
    public addLeftOffset(offset: number) {
        this.addLeftv(new Vector(offset, 0));
    }
    public addTopv(vector: Vector) {
        const leftTop = this.getLeftTop();
        const rightTop = this.getRightTop();
        super.setPoint(this.leftTopIndex, leftTop.addVector(vector));
        super.setPoint(this.rightTopIndex, rightTop.addVector(vector));
        this.collate();
    }
    public addTopOffset(offset: number) {
        this.addTopv(new Vector(0, offset));
    }
    public addBottomv(vector: Vector) {
        const leftBottom = this.getLeftBottom();
        const rightBottom = this.getRightBottom();
        super.setPoint(this.leftBottomIndex, leftBottom.addVector(vector));
        super.setPoint(this.rightBottomIndex, rightBottom.addVector(vector));
        this.collate();
    }
    public addBottomOffset(offset: number) {
        this.addBottomv(new Vector(0, offset));
    }
    public straighten() {
        const vec = this.getLeftTop().vector(this.getRightTop());
        const r = Math.atan2(vec.x, vec.y);
        this.rotate(-r);
    }
    public setPoint(index: number, point: AnyPoint) {
        if (index > 3) {
            throw new Error('Unsupported operation: index should be in range of 0 to 4');
        }
        super.setPoint(index, point);
        this.collate();
    }
    public addPoint(point: AnyPoint): number {
        throw new Error('Unsupported operation!');
    }

    private collate() {
        this.points = Quadrilateral.collatePoints(this.points).map(point => {
            if (point.coord !== this.coordinate || !(point instanceof PolarPoint)) {
                return point.toPolar(this.coordinate);
            }
            return point;
        });
    }
    private initLeftCenter(): PolarPoint {
        const halfVector = this.getLeftTop()
            .vector(this.getLeftBottom())
            .multiply(0.5);
        return this.getLeftTop().addVector(halfVector);
    }
    private initRightCenter(): PolarPoint {
        const halfVector = this.getRightTop()
            .vector(this.getRightBottom())
            .multiply(0.5);
        return this.getRightTop().addVector(halfVector);
    }
    private initTopCenter(): PolarPoint {
        const halfVector = this.getLeftTop()
            .vector(this.getRightTop())
            .multiply(0.5);
        return this.getLeftTop().addVector(halfVector);
    }
    private initBottomCenter(): PolarPoint {
        const halfVector = this.getLeftBottom()
            .vector(this.getRightBottom())
            .multiply(0.5);
        return this.getLeftBottom().addVector(halfVector);
    }
}
