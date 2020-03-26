import { Contour } from '../foundation/Contour';
import ContourController from './ContourController';

export abstract class DeformerLimitation<C extends Contour> {
    public abstract handleIt(controller: ContourController<C>): boolean;
    public continueHandle(event: EditorEvent, contour: C): boolean {
        return true;
    }
    public accept(contour: C, result: ContourControllerHandleResult): boolean {
        return true;
    }
}
