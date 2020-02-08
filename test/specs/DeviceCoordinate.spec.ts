import { expect } from 'chai';
import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';
import { Vector } from '../../src/foundation/math/vector';
import { PolarCoordinatate } from '../../src/foundation/math/coordinate/PolarCoordinate';
import { CartesianCoordinate } from '../../src/foundation/math/coordinate/CartesianCoordinate';

const MIN_ACCURACY = 0.0001;

describe('Device Coordinate system', () => {
    let coordinate: DeviceCoordinate;
    before(() => {
        coordinate = new DeviceCoordinate(1, 1);
    });
    it('create point(0,0)', () => {
        const point = coordinate.point(0, 0);
        expect(point.x).to.be.eq(0);
        expect(point.y).to.be.eq(0);
        expect(point.getDeviceX()).to.be.eq(coordinate.originX);
        expect(point.getDeviceY()).to.be.eq(coordinate.originY);
    });
    it('point addVector', () => {
        const newPoint = coordinate.point(0, 0).addVector(new Vector(1, 1));
        expect(newPoint.x).to.be.eql(1);
        expect(newPoint.y).to.be.eql(1);
        expect(newPoint.getDeviceX()).to.be.eql(coordinate.originX + 1);
        expect(newPoint.getDeviceY()).to.be.eql(coordinate.originY + 1);
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
    it('device point rotation', () => {
        const rotatedPoint = coordinate.point(1, 1).rotate(Math.PI / 2);
        expect(rotatedPoint.x).to.be.closeTo(-1, MIN_ACCURACY);
        expect(rotatedPoint.y).to.be.closeTo(1, MIN_ACCURACY);
    });
    it('solve equation', () => {
        const fp = coordinate.point(0, 0);
        const tp = coordinate.point(1, 2);
        const ft = fp.solveEquation(tp);
        expect(ft.b).to.be.eql(0);
        expect(ft.k).to.be.eql(2);

        const tf = tp.solveEquation(fp);
        expect(tf.b).to.be.eql(0);
        expect(tf.k).to.be.eql(2);
    });
    it('convert to device coordinate', () => {
        const point = coordinate.point(1, 2);
        const converted = point.toDevice(coordinate);
        expect(converted.x).to.be.eql(point.x);
        expect(converted.y).to.be.eql(point.y);
    });
    it('convert to polar coordinate', () => {
        const point = coordinate.point(1, 1);
        const polar = new PolarCoordinatate(coordinate.originX, coordinate.originY);
        const polarPoint = point.toPolar(polar);
        expect(polarPoint.sita).to.be.closeTo(Math.PI / 4, MIN_ACCURACY);
        expect(polarPoint.r).to.be.closeTo(Math.sqrt(2), MIN_ACCURACY);
    });
    it('convert to cartesian coordinate', () => {
        const point = coordinate.point(1, 1);
        const cartesian = new CartesianCoordinate(coordinate.originX, coordinate.originY);
        const cartesianPoint = point.toCartesian(cartesian);
        expect(cartesianPoint.x).to.be.eql(1);
        expect(cartesianPoint.y).to.be.eql(-1);
    });
});
