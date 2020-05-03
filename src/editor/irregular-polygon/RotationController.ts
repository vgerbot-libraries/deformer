import RotationController from '../common/RotationController';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';
import { Vector } from '../../foundation/math/vector';
import { HandlingType } from '../ContourController';

export default class IrregularPolygonRotationController extends RotationController<IrregularPolygon> {
    private lastEditorEvent?: EditorEvent;
    public deformerHandlers(e: EditorEvent, type: HandlingType) {
        this.lastEditorEvent = e;
        return super.deformerHandlers(e, type);
    }
    protected resolveCtrlPoint(): DevicePoint {
        const center = this.contour.getCenter().toDevice();
        const ctop = center.addVector(new Vector(0, -100));

        if (this.lastEditorEvent) {
            const vec = center.vector(this.lastEditorEvent.position.page).take(100);
            return center.addVector(vec);
        }
        return ctop;
    }
}
