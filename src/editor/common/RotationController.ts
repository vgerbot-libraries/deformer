import ContourDeformer from '../Deformer';
import ContourController, { DeformerHandler, DeformerHandlerResult, HandlingType } from '../ContourController';
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
            isMouseOver: this.isMouseOver,
        };
    }
    public deformerHandlers(e: EditorEvent, type: HandlingType): Array<DeformerHandler<number>> {
        if (type === HandlingType.START) {
            this.ctrlPoint = this.resolveCtrlPoint();
            this.center = this.contour.getCenter().toDevice();
        }
        return [
            {
                cacheResultKey: 'rotation',
                handle: () => {
                    return this.handleRotateByEvent(e);
                },
                undo: (lastRotation?: number) => {
                    if (typeof lastRotation === 'number') {
                        this.contour.rotate(lastRotation);
                    }
                },
            },
        ];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            lineWidth: 2,
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
    private handleRotateByEvent(e: EditorEvent): DeformerHandlerResult<number> {
        const rv = this.center.vector(this.ctrlPoint);
        const mv = this.center.vector(e.position.page);
        const radian = rv.radian(mv);
        this.contour.rotate(radian);
        return {
            cacheData: radian,
        };
    }
}
