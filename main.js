import { Point, Rectangle } from './shape.js';
import { KDTree } from './kd-tree.js';


function addPoint(event, kdtree) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    kdtree.addPoint(new Point(x, y));
}

function drawBackground(ctx, depthCount) {
    for (let depth = 0; depth < depthCount; depth++) {
        if (depth % 2 == 0) { continue; }
        ctx.fillStyle = 'whitesmoke';
        ctx.fillRect(0, ctx.canvas.height * depth / depthCount, ctx.canvas.width, ctx.canvas.height / depthCount);
    }
}

function drawPoint(ctx, aPoint) {
    const radius = 3;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(aPoint.x, aPoint.y, radius, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawHighlightPoint(ctx, aPoint) {
    const radius = 6;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(aPoint.x, aPoint.y, radius, 0, Math.PI * 2, false);
    ctx.stroke();
}

function drawLine(ctx, fromPoint, toPoint) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();
}

function drawHighlightLine(ctx, fromPoint, toPoint) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();
}

function drawTreeNode(ctx, aPoint) {
    const radius = 5;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(aPoint.x, aPoint.y, radius, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawHighlightTreeNode(ctx, aPoint) {
    const radius = 10;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(aPoint.x, aPoint.y, radius, 0, Math.PI * 2, false);
    ctx.stroke();
}

function drawTreeEdge(ctx, fromPoint, toPoint) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();
}

function highlightTreeEdge(ctx, fromPoint, toPoint) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();
}


const nodes = Array();
function nodeFactory(kdtree, index) {
    const canvas = document.getElementById('plane');
    const context = canvas.getContext('2d');
    const treeCanvas = document.getElementById('binary-tree');
    const treeContext = treeCanvas.getContext('2d');


    const thisNode = kdtree.nodes[index];
    const y = treeCanvas.height * (thisNode.depth + 0.5) / kdtree.maxDepth;
    const x = (() => {
        if (thisNode.parentIndex == -1) {return treeCanvas.width / 2; }
        if (index == kdtree.nodes[thisNode.parentIndex].leftIndex) {
            return nodes[thisNode.parentIndex].x - treeCanvas.width / (2 ** (thisNode.depth + 1));
        } else {
            return nodes[thisNode.parentIndex].x + treeCanvas.width / (2 ** (thisNode.depth + 1));
        }
    })();
    nodes[index] = new Point(x, y);
    return nodes[index];
}

const lines = Array();
async function drawVerticalLine(aRectangle, kdtree, index) {
    const canvas = document.getElementById('plane');
    const context = canvas.getContext('2d');
    const treeCanvas = document.getElementById('binary-tree');
    const treeContext = treeCanvas.getContext('2d');

    lines[index] = (() => {
        const fromPoint = new Point(kdtree.points[index].x, aRectangle.top);
        const toPoint = new Point(kdtree.points[index].x, aRectangle.bottom);
        drawLine(context, fromPoint, toPoint);
        return [fromPoint, toPoint];
    })();

    const aNode = nodeFactory(kdtree, index)
    if (kdtree.nodes[index].parentIndex != -1) {
        const parentNode = nodeFactory(kdtree, kdtree.nodes[index].parentIndex)
        drawTreeEdge(treeContext, parentNode, aNode);
    }
    drawTreeNode(treeContext, aNode);

    return new Promise((resolve) => {
        setTimeout(()=> {
            resolve();
        }, 10000 / speed.value);
    });
}

async function drawHorizontalLine(aRectangle, kdtree, index) {
    const canvas = document.getElementById('plane');
    const context = canvas.getContext('2d');
    const treeCanvas = document.getElementById('binary-tree');
    const treeContext = treeCanvas.getContext('2d');


    lines[index] = ((ctx) => {
        const fromPoint = new Point(aRectangle.left, kdtree.points[index].y);
        const toPoint = new Point(aRectangle.right, kdtree.points[index].y);
        drawLine(ctx, fromPoint, toPoint);
        return [fromPoint, toPoint];
    })(context);

    {
        const thisNode = nodeFactory(kdtree, index);
        drawTreeNode(treeContext, thisNode);
        if (kdtree.nodes[index].parentIndex != -1) {
            const parentNode = nodeFactory(kdtree, kdtree.nodes[index].parentIndex);
            drawTreeEdge(treeContext, parentNode, thisNode);
        }
    }

    return new Promise((resolve) => {
        setTimeout(()=> {
            resolve();
        }, 10000 / speed.value);
    });
}


{
    const canvas = document.getElementById('plane');
    const context = canvas.getContext('2d');
    canvas.style.border = "1px solid";

    const rectangle = new Rectangle(0, canvas.width, 0, canvas.height);

    const speed = document.getElementById('speed');
    canvas.addEventListener('click', (event) => {
        addPoint(event, kdtree);
    });
}


const kdtree = new KDTree(
    (aPoint) => { drawPoint(document.getElementById('plane').getContext('2d'), aPoint); },
    drawVerticalLine,
    drawHorizontalLine
);
const rectangle = new Rectangle(0, 400, 0, 400);


