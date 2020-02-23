import { PanMoveOffset, HammerDirection } from '../../event-input';
import { Vector } from '../../foundation/math/vector';
import { Direction, DiagonalDirection } from '../../foundation/Direction';
import { QuadrilateralController } from './QuadrilateralController';

export class QuadrilateralControllerEventHandler {
    constructor(private readonly controller: QuadrilateralController) {}
    public handleDiagonalPanEvent(offset: PanMoveOffset, direction: DiagonalDirection): boolean {
        const contour = this.controller.contour;
        const editor = this.controller.editor;
        const { moveX, moveY } = offset;
        const { clientX: mouseX, clientY: mouseY } = offset.mousePosition;
        const leftTop = contour.getLeftTop().toDevice();
        const rightBottom = contour.getRightBottom().toDevice();
        const leftSideX = leftTop.getDeviceX();
        const topSideY = leftTop.getDeviceY();
        const rightSideX = rightBottom.getDeviceX();
        const bottomSideY = rightBottom.getDeviceY();

        if (direction === Direction.LEFT_TOP || direction === Direction.RIGHT_TOP) {
            if ((mouseY > topSideY && moveY < 0) || (mouseY < topSideY && moveY > 0)) {
                return false;
            }
        } else {
            if ((mouseY > bottomSideY && moveY < 0) || (mouseY < bottomSideY && moveY > 0)) {
                return false;
            }
        }
        if (direction === Direction.LEFT_TOP || direction === Direction.LEFT_BOTTOM) {
            if ((mouseX > leftSideX && moveX < 0) || (mouseX < leftSideX && moveX > 0)) {
                return false;
            }
        } else {
            if ((mouseX < rightSideX && moveX > 0) || (mouseX > rightSideX && moveX < 0)) {
                return false;
            }
        }
        const width = rightSideX - leftSideX;
        const height = bottomSideY - topSideY;

        const absMoveX = Math.abs(moveX);
        const absMoveY = Math.abs(moveY);

        const isRightToLeft =
            (direction === Direction.RIGHT_TOP || direction === Direction.RIGHT_BOTTOM) &&
            width < absMoveX &&
            moveX < 0;
        const isLeftToRight =
            (direction === Direction.LEFT_TOP || direction === Direction.LEFT_BOTTOM) && width < absMoveX && moveX > 0;
        const isTopToBottom =
            (direction === Direction.LEFT_TOP || direction === Direction.RIGHT_TOP) && height < absMoveY && moveY > 0;
        const isBottomToTop =
            (direction === Direction.LEFT_BOTTOM || direction === Direction.RIGHT_BOTTOM) &&
            height < absMoveY &&
            moveY < 0;

        if (
            (isRightToLeft && (isTopToBottom || isBottomToTop)) ||
            (isLeftToRight && (isTopToBottom || isBottomToTop))
        ) {
            editor.reverseControllersDirection(this.controller.direction);
        } else if (isRightToLeft) {
            editor.exchangeDirection(
                direction,
                direction === Direction.RIGHT_TOP ? Direction.LEFT_TOP : Direction.LEFT_BOTTOM
            );
        } else if (isTopToBottom) {
            editor.exchangeDirection(
                direction,
                direction === Direction.LEFT_TOP ? Direction.LEFT_BOTTOM : Direction.RIGHT_BOTTOM
            );
        } else if (isLeftToRight) {
            editor.exchangeDirection(
                direction,
                direction === Direction.LEFT_BOTTOM ? Direction.RIGHT_BOTTOM : Direction.RIGHT_TOP
            );
        } else if (isBottomToTop) {
            editor.exchangeDirection(
                direction,
                direction === Direction.LEFT_BOTTOM ? Direction.LEFT_TOP : Direction.RIGHT_TOP
            );
        }
        contour.addVector(new Vector(moveX, -moveY), direction);
        return true;
    }
    public handleVerticalPanEvent(offset: PanMoveOffset): boolean {
        const controller = this.controller;
        if (
            !controller.isOneOfTheSpecificDirections(
                offset.direction,
                HammerDirection.UP,
                HammerDirection.DOWN,
                HammerDirection.VERTICAL
            )
        ) {
            return false;
        }
        const isTop = controller.direction === Direction.TOP;
        const contour = controller.contour;
        const leftTop = contour.getLeftTop().toDevice();
        const leftBottom = contour.getLeftBottom().toDevice();
        const ofsY = offset.moveY;
        const mouseY = offset.mousePosition.clientY;
        const topSideY = leftTop.getDeviceY();
        const bottomSideY = leftBottom.getDeviceY();
        if (isTop) {
            if ((mouseY > topSideY && ofsY < 0) || (mouseY < topSideY && ofsY > 0)) {
                return false;
            }
        } else {
            if ((mouseY > bottomSideY && ofsY < 0) || (mouseY < bottomSideY && ofsY > 0)) {
                return false;
            }
        }
        const height = leftBottom.getDeviceY() - leftTop.getDeviceY();
        if (height < Math.abs(ofsY)) {
            if ((ofsY > 0 && isTop) || (ofsY < 0 && !isTop)) {
                controller.editor.reverseControllersDirection(controller.direction);
            }
        }
        if (isTop) {
            contour.addVector(new Vector(0, -ofsY), Direction.TOP);
        } else {
            contour.addVector(new Vector(0, -ofsY), Direction.BOTTOM);
        }
        return true;
    }
    public handleHorizontalPanEvent(offset: PanMoveOffset): boolean {
        const controller = this.controller;
        if (
            !controller.isOneOfTheSpecificDirections(
                offset.direction,
                HammerDirection.LEFT,
                HammerDirection.RIGHT,
                HammerDirection.HORIZONTAL
            )
        ) {
            return false;
        }
        const isLeft = controller.direction === Direction.LEFT;
        const contour = controller.contour;
        const leftTop = contour.getLeftTop().toDevice();
        const rightTop = contour.getRightTop().toDevice();
        const ofsX = offset.moveX;
        const mouseX = offset.mousePosition.clientX;
        const leftSideX = leftTop.getDeviceX();
        const rightSideX = rightTop.getDeviceX();
        if (isLeft) {
            if ((mouseX > leftSideX && ofsX < 0) || (mouseX < leftSideX && ofsX > 0)) {
                return false;
            }
        } else {
            // is right side
            if ((mouseX < rightSideX && ofsX > 0) || (mouseX > rightSideX && ofsX < 0)) {
                return false;
            }
        }
        const width = rightTop.x - leftTop.x;
        if (width < Math.abs(ofsX)) {
            if ((ofsX < 0 && !isLeft) || (ofsX > 0 && isLeft)) {
                controller.editor.reverseControllersDirection(controller.direction);
            }
        }
        if (isLeft) {
            contour.addVector(new Vector(ofsX, 0), Direction.LEFT);
        } else {
            contour.addVector(new Vector(ofsX, 0), Direction.RIGHT);
        }
        return true;
    }
}
