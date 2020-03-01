import { Contour } from '../foundation/Contour';
import DeformerEditorRenderer from './DeformerEditorRenderer';

export default abstract class ContourController<C extends Contour> {
    public isMouseOver: boolean = false;
    constructor(public contour: C) {}
    public abstract handleMouseMove(position: MousePosition);
    public afterAllHandleMouseMove(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract handlePanStart(e: EditorEvent);
    public afterAllHandlePanStart(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract handlePanMove(e: EditorEvent);
    public afterAllHandlePanMove(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract handlePanStop(e: EditorEvent);
    public afterAllHandlePanStop(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract render(renderer: DeformerEditorRenderer);
}