{
    const highlightCanvas = document.getElementById('plane-highlighter');
    const highlightContext = highlightCanvas.getContext('2d');

    const selectorCanvas = document.getElementById('tree-selector');
    const selectorContext = selectorCanvas.getContext('2d');

    function mouseOver(event) {
        selectorContext.clearRect(0, 0, event.target.width, event.target.height);
        highlightContext.clearRect(0, 0, event.target.width, event.target.height);
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        nodes.forEach((node, i) => {
            if ((node.x - 8 < x && x < node.x + 8) && (node.y - 8 < y && y < node.y + 8)) {
                drawHighlightPoint(highlightContext, kdtree.points[i]);
                drawHighlightLine(highlightContext, lines[i][0], lines[i][1]);
                drawHighlightTreeNode(selectorContext, node);
                return;
            }
        });
    }

    highlightCanvas.style.border = "1px solid";
    selectorCanvas.addEventListener('mousemove', mouseOver, false);
}

{
    const highlighterCanvas = document.getElementById('tree-highlighter');
    const highlighterContext = highlighterCanvas.getContext('2d');

    const selectorCanvas = document.getElementById('plane-selector');
    const selectorContext = selectorCanvas.getContext('2d');

    let isDown = false;
    let downX;
    let downY;

    function mouseDown(event) {
        const rect = event.target.getBoundingClientRect();
        isDown = true;
        downX = event.clientX - rect.left;
        downY = event.clientY - rect.top;
        selectorContext.clearRect(0, 0, event.target.width, event.target.height);
        highlighterContext.clearRect(0, 0, event.target.width, event.target.height);
    }
    function mouseMove(event) {
        if (!isDown) { return; }
        selectorContext.clearRect(0, 0, event.target.width, event.target.height);
        highlighterContext.clearRect(0, 0, event.target.width, event.target.height);

        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        selectorContext.fillStyle = "blue";
        selectorContext.globalAlpha = 0.1;
        selectorContext.fillRect(downX, downY, x - downX, y - downY);
        selectorContext.strokeStyle = "blue";
        selectorContext.globalAlpha = 0.2;
        selectorContext.strokeRect(downX, downY, x - downX, y - downY);

        {
            const left = Math.min(downX, x)
            const right = Math.max(downX, x)
            const top = Math.min(downY, y)
            const bottom = Math.max(downY, y)
            const [points, indexes, accessedIndexes] = kdtree.find(new Rectangle(left, right, top, bottom));

            points.forEach(point => drawHighlightPoint(selectorContext, point));
            indexes.forEach(index => drawHighlightTreeNode(highlighterContext, nodes[index]));
            for (const index of accessedIndexes) {
                const aNode = nodeFactory(kdtree, index)
                if (kdtree.nodes[index].parentIndex != -1) {
                    const parentNode = nodeFactory(kdtree, kdtree.nodes[index].parentIndex)
                    highlightTreeEdge(highlighterContext, parentNode, aNode);
                }
            }

        }
    }
    function mouseUp(event) { isDown = false; }
    function mouseOut(event) { isDown = false; }

    selectorCanvas.style.border = "1px solid";
    selectorCanvas.addEventListener('mousedown', mouseDown, false);
    selectorCanvas.addEventListener('mousemove', mouseMove, false);
    selectorCanvas.addEventListener('mouseup', mouseUp, false);
    selectorCanvas.addEventListener('mouseout', mouseOut, false);
}


{
    const randomButton = document.getElementById('random');
    const buildButton = document.getElementById('build');
    const resetButton = document.getElementById('reset');

    const highlighters = document.getElementsByClassName('highlighter')
    const selectors = document.getElementsByClassName('selector')
    const drawers = document.getElementsByClassName('drawer')


    function build(event) {
        const treeCanvas = document.getElementById('binary-tree');
        const treeContext = treeCanvas.getContext('2d');
    
        console.log(100)
        Array.from(drawers)
            .map(x => x.style.zIndex = 0);
        Array.from(selectors)
            .map(x => x.style.zIndex = 1);
        Array.from(highlighters)
            .map(x => x.style.zIndex = 2);

        drawBackground(treeContext, kdtree.maxDepth);
        kdtree.build(rectangle);
        kdtree.preorder(Math.floor((0 + kdtree.points.length) / 2), rectangle)
            .then(() => {
                Array.from(drawers)
                    .map(x => x.style.zIndex = 0);
                Array.from(highlighters)
                    .map(x => x.style.zIndex = 1);
                Array.from(selectors)
                    .map(x => x.style.zIndex = 2);
            })
    }

    randomButton.addEventListener('click', () => {
        Array.from(drawers)
            .map(canvas => canvas.getContext('2d'))
            .map(context => context.clearRect(0, 0, context.canvas.width, context.canvas.height));
        kdtree.clear();
        buildButton.disabled = false;

        for (let count = 0; count < 63; count++) {
            const x = Math.floor(Math.random() * 400);
            const y = Math.floor(Math.random() * 400);
            kdtree.addPoint(new Point(x, y));
        }
    });

    buildButton.addEventListener('click', () => {
        build();
        randomButton.disabled = true;
        buildButton.disabled = true;
    });

    resetButton.addEventListener('click', () => {
        const initialize = htmlCollection => {
            Array.from(htmlCollection)
                .map(canvas => canvas.getContext('2d'))
                .map(context => context.clearRect(0, 0, context.canvas.width, context.canvas.height));
        }
        initialize(highlighters);
        initialize(selectors);
        initialize(drawers);

        Array.from(highlighters)
            .map(canvas => canvas.style.zIndex = 0);
        Array.from(selectors)
            .map(canvas => canvas.style.zIndex = 1);
        Array.from(drawers)
            .map(canvas => canvas.style.zIndex = 2);

        kdtree.clear();
        nodes.splice(0);
        lines.splice(0);
        buildButton.disabled = false;
        randomButton.disabled = false;
    });
}