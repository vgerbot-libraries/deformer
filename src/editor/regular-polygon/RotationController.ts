import RotationController from '../common/RotationController';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';

export default class RegularPolygonRotationController extends RotationController<RegularPolygon & IrregularPolygon> {
    protected resolveCtrlPoint(): DevicePoint {
        const center = this.contour.getCenter();
        const top = this.contour.getAllPoints()[0];
        const centerToTopVector = center.vector(top);
        const rotationVector = centerToTopVector.extend(30);
        return center.addVector(rotationVector).toDevice();
    }
}
