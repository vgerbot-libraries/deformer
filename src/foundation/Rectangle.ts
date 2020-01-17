import { Quadrilateral } from './Quadrilateral';
import { DeviceCoordinate } from './math/coordinate/DeviceCoordinate';
import { CartesianCoordinate } from './math/coordinate/CartesianCoordinate';

type AnyCoordinate = DeviceCoordinate | CartesianCoordinate;

export default class Rectangle extends Quadrilateral {
    public static create(coord: AnyCoordinate, left: number, right: number, top: number, bottom: number) {
        const leftTop = coord.point(left, top);
        const rightTop = coord.point(right, top);
        const leftBottom = coord.point(left, bottom);
        const rightBottom = coord.point(right, bottom);
        const center = coord.point(left + (right - left) * 0.5, top + (bottom - top) * 0.5);
        return new Rectangle(leftTop, rightTop, rightBottom, leftBottom, center);
    }
    public getLeft(coord?: AnyCoordinate) {
        if (coord) {
            return coord.convertFrom(this.getLeftTop()).x;
        }
        return this.getLeftTop()
            .toDevice()
            .getDeviceX();
    }
    public getTop(coord?: AnyCoordinate) {
        if (coord) {
            return coord.convertFrom(this.getLeftTop()).y;
        }
        return this.getLeftTop()
            .toDevice()
            .getDeviceY();
    }
    public getRight(coord: AnyCoordinate) {
        if (coord) {
            return coord.convertFrom(this.getRightTop()).x;
        }
        return this.getRightTop()
            .toDevice()
            .getDeviceX();
    }
    public getBottom(coord: AnyCoordinate) {
        if (coord) {
            return coord.convertFrom(this.getRightBottom()).y;
        }
        return this.getRightBottom()
            .toDevice()
            .getDeviceY();
    }
}
