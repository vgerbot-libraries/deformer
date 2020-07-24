import { Contour } from '../foundation/Contour';
import ContourController, { HandlingType, DeformerHandlerResult } from './ContourController';
import ContourDeformer from './Deformer';
import { DeformerLimitator } from './DeformerLimitator';
import noop from '../foundation/noop';

export class DeformerInteraction<C extends Contour> {
    private controllers: Array<ContourController<C>> = [];
    private currentMouseOverController?: ContourController<C>;
    private limitations: Array<DeformerLimitator<C>> = [];
    private currentLimitators: Array<DeformerLimitator<C>> = [];
    private attached: boolean = false;
    constructor(protected deformer: ContourDeformer<C>) {}
    public attachController(controller: ContourController<C>): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            return false;
        }
        if (this.controllers.length === 0) {
            this.controllers.push(controller);
        } else {
            let insertIndex = 0;
            const zindex = controller.getZIndex();
            this.controllers.some((ctrl, i) => {
                if (ctrl.getZIndex() <= zindex) {
                    insertIndex = i;
                    return true;
                }
                return false;
            });
            this.controllers.splice(insertIndex, 0, controller);
        }
        return true;
    }
    public dettachController(controller: ContourController<C>): boolean {
        const index = this.controllers.indexOf(controller);
        if (index > -1) {
            this.controllers.splice(index, 1);
            return true;
        }
        return false;
    }
    public applyAttach(deformer: ContourDeformer<C>) {
        if (this.isAttached()) {
            throw new Error('This interaction has been attached!');
        }
        this.attached = true;
        this.controllers.forEach(it => it.attached(deformer.getHammerInstance()));
    }
    public getControllers() {
        return this.controllers;
    }
    public isAttached() {
        return this.attached;
    }
    public holdsAController() {
        return !!this.currentMouseOverController;
    }
    public getDeformer() {
        return this.deformer;
    }
    public getCurrentMouseOverController() {
        return this.currentMouseOverController;
    }
    public dettach() {
        if (!this.isAttached()) {
            throw new Error('Cannot dettach a dettached interaction!');
        }
        this.attached = false;
    }
    public handleMouseMove(position: MousePosition) {
        if (!this.isAttached()) {
            throw new Error('This interaction has not been attached!');
        }
        if (this.currentMouseOverController) {
            this.currentMouseOverController.isMouseOver = false;
            this.currentMouseOverController = undefined;
        }

        const isMouseOnController = this.controllers.some(controller => {
            controller.handleMouseMove(position);
            if (controller.isMouseOver) {
                if (this.currentMouseOverController) {
                    this.currentMouseOverController.isMouseOver = false;
                }
                this.currentMouseOverController = controller;
                return true;
            }
            return false;
        });

        if (isMouseOnController) {
            this.deformer.setCursor(this.currentMouseOverController!.getCursorClass());
            this.currentLimitators = this.limitations.filter(limit => limit.handleIt(this.currentMouseOverController!));
        } else {
            this.deformer.setCursor('default');
            this.currentLimitators = [];
        }
        this.controllers.forEach(ctrl => {
            ctrl.afterAllHandleMouseMove();
        });
    }
    public handlePanstartEvent(event: EditorEvent): boolean {
        if (!this.isAttached()) {
            return false;
        }
        const deformer = this.deformer;
        if (!this.continueHandle(event)) {
            return false;
        }
        deformer.contour.save();
        this.handleContoller(event, HandlingType.START);
        return true;
    }
    public handlePanMoveEvent(editorEvent: EditorEvent): boolean {
        if (!this.continueHandle(editorEvent)) {
            return false;
        }
        const deformer = this.deformer;
        deformer.contour.restore();
        deformer.contour.save();
        this.handleContoller(editorEvent, HandlingType.MOVE);
        return true;
    }
    public handlePanEndEvent(editorEvent: EditorEvent) {
        if (!this.continueHandle(editorEvent)) {
            return noop;
        }
        const deformer = this.deformer;
        deformer.contour.restore();
        deformer.contour.save();
        const clearMethod = this.handleContoller(editorEvent, HandlingType.END);
        deformer.contour.apply();
        this.currentMouseOverController = undefined;
        return clearMethod;
    }
    public validateHandleResult(result: DeformerHandlerResult<unknown>) {
        if (!this.isAttached()) {
            return false;
        }
        return !this.currentLimitators.some(limit => !limit.accept(this.deformer.contour, result));
    }
    private continueHandle(event: EditorEvent) {
        return !this.currentLimitators.some(limit => !limit.continueHandle(event, this.deformer.contour));
    }
    private handleContoller(editorEvent: EditorEvent, type: HandlingType) {
        if (!this.currentMouseOverController || !this.isAttached()) {
            return noop;
        }
        const handlers = this.currentMouseOverController.deformerHandlers(editorEvent, type);
        const deformer = this.deformer;
        handlers.forEach(handler => {
            deformer.contour.save();
            const lastResult = deformer.getTempVar(handler.cacheResultKey);
            const result = handler.handle();
            if (!this.validateHandleResult(result)) {
                let someOneAdjustSuccess = false;
                this.currentLimitators.forEach(limitator => {
                    const adjusted = limitator.adjust(
                        deformer.contour,
                        editorEvent,
                        this.currentMouseOverController!,
                        result
                    );
                    if (adjusted) {
                        someOneAdjustSuccess = adjusted;
                    }
                });
                if (someOneAdjustSuccess) {
                    deformer.contour.pop();
                } else {
                    deformer.contour.restore();
                    handler.undo(lastResult);
                }
            } else {
                deformer.setTempVar(handler.cacheResultKey, result.cacheData);
                deformer.contour.pop();
            }
        });
        return () => {
            handlers.forEach(handler => {
                const key = handler.cacheResultKey;
                deformer.removeTempVar(key);
            });
        };
    }
}
