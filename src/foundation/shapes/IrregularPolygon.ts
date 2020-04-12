import { Contour } from '../Contour';
import { PolarPoint } from '../math/coordinate/PolarCoordinate';
import { Lazy } from '../lazy';

const lazy = new Lazy<IrregularPolygon>();
export class IrregularPolygon extends Contour {
    @lazy.resetBy('points')
    @lazy.property(it => it.resolveNonSelfIntersectingPoints())
    private nonSelfIntersectingPoints!: PolarPoint[];
    public getCenter(): AnyPoint {
        throw new Error('Method not implemented.');
    }
    public clone(): Contour {
        throw new Error('Method not implemented.');
    }
    public getAcreage(): number {
        throw new Error('Method not implemented.');
    }
    private isSelfIntersecting(): boolean {
        return false;
    }
    private resolveNonSelfIntersectingPoints(): PolarPoint[] {
        return [];
    }
}
