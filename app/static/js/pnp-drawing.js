
const LAYER_BASE = 0;
const LAYER_TEMP = 1;
const LAYER_DRAW = 2;

// Creates a new canvas element and appends it as a child to
// the parent element, and returns a DrawPad wrapper around 
// the newly created canvas element
function createCanvas(parent, width, height, zIndex) {
    var canvasNode = document.createElement('canvas');
    canvasNode.style.width = width || '100%';
    canvasNode.style.height = height || '100%';
    canvasNode.style.position = 'absolute';
    canvasNode.style.left = parent.offsetLeft;
    canvasNode.style.top = parent.offsetTop;
    canvasNode.style.zIndex = zIndex;
    parent.append(canvasNode);
    canvasNode.width = canvasNode.offsetWidth;
    canvasNode.height = canvasNode.offsetHeight;
    return canvasNode;
}

function createOnlineDrawPad(parent, sendMessage, width, height) {
    var canvases = [];
    for (var i = 0; i < 3; i++) {
        canvases.push(createCanvas(parent, width, height, i));
    }
    var drawPad = new OnlineDrawPad(canvases, sendMessage);
    drawPad.clearTo('#FFF');
    drawPad.drawGrid('#099', 50, 50, 0.5);
    return drawPad;
}

function DrawPad(canvases) {
    this.canvases = canvases;
    this.width = this.canvases[0].width
    this.height = this.canvases[0].height
    this.offsetLeft = this.canvases[0].offsetLeft
    this.offsetTop = this.canvases[0].offsetTop
    this.isDrawing = false;
    this.contexts = [];
    for (var i = 0; i < canvases.length; i++) {
        this.contexts.push(canvases[i].getContext('2d'));
    }
    this.drawWidth = 5;
    this.drawColor = '#000000';
    this.brushType = 'free';
    this.recorder = null;
    
    this.storedImage = null;
    this.brush = null;
    
    this.clearTo = function(color) {
        this.contexts[0].fillStyle = color;
        this.contexts[0].fillRect(0, 0, this.width, this.height);
        for (var i = 1; i < this.contexts.length; i++) {
            this.contexts[i].clearRect(0, 0, this.width, this.height);
        }
    };
    
    // Setup drawing layer
    var drawCanvas = this.canvases[LAYER_DRAW];
    drawCanvas.onmousedown = function(e) {
        console.log("mouse down");
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        this.isDrawing = true;
        this.brush = createBrush(this.brushType, this.drawColor, this.drawWidth);
        this.brush.start(x, y);
    }.bind(this);
    
    drawCanvas.onmouseup = function(e) {
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        this.isDrawing = false;
        this.brush.end(x, y);
        this.contexts[LAYER_DRAW].clearRect(0, 0, this.width, this.height);
    }.bind(this);
    
    drawCanvas.onmousemove = function(e) {
        if (!this.isDrawing) {
            return;
        }
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        this.brush.mousemove(x, y);
        this.brush.drawMove(this.contexts[LAYER_DRAW]);
    }.bind(this);
}

function AdvancedDrawPad(canvases) {
    DrawPad.call(this, canvases);
    
    this.drawGrid = function(color, xSpacing, ySpacing, lineWidth) {
        var width = this.width;
        var height = this.height;
        var xNum = Math.round(width / xSpacing) + 1;
        var yNum = Math.round(height / ySpacing) + 1;
        var context = this.contexts[LAYER_BASE];
        context.fillStyle = null;
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.beginPath();
        for (var y = 0; y < yNum; y++) {
            context.moveTo(0, y * ySpacing);
            context.lineTo(width, y * ySpacing);
        }
        for (var x = 0; x < xNum; x++) {
            context.moveTo(x * xSpacing, 0);
            context.lineTo(x * xSpacing, height);
        }
        context.stroke();
    };
}

function OnlineDrawPad(canvases, sendMessage) {
    AdvancedDrawPad.call(this, canvases);
    this.sendMessage = sendMessage;
    
    this.onDrawMessage = function(draws) {
        for (var drawIndex in draws) {
            var brush = createBrushFromJson(draws[drawIndex]);
            brush.drawFinal(this.contexts[LAYER_BASE]);
        }
    };
    
    // Setup drawing layer
    var drawCanvas = this.canvases[LAYER_DRAW];
    drawCanvas.superOnmouseup = drawCanvas.onmouseup;
    drawCanvas.onmouseup = function(e) {
        drawCanvas.superOnmouseup(e);
        var json = this.brush.toJson();
        this.sendMessage('draw', json);
    }.bind(this);
}
