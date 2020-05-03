import { Contour } from '../foundation/Contour';
import ContourController, { DeformerHandlerResult } from './ContourController';

export abstract class DeformerLimitator<C extends Contour> {
    public abstract handleIt(controller: ContourController<C>): boolean;
    public continueHandle(event: EditorEvent, contour: C): boolean {
        return true;
    }
    public accept(contour: C, result: DeformerHandlerResult<unknown>): boolean {
        return true;
    }
    /**
     *
     * @param contour
     * @param event
     * @param controller
     * @param result
     * @returns boolean - Whether it has been adjusted successfully.
     */
    public adjust(
        contour: C,
        event: EditorEvent,
        controller: ContourController<C>,
        result: DeformerHandlerResult<unknown>
    ) {
        return false;
    }
}
