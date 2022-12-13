import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import ContourDeformer from '../Deformer';
import { Side } from '../../foundation/Direction';
import { Vector } from '../../foundation/math/vector';
import MoveController from '../common/MoveController';
import { DeformerHandlerResult } from '../ContourController';

export default class QuadrilateralMoveController extends MoveController<Quadrilateral> {
    constructor(public readonly editor: ContourDeformer<Quadrilateral>) {
        super(editor);
    }
    protected handleMove(move: Vector): DeformerHandlerResult<Vector> {
        this.contour.addVector(move, Side.ALL);
        return {
            cacheData: move,
        };
    }
}
