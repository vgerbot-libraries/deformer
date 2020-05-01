import ContourDeformer, { ContourDeformerOptions } from '../Deformer';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { RegularPolygonVertexController } from './RegularPolygonVertexController';
import RegularPolygonMoveController from './MoveController';
import RegularPolygonRotationController from './RotationController';

export interface RegularPolygonDeformerOptions extends ContourDeformerOptions<RegularPolygon> {
    rotatableVertices?: boolean;
}

export class RegularPolygonDeformer extends ContourDeformer<RegularPolygon> {
    constructor(options: RegularPolygonDeformerOptions) {
        super(options);
        const rotatableVertices =
            options.rotatableVertices === undefined ? options.rotatable === true : options.rotatableVertices;
        if (this.moveable) {
            this.attach(new RegularPolygonMoveController(this));
        }
        this.contour.getAllPoints().forEach((_, i) => {
            this.attach(new RegularPolygonVertexController(this, i, 10, rotatableVertices));
        });
        if (this.rotatable) {
            this.attach(new RegularPolygonRotationController(this));
        }
    }
}
