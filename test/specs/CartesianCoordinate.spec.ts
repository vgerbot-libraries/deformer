import { expect } from 'chai';
import { CartesianCoordinate } from '../../src/foundation/math/coordinate/CartesianCoordinate';
import { Vector } from '../../src/foundation/math/vector';
import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';
import { PolarCoordinatate } from '../../src/foundation/math/coordinate/PolarCoordinate';

const MIN_ACCURACY = 0.001;

describe('Cartesian Coordinate system', () => {
    let coordinate: CartesianCoordinate;
    before(() => {
        coordinate = new CartesianCoordinate(1, 1);
    });
    it('create cartesian point', () => {
        const point = coordinate.point(1, 1);
        expect(point.x).to.be.eql(1);
        expect(point.y).to.be.eql(1);
    });
    it('point addVector', () => {
        const point = coordinate.point(1,1);
        const npoint = point.addVector(new Vector(1, 1));
        expect(npoint.x).to.be.eq(2);
        expect(npoint.y).to.be.eq(2);
    });
    it('point vector', () => {
        const from = coordinate.point(0, 0);
        const to = coordinate.point(1, 1);
        const ftVector = from.vector(to);
        expect(ftVector.x).to.be.eql(1);
        expect(ftVector.y).to.be.eql(1);
        const tfVector = to.vector(from);
        expect(tfVector.x).to.be.eql(-1);
        expect(tfVector.y).to.be.eql(-1);
    });
    it('point rotation', () => {
        const point = coordinate.point(1, 1);
        const rotated = point.rotate(Math.PI / 4);
        expect(rotated.x).to.be.closeTo(0, MIN_ACCURACY);
        expect(rotated.y).to.be.closeTo(Math.sqrt(2), MIN_ACCURACY);
    });
    it('convert to device point', () => {
        const point = coordinate.point(1, 1);
        const devicePoint = point.toDevice(
            new DeviceCoordinate(coordinate.originX, coordinate.originY)
        );
        expect(devicePoint.x).to.be.eq(1);
        expect(devicePoint.y).to.be.eq(-1);
        expect(devicePoint.getDeviceX()).to.be.eq(2);
        expect(devicePoint.getDeviceY()).to.be.eq(0);
    });
    it('convert to cartesian point', () => {
        const point = coordinate.point(1, 1);
        const cp1 = point.toCartesian(coordinate);
        expect(cp1.x).to.be.eql(point.x);
        expect(cp1.y).to.be.eql(point.y);
        const cp2 = point.toCartesian(new CartesianCoordinate(0, 0));
        expect(cp2.x).to.be.eql(2);
        expect(cp2.y).to.be.eql(0);
    });
    it('convert to polar point', () => {
        const point = coordinate.point(1, 1);
        const polar = point.toPolar(
            new PolarCoordinatate(coordinate.originX, coordinate.originY)
        );
        expect(polar.sita).to.be.closeTo(Math.PI / 4, MIN_ACCURACY);
        expect(polar.r).to.be.closeTo(Math.sqrt(2), MIN_ACCURACY);
    });
    it('convertion', () => {
        const point = coordinate.point(1, 1);
        const converted = point
            .toDevice()
            .toPolar()
            .toCartesian(coordinate);
        expect(point.x).to.be.closeTo(converted.x, MIN_ACCURACY);
        expect(point.y).to.be.closeTo(converted.y, MIN_ACCURACY);
    });
});
