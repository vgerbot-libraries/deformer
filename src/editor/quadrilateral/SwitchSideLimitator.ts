import { DeformerLimitator } from '../DeformerLimitator';
import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import ContourController from '../ContourController';
import { QuadrilateralEdgeController } from './EdgeController';

export class AvoidSwitchSideLimitator extends DeformerLimitator<Quadrilateral> {
    public handleIt(controller: ContourController<Quadrilateral>) {
        return controller instanceof QuadrilateralEdgeController;
    }
    public accept(contour: Quadrilateral, handleResult: ContourControllerHandleResult): boolean {
        return !!!handleResult.switchedSide;
    }
}
