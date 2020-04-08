import { Contour } from '../foundation/Contour';
import DeformerEditorRenderer from './DeformerEditorRenderer';
import DeformerEditor from './DeformerEditor';

export default abstract class ContourController<C extends Contour> {
    public isMouseOver: boolean = false;
    public isVisible: boolean = true;
    public contour: C;
    constructor(public readonly editor: DeformerEditor<C>) {
        this.contour = editor.contour;
    }
    public getZIndex() {
        return 0;
    }
    public getCursorClass() {
        return 'default';
    }
    public abstract handleMouseMove(position: MousePosition): ContourControllerHandleResult;
    public afterAllHandleMouseMove() {
        //
    }
    public abstract handlePanStart(e: EditorEvent): ContourControllerHandleResult;
    public afterAllHandlePanStart() {
        //
    }
    public abstract handlePanMove(e: EditorEvent): ContourControllerHandleResult;
    public afterAllHandlePanMove() {
        //
    }
    public abstract handlePanStop(e: EditorEvent): ContourControllerHandleResult;
    public afterAllHandlePanStop() {
        //
    }
    public abstract render(renderer: DeformerEditorRenderer);
    public attached(editor: DeformerEditor<C>, hammer: HammerManager) {
        //
    }
    public hide() {
        this.isVisible = false;
    }
    public show() {
        this.isVisible = true;
    }
    public handleLimitationBySelf() {
        return false;
    }
}
