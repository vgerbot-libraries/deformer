export class Lazy<Class> {
    public property<ReturnType>(
        initializer: Initializer<Class, ReturnType>,
        readony: boolean = true
    ): PropertyDecorator {
        return (target: object, propertyKey: string | symbol) => {
            const ownDesciptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            if (ownDesciptor && !ownDesciptor.configurable) {
                delete target[propertyKey];
            }
            const descriptor: PropertyDescriptor = {};
            descriptor.get = function() {
                const lazyValue = initializer(this as any);
                descriptor.get = () => lazyValue;
                Object.defineProperty(target, propertyKey, descriptor);
                return lazyValue;
            };
            if (!readony) {
                descriptor.set = newValue => {
                    descriptor.get = () => newValue;
                    Object.defineProperty(target, propertyKey, descriptor);
                };
            }
            descriptor.enumerable = true;
            descriptor.configurable = true;
            Object.defineProperty(target, propertyKey, descriptor);
        };
    }
}
