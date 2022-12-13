import ContourController, { DeformerHandler } from '../ContourController';
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
        this.isMouseOver = this.getPoint().vector(position.page).length() < this.size;
        return {
            isMouseOver: this.isMouseOver,
        };
    }
    public render(renderer: DeformerRenderer) {
        renderer.save();
        const point = this.getPoint();
        renderer.config({
            fillStyle: '#00FFFF',
            strokeStyle: '#FF00FF',
            textAlign: 'center',
            textBaseLine: 'bottom',
        });
        renderer.renderSquare(point, this.size);
        renderer.getContext().fill();
        renderer.restore();
    }
    public deformerHandlers(e: EditorEvent): Array<DeformerHandler<AnyPoint>> {
        return [
            {
                cacheResultKey: 'irregular-vertex-point',
                handle: () => {
                    const move = e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION);
                    const newPoint = this.getPoint().addVector(move);
                    this.contour.setPoint(this.index, newPoint);
                    return {
                        cacheData: newPoint,
                    };
                },
                undo: (lastPoint?: AnyPoint) => {
                    if (lastPoint) {
                        this.contour.setPoint(this.index, lastPoint);
                    }
                },
            },
        ];
    }
    private getPoint() {
        return this.contour.getPointAt(this.index);
    }
}
