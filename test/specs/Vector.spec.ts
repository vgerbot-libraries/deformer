// tslint:disable: variable-name
import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';
import { expect } from 'chai';

describe('Vector', () => {
    it('should cross() work', () => {
        const origin = DeviceCoordinate.ORIGIN;
        const a = origin.point(0, 10);
        const b = origin.point(61, 10);
        const c = origin.point(20, 21);
        const d = origin.point(20, 11);

        const vca = c.vector(a);
        const vcd = c.vector(d);
        const vcb = c.vector(b);
        const cross_ca_cd = vca.cross(vcd);
        const radian_vca_vcd = vca.radian(vcd);
        const cross_ca_cdx = vca.length() * vcd.length() * Math.sin(Math.PI * 2 - radian_vca_vcd);
        expect(cross_ca_cd).to.be.closeTo(cross_ca_cdx, 1e-8);
        const cross_cd_ca = vcd.cross(vca);
        expect(cross_ca_cd).to.be.eql(-cross_cd_ca);

        const cross_cd_cb = vcd.cross(vcb);
        console.info(cross_ca_cd, cross_cd_cb);
    });
});
