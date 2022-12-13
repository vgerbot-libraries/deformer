import ContourController, { DeformerHandler, DeformerHandlerResult } from '../ContourController';
import DeformerRenderer from '../DeformerRenderer';
import ContourDeformer from '../Deformer';
import { Contour } from '../../foundation/Contour';
import { Vector } from '../../foundation/math/vector';

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
            isMouseOver: this.isMouseOver,
        };
    }
    public getCursorClass() {
        return 'deformer-editor--cursor-move';
    }
    public deformerHandlers(e: EditorEvent): Array<DeformerHandler<Vector>> {
        return [
            {
                cacheResultKey: 'move-x',
                handle: () => {
                    return this.handleMove(new Vector(e.move.x, 0));
                },
                undo: (v?: Vector) => {
                    if (v) {
                        this.handleMove(v);
                    }
                },
            },
            {
                cacheResultKey: 'move-y',
                handle: () => {
                    return this.handleMove(new Vector(0, -e.move.y));
                },
                undo: (vector?: Vector) => {
                    if (vector) {
                        this.handleMove(vector);
                    }
                },
            },
        ];
    }
    public render(renderer: DeformerRenderer) {
        //
    }
    protected abstract handleMove(v: Vector): DeformerHandlerResult<Vector>;
}
