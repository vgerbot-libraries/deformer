import DeformerEditor, { DeformerEditorOptions } from '../DeformerEditor';
import { RegularPolygon } from '../../foundation/shapes/RegularPolygon';
import { RegularPolygonVertexController } from './RegularPolygonVertexController';
import RegularPolygonMoveController from './MoveController';
import RegularPolygonRotationController from './RotationController';

export interface RegularPolygonDeformerEditorOptions extends DeformerEditorOptions<RegularPolygon> {
    rotatableVertices?: boolean;
}

export class RegularPolygonDeformerEditor extends DeformerEditor<RegularPolygon> {
    constructor(options: RegularPolygonDeformerEditorOptions) {
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
