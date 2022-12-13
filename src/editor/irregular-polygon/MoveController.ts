import MoveController from '../common/MoveController';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';
import { Vector } from '../../foundation/math/vector';
import { DeformerHandlerResult } from '../ContourController';

export default class IrregularMoveController extends MoveController<IrregularPolygon> {
    protected handleMove(move: Vector): DeformerHandlerResult<Vector> {
        this.contour.move(move);
        return {
            cacheData: move,
        };
    }
}
