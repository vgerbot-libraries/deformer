import { Quadrilateral } from '../foundation/shapes/Quadrilateral';
import { QuadrilateralDeformerEditor } from '../editor/quadrilateral/QuadrilateralDeformerEditor';
import { Vector } from '../foundation/math/vector';
import { SizeLimitator } from '../editor/quadrilateral/SizeLimitator';
import { AvoidSwitchSideLimitator } from '../editor/quadrilateral/SwitchSideLimitator';
import { RegularPolygonDeformerEditor } from '../editor/regular-polygon/RegularPolygonDeformerEditor';
import { RegularPolygon } from '../foundation/shapes/RegularPolygon';
import { DeviceCoordinate } from '../foundation/math/coordinate/DeviceCoordinate';
import EdgeLengthLimitator from '../editor/regular-polygon/EdgeLengthLimitator';
import { Interval } from '../foundation/Interval';
import BoxLimitator from '../editor/common/BoxLimitator';

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
        new SizeLimitator({
            minWidth: 50,
            maxWidth: 500,
            minHeight: 50,
            maxHeight: 300
        }),
        new AvoidSwitchSideLimitator(),
        new BoxLimitator({
            left: 0,
            right: 500
        })
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
    moveable: true,
    limitations: [new EdgeLengthLimitator(Interval.closed(10, 100))]
});

console.info(regularPolygonEditor);

document.body.appendChild(regularPolygonEditor.getDOM());
