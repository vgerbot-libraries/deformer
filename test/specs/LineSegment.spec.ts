import { DeviceCoordinate } from '../../src/foundation/math/coordinate/DeviceCoordinate';
import LineSegment from '../../src/foundation/math/LineSegment';
import { Vector } from '../../src/foundation/math/vector';
import { expect } from 'chai';

describe('LineSegment', () => {
    const origin = DeviceCoordinate.ORIGIN;
    it('should translate() work', () => {
        const line = new LineSegment(origin.point(0, 0), origin.point(13, 21));
        const lineb = LineSegment.translate(line, new Vector(10, 10));
        const delta = 1e-8;
        expect(lineb.getStartPoint().distanceTo(origin.point(10, 10))).to.be.closeTo(0, delta);
        expect(lineb.getEndPoint().distanceTo(origin.point(23, 31))).to.be.closeTo(0, delta);
    });
    describe('line segment crossing', () => {
        it('parallel lines should not be intersect', () => {
            const linea = new LineSegment(origin.point(11, 13), origin.point(31, 54));
            const lineb = LineSegment.translate(linea, new Vector(11, 13));
            expect(linea.isCross(lineb)).to.be.false;
            expect(lineb.isCross(linea)).to.be.false;
        });
        it('the same line should not be intersect', () => {
            const linea = new LineSegment(origin.point(10, 13), origin.point(17, 21));
            const lineb = linea.clone();
            expect(linea.isCross(lineb)).to.be.false;
            expect(linea.isCross(linea)).to.be.false;
        });
        const lineSegments = [
            [[0, 10, 11, 31], [0, 21, 14, 10], true],
            [[0, 10, 61, 10], [20, 21, 20, 0], true],
            [[0, 10, 61, 10], [20, 21, 20, 11], false]
        ];
        lineSegments
            .map(([a, b, isCross]) => {
                return {
                    linea: new LineSegment(origin.point(a[0], a[1]), origin.point(a[2], a[3])),
                    lineb: new LineSegment(origin.point(b[0], b[1]), origin.point(b[2], b[3])),
                    isCross: isCross as boolean
                };
            })
            .forEach(({ linea, lineb, isCross }) => {
                const lineToString = (line: LineSegment) => {
                    const sp = line.getStartPoint().toDevice();
                    const ep = line.getEndPoint().toDevice();
                    return `{(${sp.x},${sp.y})->(${ep.x}, ${ep.y})}`;
                };
                it(`line${lineToString(linea)} and line${lineToString(lineb)} should be intersect`, () => {
                    expect(linea.isCross(lineb)).to.be.eql(isCross);
                    expect(lineb.isCross(linea)).to.be.eql(isCross);
                });
            });
    });
});
