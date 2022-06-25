export class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
}

export class Rectangle {
    constructor(left, right, top, bottom) {
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;
    }
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }
    get top() {
        return this._top;
    }
    get bottom() {
        return this._bottom;
    }
    splitVertically(middle) {
        const leftRect = new Rectangle(this.left, middle, this.top, this.bottom);
        const rightRect = new Rectangle(middle, this.right, this.top, this.bottom);
        return [leftRect, rightRect];
    }
    splitHorizontally(middle) {
        const topRect = new Rectangle(this.left, this.right, this.top, middle);
        const bottomRect = new Rectangle(this.left, this.right, middle, this.bottom);
        return [topRect, bottomRect];
    }
}
