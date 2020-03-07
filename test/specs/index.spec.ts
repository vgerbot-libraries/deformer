import { hello } from '../../src/index';
import QuadrilateralDeformerEditor from '../../src/editor/quadrilateral/QuadrilateralDeformerEditor';
import { Quadrilateral } from '../../src/foundation/Quadrilateral';
import { expect } from 'chai';

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
        const editor = new QuadrilateralDeformerEditor({
            contour: Quadrilateral.fromDOMElement(holder),
            enableEdge: true,
            enableVerticies: true,
            rotatable: true
        });
        document.body.appendChild(editor.getDOM());
    });
    it("should hello() returns 'world'", () => {
        expect(hello()).to.be.eq('world');
    });
});
