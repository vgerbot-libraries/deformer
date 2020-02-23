import { DeviceCoordinate } from './math/coordinate/DeviceCoordinate';
import { Contour } from '../Contour';
import { Vector } from './math/vector';
import { CartesianCoordinate } from './math/coordinate/CartesianCoordinate';
import { PolarPoint } from './math/coordinate/PolarCoordinate';
import { AnyPoint } from './math/coordinate/Coordinate';
import { Lazy } from './lazy';
import { Direction } from './Direction';

const DEVICE_ORIGIN = DeviceCoordinate.ORIGIN;

interface SidePointIndexes {
    horizontal: number[];
    vertical: number[];
}
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
    @lazy.detectFieldChange(
        q => q.getLeftTop(),
        q => q.getLeftBottom()
    )
    @lazy.property(q => q.initLeftCenter())
    private leftCenter!: PolarPoint;
    @lazy.detectFieldChange(
        q => q.getRightTop(),
        q => q.getRightBottom()
    )
    @lazy.property(q => q.initRightCenter())
    private rightCenter!: PolarPoint;
    @lazy.detectFieldChange(
        q => q.getLeftTop(),
        q => q.getRightTop()
    )
    @lazy.property(q => q.initTopCenter())
    private topCenter!: PolarPoint;
    @lazy.detectFieldChange(
        q => q.getLeftBottom(),
        q => q.getRightBottom()
    )
    @lazy.property(q => q.initBottomCenter())
    private bottomCenter!: PolarPoint;
    @lazy.detectFieldChange(
        q => q.points,
        q => q.points[0],
        q => q.points[1],
        q => q.points[2],
        q => q.points[3]
    )
    @lazy.property(q => q.initCenter())
    private center!: PolarPoint;
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
    public addVector(vector: Vector, side: Direction) {
        switch (side) {
            case Direction.HORIZONTAL:
            case Direction.VERTICAL:
                return;
        }
        const indexes = this.getPointIndexArrayAt(side);
        if (Array.isArray(indexes)) {
            indexes.forEach(index => {
                this.points[index] = this.points[index].addVector(vector);
            });
        } else {
            const horizontalVector = new Vector(vector.x, 0);
            const verticalVector = new Vector(0, vector.y);
            indexes?.horizontal.forEach(index => {
                this.points[index] = this.points[index].addVector(horizontalVector);
            });
            indexes?.vertical.forEach(index => {
                this.points[index] = this.points[index].addVector(verticalVector);
            });
        }
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
    public getCenter(): PolarPoint {
        return this.center;
    }
    private getPointIndexArrayAt(side: Direction): SidePointIndexes | number[] {
        switch (side) {
            case Direction.LEFT:
                return [this.leftTopIndex, this.leftBottomIndex];
            case Direction.RIGHT:
                return [this.rightTopIndex, this.rightBottomIndex];
            case Direction.TOP:
                return [this.leftTopIndex, this.rightTopIndex];
            case Direction.BOTTOM:
                return [this.leftBottomIndex, this.rightBottomIndex];
            case Direction.LEFT_TOP:
                return {
                    horizontal: [this.leftTopIndex, this.leftBottomIndex],
                    vertical: [this.leftTopIndex, this.rightTopIndex]
                };
            case Direction.RIGHT_TOP:
                return {
                    horizontal: [this.rightTopIndex, this.rightBottomIndex],
                    vertical: [this.leftTopIndex, this.rightTopIndex]
                };
            case Direction.LEFT_BOTTOM:
                return {
                    horizontal: [this.leftBottomIndex, this.leftTopIndex],
                    vertical: [this.leftBottomIndex, this.rightBottomIndex]
                };
            case Direction.RIGHT_BOTTOM:
                return {
                    horizontal: [this.rightTopIndex, this.rightBottomIndex],
                    vertical: [this.leftBottomIndex, this.rightBottomIndex]
                };
            case Direction.ALL:
                return [this.leftTopIndex, this.rightTopIndex, this.rightBottomIndex, this.leftBottomIndex];
        }
        return [];
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
    private initCenter(): PolarPoint {
        const leftTop = this.getLeftTop();
        const rightBottom = this.getRightBottom();
        return leftTop.addVector(leftTop.vector(rightBottom).multiply(0.5));
    }
}
