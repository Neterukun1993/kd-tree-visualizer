class Points extends Array {
    sortByXCoordinate(start, end) {
        const points = this.slice(start, end);
        points.sort((p0, p1) => p0.x - p1.x).forEach((point, i) => {
            this[start + i] = point;
        });
    }
    sortByYCoordinate(start, end) {
        const points = this.slice(start, end);
        points.sort((p0, p1) => p0.y - p1.y).forEach((point, i) => {
            this[start + i] = point;
        });
    }
}

export class Node {
    constructor(leftIndex, rightIndex, parentIndex, depth) {
        this._leftIndex = leftIndex;
        this._rightIndex = rightIndex;
        this._parentIndex = parentIndex;
        this._depth = depth;
    }
    get leftIndex() {
        return this._leftIndex;
    }
    get rightIndex() {
        return this._rightIndex;
    }
    get parentIndex() {
        return this._parentIndex;
    }
    get depth() {
        return this._depth;
    }
}

export class KDTree {
    constructor(pointAddHandler, verticalLineAddHandler, horizontalLineAddHandler) {
        this.points = new Points();
        this.nodes = new Array();
        this.pointAddHandler = pointAddHandler;
        this.verticalLineAddHandler = verticalLineAddHandler;
        this.horizontalLineAddHandler = horizontalLineAddHandler;
    }
    get maxDepth() {
        let depth = 0;
        for (let i = this.points.length; i != 0; i = i >>> 1) {
            depth += 1;
        }
        return depth;
    }
    countPoints() {
        return this.points.length;
    } 
    addPoint(aPoint) {
        this.points.push(aPoint);
        this.pointAddHandler(aPoint);
    }
    clear() {
        this.points.splice(0);
    }
    build(aRectangle) {
        this.nodes.length = this.points.length;
        this.recursiveBuild(0, this.points.length, -1, 0);
    }
    recursiveBuild(start, end, parent, depth) {
        if (start >= end) {
            return -1;
        }
        const middle = Math.floor((start + end) / 2);
        if (depth % 2 == 0) {
            this.points.sortByXCoordinate(start, end);
        } else {
            this.points.sortByYCoordinate(start, end);
        }
        this.nodes[middle] = new Node(
            this.recursiveBuild(start, middle, middle, depth + 1),
            this.recursiveBuild(middle + 1, end, middle, depth + 1),
            parent, depth
        );
        return middle
    }
    async preorder(index, aRect) {
        if (index == -1) {
            return;
        }
        let formerRect, latterRect;
        if (this.nodes[index].depth % 2 == 0) {
            await this.verticalLineAddHandler(aRect, this, index);
            [formerRect, latterRect] = aRect.splitVertically(this.points[index].x);
        } else {
            await this.horizontalLineAddHandler(aRect, this, index);
            [formerRect, latterRect] = aRect.splitHorizontally(this.points[index].y);
        }
        await this.preorder(this.nodes[index].leftIndex, formerRect);
        await this.preorder(this.nodes[index].rightIndex, latterRect);
    }
    find(aRect) {
        function recursiveFind(depth, index) {
            const x = points[index].x
            const y = points[index].y
            accessedIndexes.push(index);
            if (aRect.left <= x && x < aRect.right && aRect.top <= y && y < aRect.bottom) {
                resultPoints.push(points[index]);
                resultIndexes.push(index);
            }
            if (depth % 2 == 0) {
                if (nodes[index].leftIndex != -1 && aRect.left <= x) recursiveFind(depth + 1, nodes[index].leftIndex);
                if (nodes[index].rightIndex != -1 && x < aRect.right) recursiveFind(depth + 1, nodes[index].rightIndex);
            } else {
                if (nodes[index].leftIndex != -1 && aRect.top <= y) recursiveFind(depth + 1, nodes[index].leftIndex);
                if (nodes[index].rightIndex != -1 && y < aRect.bottom) recursiveFind(depth + 1, nodes[index].rightIndex);
            }
        }

        const resultPoints = new Points();
        const resultIndexes = new Array();
        const accessedIndexes = new Array();
        const points = this.points;
        const nodes = this.nodes;
        recursiveFind(0, Math.floor((0 + this.points.length) / 2))
        return [resultPoints, resultIndexes, accessedIndexes];
    }
}
