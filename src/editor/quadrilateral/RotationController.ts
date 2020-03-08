import DeformerEditor from '../DeformerEditor';
import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import DeformerEditorRenderer from '../DeformerEditorRenderer';

export default class RotationController extends ContourController<Quadrilateral> {
    constructor(protected readonly editor: DeformerEditor<Quadrilateral>) {
        super(editor.contour);
    }
    public handleMouseMove(position: MousePosition) {
        const topPoint = this.resolveTopPoint();
        this.isMouseOver = topPoint.vector(position.page).length() < 10;
    }
    public handlePanStart(e: EditorEvent) {
        // throw new Error('Method not implemented.');
    }
    public handlePanMove(e: EditorEvent) {
        // throw new Error('Method not implemented.');
        console.info('rotation', e);
    }
    public handlePanStop(e: EditorEvent) {
        // throw new Error('Method not implemented.');
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
        const topPoint = this.resolveTopPoint();
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
    private resolveTopPoint() {
        const topCenter = this.contour.getTopCenter();
        const center = this.contour.getCenter();
        const centerToTopVector = center.vector(topCenter);
        const rotationVector = centerToTopVector.extend(20);
        return center.addVector(rotationVector);
    }
}
