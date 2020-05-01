import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import ContourDeformer from '../Deformer';
import { Side } from '../../foundation/Direction';
import { Vector } from '../../foundation/math/vector';
import MoveController from '../common/MoveController';

export default class QuadrilateralMoveController extends MoveController<Quadrilateral> {
    constructor(public readonly editor: ContourDeformer<Quadrilateral>) {
        super(editor);
    }
    protected handleMove(e: EditorEvent): ContourControllerHandleResult {
        this.editor.contour.addVector(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION), Side.ALL);
        return {};
    }
}
