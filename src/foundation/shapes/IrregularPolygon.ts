import { Contour } from '../Contour';

export class IrregularPolygon extends Contour {
    public getCenter(): AnyPoint {
        throw new Error('Method not implemented.');
    }
    public clone(): Contour {
        throw new Error('Method not implemented.');
    }
    public getAcreage(): number {
        throw new Error('Method not implemented.');
    }
}
