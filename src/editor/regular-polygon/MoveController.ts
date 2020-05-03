import MoveController from '../common/MoveController';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { Vector } from '../../foundation/math/vector';
import { DeformerHandlerResult } from '../ContourController';

export default class RegularPolygonMoveController extends MoveController<RegularPolygon> {
    protected handleMove(move: Vector): DeformerHandlerResult<Vector> {
        this.contour.move(move);
        return {
            cacheData: move
        };
    }
}
