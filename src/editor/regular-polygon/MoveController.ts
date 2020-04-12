import MoveController from '../common/MoveController';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { Vector } from '../../foundation/math/vector';

export default class RegularPolygonMoveController extends MoveController<RegularPolygon> {
    protected handleMove(e: EditorEvent): ContourControllerHandleResult {
        this.contour.move(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION));
        return {};
    }
}
