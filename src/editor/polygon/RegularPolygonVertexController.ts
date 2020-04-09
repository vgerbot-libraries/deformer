import ContourController from '../ContourController';
import { RegularPolygon } from '../../foundation/Polygon';
import DeformerEditorRenderer from '../DeformerEditorRenderer';
import DeformerEditor from '../DeformerEditor';

export class RegularPolygonVertexController extends ContourController<RegularPolygon> {
    constructor(
        editor: DeformerEditor<RegularPolygon>,
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
    private handlePanEvent(e: EditorEvent): ContourControllerHandleResult {
        this.contour.restore();
        this.contour.save();
        const point = this.getPoint();
        const center = this.contour.getCenter();
        const newPoint = e.position.page;
        const c2p = center.vector(point);
        const nc2p = center.vector(newPoint);

        const dlen = nc2p.length() - c2p.length();
        if (this.rotatable) {
            const radian = c2p.radian(nc2p);
            this.contour.rotate(-radian);
        }
        this.contour.expansion(dlen);
        return {};
    }
    private getPoint() {
        return this.contour.getPointAt(this.index);
    }
}
