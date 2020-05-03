import { Contour } from '../foundation/Contour';
import DeformerRenderer from './DeformerRenderer';
import ContourDeformer from './Deformer';
import { DeformerLimitator } from './DeformerLimitator';

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
    public contour: C;
    constructor(public readonly editor: ContourDeformer<C>) {
        this.contour = editor.contour;
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
    public attached(editor: ContourDeformer<C>, hammer: HammerManager) {
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
