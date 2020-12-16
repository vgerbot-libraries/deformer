import { DeviceCoordinate } from '../math/coordinate/DeviceCoordinate';
import { Contour } from '../Contour';
import { Vector } from '../math/vector';
import { CartesianCoordinate } from '../math/coordinate/CartesianCoordinate';
import { PolarCoordinatate, PolarPoint } from '../math/coordinate/PolarCoordinate';
import { AnyPoint } from '../math/coordinate/Coordinate';
import { Lazy } from '../lazy';
import { Side, getSideName } from '../Direction';

const DEVICE_ORIGIN = DeviceCoordinate.ORIGIN;
const TWO_PI = Math.PI * 2;

interface SidePointIndexes {
    left: number[];
    right: number[];
    top: number[];
    bottom: number[];
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
        return new Quadrilateral(leftTop, rightTop, rightBottom, leftBottom);
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
        return new Quadrilateral(leftTop, rightTop, rightBottom, leftBottom);
    }
    public static fromPoints(point1: AnyPoint, point2: AnyPoint, point3: AnyPoint, point4: AnyPoint): Quadrilateral {
        const [leftTop, rightTop, rightBottom, leftBottom] = Quadrilateral.collatePoints([
            point1.toDevice(),
            point2.toDevice(),
            point3.toDevice(),
            point4.toDevice()
        ]);
        return new Quadrilateral(leftTop, rightTop, rightBottom, leftBottom);
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
    private rotation: number = 0;
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
        q => q.getLeftTop(),
        q => q.getRightTop(),
        q => q.getRightBottom(),
        q => q.getLeftBottom()
    )
    @lazy.property(q => q.initCenter())
    private center!: PolarPoint;

    @lazy.detectFieldChange(
        q => q.leftCenter,
        q => q.rightCenter
    )
    @lazy.property(q => q.initWidth())
    private width!: number;
    @lazy.detectFieldChange(
        q => q.topCenter,
        q => q.bottomCenter
    )
    @lazy.property(q => q.initHeight())
    private height!: number;
    protected constructor(point1: AnyPoint, point2: AnyPoint, point3: AnyPoint, point4: AnyPoint) {
        super();
        super.addPoint(point1);
        super.addPoint(point2);
        super.addPoint(point3);
        super.addPoint(point4);
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
    public getWidth() {
        return this.width;
    }
    public getHeight() {
        return this.height;
    }
    public getPointBySide(side: Side): PolarPoint {
        switch (side) {
            case Side.LEFT:
                return this.getLeftCenter();
            case Side.LEFT_BOTTOM:
                return this.getLeftBottom();
            case Side.RIGHT:
                return this.getRightCenter();
            case Side.RIGHT_BOTTOM:
                return this.getRightBottom();
            case Side.TOP:
                return this.getTopCenter();
            case Side.BOTTOM:
                return this.getBottomCenter();
            case Side.LEFT_TOP:
                return this.getLeftTop();
            case Side.RIGHT_TOP:
                return this.getRightTop();
        }
        throw new Error(`Incorrect side: ${side}`);
    }
    public rotate(radian: number, origin = this.getCenter()) {
        this.rotation = (this.rotation + radian + TWO_PI) % TWO_PI;
        const coordinate = PolarCoordinatate.by(origin);
        this.points = this.points.map(p => p.toPolar(coordinate).rotate(radian));
    }
    public getRotationBaseOnCenter() {
        const c2tVec = this.getCenter().vector(this.getTopCenter());
        return (Math.PI / 2 - Math.atan2(c2tVec.y, c2tVec.x)) % TWO_PI;
    }
    public addVector(vector: Vector, side: Side): boolean {
        const doAddVector = (points: PolarPoint[], theSide: Side) => {
            const ground = this.getSideVector(theSide);
            const proj = vector.projection(ground);
            const sidePoints = this.getSidePoints(theSide);
            const sideName = getSideName(theSide);
            const width = this.getWidth();
            const height = this.getHeight();
            const rotationBaseOnCenter = this.getRotationBaseOnCenter();
            sidePoints[sideName]?.map(pindex => {
                points[pindex] = points[pindex].addVector(proj);
            });
            return this.collate(points, proj, theSide, rotationBaseOnCenter, width, height);
        };
        const doAddMulSideVector = (hside: Side, vside: Side) => {
            const points = this.points;
            let newPoints = doAddVector(points, hside);
            newPoints = doAddVector(newPoints, vside);
            this.points = newPoints;
            return points !== newPoints;
        };
        switch (side) {
            case Side.LEFT:
            case Side.TOP:
            case Side.RIGHT:
            case Side.BOTTOM: {
                const points = this.points;
                const newPoints = doAddVector(points, side);
                this.points = newPoints;
                return points !== newPoints;
            }
            case Side.LEFT_TOP:
                return doAddMulSideVector(Side.LEFT, Side.TOP);
            case Side.RIGHT_TOP:
                return doAddMulSideVector(Side.RIGHT, Side.TOP);
            case Side.RIGHT_BOTTOM:
                return doAddMulSideVector(Side.RIGHT, Side.BOTTOM);
            case Side.LEFT_BOTTOM:
                return doAddMulSideVector(Side.LEFT, Side.BOTTOM);
            case Side.ALL:
                this.points = this.points.map(it => it.addVector(vector));
                return true;
        }
        return false;
    }
    public straighten() {
        const vec = this.getLeftTop().vector(this.getRightTop());
        const r = Math.atan2(vec.x, vec.y);
        this.rotate(-r);
    }
    public setPoint(index: number, point: AnyPoint) {
        throw new Error('Unsupported operation!');
    }
    public addPoint(point: AnyPoint): number {
        throw new Error('Unsupported operation!');
    }
    public getCenter(): PolarPoint {
        return this.center;
    }
    public clone(): Quadrilateral {
        return new Quadrilateral(this.points[0], this.points[1], this.points[2], this.points[3]);
    }
    public getAcreage(): number {
        return 0;
    }
    private getSideVector(side: Side) {
        const center = this.getCenter();
        const point = this.getPointBySide(side);
        return center.vector(point);
    }
    private getSidePoints(side: Side): Partial<SidePointIndexes> {
        switch (side) {
            case Side.LEFT:
                return {
                    left: [this.leftTopIndex, this.leftBottomIndex]
                };
            case Side.TOP:
                return {
                    top: [this.leftTopIndex, this.rightTopIndex]
                };
            case Side.RIGHT:
                return {
                    right: [this.rightTopIndex, this.rightBottomIndex]
                };
            case Side.BOTTOM:
                return {
                    bottom: [this.leftBottomIndex, this.rightBottomIndex]
                };
            case Side.LEFT_TOP:
                return Object.assign(this.getSidePoints(Side.LEFT), this.getSidePoints(Side.TOP));
            case Side.RIGHT_TOP:
                return Object.assign(this.getSidePoints(Side.RIGHT), this.getSidePoints(Side.TOP));
            case Side.RIGHT_BOTTOM:
                return Object.assign(this.getSidePoints(Side.RIGHT), this.getSidePoints(Side.BOTTOM));
            case Side.LEFT_BOTTOM:
                return Object.assign(this.getSidePoints(Side.LEFT), this.getSidePoints(Side.BOTTOM));
        }
        return {};
    }
    private collate(
        points: PolarPoint[],
        offset: Vector,
        side: Side,
        rotationBaseOnCenter,
        width: number,
        height: number
    ): PolarPoint[] {
        let switchHorizontal = false;
        let switchVertical = false;
        const offsetSize = offset.length();
        const dir = offset.rotate(rotationBaseOnCenter);
        if (offsetSize > width) {
            switch (side) {
                case Side.LEFT:
                    switchHorizontal = dir.x > 0;
                    break;
                case Side.RIGHT:
                    switchHorizontal = dir.x < 0;
                    break;
            }
        }
        if (offsetSize > height) {
            switch (side) {
                case Side.TOP:
                    switchVertical = dir.y < 0;
                    break;
                case Side.BOTTOM:
                    switchVertical = dir.y > 0;
                    break;
            }
        }
        let leftTopIndex = this.leftTopIndex;
        let rightTopIndex = this.rightTopIndex;
        let rightBottomIndex = this.rightBottomIndex;
        let leftBottomIndex = this.leftBottomIndex;

        if (switchHorizontal) {
            leftTopIndex = this.rightTopIndex;
            rightTopIndex = this.leftTopIndex;
            rightBottomIndex = this.leftBottomIndex;
            leftBottomIndex = this.rightBottomIndex;
        }
        if (switchVertical) {
            let tmp = leftBottomIndex;
            leftBottomIndex = leftTopIndex;
            leftTopIndex = tmp;
            tmp = rightBottomIndex;
            rightBottomIndex = rightTopIndex;
            rightTopIndex = tmp;
        }
        if (switchHorizontal || switchVertical) {
            return [points[leftTopIndex], points[rightTopIndex], points[rightBottomIndex], points[leftBottomIndex]];
        } else {
            return points;
        }
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
    private initWidth(): number {
        return this.getLeftTop()
            .vector(this.getRightTop())
            .length();
    }
    private initHeight(): number {
        return this.getLeftTop()
            .vector(this.getLeftBottom())
            .length();
    }
}
