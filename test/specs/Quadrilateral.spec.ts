import { expect } from 'chai';
import { Quadrilateral } from '../../src/foundation/Quadrilateral';
import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';

const MIN_ACCURACY = 0.001;

describe('Quadrilateral', () => {
    let dom: HTMLElement;
    before(() => {
        dom = document.createElement('div');
        dom.style.cssText = `
            display: block;
            width: 100px;
            height: 100px;
            left: 45px;
            top: 63px;
            position: fixed;
        `;
        document.body.appendChild(dom);
    });
    it('create quadrilateral from DOM', () => {
        const quad = Quadrilateral.fromDOMElement(dom);
        const rect = dom.getBoundingClientRect();
        const leftTop = quad.getLeftTop().toDevice(DeviceCoordinate.ORIGIN);
        expect(leftTop.getDeviceX()).to.be.closeTo(rect.left, MIN_ACCURACY);
        expect(leftTop.getDeviceY()).to.be.closeTo(rect.top, MIN_ACCURACY);
        const rightTop = quad.getRightTop().toDevice(DeviceCoordinate.ORIGIN);
        expect(rightTop.getDeviceX()).to.be.closeTo(rect.right, MIN_ACCURACY);
        expect(rightTop.getDeviceY()).to.be.closeTo(rect.top, MIN_ACCURACY);

        const rightBottom = quad.getRightBottom().toDevice(DeviceCoordinate.ORIGIN);
        expect(rightBottom.getDeviceX()).to.be.closeTo(rect.right, MIN_ACCURACY);
        expect(rightBottom.getDeviceY()).to.be.closeTo(rect.bottom, MIN_ACCURACY);
        const leftBottom = quad.getLeftBottom().toDevice(DeviceCoordinate.ORIGIN);
        expect(leftBottom.getDeviceX()).to.be.closeTo(rect.left, MIN_ACCURACY);
        expect(leftBottom.getDeviceY()).to.be.closeTo(rect.bottom, MIN_ACCURACY);
    });
    it('addLeftOffset', () => {
        const quad = Quadrilateral.fromDOMElement(dom);
        console.info(quad);
        const rect = dom.getBoundingClientRect();
        const offset = -10;
        quad.addLeftOffset(offset);

        const leftTop = quad.getLeftTop().toDevice(DeviceCoordinate.ORIGIN);
        expect(leftTop.getDeviceX()).to.be.closeTo(rect.left + offset, MIN_ACCURACY);
        expect(leftTop.getDeviceY()).to.be.closeTo(rect.top, MIN_ACCURACY);
        const rightTop = quad.getRightTop().toDevice(DeviceCoordinate.ORIGIN);
        expect(rightTop.getDeviceX()).to.be.closeTo(rect.right, MIN_ACCURACY);
        expect(rightTop.getDeviceY()).to.be.closeTo(rect.top, MIN_ACCURACY);

        const rightBottom = quad.getRightBottom().toDevice(DeviceCoordinate.ORIGIN);
        expect(rightBottom.getDeviceX()).to.be.closeTo(rect.right, MIN_ACCURACY);
        expect(rightBottom.getDeviceY()).to.be.closeTo(rect.bottom, MIN_ACCURACY);
        const leftBottom = quad.getLeftBottom().toDevice(DeviceCoordinate.ORIGIN);
        expect(leftBottom.getDeviceX()).to.be.closeTo(rect.left + offset, MIN_ACCURACY);
        expect(leftBottom.getDeviceY()).to.be.closeTo(rect.bottom, MIN_ACCURACY);
    });

    it('addRightOffset', () => {
        const quad = Quadrilateral.fromDOMElement(dom);
        const rect = dom.getBoundingClientRect();
        const offset = 10;
        quad.addRightOffset(offset);

        const leftTop = quad.getLeftTop().toDevice(DeviceCoordinate.ORIGIN);
        expect(leftTop.getDeviceX()).to.be.closeTo(rect.left, MIN_ACCURACY);
        expect(leftTop.getDeviceY()).to.be.closeTo(rect.top, MIN_ACCURACY);
        const rightTop = quad.getRightTop().toDevice(DeviceCoordinate.ORIGIN);
        expect(rightTop.getDeviceX()).to.be.closeTo(rect.right + offset, MIN_ACCURACY);
        expect(rightTop.getDeviceY()).to.be.closeTo(rect.top, MIN_ACCURACY);

        const rightBottom = quad.getRightBottom().toDevice(DeviceCoordinate.ORIGIN);
        expect(rightBottom.getDeviceX()).to.be.closeTo(rect.right + offset, MIN_ACCURACY);
        expect(rightBottom.getDeviceY()).to.be.closeTo(rect.bottom, MIN_ACCURACY);
        const leftBottom = quad.getLeftBottom().toDevice(DeviceCoordinate.ORIGIN);
        expect(leftBottom.getDeviceX()).to.be.closeTo(rect.left, MIN_ACCURACY);
        expect(leftBottom.getDeviceY()).to.be.closeTo(rect.bottom, MIN_ACCURACY);
    });
    after(() => {
        document.body.removeChild(dom);
    });
});
