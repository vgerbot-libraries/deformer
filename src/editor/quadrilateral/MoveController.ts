import ContourController from '../ContourController';
import { Quadrilateral } from '../../foundation/Quadrilateral';
import DeformerEditorRenderer from '../DeformerEditorRenderer';
import DeformerEditor from '../DeformerEditor';
import { Side } from '../../foundation/Direction';
import { Vector } from '../../foundation/math/vector';

export default class MoveController extends ContourController<Quadrilateral> {
    constructor(public readonly editor: DeformerEditor<Quadrilateral>) {
        super(editor.contour);
    }
    public getZIndex() {
        return Infinity;
    }
    public handleMouseMove(position: MousePosition) {
        const currentMOController = this.editor.getCurrentMouseOverController();
        if (currentMOController) {
            return;
        }
        this.isMouseOver = this.contour.containsPoint(position.page);
        if (this.isMouseOver) {
            this.editor.setCursor('deformer-editor--cursor-move');
        }
    }
    public handlePanStart(e: EditorEvent) {
        this.contour.save();
        this.handleMove(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.contour.restore();
        this.contour.save();
        this.handleMove(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.contour.restore();
        this.handleMove(e);
        this.contour.apply();
    }
    public render(renderer: DeformerEditorRenderer) {
        //
    }
    private handleMove(e: EditorEvent) {
        this.editor.contour.addVector(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION), Side.ALL);
    }
}
