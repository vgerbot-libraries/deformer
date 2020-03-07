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
    public handleMouseMove(position: MousePosition) {
        //
    }
    public afterAllHandleMouseMove(position) {
        const ctrl = this.editor.getOprControllers().find(it => it !== this && it.isMouseOver);
        if (!ctrl) {
            this.isMouseOver = true;
        }
    }
    public handlePanStart(e: EditorEvent) {
        this.handleMove(e);
    }
    public handlePanMove(e: EditorEvent) {
        this.handleMove(e);
    }
    public handlePanStop(e: EditorEvent) {
        this.handleMove(e);
    }
    public render(renderer: DeformerEditorRenderer) {
        //
    }
    private handleMove(e: EditorEvent) {
        this.editor.contour.addVector(e.move.multiplyVector(Vector.REVERSE_VERTICAL_DIRECTION), Side.ALL);
    }
}
