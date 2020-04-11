import { DeformerLimitation } from '../DeformerLimitation';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import ContourController from '../ContourController';
import { QuadrilateralEdgeController } from './EdgeController';

export class AvoidSwitchSideLimitation extends DeformerLimitation<Quadrilateral> {
    public handleIt(controller: ContourController<Quadrilateral>) {
        return controller instanceof QuadrilateralEdgeController;
    }
    public accept(contour: Quadrilateral, handleResult: ContourControllerHandleResult): boolean {
        return !!!handleResult.switchedSide;
    }
}
