import { Contour } from '../Contour';
import { PolarPoint } from '../math/coordinate/PolarCoordinate';
import { Lazy } from '../lazy';

const lazy = new Lazy<IrregularPolygon>();
export class IrregularPolygon extends Contour {
    /** FIXME: private */
    @lazy.resetBy('points')
    @lazy.property(it => it.resolveNonSelfIntersectingPoints())
    public nonSelfIntersectingPoints!: PolarPoint[];
    public getCenter(): AnyPoint {
        throw new Error('Method not implemented.');
    }
    public clone(): Contour {
        throw new Error('Method not implemented.');
    }
    public getAcreage(): number {
        throw new Error('Method not implemented.');
    }
    /** FIXME: private */
    public isSelfIntersecting(): boolean {
        return false;
    }
    private resolveNonSelfIntersectingPoints(): PolarPoint[] {
        return [];
    }
}
