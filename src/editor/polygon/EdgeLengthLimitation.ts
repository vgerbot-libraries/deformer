import { DeformerLimitation } from '../DeformerLimitation';
import { RegularPolygon } from '../../foundation/Polygon';
import ContourController from '../ContourController';
import { RegularPolygonVertexController } from './RegularPolygonVertexController';
import { Interval } from '../../foundation/Interval';

export default class EdgeLengthLimitation extends DeformerLimitation<RegularPolygon> {
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
