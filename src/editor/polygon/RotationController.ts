import RotationController from '../common/RotationController';
import { RegularPolygon, IrregularPolygon } from '../../foundation/Polygon';

export default class RegularPolygonRotationController extends RotationController<RegularPolygon & IrregularPolygon> {
    protected resolveCtrlPoint(): DevicePoint {
        const center = this.contour.getCenter();
        const top = this.contour.getAllPoints()[0];
        const centerToTopVector = center.vector(top);
        const rotationVector = centerToTopVector.extend(30);
        return center.addVector(rotationVector).toDevice();
    }
}
