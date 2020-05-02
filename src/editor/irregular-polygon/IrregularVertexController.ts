import ContourController from '../ContourController';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';
import DeformerRenderer from '../DeformerRenderer';
import { IrregularPolygonDeformer } from './IrregularPolygonDeformer';
import { Vector } from '../../foundation/math/vector';

export default class IrregularPolygonVertexController extends ContourController<IrregularPolygon> {
    constructor(editor: IrregularPolygonDeformer, private index: number, private readonly size: number) {
        super(editor);
    }
    public getCursorClass() {
        return 'deformer-editor--cursor-pointer';
    }
    public handleMouseMove(position: MousePosition): ContourControllerHandleResult {
        this.isMouseOver =
            this.getPoint()
                .vector(position.page)
                .length() < this.size;
        return {
            isMouseOver: this.isMouseOver
        };
    }
    public handlePanStart(e: EditorEvent): ContourControllerHandleResult {
        return this.handlePanEvent(e);
    }
    public handlePanMove(e: EditorEvent): ContourControllerHandleResult {
        return this.handlePanEvent(e);
    }
    public handlePanStop(e: EditorEvent): ContourControllerHandleResult {
        this.contour.apply();
        return {};
    }
    public render(renderer: DeformerRenderer) {
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
    private handlePanEvent(e: EditorEvent): ContourControllerHandleResult {
        this.contour.restore();
        this.contour.save();
        const newPoint = this.getPoint().addVector(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION));
        this.contour.setPoint(this.index, newPoint);
        return {};
    }
    private getPoint() {
        return this.contour.getPointAt(this.index);
    }
}
