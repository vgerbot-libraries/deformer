import { DeformerLimitation } from '../DeformerLimitation';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import { Interval } from '../../foundation/Interval';
import ContourController from '../ContourController';
import { QuadrilateralEdgeController } from './EdgeController';

export class SizeLimitation extends DeformerLimitation<Quadrilateral> {
    private widthInterval: Interval = Interval.NATURAL_NUMBER;
    private heightInterval: Interval = Interval.NATURAL_NUMBER;
    constructor(options: Partial<SizeLimitationOptions>) {
        super();
        this.widthInterval = Interval.closed(options.minWidth || 0, options.maxWidth || Infinity);
        this.heightInterval = Interval.closed(options.minHeight || 0, options.maxHeight || Infinity);
    }
    public handleIt(controller: ContourController<Quadrilateral>) {
        return controller instanceof QuadrilateralEdgeController;
    }
    public accept(contour: Quadrilateral): boolean {
        return this.widthInterval.contains(contour.getWidth()) && this.heightInterval.contains(contour.getHeight());
    }
}
