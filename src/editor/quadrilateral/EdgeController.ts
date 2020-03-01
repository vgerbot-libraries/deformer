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
        const hsize = this.size * 0.5;
        const point = this.getPoint();
        const leftTopPoint = point.addVector(new Vector(-hsize, hsize));
        const rightBottomPoint = point.addVector(new Vector(hsize, -hsize));
        renderer.config({
            fillStyle: '#00FFFF'
        });
        renderer.renderSquare(leftTopPoint, rightBottomPoint, true);
        renderer.getContext().fill();
        renderer.restore();
    }
    public handleMouseMove(position: MousePosition) {
        this.isMouseOver =
            this.getPoint()
                .vector(position.page)
                .length() < this.size;
    }
    public handlePanStart(e: EditorEvent) {
        this.handlePanEvent(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.handlePanEvent(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.handlePanEvent(e);
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
}
