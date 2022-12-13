export type DestroyHook = () => void;
export default abstract class Disposable {
    private readonly hooks: DestroyHook[] = [];
    protected constructor() {
        //
    }
    public destroy() {
        this.hooks.forEach((hook) => hook());
        this.hooks.splice(0, this.hooks.length);
    }
    protected addDestroyHook(...hooks: DestroyHook[]): Disposable {
        this.hooks.push(...hooks);
        return this;
    }
}
