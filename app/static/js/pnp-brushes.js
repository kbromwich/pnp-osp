
function createBrush(brushType, color, width) {
    console.log("Creating brush: "+brushType+","+color+","+width);
    if (brushType == 'free') {
        return new FreeBrush(color, width);
    } else if (brushType == 'line') {
        return new LineBrush(color, width);
    } else if (brushType == 'rect') {
        return new RectangleBrush(color, width);
    } else if (brushType == 'rectCentre') {
        var brush = new RectangleBrush(color, width);
        brush.centred = true;
        return brush;
    } else if (brushType == 'circ') {
        return new CircleBrush(color, width);
    } else if (brushType == 'circCentre') {
        var brush = new CircleBrush(color, width);
        brush.centred = true;
        return brush;
    }
    console.log("Brush type unknown! Defaulting to Free...");
    return new FreeBrush();
}

function createBrushFromJson(json) {
    var brushType = json['brushType'];
    var brush = createBrush(brushType);
    brush.fromJson(json);
    return brush;
}

function Brush(color, width) {
    this.brushType = 'none';
    this.color = color;
    this.width = width;
    this.xStart = 0;
    this.yStart = 0;
    this.xEnd = 0;
    this.xEnd = 0;
    
    this.start = function(x, y) {
        this.xStart = x;
        this.yStart = y;
    };
    
    this.mousemove = function(x, y) {
        this.xEnd = x;
        this.yEnd = y;
    };
    
    this.drawMove = function(context) {};
    this.drawFinal = function(context) {};
    
    this.end = function(x, y) {
        this.xEnd = x;
        this.yEnd = y;
    };
    
    this.toJson = function() {
        console.log("toJson");
        var json = {};
        json['brushType'] = this.brushType;
        json['color'] = this.color;
        json['width'] = this.width;
        json['xStart'] = this.xStart;
        json['yStart'] = this.yStart;
        json['xEnd'] = this.xEnd;
        json['yEnd'] = this.yEnd;
        return json;
    };
    
    this.fromJson = function(json) {
        this.color = json['color'];
        this.width = json['width'];
        this.xStart = json['xStart'];
        this.yStart = json['yStart'];
        this.xEnd = json['xEnd'];
        this.yEnd = json['yEnd'];
    };
}

function FreeBrush(color, width) {
    Brush.call(this, color, width);  
    this.brushType = 'free'; 
    this.xPoints = []
    this.yPoints = []
    
    this.mousemove = function(x, y) {
        this.xPoints.push(x);
        this.yPoints.push(y);
    };
    
    this.drawMove = function(context) {
        this.fillCircle(context, 
                        this.xPoints[this.xPoints.length - 1], 
                        this.yPoints[this.yPoints.length - 1],
                        this.width, this.color);
    };
    
    this.drawFinal = function(context) {
        console.log("FreeBrush drawFinal: " + this.xPoints.length);
        for (var pIndex in this.xPoints) {
            this.fillCircle(context, 
                        this.xPoints[pIndex], 
                        this.yPoints[pIndex],
                        this.width, this.color);
        }
    };

    this.fillCircle = function(context, x, y, radius, color) {
        console.log(["fillCircle",x,y,radius,color].join());
        context.strokeStyle = null;
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.fill();
    };
    
    this.superToJson = this.toJson;
    this.toJson = function() {
        var json = this.superToJson();
        console.log("free toJson");
        json['xPoints'] = this.xPoints;
        json['yPoints'] = this.yPoints;
        return json;
    };
    
    this.superFromJson = this.fromJson;
    this.fromJson = function(json) {
        this.superFromJson(json);
        this.xPoints = json['xPoints'];
        this.yPoints = json['yPoints'];
    };
}

function LineBrush(color, width) {
    Brush.call(this, color, width);
    this.brushType = 'line'; 

}

function RectangleBrush(color, width) {
    Brush.call(this, color, width);
    this.brushType = 'rect'; 
    this.centred = false;
}

function CircleBrush(color, width) {
    Brush.call(this, color, width);
    this.brushType = 'circ'; 
    this.centred = false;
}
