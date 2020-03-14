import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { Side, getOppositeSite } from '../../foundation/Direction';
import DeformerEditor from '../DeformerEditor';
import DeformerEditorRenderer from '../DeformerEditorRenderer';
import { Vector } from '../../foundation/math/vector';

export class QuadrilateralEdgeController extends ContourController<Quadrilateral> {
    constructor(
        public readonly editor: DeformerEditor<Quadrilateral>,
        public side: Side,
        public readonly size: number = 10
    ) {
        super(editor.contour);
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
            fillStyle: '#00FFFF'
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
        if (this.isMouseOver) {
            this.editor.setCursor(this.getCursorClassName());
        }
    }
    public handlePanStart(e: EditorEvent) {
        this.contour.save();
        this.handlePanEvent(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.contour.restore();
        this.contour.save();
        this.handlePanEvent(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.contour.restore();
        this.handlePanEvent(e);
        this.contour.apply();
    }
    public handlePanEvent(e: EditorEvent) {
        this.contour.addVector(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION), this.side);
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
                cursorName = 'ne-resize';
            case Side.RIGHT_TOP:
                cursorName = 'nw-resize';
            case Side.RIGHT_BOTTOM:
                cursorName = 'se-resize';
            case Side.LEFT_BOTTOM:
                cursorName = 'ew-resize';
        }
        if (cursorName) {
            return 'deformer-editor--cursor-' + cursorName;
        } else {
            return this.editor.getCursorClass();
        }
    }
}
