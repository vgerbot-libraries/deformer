import { Quadrilateral } from '../foundation/Quadrilateral';
import { QuadrilateralDeformerEditor } from '../editor/quadrilateral/QuadrilateralDeformerEditor';
import { Vector } from '../foundation/math/vector';

// tslint-ignore all

const holder = document.createElement('div');
holder.style.cssText = `
    position: absolute;
    display: block;
    left: 100px;
    top: 100px;
    width: 200px;
    height: 200px;
    outline: 1px red inset;
`;
document.body.appendChild(holder);
const editor = new QuadrilateralDeformerEditor({
    contour: Quadrilateral.fromDOMElement(holder),
    enableEdge: true,
    enableVerticies: true,
    rotatable: true,
    maxWidth: 200
});
document.body.appendChild(editor.getDOM());
editor.on('update', contour => {
    const boundary = contour.getDeviceBoundary();
    holder.style.cssText += `
        left: ${boundary.left}px;
        top: ${boundary.top}px;
        width: ${boundary.getWidth()}px;
        height: ${boundary.getHeight()}px;
    `;
});

(window as any).Vector = Vector;
(window as any).Quadrilateral = Quadrilateral;
