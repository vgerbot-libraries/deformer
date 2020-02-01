import { MousePosition, PanMoveOffset } from './event-input';
import { Contour } from './Contour';

export default abstract class ContourController<C extends Contour> {
    public isMouseOver: boolean = false;
    constructor(public contour: C) {}
    public abstract handleMouseMove(holder: DeformerHolderElement, positions: MousePosition[]);
    public abstract handlePanStart(holder: DeformerHolderElement, offset: PanMoveOffset);
    public abstract handlePanMove(holder: DeformerHolderElement, offset: PanMoveOffset);
    public abstract handlePanStop(holder: DeformerHolderElement, offset: PanMoveOffset);
}
