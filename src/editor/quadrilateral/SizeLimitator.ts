import { Side } from '../../foundation/Direction';
import { Interval } from '../../foundation/Interval';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import ContourController from '../ContourController';
import { DeformerLimitator } from '../DeformerLimitator';
import { QuadrilateralEdgeController } from './EdgeController';

export class SizeLimitator extends DeformerLimitator<Quadrilateral> {
    private widthInterval: Interval = Interval.NATURAL_NUMBER;
    private heightInterval: Interval = Interval.NATURAL_NUMBER;
    constructor(options: Partial<SizeLimitatorOptions>) {
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
export class WidthLimitator extends DeformerLimitator<Quadrilateral> {
    private widthInterval: Interval = Interval.NATURAL_NUMBER;
    constructor(minWidth: number = 0, maxWidth: number = Infinity) {
        super();
        this.widthInterval = Interval.closed(minWidth, maxWidth);
    }
    public handleIt(controller: ContourController<Quadrilateral>) {
        return (
            controller instanceof QuadrilateralEdgeController &&
            controller.side !== Side.TOP &&
            controller.side !== Side.BOTTOM
        );
    }
    public accept(contour: Quadrilateral): boolean {
        return this.widthInterval.contains(contour.getWidth());
    }
}

export class HeightLimitator extends DeformerLimitator<Quadrilateral> {
    private heightInterval: Interval = Interval.NATURAL_NUMBER;
    constructor(minWidth: number = 0, maxWidth: number = Infinity) {
        super();
        this.heightInterval = Interval.closed(minWidth, maxWidth);
    }
    public handleIt(controller: ContourController<Quadrilateral>) {
        return (
            controller instanceof QuadrilateralEdgeController &&
            controller.side !== Side.LEFT &&
            controller.side !== Side.RIGHT
        );
    }
    public accept(contour: Quadrilateral): boolean {
        return this.heightInterval.contains(contour.getHeight());
    }
}
