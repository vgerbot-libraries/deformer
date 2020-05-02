import { Contour } from '../Contour';
import { PolarPoint } from '../math/coordinate/PolarCoordinate';
import { Lazy } from '../lazy';
import { DeviceCoordinate } from '../math/coordinate/DeviceCoordinate';
import UnsupportedError from '../error/UnsupportedError';

const lazy = new Lazy<IrregularPolygon>();
export class IrregularPolygon extends Contour {
    @lazy.resetBy('points')
    @lazy.property(it => it.computeCenterPoint())
    private center!: PolarPoint;
    public getCenter(): AnyPoint {
        return this.center;
    }
    public clone(): IrregularPolygon {
        const polygon = new IrregularPolygon();
        polygon.resetAllPoints(this.points.slice(0));
        return polygon;
    }
    public getAcreage(): number {
        throw new UnsupportedError();
    }
    private computeCenterPoint(): PolarPoint {
        let sumX: number = 0;
        let sumY: number = 0;
        this.points.forEach(point => {
            const p = point.toDevice();
            sumX += p.x;
            sumY += p.y;
        });
        const centerX = sumX / this.points.length;
        const centerY = sumY / this.points.length;
        return DeviceCoordinate.ORIGIN.point(centerX, centerY).toPolar();
    }
}
