const graphListContainerDOM = document.getElementById('graph-list-container')
const graphPointColor = '#2980b9';
const graphLineColor = '#3498db';
const graphBgColor = '#cdc3c3';
const defaultPointSize = 6;

class Graph {
    constructor (x, values, gap, id) {
        this.x = x,
        this.values = values,
        this.gap = gap,
        this.width = 0,
        this.height = 0,
        this.id = id
    }

    draw() {
        //create graph container
        const graphContainerDOM = document.createElement('div')
        graphContainerDOM.classList.add('graph-container')
        graphContainerDOM.id = `graph-container-${this.id}`;
    
        //create column
        const col1 = document.createElement('div');
        col1.classList.add('col')
        graphContainerDOM.appendChild(col1)
    
        //create y axis column
        const yAxisDOM = document.createElement('div');
        yAxisDOM.id = 'y-axis';
        //append y-axis to graph container
        col1.appendChild(yAxisDOM)
    
        //create column
        const col2 = document.createElement('div');
        col2.classList.add('col')
        graphContainerDOM.appendChild(col2)
    
        //create x axis column
        const xAxisDOM = document.createElement('div');
        xAxisDOM.id = 'x-axis';
        //append y-axis to graph container
        col2.appendChild(xAxisDOM)
    
        //create canvas container
        const graphDOM = document.createElement('main');
        graphDOM.classList.add('graph')
        graphDOM.id = `graph-${this.id}`;
        graphDOM.style.backgroundColor = graphBgColor;
        //append graph to column
        col2.appendChild(graphDOM)
    
        //DRAW LAYOUT OF GRAPH
        const maxValue = Math.ceil(Math.max(...this.values) / this.gap) * this.gap;
        const minValue = Math.floor(Math.min(...this.values) / this.gap) * this.gap;
        const y = [];
        let currVal = maxValue;
        while (currVal >= minValue) {
            y.unshift(currVal)
            currVal -= this.gap;
        }
    
        xAxisDOM.innerHTML = this.x.map(val => {
            return `
                <p>${val}</p>
            `
        }).join('')
        yAxisDOM.innerHTML = y.map(val => {
            return `
                <p>${val}</p>
            `
        }).join('')
        
        graphListContainerDOM.appendChild(graphContainerDOM)
        
        //set height for canvas
        this.width = xAxisDOM.offsetWidth;
        this.height = yAxisDOM.offsetHeight;
        this.update(this.width, this.height, this.values, minValue, this.gap, this.id);
    }

    update(width, height, points, min, gap, id) {

        const slopes = [];
        let averageLine1;
        let averageLine2

        //-------------------------------------------------------

        var s1 = function(sketch) {
            const lines = [];
            const dots = [];
            class Line {
                constructor (x1, y1, x2, y2, color) {
                    this.x1 = x1,
                    this.y1 = y1,
                    this.x2 = x2,
                    this.y2 = y2,
                    this.color = color;
                }

                draw() {
                    sketch.stroke(this.color);
                    sketch.strokeWeight(2)
                    sketch.line(this.x1, this.y1, this.x2, this.y2)
                }
            }
            class Point {
                constructor (x, y, value, radius, color, id) {
                    this.x = x,
                    this.y = y,
                    this.value = value,
                    this.radius = radius,
                    this.color = color,
                    this.id = id,
                    this.highlighted = false
                }

                draw() {
                    if (this.highlighted && this.value != null) {
                        this.radius = defaultPointSize + 4;
                        sketch.noStroke()
                        sketch.fill(0)
                        sketch.text(this.value, this.x, this.y - 5);
                        
                        sketch.stroke('#000000BB')
                        sketch.strokeWeight(1)
                        sketch.line(sketch.mouseX, sketch.mouseY, this.x, this.y)
                    } else {
                        this.radius = defaultPointSize;
                    }

                    sketch.fill(this.color)
                    sketch.noStroke()
                    sketch.ellipse(this.x, this.y, this.radius)
                }
            }

            const drawLine = (x1, y1, x2, y2, color) => {
                lines.push(new Line(33 * x1 + 7, sketch.height - 9 - (26.4 * ((y1 - min) / gap)), 33 * x2 + 7, sketch.height - 9 - (26.4 * ((y2 - min) / gap)), color));
                // sketch.line(33 * x1 + 7, sketch.height - 9 - (26.4 * ((y1 - min) / gap)), 33 * x2 + 7, sketch.height - 9 - (26.4 * ((y2 - min) / gap)))
            }
            const plotPoint = (x, y, thickness, color, selectable) => {
                dots.push(new Point(33 * x + 7, sketch.height - 9 - (26.4 * ((y - min) / gap)), selectable ? y : null, thickness, color, dots.length))
            }

            sketch.setup = function() {
                let canvas = sketch.createCanvas(width, height);
                canvas.parent(`#graph-${id}`)
                canvas.mouseMoved(handleMouseOver)
                canvas.mouseOut(() => dots.forEach(dot => dot.highlighted = false))
                
                sketch.rectMode(sketch.CENTER);

                for (let i = 0; i < points.length; i ++) {
                    if (points[i + 1]) slopes.push(points[i + 1] - points[i])
                }

                slopes.sort(function(a,b){return a - b});
                slopes.splice(0, 2)
                slopes.splice(slopes.length - 2, 2)
                const averageSlopeHeight = (slopes.reduce((val, accum) => val + accum) / slopes.length) * points.length;
                const averagePointValue = points.reduce((val, accum) => val + accum) / points.length;

                averageLine1 = sketch.createVector(0, averagePointValue - (averageSlopeHeight / 2));
                averageLine2 = sketch.createVector(points.length - 1, averagePointValue - (averageSlopeHeight / 2) + averageSlopeHeight);

                //plot average growth line and points
                plotPoint(averageLine1.x, averageLine1.y, defaultPointSize, '#27ae60', false);
                plotPoint(averageLine2.x, averageLine2.y, defaultPointSize, '#27ae60', false);
                drawLine(averageLine1.x, averageLine1.y, averageLine2.x, averageLine2.y, averageLine2.y > averageLine1.y ? '#2ecc7199' : '#e74c3c99');

                for (let i = 0; i < points.length; i ++) {
                    plotPoint(i, points[i], defaultPointSize, graphPointColor, true);
                    if (points[i + 1]) {
                        drawLine(i, points[i], i + 1, points[i + 1], graphLineColor)
                    }
                }
            }

            const handleMouseOver = () => {
                const mx = sketch.mouseX;
                const my = sketch.mouseY;

                const distFromPoints = dots.filter(dot => dot.value != null).map(dot => {
                    const {x, y, id} = dot;
                    const dist = Math.sqrt(Math.pow((x - mx), 2) + Math.pow((y - my), 2));
                    return {dist: dist, id: id};
                }).sort(function(a,b){return a.dist - b.dist})
                const closestDot = dots.filter(dot => dot.id == distFromPoints[0].id)[0];
                dots.forEach(dot => dot.highlighted = false);
                closestDot.highlighted = true;
            }

            sketch.draw = function() {
                sketch.frameRate(60)
                sketch.background(graphBgColor)

                

                for (let i = 0; i < lines.length; i ++) {
                    lines[i].draw();
                };
                for (let i = 0; i < dots.length; i ++) {
                    dots[i].draw();
                };
            }
        }
        new p5(s1)
    }
    //-------------------------------------------------------------
}

const graphsList = [];

const drawGraph = (x, values, gap) => {
    const graphObject = new Graph(x, values, gap, graphsList.length);
    graphsList.push(graphObject)

    graphObject.draw();

}