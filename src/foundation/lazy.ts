export class Lazy<Class> {
    public property<ReturnType>(
        initializer: Initializer<Class, ReturnType>,
        readony: boolean = true
    ): PropertyDecorator {
        return (target: object, propertyKey: string | symbol) => {
            let value = target[propertyKey];
            const ownDesciptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            const descriptor: PropertyDescriptor = ownDesciptor || {};
            if (ownDesciptor === undefined) {
                Object.defineProperty(target, propertyKey, descriptor);
            }
            descriptor.get = () => {
                descriptor.get = () => value;
                value = initializer(target as any);
                return value;
            };
            if (!readony) {
                descriptor.set = newValue => {
                    value = newValue;
                };
            }
            descriptor.enumerable = true;
            descriptor.writable = true;
        };
    }
}
