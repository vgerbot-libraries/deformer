import { Contour } from '../foundation/Contour';
import DeformerEditorRenderer from './DeformerEditorRenderer';
import DeformerEditor from './DeformerEditor';

export default abstract class ContourController<C extends Contour> {
    public isMouseOver: boolean = false;
    constructor(public contour: C) {}
    public getZIndex() {
        return 0;
    }
    public abstract handleMouseMove(position: MousePosition);
    public afterAllHandleMouseMove() {
        //
    }
    public abstract handlePanStart(e: EditorEvent);
    public afterAllHandlePanStart() {
        //
    }
    public abstract handlePanMove(e: EditorEvent);
    public afterAllHandlePanMove() {
        //
    }
    public abstract handlePanStop(e: EditorEvent);
    public afterAllHandlePanStop() {
        //
    }
    public abstract render(renderer: DeformerEditorRenderer);
    public attached(editor: DeformerEditor<C>) {
        //
    }
}
