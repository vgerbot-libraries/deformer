import { DeviceCoordinate } from './math/coordinate/DeviceCoordinate';
import { Contour } from '../Contour';
import { Vector } from './math/vector';
import { CartesianCoordinate } from './math/coordinate/CartesianCoordinate';
import { PolarPoint } from './math/coordinate/PolarCoordinate';
import { AnyPoint } from './math/coordinate/Coordinate';

const DEVICE_ORIGIN = DeviceCoordinate.ORIGIN;

export class Quadrilateral extends Contour {
    public static fromCoordinate(
        coordinate: DeviceCoordinate | CartesianCoordinate,
        left: number,
        right: number,
        top: number,
        bottom: number
    ) {
        const center = coordinate.point((right - left) * 0.5, (bottom - top) * 0.5);
        const leftTop = coordinate.point(left, top);
        const rightTop = coordinate.point(right, top);
        const leftBottom = coordinate.point(left, bottom);
        const rightBottom = coordinate.point(right, bottom);
        return new Quadrilateral(leftTop, rightTop, leftBottom, rightBottom, center);
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
        let [leftTop, leftBottom, rightTop, rightBottom] = devicePoints;
        let leftTopIndex = 0;
        let leftBottomIndex = 1;
        let rightTopIndex = 2;
        let rightBottomIndex = 3;
        devicePoints.forEach((point, i) => {
            if (point.x <= leftTop.x) {
                if (point.y <= leftTop.y) {
                    leftTop = point;
                    leftTopIndex = i;
                }
            }
            if (point.x <= leftBottom.x) {
                if (point.y >= leftBottom.y) {
                    leftBottom = point;
                    leftBottomIndex = i;
                }
            }
            if (point.x >= rightTop.x) {
                if (point.y <= rightTop.y) {
                    rightTop = point;
                    rightTopIndex = i;
                }
            }
            if (point.x >= rightBottom.x) {
                if (point.y >= rightBottom.y) {
                    rightBottom = point;
                    rightBottomIndex = i;
                }
            }
        });
        return [points[leftTopIndex], points[rightTopIndex], points[rightBottomIndex], points[leftBottomIndex]];
    }
    private leftTopIndex: number = 0;
    private rightTopIndex: number = 1;
    private rightBottomIndex: number = 2;
    private leftBottomIndex: number = 3;
    protected constructor(point1: AnyPoint, point2: AnyPoint, point3: AnyPoint, point4: AnyPoint, center: AnyPoint) {
        super(center);
        super.addPoint(point1);
        super.addPoint(point2);
        super.addPoint(point3);
        super.addPoint(point4);
        this.collate();
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
        const rightTop = this.getRightTop();
        const rightBottom = this.getRightBottom();
        super.setPoint(this.rightTopIndex, rightTop.toPolar(this.coordinate).expansion(offset));
        super.setPoint(this.rightBottomIndex, rightBottom.toPolar(this.coordinate).expansion(offset));
        this.collate();
    }
    public addLeftv(vector: Vector) {
        const leftTop = this.getLeftTop();
        const leftBottom = this.getLeftBottom();
        super.setPoint(this.leftTopIndex, leftTop.addVector(vector));
        super.setPoint(this.leftBottomIndex, leftBottom.addVector(vector));
        this.collate();
    }
    public addLeftOffset(offset: number) {
        const leftTop = this.getLeftTop();
        const leftBottom = this.getLeftBottom();
        super.setPoint(this.leftTopIndex, leftTop.toPolar(this.coordinate).expansion(offset));
        super.setPoint(this.leftBottomIndex, leftBottom.toPolar(this.coordinate).expansion(offset));
        this.collate();
    }
    public addTopv(vector: Vector) {
        const leftTop = this.getLeftTop();
        const rightTop = this.getRightTop();
        super.setPoint(this.leftTopIndex, leftTop.addVector(vector));
        super.setPoint(this.rightTopIndex, rightTop.addVector(vector));
        this.collate();
    }
    public addTopOffset(offset: number) {
        const leftTop = this.getLeftTop();
        const rightTop = this.getRightTop();
        super.setPoint(this.leftTopIndex, leftTop.toPolar(this.coordinate).expansion(offset));
        super.setPoint(this.rightTopIndex, rightTop.toPolar(this.coordinate).expansion(offset));
        this.collate();
    }
    public addBottomv(vector: Vector) {
        const leftTop = this.getLeftTop();
        const rightTop = this.getRightTop();
        super.setPoint(this.leftTopIndex, leftTop.addVector(vector));
        super.setPoint(this.rightTopIndex, rightTop.addVector(vector));
        this.collate();
    }
    public addBottomOffset(offset: number) {
        const leftBottom = this.getLeftBottom();
        const rightBottom = this.getRightBottom();
        super.setPoint(this.leftBottomIndex, leftBottom.toPolar(this.coordinate).expansion(offset));
        super.setPoint(this.rightBottomIndex, rightBottom.toPolar(this.coordinate).expansion(offset));
        this.collate();
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
        this.points = Quadrilateral.collatePoints(this.points);
    }
}
