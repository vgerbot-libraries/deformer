import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { Side, getOppositeSite } from '../../foundation/Direction';
import DeformerEditor from '../DeformerEditor';
import DeformerEditorRenderer from '../DeformerEditorRenderer';
import { Vector } from '../../foundation/math/vector';

export class QuadrilateralEdgeController extends ContourController<Quadrilateral> {
    constructor(editor: DeformerEditor<Quadrilateral>, public side: Side, public readonly size: number = 10) {
        super(editor);
    }
    public reverseDirection() {
        this.side = getOppositeSite(this.side);
    }
    public getDirectionName(): string {
        return Side[this.side].toLowerCase();
    }
    public getPoint(): PolarPoint {
        return this.contour.getPointBySide(this.side);
    }
    public render(renderer: DeformerEditorRenderer) {
        renderer.save();
        const point = this.getPoint();
        renderer.config({
            fillStyle: '#00FFFF',
            strokeStyle: '#FF00FF',
            textAlign: 'center',
            textBaseLine: 'bottom'
        });
        renderer.renderSquare(point, this.size);
        renderer.getContext().fill();
        renderer.renderText(point, this.getDirectionName());
        renderer.restore();
    }
    public handleMouseMove(position: MousePosition) {
        this.isMouseOver =
            this.getPoint()
                .vector(position.page)
                .length() < this.size;
        return {
            isMouseOver: this.isMouseOver
        };
    }
    public getCursorClass() {
        return this.getCursorClassName();
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
    public handlePanEvent(e: EditorEvent): ContourControllerHandleResult {
        this.contour.restore();
        this.contour.save();
        return this.handlePanEvent2(e);
    }
    public handlePanEvent2(e: EditorEvent): ContourControllerHandleResult {
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
            case Side.LEFT:
            case Side.TOP:
            case Side.RIGHT:
            case Side.BOTTOM:
                switchedSide = this.contour.addVector(move, this.side);
                this.editor.handleLimitation({ switchedSide });
                break;
        }
        this.editor.setTempVar('lastMoveX', lastMoveX);
        this.editor.setTempVar('lastMoveY', lastMoveY);
        return {
            switchedSide
        };
    }
    public handleLimitationBySelf() {
        return true;
    }
    protected getCursorClassName() {
        let cursorName;
        switch (this.side) {
            case Side.LEFT:
                cursorName = 'w-resize';
                break;
            case Side.RIGHT:
                cursorName = 'e-resize';
                break;
            case Side.TOP:
                cursorName = 'n-resize';
                break;
            case Side.BOTTOM:
                cursorName = 's-resize';
                break;
            case Side.LEFT_TOP:
                cursorName = 'nwse-resize';
                break;
            case Side.RIGHT_TOP:
                cursorName = 'nesw-resize';
                break;
            case Side.RIGHT_BOTTOM:
                cursorName = 'nwse-resize';
                break;
            case Side.LEFT_BOTTOM:
                cursorName = 'nesw-resize';
                break;
        }
        if (cursorName) {
            return 'deformer-editor--cursor-' + cursorName;
        } else {
            return this.editor.getCursorClass();
        }
    }
}
