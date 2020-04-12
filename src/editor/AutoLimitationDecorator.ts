import ContourController from './ContourController';

type PanEventHandlerMethodName = 'handlePanStart' | 'handlePanMove' | 'handlePanStop';

export function AutoLimitation(
    target: ContourController<any>,
    propertyKey: PanEventHandlerMethodName,
    descriptor: PropertyDescriptor
) {
    // tslint:disable-next-line:ban-types
    const fn = descriptor.value as Function;
    descriptor.value = function(...args: any[]) {
        const result = fn.call(this, ...args);
        target.editor.handleLimitator(result);
        return result;
    };
}
