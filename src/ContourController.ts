import { MousePosition, PanMoveOffset } from './event-input';
import { Contour } from './Contour';

export default abstract class ContourController<C extends Contour> {
    public isMouseOver: boolean = false;
    constructor(public contour: C) {}
    public abstract handleMouseMove(holder: DeformerHolderElement, positions: MousePosition[]);
    public afterAllHandleMouseMove(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract handlePanStart(holder: DeformerHolderElement, offset: PanMoveOffset);
    public afterAllHandlePanStart(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract handlePanMove(holder: DeformerHolderElement, offset: PanMoveOffset);
    public afterAllHandlePanMove(controllers: Array<ContourController<C>>) {
        //
    }
    public abstract handlePanStop(holder: DeformerHolderElement, offset: PanMoveOffset);
    public afterAllHandlePanStop(controllers: Array<ContourController<C>>) {
        //
    }
}
