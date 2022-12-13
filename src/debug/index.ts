import { QuadrilateralDeformer } from '../editor/quadrilateral/QuadrilateralDeformer';
import { HeightLimitator, WidthLimitator } from '../editor/quadrilateral/SizeLimitator';
import { AvoidSwitchSideLimitator } from '../editor/quadrilateral/SwitchSideLimitator';
import { RegularPolygonDeformer } from '../editor/regular-polygon/RegularPolygonDeformer';
import { DeviceCoordinate } from '../foundation/math/coordinate/DeviceCoordinate';
import { Vector } from '../foundation/math/vector';
import { Quadrilateral } from '../foundation/shapes/Quadrilateral';
import { RegularPolygon } from '../foundation/shapes/RegularPolygon';
import { Interval } from '../foundation/Interval';
import EdgeLengthLimitator from '../editor/regular-polygon/EdgeLengthLimitator';
import { IrregularPolygonDeformer } from '../editor/irregular-polygon/IrregularPolygonDeformer';
import { IrregularPolygon } from '../foundation/shapes/IrregularPolygon';
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
const editor = new QuadrilateralDeformer({
    contour: Quadrilateral.fromDOMElement(holder),
    enableEdge: true,
    enableVerticies: true,
    rotatable: true,
    limitations: [
        // new SizeLimitator({
        //     minWidth: 50,
        //     maxWidth: 500,
        //     minHeight: 50,
        //     maxHeight: 300
        // }),O
        new WidthLimitator(50, 500),
        new HeightLimitator(50, 500),
        new AvoidSwitchSideLimitator(),
        BoxLimitator.createStaticBox({
            left: 100,
            right: 1200,
            top: 100,
            bottom: 800,
        }),
    ],
});
document.body.appendChild(editor.getDOM());
editor.on('update', (contour) => {
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

const regularPolygonDeformer = new RegularPolygonDeformer({
    contour: new RegularPolygon(DeviceCoordinate.ORIGIN.point(400, 400), 100, 6),
    rotatable: true,
    moveable: true,
    limitations: [new EdgeLengthLimitator(Interval.closed(10, 100))],
});

console.info(regularPolygonDeformer);

document.body.appendChild(regularPolygonDeformer.getDOM());

const irregularPolygonDeformer = new IrregularPolygonDeformer({
    contour: new IrregularPolygon(),
    rotatable: true,
    moveable: true,
});
irregularPolygonDeformer.addPoint(DeviceCoordinate.ORIGIN.point(500, 300));
irregularPolygonDeformer.addPoint(DeviceCoordinate.ORIGIN.point(600, 350));
irregularPolygonDeformer.addPoint(DeviceCoordinate.ORIGIN.point(700, 600));
irregularPolygonDeformer.addPoint(DeviceCoordinate.ORIGIN.point(650, 400));
document.body.appendChild(irregularPolygonDeformer.getDOM());
