import MoveController from '../common/MoveController';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';
import { Vector } from '../../foundation/math/vector';

export default class IrregularMoveController extends MoveController<IrregularPolygon> {
    protected handleMove(e: EditorEvent): ContourControllerHandleResult {
        this.contour.move(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION));
        return {};
    }
}
