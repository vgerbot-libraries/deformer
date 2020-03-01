import { AnyPoint } from '../foundation/math/coordinate/Coordinate';
import { DeviceCoordinate } from '../foundation/math/coordinate/DeviceCoordinate';
import { Vector } from '../foundation/math/vector';

export interface RenderingConfig {
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    direction: CanvasDirection;
    lineWidth: number;
    filter: string;
    font: string;
    globalAlpha: number;
    globalCompositeOperation: string;
    textAlign: CanvasTextAlign;
    textBaseLine: CanvasTextBaseline;
    imageSmoothingQuality: ImageSmoothingQuality;
    imageSmoothingEnabled: boolean;
    lineCap: CanvasLineCap;
    lineJoin: CanvasLineJoin;
    lineDashOffset: number;
}

export default class DeformerEditorRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly coordinate: DeviceCoordinate = new DeviceCoordinate(0, 0);
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
    }
    public getDOM() {
        return this.canvas;
    }
    public reset(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    public clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    public save() {
        this.ctx.save();
    }
    public restore() {
        this.ctx.restore();
    }
    public config(config: Partial<RenderingConfig>) {
        for (const key in config) {
            this.ctx[key] = config[key];
        }
    }
    public setOffset(left: number, top: number = left) {
        this.coordinate.moveOriginTo(left, top);
    }
    public getContext() {
        return this.ctx;
    }
    public renderOpenPath(...points: AnyPoint[]) {
        this.ctx.beginPath();
        const pts = points.map(point => this.convertPoint(point));
        this.ctx.moveTo(pts[0].getDeviceX(), pts[0].getDeviceY());
        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].getDeviceX(), pts[i].getDeviceY());
        }
    }
    public renderClosedPath(...points: AnyPoint[]) {
        this.renderOpenPath(...points);
        this.ctx.closePath();
    }
    public renderSquare(leftTop: AnyPoint, rightBottom: AnyPoint, fill: boolean = false) {
        const dLeftTop = this.convertPoint(leftTop);
        const dRightBottom = this.convertPoint(rightBottom);
        const width = dRightBottom.x - dLeftTop.x;
        const height = dRightBottom.y - dLeftTop.y;
        this.ctx.rect(dLeftTop.x + width * 0.5, dLeftTop.y + height * 0.5, width, height);
    }
    private convertPoint(point: AnyPoint) {
        const rect = this.canvas.getBoundingClientRect();
        return point.toDevice(this.coordinate).addVector(new Vector(-rect.left, -rect.top));
    }
}
