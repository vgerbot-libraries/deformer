import { uniqId } from './unique';

export class Lazy<Class> {
    public property<ReturnType>(
        initializer: Initializer<Class, ReturnType>,
        readony: boolean = true
    ): PropertyDecorator {
        const key = uniqId('__lazy__');
        return (target: object, propertyKey: string | symbol) => {
            const ownDesciptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            if (ownDesciptor && !ownDesciptor.configurable) {
                delete target[propertyKey];
            }
            const descriptor: PropertyDescriptor = {};
            descriptor.get = function() {
                if (!(key in this)) {
                    this[key] = initializer(this as any);
                }
                return this[key];
            };
            if (!readony) {
                descriptor.set = newValue => {
                    this[key] = newValue;
                };
            }
            descriptor.enumerable = true;
            descriptor.configurable = true;
            Object.defineProperty(target, propertyKey, descriptor);
        };
    }
}
