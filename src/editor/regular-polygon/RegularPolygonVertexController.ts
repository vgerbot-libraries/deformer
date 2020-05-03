import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import ContourController, { DeformerHandler } from '../ContourController';
import ContourDeformer from '../Deformer';
import DeformerRenderer from '../DeformerRenderer';

export class RegularPolygonVertexController extends ContourController<RegularPolygon> {
    constructor(
        editor: ContourDeformer<RegularPolygon>,
        public index: number,
        public readonly size: number,
        private rotatable: boolean
    ) {
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
    public deformerHandlers(e: EditorEvent): Array<DeformerHandler<number>> {
        const point = this.getPoint();
        const center = this.contour.getCenter();
        const newPoint = e.position.page;
        const c2p = center.vector(point);
        const nc2p = center.vector(newPoint);
        const handles = [
            {
                cacheResultKey: 'regular-polygon-vertex-expansion',
                handle: () => {
                    const expansion = nc2p.length() - c2p.length();
                    this.contour.expansion(expansion);
                    return {
                        cacheData: expansion
                    };
                },
                undo: (lastExpansion?: number) => {
                    if (typeof lastExpansion === 'number') {
                        this.contour.expansion(lastExpansion);
                    }
                }
            }
        ];
        if (this.rotatable) {
            handles.push({
                cacheResultKey: 'regular-polygon-vertex-rotation',
                handle: () => {
                    const radian = -c2p.radian(nc2p);
                    this.contour.rotate(radian);
                    return {
                        cacheData: radian
                    };
                },
                undo: (lastRadian?: number) => {
                    if (typeof lastRadian === 'number') {
                        this.contour.rotate(lastRadian);
                    }
                }
            });
        }
        return handles;
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
    private getPoint() {
        return this.contour.getPointAt(this.index);
    }
}
