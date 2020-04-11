import MoveController from '../common/MoveController';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { Vector } from '../../foundation/math/vector';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';

export default class RegularPolygonMoveController extends MoveController<RegularPolygon & IrregularPolygon> {
    protected handleMove(e: EditorEvent): ContourControllerHandleResult {
        this.contour.move(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION));
        return {};
    }
}
