import ContourDeformer from '../Deformer';
import ContourController from '../ContourController';
import DeformerRenderer from '../DeformerRenderer';
import { Contour } from '../../foundation/Contour';

export default abstract class RotationController<C extends Contour> extends ContourController<C> {
    private center!: DevicePoint;
    private ctrlPoint!: DevicePoint;
    constructor(editor: ContourDeformer<C>) {
        super(editor);
    }
    public handleMouseMove(position: MousePosition) {
        const topPoint = this.resolveCtrlPoint();
        this.isMouseOver = topPoint.vector(position.page).length() < 10;
        return {
            isMouseOver: this.isMouseOver
        };
    }
    public handlePanStart(e: EditorEvent) {
        this.contour.save();
        this.ctrlPoint = this.resolveCtrlPoint();
        this.center = this.contour.getCenter().toDevice();
        return this.handleRotateByEvent(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.contour.restore();
        this.contour.save();
        return this.handleRotateByEvent(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.contour.apply();
        return {};
    }
    public handleRotate(rotation: number) {
        //
    }
    public attached(editor: ContourDeformer<C>) {
        editor.setPadding(40);
    }
    public render(renderer: DeformerRenderer) {
        renderer.save();
        const center = this.contour.getCenter();
        const topPoint = this.resolveCtrlPoint();
        renderer.config({
            strokeStyle: '#00FFFF',
            fillStyle: '#00FFFF',
            lineWidth: 2
        });
        const ctx = renderer.getContext();
        renderer.renderOpenPath(center, topPoint);
        ctx.stroke();
        renderer.renderCircle(center, 5);
        ctx.fill();
        renderer.renderCircle(topPoint, 10);
        ctx.fill();
    }
    protected abstract resolveCtrlPoint(): DevicePoint;
    private handleRotateByEvent(e: EditorEvent): ContourControllerHandleResult {
        const rv = this.center.vector(this.ctrlPoint);
        const mv = this.center.vector(e.position.page);
        const radian = rv.radian(mv);
        this.contour.rotate(radian);
        return {};
    }
}
