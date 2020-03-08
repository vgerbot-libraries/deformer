import { Lazy } from '../lazy';

const lazy = new Lazy<Vector>();
export class Vector {
    public static ZERO = new Vector(0, 0);
    public static NORMALIZE = new Vector(1, 1);
    public static REVERSE_VERTICAL_DIRECTION = new Vector(1, -1);
    public static REVERSE_HORIZONTAL_DIRECTION = new Vector(-1, 1);
    @lazy.property(vec => vec.x * vec.x)
    private $squareX!: number;
    @lazy.property(vec => vec.y * vec.y)
    private $squareY!: number;
    @lazy.property(vec => Math.sqrt(vec.$squareX + vec.$squareY))
    private $length!: number;
    @lazy.property(vec => vec.devide(vec.length()))
    private $norm!: Vector;
    constructor(public readonly x: number, public readonly y: number) {}

    public addVector(other: Vector) {
        return this.add(other.x, other.y);
    }
    public add(x: number, y: number) {
        return new Vector(this.x + x, this.y + y);
    }
    public extend(length: number) {
        return this.addVector(this.normalize().multiply(length));
    }
    public substract(other: Vector) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    public vecx() {
        return new Vector(this.x, 0);
    }
    public vecy() {
        return new Vector(0, this.y);
    }
    public negate() {
        return new Vector(-this.x, -this.y);
    }
    public multiply(f: number) {
        return new Vector(this.x * f, this.y * f);
    }
    public multiplyVector(vec: Vector) {
        return new Vector(this.x * vec.x, this.y * vec.y);
    }
    public dot(other: Vector) {
        return this.x * other.x + this.y * other.y;
    }
    // z-axis
    public cross(other: Vector) {
        return this.x * other.y - other.x * this.y;
    }
    public length() {
        return this.$length;
    }
    public sqrtLength() {
        return this.$squareX + this.$squareY;
    }
    public normalize() {
        return this.$norm.clone();
    }
    public devide(devident) {
        const inv = 1 / devident;
        return new Vector(this.x * inv, this.y * inv);
    }
    // 当前的投影到other上
    public projection(other: Vector) {
        const d = this.dot(other) / other.sqrtLength();
        return other.multiply(d);
    }
    public clone() {
        return new Vector(this.x, this.y);
    }
}
