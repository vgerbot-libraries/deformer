import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import { PolarPoint } from '../../foundation/math/coordinate/PolarCoordinate';
import { Side, getOppositeSite } from '../../foundation/Direction';
import DeformerEditor from '../DeformerEditor';
import DeformerEditorRenderer from '../DeformerEditorRenderer';

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
        switch (this.side) {
            case Side.LEFT:
            case Side.RIGHT:
                this.contour.addVector(e.move.vecx(), this.side);
                break;
            case Side.TOP:
            case Side.BOTTOM:
                this.contour.addVector(e.move.vecy().negate(), this.side);
                break;
        }
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
        }
        if (cursorName) {
            return 'deformer-editor--cursor-' + cursorName;
        } else {
            return this.editor.getCursorClass();
        }
    }
}
