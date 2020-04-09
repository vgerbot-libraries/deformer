import { Quadrilateral } from '../../foundation/Quadrilateral';
import { Side } from '../../foundation/Direction';
import DeformerEditor from '../DeformerEditor';
import { Vector } from '../../foundation/math/vector';
import { QuadrilateralEdgeController } from './EdgeController';

export class QuadrilateralVertexController extends QuadrilateralEdgeController {
    constructor(editor: DeformerEditor<Quadrilateral>, public side: Side, public readonly size: number = 10) {
        super(editor, side, size);
    }
    public handleLimitationBySelf() {
        return true;
    }
    public handlePanStart(e: EditorEvent) {
        this.editor.setTempVar('lastMoveX', Vector.ZERO);
        this.editor.setTempVar('lastMoveY', Vector.ZERO);
        return this.handlePanEvent(e);
    }
    public handlePanMove(e: EditorEvent) {
        return this.handlePanEvent(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.contour.apply();
        return {};
    }
    protected handlePanEvent(e: EditorEvent): ContourControllerHandleResult {
        this.contour.restore();
        this.contour.save();
        const move = e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION);
        let lastMoveX = this.editor.getTempVar<Vector>('lastMoveX');
        let lastMoveY = this.editor.getTempVar<Vector>('lastMoveY');

        let switchedSide = false;
        switch (this.side) {
            case Side.LEFT_TOP:
            case Side.LEFT_BOTTOM:
                this.contour.save();
                switchedSide = this.contour.addVector(move, Side.LEFT);
                if (!this.editor.validateHandleResult({ switchedSide })) {
                    this.contour.restore();
                    this.contour.addVector(lastMoveX, Side.LEFT);
                } else {
                    this.contour.pop();
                    lastMoveX = move;
                }
                break;
            case Side.RIGHT_TOP:
            case Side.RIGHT_BOTTOM:
                this.contour.save();
                switchedSide = this.contour.addVector(move, Side.RIGHT);
                if (!this.editor.validateHandleResult({ switchedSide })) {
                    this.contour.restore();
                    this.contour.addVector(lastMoveX, Side.RIGHT);
                } else {
                    this.contour.pop();
                    lastMoveX = move;
                }
                break;
        }

        switch (this.side) {
            case Side.LEFT_TOP:
            case Side.RIGHT_TOP:
                this.contour.save();
                switchedSide = this.contour.addVector(move, Side.TOP) || switchedSide;
                if (!this.editor.validateHandleResult({ switchedSide })) {
                    this.contour.restore();
                    this.contour.addVector(lastMoveY, Side.TOP);
                } else {
                    this.contour.pop();
                    lastMoveY = move;
                }
                break;
            case Side.LEFT_BOTTOM:
            case Side.RIGHT_BOTTOM:
                this.contour.save();
                switchedSide = this.contour.addVector(move, Side.BOTTOM) || switchedSide;
                if (!this.editor.validateHandleResult({ switchedSide })) {
                    this.contour.restore();
                    this.contour.addVector(lastMoveY, Side.BOTTOM);
                } else {
                    this.contour.pop();
                    lastMoveY = move;
                }
                break;
        }
        this.editor.setTempVar('lastMoveX', lastMoveX);
        this.editor.setTempVar('lastMoveY', lastMoveY);
        return {
            switchedSide
        };
    }
}
