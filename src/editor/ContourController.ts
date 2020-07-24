import { Contour } from '../foundation/Contour';
import DeformerRenderer from './DeformerRenderer';
import ContourDeformer from './Deformer';
import { DeformerLimitator } from './DeformerLimitator';
import { DeformerInteraction } from './DeformerInteraction';

export enum HandlingType {
    START,
    MOVE,
    END
}

export interface DeformerHandlerResult<T> {
    cacheData?: T;
    [key: string]: any;
}

export interface DeformerHandler<T> {
    cacheResultKey: string;
    handle(): DeformerHandlerResult<T>;
    undo(last: T);
}

export default abstract class ContourController<C extends Contour> {
    public isMouseOver: boolean = false;
    public isVisible: boolean = true;
    public editor: ContourDeformer<C>;
    constructor(
        public readonly interaction: DeformerInteraction<C>,
        public readonly contour: C = interaction.getDeformer().contour
    ) {
        this.editor = interaction.getDeformer();
    }
    public getZIndex() {
        return 0;
    }
    public getCursorClass() {
        return 'default';
    }
    public abstract deformerHandlers(e: EditorEvent, type: HandlingType): Array<DeformerHandler<unknown>>;
    public abstract handleMouseMove(position: MousePosition): ContourControllerHandleResult;
    public afterAllHandleMouseMove() {
        //
    }
    public abstract render(renderer: DeformerRenderer);
    public attached(hammer: HammerManager = this.editor.getHammerInstance()) {
        //
    }
    public hide() {
        this.isVisible = false;
    }
    public show() {
        this.isVisible = true;
    }
    public handleLimitatorBySelf() {
        return false;
    }
    public supportLimitator(limitator: DeformerLimitator<any>) {
        return false;
    }
}
