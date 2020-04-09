import { Quadrilateral } from '../foundation/Quadrilateral';
import { QuadrilateralDeformerEditor } from '../editor/quadrilateral/QuadrilateralDeformerEditor';
import { Vector } from '../foundation/math/vector';
import { SizeLimitation } from '../editor/quadrilateral/SizeLimitation';
import { AvoidSwitchSideLimitation } from '../editor/quadrilateral/SwitchSideLimitation';
import { RegularPolygonDeformerEditor } from '../editor/polygon/RegularPolygonDeformerEditor';
import { RegularPolygon } from '../foundation/Polygon';
import { DeviceCoordinate } from '../foundation/math/coordinate/DeviceCoordinate';

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
    limitations: [
        new SizeLimitation({
            minWidth: 50,
            maxWidth: 500,
            minHeight: 50,
            maxHeight: 300
        }),
        new AvoidSwitchSideLimitation()
    ]
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

const regularPolygonEditor = new RegularPolygonDeformerEditor({
    contour: new RegularPolygon(DeviceCoordinate.ORIGIN.point(400, 400), 100, 6),
    rotatable: true,
    moveable: true
});

console.info(regularPolygonEditor);

document.body.appendChild(regularPolygonEditor.getDOM());
