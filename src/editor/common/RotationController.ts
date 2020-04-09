import DeformerEditor from '../DeformerEditor';
import ContourController from '../ContourController';
import DeformerEditorRenderer from '../DeformerEditorRenderer';
import { Contour } from '../../foundation/Contour';

export default abstract class RotationController<C extends Contour> extends ContourController<C> {
    private center!: DevicePoint;
    private ctrlPoint!: DevicePoint;
    constructor(editor: DeformerEditor<C>) {
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
    public attached(editor: DeformerEditor<C>) {
        editor.setPadding(40);
    }
    public render(renderer: DeformerEditorRenderer) {
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
        renderer.renderSquare(center, 10);
        ctx.fill();
        renderer.renderSquare(topPoint, 10);
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
