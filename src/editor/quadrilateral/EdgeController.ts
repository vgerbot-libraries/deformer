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
        const switchedSide = this.contour.addVector(move, this.side);
        return {
            switchedSide
        };
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
