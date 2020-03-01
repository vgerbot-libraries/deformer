import DeformerEditor from './DeformerEditor';
import { Contour } from '../foundation/Contour';
import ContourController from './ContourController';

export default class RotationController<C extends Contour> extends ContourController<C> {
    constructor(protected readonly editor: DeformerEditor<C>, public contour: C) {
        super(contour);
    }
    public handleMouseMove(position: MousePosition) {
        // throw new Error('Method not implemented.');
    }
    public handlePanStart(offset: EditorEvent) {
        // throw new Error('Method not implemented.');
    }
    public handlePanMove(e: EditorEvent) {
        // throw new Error('Method not implemented.');
    }
    public handlePanStop(e: EditorEvent) {
        // throw new Error('Method not implemented.');
    }
    public handleRotate(rotation: number) {
        //
    }
    public render() {
        //
    }
}
