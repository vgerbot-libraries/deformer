import ContourController from '../ContourController';
import DeformerRenderer from '../DeformerRenderer';
import ContourDeformer from '../Deformer';
import { Contour } from '../../foundation/Contour';

export default abstract class MoveController<C extends Contour> extends ContourController<C> {
    constructor(public readonly editor: ContourDeformer<C>) {
        super(editor);
    }
    public getZIndex() {
        return Infinity;
    }
    public handleMouseMove(position: MousePosition) {
        const currentMOController = this.editor.getCurrentMouseOverController();
        if (currentMOController) {
            return { isMouseOver: false };
        }
        this.isMouseOver = this.contour.containsPoint(position.page);
        return {
            isMouseOver: this.isMouseOver
        };
    }
    public getCursorClass() {
        return 'deformer-editor--cursor-move';
    }
    public handlePanStart(e: EditorEvent) {
        this.contour.save();
        return this.handleMove(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.contour.restore();
        this.contour.save();
        return this.handleMove(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.contour.restore();
        const result = this.handleMove(e);
        this.contour.apply();
        return result;
    }
    public render(renderer: DeformerRenderer) {
        //
    }
    protected abstract handleMove(e: EditorEvent): ContourControllerHandleResult;
}
