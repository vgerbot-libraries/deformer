import DeformerEditor from '../DeformerEditor';
import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import DeformerEditorRenderer from '../DeformerEditorRenderer';

export default class RotationController extends ContourController<Quadrilateral> {
    private center!: DevicePoint;
    private ctrlPoint!: DevicePoint;
    constructor(protected readonly editor: DeformerEditor<Quadrilateral>) {
        super(editor.contour);
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
        this.contour.restore();
        const result = this.handleRotateByEvent(e);
        this.contour.apply();
        return result;
    }
    public handleRotate(rotation: number) {
        //
    }
    public attached(editor: DeformerEditor<Quadrilateral>) {
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
    private handleRotateByEvent(e: EditorEvent): ContourControllerHandleResult {
        const rv = this.center.vector(this.ctrlPoint);
        const mv = this.center.vector(e.position.page);
        const radian = rv.radian(mv);
        this.contour.rotate(radian);
        return {};
    }
    private resolveCtrlPoint() {
        const topCenter = this.contour.getTopCenter();
        const center = this.contour.getCenter();
        const centerToTopVector = center.vector(topCenter);
        const rotationVector = centerToTopVector.extend(30);
        return center.addVector(rotationVector).toDevice();
    }
}
