import MoveController from '../common/MoveController';
import { RegularPolygon, IrregularPolygon } from '../../foundation/Polygon';
import { Vector } from '../../foundation/math/vector';

export default class RegularPolygonMoveController extends MoveController<RegularPolygon & IrregularPolygon> {
    protected handleMove(e: EditorEvent): ContourControllerHandleResult {
        this.contour.move(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION));
        return {};
    }
}
