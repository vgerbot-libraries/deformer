import Deformer, { ContourDeformerOptions } from '../Deformer';
import { IrregularPolygon } from '../../foundation/shapes/IrregularPolygon';
import IrregularPolygonVertexController from './IrregularVertexController';
import RotationController from './RotationController';
import MoveController from './MoveController';

export type IrregularPolygonDeformerOptions = ContourDeformerOptions<IrregularPolygon>;

export class IrregularPolygonDeformer extends Deformer<IrregularPolygon> {
    constructor(options: IrregularPolygonDeformerOptions) {
        super(options);
        const points = this.contour.getAllPoints();
        points.forEach((_, index) => {
            this.attach(new IrregularPolygonVertexController(this, index, 10));
        });
        if (this.rotatable) {
            this.attach(new RotationController(this));
        }
        if (this.moveable) {
            this.attach(new MoveController(this));
        }
    }
    public addPoint(point: AnyPoint) {
        const index = this.contour.addPoint(point);
        this.attach(new IrregularPolygonVertexController(this, index, 10));
        return () => {
            this.contour.removePoint(index);
        };
    }
}
