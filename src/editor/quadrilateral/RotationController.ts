import { Quadrilateral } from '../../foundation/shapes/Quadrilateral';
import RotationController from '../common/RotationController';

export default class QuadrilateralRotationController extends RotationController<Quadrilateral> {
    protected resolveCtrlPoint() {
        const topCenter = this.contour.getTopCenter();
        const center = this.contour.getCenter();
        const centerToTopVector = center.vector(topCenter);
        const rotationVector = centerToTopVector.extend(30);
        return center.addVector(rotationVector).toDevice();
    }
}
