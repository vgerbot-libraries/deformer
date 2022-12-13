import { QuadrilateralDeformer } from '../../src/editor/quadrilateral/QuadrilateralDeformer';
import { Quadrilateral } from '../../src/foundation/shapes/Quadrilateral';

describe('quadrilateral test', () => {
    before(() => {
        const holder = document.createElement('div');
        holder.style.cssText = `
            position: absolute;
            display: block;
            left: 100px;
            top: 100px;
            width: 200px;
            height: 200px;
        `;
        document.body.appendChild(holder);
        const editor = new QuadrilateralDeformer({
            contour: Quadrilateral.fromDOMElement(holder),
            enableEdge: true,
            enableVerticies: true,
            rotatable: true,
        });
        document.body.appendChild(editor.getDOM());
    });
});
