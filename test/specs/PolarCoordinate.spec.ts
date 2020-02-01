import { expect } from 'chai';
import { PolarCoordinatate } from '../../src/foundation/math/coordinate/PolarCoordinate';
import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';
import { Vector } from '../../src/foundation/math/vector';
import { CartesianCoordinate } from '../../src/foundation/math/coordinate/CartesianCoordinate';

const MIN_ACCURACY = 0.001;

describe('Polar Coordinate system', () => {
    let coordinate: PolarCoordinatate;
    before(() => {
        coordinate = new PolarCoordinatate(1, 1);
    });
    it('create polar point', () => {
        const point = coordinate.point(Math.PI / 4, Math.sqrt(2));
        expect(point.sita).to.be.eql(Math.PI / 4);
        expect(point.r).to.be.eql(Math.sqrt(2));
    });
    it('point addVector', () => {
        const point = coordinate.point(Math.PI / 4, Math.sqrt(2));
        const ap = point.addVector(new Vector(1, 1));
        expect(point.sita).to.be.closeTo(ap.sita, MIN_ACCURACY);
        expect(ap.r).to.be.closeTo(2 * Math.sqrt(2), MIN_ACCURACY);
    });
    it('convert to device point', () => {
        const point = coordinate.point(Math.PI / 4, Math.sqrt(2));
        const dpoint = point.toDevice(
            new DeviceCoordinate(coordinate.originX, coordinate.originY)
        );
        expect(dpoint.x).to.be.closeTo(1, MIN_ACCURACY);
        expect(dpoint.y).to.be.closeTo(-1, MIN_ACCURACY);
    });
    it('convert to cartesian point', () => {
        const point = coordinate.point(Math.PI / 4, Math.sqrt(2));
        const dpoint = point.toCartesian(
            new CartesianCoordinate(coordinate.originX, coordinate.originY)
        );
        expect(dpoint.x).to.be.closeTo(1, MIN_ACCURACY);
        expect(dpoint.y).to.be.closeTo(1, MIN_ACCURACY);
    });
    it('convert to polar point', () => {
        const point = coordinate.point(Math.PI / 4, Math.sqrt(2));
        const convertedPoint = point.toPolar(
            new PolarCoordinatate(coordinate.originX, coordinate.originY)
        );
        expect(convertedPoint.sita).to.be.closeTo(Math.PI / 4, MIN_ACCURACY);
        expect(convertedPoint.r).to.be.closeTo(Math.sqrt(2), MIN_ACCURACY);
    });
});
