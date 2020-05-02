import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import ContourController from '../ContourController';
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
    public handlePanStart(e: EditorEvent): ContourControllerHandleResult {
        this.setLastExpansion(0);
        this.setLastRotation(0);
        return this.handlePanEvent(e);
    }
    public handlePanMove(e: EditorEvent): ContourControllerHandleResult {
        return this.handlePanEvent(e);
    }
    public handlePanStop(e: EditorEvent): ContourControllerHandleResult {
        this.contour.apply();
        return {};
    }
    public handleLimitatorBySelf() {
        return true;
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
        let lastRotation = this.getLastRotation();
        let lastExpansion = this.getLastExpansion();

        const point = this.getPoint();
        const center = this.contour.getCenter();
        const newPoint = e.position.page;
        const c2p = center.vector(point);
        const nc2p = center.vector(newPoint);

        const dlen = nc2p.length() - c2p.length();
        if (this.rotatable) {
            const radian = c2p.radian(nc2p);
            this.contour.save();
            this.contour.rotate(-radian);
            if (!this.editor.validateHandleResult({})) {
                this.contour.restore();
                this.contour.rotate(lastRotation);
            } else {
                this.contour.pop();
                lastRotation = -radian;
            }
        }
        this.contour.save();
        this.contour.expansion(dlen);
        if (!this.editor.validateHandleResult({})) {
            this.contour.restore();
            this.contour.expansion(lastExpansion);
        } else {
            this.contour.pop();
            lastExpansion = dlen;
        }
        this.setLastExpansion(lastExpansion);
        this.setLastRotation(lastRotation);
        return {};
    }
    private getPoint() {
        return this.contour.getPointAt(this.index);
    }
    private getLastExpansion(): number {
        return this.editor.getTempVar('regular-polygon-last-expansion');
    }
    private getLastRotation(): number {
        return this.editor.getTempVar('regular-polygon-last-rotation');
    }
    private setLastExpansion(expansion: number) {
        this.editor.setTempVar('regular-polygon-last-expansion', expansion);
    }
    private setLastRotation(rotation: number) {
        this.editor.setTempVar('regular-polygon-last-rotation', rotation);
    }
}
