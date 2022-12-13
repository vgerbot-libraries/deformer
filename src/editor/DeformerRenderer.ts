import { AnyPoint } from '../foundation/math/coordinate/Coordinate';
import { DeviceCoordinate } from '../foundation/math/coordinate/DeviceCoordinate';
import { Vector } from '../foundation/math/vector';
import { Boundary } from '../foundation/Boundary';

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

export default class DeformerRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly coordinate: DeviceCoordinate = new DeviceCoordinate(0, 0);
    private displayBoundary: Boundary;
    private originBoundary: Boundary;
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        const domRect = this.canvas.getBoundingClientRect();
        this.originBoundary = this.displayBoundary = new Boundary(
            domRect.left,
            domRect.top,
            domRect.right,
            domRect.bottom,
        );
        this.originBoundary.getHeight(); // suppress ts ERROR
        this.displayBoundary.getHeight();
    }
    public getDOM() {
        return this.canvas;
    }
    public reset(displayBoundary: Boundary, originBoundary: Boundary) {
        this.canvas.width = displayBoundary.getWidth();
        this.canvas.height = displayBoundary.getHeight();
        this.displayBoundary = displayBoundary;
        this.originBoundary = originBoundary;
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
        // this.coordinate.moveOriginTo(left, top);
    }
    public getContext() {
        return this.ctx;
    }
    public renderOpenPath(...points: AnyPoint[]) {
        this.ctx.beginPath();
        const pts = points.map((point) => this.convertPoint(point));
        this.ctx.moveTo(pts[0].getDeviceX(), pts[0].getDeviceY());
        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].getDeviceX(), pts[i].getDeviceY());
        }
    }
    public renderClosedPath(...points: AnyPoint[]) {
        this.renderOpenPath(...points);
        this.ctx.closePath();
    }
    public renderSquare(center: AnyPoint, size: number) {
        const hsize = size * 0.5;
        const dcenter = this.convertPoint(center);
        const left = dcenter.x - hsize;
        const top = dcenter.y - hsize;
        this.ctx.rect(left, top, size, size);
    }
    public renderCircle(center: AnyPoint, size: number) {
        const r = size * 0.5;
        const dcenter = this.convertPoint(center);
        this.ctx.beginPath();
        this.ctx.arc(dcenter.x, dcenter.y, r, 0, Math.PI * 2);
        this.ctx.closePath();
    }
    public renderText(point: AnyPoint, text: string) {
        const p = this.convertPoint(point);
        this.ctx.strokeText(text, p.x, p.y);
    }
    private convertPoint(point: AnyPoint) {
        return point
            .toDevice(this.coordinate)
            .addVector(new Vector(-this.displayBoundary.left, -this.displayBoundary.top));
    }
}
