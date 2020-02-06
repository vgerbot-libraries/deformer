import { expect } from 'chai';
import { hello } from '../../src/index';
import { QuadrilateralDeformerEditor } from '../../src/editor/quadrilateral/QuadrilateralDeformerEditor';
import { Quadrilateral } from '../../src/foundation/Quadrilateral';

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
            holder,
            enableDiagonally: true,
            enableRim: true
        });
        document.body.appendChild(editor.getDOM());
    });
    it("should hello() returns 'world'", () => {
        expect(hello()).to.be.eq('world');
    });
});
