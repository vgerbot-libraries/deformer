export enum Direction {
    ALL = 0b111111,
    HORIZONTAL = 0b111101,
    VERTICAL = 0b111100,
    // top and bottom
    TOP = 0b1000,
    BOTTOM = 0b101000,
    // left and right
    LEFT = 0b1001,
    RIGHT = 0b101001,
    // left-top and right-bottom
    LEFT_TOP = 0b1010,
    RIGHT_BOTTOM = 0b101010,
    // right-top and left-bottom
    RIGHT_TOP = 0b1011,
    LEFT_BOTTOM = 0b101011
}

export type DiagonalDirection =
    | Direction.LEFT_TOP
    | Direction.RIGHT_TOP
    | Direction.RIGHT_BOTTOM
    | Direction.LEFT_BOTTOM;

export enum Side {
    LEFT = Direction.LEFT,
    RIGHT = Direction.RIGHT,
    TOP = Direction.TOP,
    BOTTOM = Direction.BOTTOM,
    LEFT_TOP = Direction.LEFT_TOP,
    RIGHT_TOP = Direction.RIGHT_TOP,
    RIGHT_BOTTOM = Direction.RIGHT_BOTTOM,
    LEFT_BOTTOM = Direction.LEFT_BOTTOM,
    ALL = Direction.ALL
}
const directionName = {
    [Direction.ALL]: 'all',
    [Direction.LEFT]: 'left',
    [Direction.TOP]: 'top',
    [Direction.RIGHT]: 'right',
    [Direction.BOTTOM]: 'bottom',
    [Direction.LEFT_TOP]: 'left_top',
    [Direction.RIGHT_TOP]: 'right_top',
    [Direction.RIGHT_BOTTOM]: 'right_bottom',
    [Direction.LEFT_BOTTOM]: 'left_bottom'
};

export function isOpposite(direction: Direction, otherDirection: Direction) {
    return (direction ^ otherDirection) === 0b100000;
}

export function isOppositeOrSame(direction: Direction, otherDirection: Direction) {
    const xor = direction ^ otherDirection;
    return xor === 0b100000 || xor === 0;
}

export function getOppositeDirection(direction: Direction): Direction {
    if (direction > 0b1111) {
        return direction & 0b1111;
    } else {
        return 0b100000 | direction;
    }
}
export function getOppositeSite(side: Side): Side {
    if (side > 0b1111) {
        return side & 0b1111;
    } else {
        return 0b100000 | side;
    }
}

export function getSideName(side: Side) {
    return directionName[side];
}
