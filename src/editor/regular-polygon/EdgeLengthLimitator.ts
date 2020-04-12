import { DeformerLimitator } from '../DeformerLimitator';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import ContourController from '../ContourController';
import { RegularPolygonVertexController } from './RegularPolygonVertexController';
import { Interval } from '../../foundation/Interval';

export default class EdgeLengthLimitator extends DeformerLimitator<RegularPolygon> {
    constructor(private readonly interval: Interval) {
        super();
    }
    public handleIt(controller: ContourController<RegularPolygon>): boolean {
        return controller instanceof RegularPolygonVertexController;
    }
    public accept(contour: RegularPolygon) {
        return this.interval.contains(contour.getEdgeLength());
    }
}
