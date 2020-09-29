import { JSEventEmitter, DOMEventListenerOptions } from '../EventEmitter';
import Hammer from 'hammerjs';
import Disposable from '../Disposable';
import { mousePositionFromMouseEvent, mousePositionFromHammerInput } from '../event-input';
import { isTouchDevice } from '../foundation/devices';
import { Contour } from '../foundation/Contour';
import { Vector } from '../foundation/math/vector';
import DeformerRenderer from './DeformerRenderer';
import './editor.less';
import { DeformerLimitator } from './DeformerLimitator';
import noop from '../foundation/noop';
import { DeformerInteraction } from './DeformerInteraction';

interface EventTypes {
    mousemove: MouseEvent;
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    touchmove: TouchEvent;
    touchstart: TouchEvent;
    touchend: TouchEvent;
}
export interface ContourDeformerOptions<C extends Contour> {
    contour: C;
    moveable?: boolean;
    rotatable?: boolean;
    limitations?: Array<DeformerLimitator<C>>;
}

interface DeformerEventMap {
    update: (contour: Contour) => void;
}

export default class ContourDeformer<C extends Contour> extends Disposable {
    public readonly contour: C;
    protected rotatable: boolean;
    protected moveable: boolean;
    protected readonly renderer: DeformerRenderer;
    protected currentDeformerEvent?: EditorEvent;
    private readonly emitter: JSEventEmitter = new JSEventEmitter();
    private readonly hammer: HammerManager;
    private dom: HTMLElement = this.getDOM();
    private padding: number = 5;
    private cursorClass: string = 'deformer-editor--cursor-default';
    private limitations: Array<DeformerLimitator<C>> = [];
    private tempVariables = {};
    private interaction?: DeformerInteraction<C>;
    constructor(options: ContourDeformerOptions<C>) {
        super();
        this.contour = options.contour;
        this.rotatable = options.rotatable === true;
        this.moveable = options.moveable === undefined ? true : options.moveable;
        if (options.limitations) {
            this.limitations.push(...options.limitations);
        }
        this.hammer = new Hammer(this.getDOM());
        this.renderer = this.createRenderer();
        this.dom.appendChild(this.renderer.getDOM());
        this.prepare();
        this.attachUpdateUIEvents();
        this.addDestroyHook(() => {
            if (this.interaction) {
                this.interaction.dettach();
            }
        });
    }
    public setTempVar(name: string, value: any) {
        this.tempVariables[name] = value;
    }
    public getTempVar<T>(name: string): T {
        return this.tempVariables[name] as T;
    }
    public removeTempVar(name: string) {
        delete this.tempVariables[name];
    }
    public on<K extends keyof DeformerEventMap>(type: K, callback: DeformerEventMap[K]) {
        return this.emitter.on(type, callback);
    }
    public once<K extends keyof DeformerEventMap>(type: K, callback: DeformerEventMap[K]) {
        return this.emitter.on(type, callback, { once: true });
    }
    public emit(type: string, ...args: any[]) {
        this.emitter.emit(type, ...args);
    }
    public clearListeners() {
        return this.emitter.clear();
    }
    public setCurrentInteraction(interaction: DeformerInteraction<C>) {
        if (this.interaction === interaction) {
            return;
        }
        if (this.interaction) {
            this.interaction.dettach();
        }
        this.interaction = interaction;
        interaction.applyAttach(this);
    }
    public getDOM(): HTMLElement {
        if (!this.dom) {
            this.dom = document.createElement('div');
            this.dom.classList.add('deformer-editor');
        }
        return this.dom;
    }
    public getHammerInstance() {
        return this.hammer;
    }
    public getLimitators() {
        return this.limitations;
    }
    public setPadding(padding: number) {
        this.padding = padding;
    }
    public getPadding() {
        return this.padding;
    }
    public updateUI() {
        const boundary = this.contour.getDeviceBoundary();
        const padding = this.getPadding();
        const displayBoundary = boundary.expand(padding);
        this.getDOM().style.cssText += `
            left: ${displayBoundary.left}px;
            top: ${displayBoundary.top}px;
            width: ${displayBoundary.getWidth()}px;
            height: ${displayBoundary.getHeight()}px;
        `;
        this.renderer.setOffset(padding);
        this.renderer.reset(displayBoundary, boundary);
        this.getControllers().forEach(ctrl => {
            ctrl.render(this.renderer);
        });
    }
    public getControllers() {
        return this.interaction?.getControllers() || [];
    }
    public setCursor(cursorClass: string) {
        if (this.cursorClass === cursorClass) {
            return;
        }
        const dom = this.getDOM();
        dom.classList.remove(this.cursorClass);
        dom.classList.add(cursorClass);
        this.cursorClass = cursorClass;
    }
    public getCursorClass() {
        return this.cursorClass;
    }
    public isRotatable() {
        return this.rotatable;
    }
    public isMoveable() {
        return this.moveable;
    }
    protected createRenderer() {
        return new DeformerRenderer();
    }
    protected prepare() {
        this.addDestroyHook(() => this.hammer.destroy());
        this.addDestroyHook(() => (this.tempVariables = {}));
        this.hammer.add(
            new Hammer.Pan({
                direction: Hammer.DIRECTION_ALL
            })
        );
        if (this.rotatable) {
            this.hammer.add(new Hammer.Rotate({}));
        }
        let isMouseDown = false;
        if (isTouchDevice) {
            this.attachDOMEvent('touchstart', e => {
                isMouseDown = true;
            });
            this.attachDOMEvent(
                'touchend',
                e => {
                    isMouseDown = false;
                },
                this.getDOM(),
                {
                    capture: true
                }
            );
            this.attachDOMEvent(
                'touchmove',
                e => {
                    if (e.touches.length !== 1) {
                        return;
                    }
                    this.handleMouseMove(mousePositionFromMouseEvent(e.touches[0]));
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true
                }
            );
        } else {
            this.attachDOMEvent('mousedown', e => {
                isMouseDown = true;
            });
            this.attachDOMEvent(
                'mouseup',
                e => {
                    isMouseDown = false;
                },
                document,
                {
                    capture: true
                }
            );
            this.attachDOMEvent(
                'mousemove',
                e => {
                    if (isMouseDown) {
                        return;
                    }
                    this.handleMouseMove(mousePositionFromMouseEvent(e));
                },
                this.getDOM(),
                {
                    capture: true,
                    passive: true
                }
            );
        }
        const editorEventOf = (e: HammerInput): EditorEvent => {
            const position = mousePositionFromHammerInput(e);
            return {
                move: new Vector(e.deltaX, e.deltaY),
                position,
                direction: e.direction
            };
        };
        this.hammer.on('panstart', e => {
            if (!this.interaction?.holdsAController()) {
                return;
            }
            const editorEvent = editorEventOf(e);
            const isHandled = this.interaction.handlePanstartEvent(editorEvent);
            if (!isHandled) {
                return;
            }
            this.emitter.emit('start-update', this.contour);
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        this.hammer.on('panmove', e => {
            if (!this.interaction?.holdsAController()) {
                return;
            }
            const editorEvent = editorEventOf(e);
            const isHandled = this.interaction.handlePanMoveEvent(editorEvent);
            if (!isHandled) {
                return;
            }
            this.emitter.emit('update', this.contour);
            this.updateUI();
        });
        this.hammer.on('panend', e => {
            if (!this.interaction?.holdsAController()) {
                return;
            }
            const editorEvent = editorEventOf(e);
            const clearMethod = this.interaction.handlePanEndEvent(editorEvent);
            if (clearMethod === noop) {
                return;
            }
            this.emitter.emit('update', this.contour);
            this.emitter.emit('update-end', this.contour);
            this.updateUI();
            clearMethod();
            this.currentDeformerEvent = undefined;
        });
        if (this.rotatable) {
            this.hammer.on('rotate', e => {
                // TODO: handle rotation controller
            });
        }
    }
    protected attachUpdateUIEvents() {
        const dom = this.getDOM();
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                if (dom.parentElement) {
                    this.updateUI();
                    observer.disconnect();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            this.addDestroyHook(() => {
                observer.disconnect();
            });
        } else {
            const eventListener = () => {
                this.updateUI();
                dom.removeEventListener('DOMNodeInserted', eventListener);
            };
            dom.addEventListener('DOMNodeInserted', eventListener);
        }
    }
    private attachDOMEvent<T extends keyof EventTypes>(
        type: T,
        listener: (e: EventTypes[T]) => void,
        target: Document | HTMLElement = this.getDOM(),
        options?: DOMEventListenerOptions | boolean
    ) {
        target.addEventListener(type, listener as EventListener, options);
        this.addDestroyHook(() => {
            target.removeEventListener(type, listener as EventListener, options);
        });
    }
    private handleMouseMove(position: MousePosition) {
        this.interaction?.handleMouseMove(position);
    }
}
