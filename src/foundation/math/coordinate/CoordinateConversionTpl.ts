import { Coordinate, Point } from './Coordinate';
import { DeviceCoordinate } from './DeviceCoordinate';
import { CartesianCoordinate } from './CartesianCoordinate';
import { PolarCoordinatate } from './PolarCoordinate';

export abstract class CoordinateConvertionTpl<T extends Point<any>> extends Coordinate<T> {
    public toDevice() {
        return new DeviceCoordinate(this.originX, this.originY);
    }
    public toCartesian() {
        return new CartesianCoordinate(this.originX, this.originY);
    }
    public toPolar() {
        return new PolarCoordinatate(this.originX, this.originY);
    }
}
