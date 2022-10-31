const graphListContainerDOM = document.getElementById('graph-list-container')
const graphPointColor = '#2980b9';
const graphLineColor = '#3498db';
const graphBgColor = '--primary-bg-color';
const defaultPointSize = 6;
const graphWidth = 450;
// const graphWidth = 1200;
const graphYGap = 8;
const animationSpeed = 6;

class LineGraph {
    constructor (x, values, gap, congregation, year, campus, id) {
        this.x = x,
        this.values = values,
        this.gap = gap,
        this.congregation = congregation,
        this.year = year,
        this.campus = campus,
        this.width = 0,
        this.height = 0,
        this.id = id
    }

    draw() {
        if (!this.x || !this.values.length) return;
        //create graph container
        const graphContainerDOM = document.createElement('div')
        graphContainerDOM.classList.add('graph-container')
        graphContainerDOM.id = `graph-container-${this.id}`;
        // graphContainerDOM.style.maxWidth = `${graphWidth}px`;

        //create graph title
        const titleDOM = document.createElement('h1');
        const titleText = document.createTextNode(`${this.year} - ${this.congregation}${this.campus ? ` - ${this.campus}` : ''}`);
        titleDOM.appendChild(titleText);
        graphContainerDOM.appendChild(titleDOM);

        //create graph row
        const row1 = document.createElement('div');
        row1.classList.add('row');
        graphContainerDOM.appendChild(row1)
    
        //create column
        const col1 = document.createElement('div');
        col1.classList.add('col')
        row1.appendChild(col1)
    
        //create y axis column
        const yAxisDOM = document.createElement('div');
        yAxisDOM.id = 'y-axis';
        yAxisDOM.style.gap = `${graphYGap}px`
        //append y-axis to graph container
        col1.appendChild(yAxisDOM)
    
        //create column
        const col2 = document.createElement('div');
        col2.classList.add('col')
        row1.appendChild(col2)
    
        //create x axis column
        const xAxisDOM = document.createElement('div');
        xAxisDOM.id = 'x-axis';
        //append y-axis to graph container
        col2.appendChild(xAxisDOM)

        //create row  2
        const row2 = document.createElement('div');
        row2.classList.add('row');
        row2.classList.add('info');
        graphContainerDOM.appendChild(row2);

        //create average value text element
        const avgValDOM = document.createElement('p');
        avgValDOM.id = `avg-value-${this.id}`
        row2.appendChild(avgValDOM);

        //create aroc value text element
        const avgChangeDOM = document.createElement('p');
        avgChangeDOM.id = `avg-change-${this.id}`
        row2.appendChild(avgChangeDOM);
        
        //create canvas container
        const graphDOM = document.createElement('main');
        graphDOM.classList.add('graph')
        graphDOM.id = `graph-${this.id}`;
        //append graph to column
        col2.appendChild(graphDOM)
    
        if (!this.gap) this.gap = Math.pow(10, Math.max(...this.values).toString().length - 2);
        while (Math.max(...this.values) / this.gap > 9) this.gap = Math.round(this.gap * 1.5);
        if (this.gap < 10) this.gap = 10;
        //DRAW LAYOUT OF GRAPH
        const maxValue = Math.ceil(Math.max(...this.values) / this.gap) * this.gap;
        const minValue = Math.floor(Math.min(...this.values) / this.gap) * this.gap;
        const y = [];
        let currVal = maxValue;
        while (currVal >= minValue) {
            y.unshift(currVal)
            currVal -= this.gap;
        }
        
        let lastMonth;
        xAxisDOM.innerHTML = this.x.map(val => {
            if (!val.toString().includes('/')) return `<p class="date-value-${this.id} stack"><span>${val}</span></p>`
            const currMonth = val.split('/')[0] - 1
            let label = currMonth == lastMonth ? '' : new Date(2022,currMonth,1).toLocaleString('default', { month: 'short' });
            lastMonth = currMonth;
            return `
                <p class="date-value-${this.id}">${label ? `<span>${label}</span>` : ''}</p>
            `
        }).join('')
        
        yAxisDOM.innerHTML = y.map(val => {

            return `
                <p class="num-value"><span>${abbrNum(val, 0)}</span></p>
            `
        }).join('')
        graphListContainerDOM.appendChild(graphContainerDOM)
        
        const graphMaxWidth = .60;

        if (graphWidth > window.innerWidth * graphMaxWidth) {
            this.width = graphWidth * graphMaxWidth
        } else {
            this.width = graphWidth;
        }
        this.height = yAxisDOM.offsetHeight;
        this.populate(this.width, this.height, this.values, this.x, minValue, this.gap, this.id);
    }

    populate(width, height, points, dates, min, gap, id) {

        const slopes = [];
        let averageLine1;
        let averageLine2

        //-------------------------------------------------------

        var s1 = function(sketch) {
            const lines = [];
            const dots = [];
            class Line {
                constructor (x1, y1, x2, y2, color, id) {
                    this.x1 = x1,
                    this.y1 = y1,
                    this.x2 = x2,
                    this.y2 = y2,
                    this.color = color,
                    this.id = id,
                    this.animHeight1 = sketch.height,
                    this.animHeight2 = sketch.height
                }

                draw() {
                    sketch.stroke(this.color);
                    sketch.strokeWeight(2)
                    sketch.line(this.x1, this.y1, this.x2, this.y2);
                    // this.animHeight1 -= animationSpeed - (this.x1 / 200);
                    // this.animHeight2 -= animationSpeed - (this.x2 / 200);
                }
            }
            class Point {
                constructor (x, y, value, date, radius, color, id) {
                    this.x = x,
                    this.y = y,
                    this.value = value,
                    this.date = date,
                    this.radius = radius,
                    this.color = color,
                    this.id = id,
                    this.highlighted = false,
                    this.animHeight = sketch.height
                }

                draw() {

                    sketch.fill(this.color)
                    sketch.noStroke()
                    sketch.ellipse(this.x, this.y, this.radius)
                }
            }

            const toHex = (rgb) => {
                //rgb(1,2,3)
                const values = rgb.toString().split('rgb(')[1].split(')')[0].split(',');
                // values.pop()
                const hexValues = values.map(value => {
                    const hex = parseInt(value).toString(16)
                    return hex.length == 1 ? "0" + hex : hex;
                })
                return '#' + hexValues[0] + hexValues[1] + hexValues[2];
            }

            const calcX = (x) => {
                const elemWidth = document.querySelector(`.date-value-${id}`).getBoundingClientRect().width
                const xOffset = 12 + (elemWidth / 2)
                const availableWidth = sketch.width - (16 + (elemWidth / 2));
                // return availableWidth
                return xOffset + ((availableWidth - xOffset) / (points.length - 1)) * x
            }
            const calcY = (y) => {
                const elemHeight = document.querySelector('.num-value').getBoundingClientRect().height
                return sketch.height - (elemHeight / 2) - (((y - min) / gap) * (elemHeight + graphYGap))
            }

            const drawLine = (x1, y1, x2, y2, color) => {
                lines.push(new Line(calcX(x1), calcY(y1), calcX(x2), calcY(y2), color, dots.length));
                // sketch.line(33 * x1 + 7, sketch.height - 9 - (26.4 * ((y1 - min) / gap)), 33 * x2 + 7, sketch.height - 9 - (26.4 * ((y2 - min) / gap)))
            }
            const plotPoint = (x, y, thickness, color, selectable) => {
                dots.push(new Point(calcX(x), calcY(y), selectable ? y : null, dates[x], thickness, color, dots.length))
            }

            sketch.setup = function() {
                let canvas = sketch.createCanvas(width, height);
                canvas.parent(`#graph-${id}`)
                canvas.mouseMoved(handleMouseOver)
                canvas.mouseOut(() => dots.forEach(dot => dot.highlighted = false))
                
                // sketch.rectMode(sketch.CENTER);

                
                for (let i = 0; i < points.length; i ++) {
                    if (points[i + 1]) slopes.push(points[i + 1] - points[i])
                }
                if (!points.length || !slopes.length) return;

                // slopes.sort(function(a,b){return a - b});
                // slopes.splice(0, 1)
                // slopes.splice(slopes.length - 1, 1)
                const averageSlope = slopes.reduce((val, accum) => val + accum) / slopes.length;
                const averagePointValue = points.reduce((val, accum) => val + accum) / points.length;
                const averageChange = parseFloat(((averageSlope / averagePointValue) * points.length * 100).toFixed(2));


                console.log(`${id}: ${averageChange}`)
                // console.log(`${id}: ${(slopes.reduce((val, accum) => val + accum) / slopes.length) / averagePointValue}`)

                document.getElementById(`avg-value-${id}`).innerHTML = `Avg Value: <strong>${abbrNum(averagePointValue, 2)}</strong>`
                document.getElementById(`avg-change-${id}`).innerHTML = `Avg Change: <strong>${averageChange}%</strong>`

                averageLine1 = sketch.createVector(0, averagePointValue - (averagePointValue * (averageChange / 200)));
                averageLine2 = sketch.createVector(points.length - 1, averagePointValue + (averagePointValue * (averageChange / 200)));

                // plot average growth line and points
                plotPoint(averageLine1.x, averageLine1.y, defaultPointSize, averageLine2.y > averageLine1.y ? '#2ecc7199' : '#e74c3c99', false);
                plotPoint(averageLine2.x, averageLine2.y, defaultPointSize, averageLine2.y > averageLine1.y ? '#2ecc7199' : '#e74c3c99', false);
                drawLine(averageLine1.x, averageLine1.y, averageLine2.x, averageLine2.y, averageLine2.y > averageLine1.y ? '#2ecc7199' : '#e74c3c99');

                for (let i = 0; i < points.length; i ++) {
                    plotPoint(i, points[i], defaultPointSize, graphPointColor, true);
                    if (!isNaN(points[i + 1])) {
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
                sketch.background(getComputedStyle(document.documentElement).getPropertyValue(graphBgColor))

                for (let i = 0; i < lines.length; i ++) {
                    lines[i].draw();
                };
                for (let i = 0; i < dots.length; i ++) {
                    dots[i].draw();
                };
                dots.filter(dot => dot.highlighted).forEach(dot => {
                    const {x, y, value, date} = dot
                    const boxHeight = 28;
                    const boxWidth = 48;
                    let xOriginOffset = sketch.mouseX;
                    let yOriginOffset = sketch.mouseY;

                    if (sketch.mouseX > sketch.width / 2) xOriginOffset -= boxWidth;
                    if (sketch.mouseY > sketch.height / 2) yOriginOffset -= boxHeight;

                    //line from point to box
                    sketch.stroke('#9f9696')
                    sketch.strokeWeight(1)
                    sketch.line(sketch.mouseX, sketch.mouseY, x, y)
                    
                    //point on line end
                    sketch.noStroke();
                    sketch.fill('#9f9696')
                    sketch.ellipse(sketch.mouseX, sketch.mouseY, 5, 5)
                    
                    //larger point on graph
                    sketch.stroke('#FFFFFF');
                    sketch.strokeWeight(2)
                    sketch.fill(graphPointColor);
                    sketch.ellipse(x, y, 10)

                    // 36 x 24 box
                    sketch.strokeWeight(1)
                    sketch.stroke('#565656');
                    sketch.fill('#FFFFFF');
                    sketch.rect(xOriginOffset, yOriginOffset, boxWidth, boxHeight)


                    sketch.noStroke()
                    sketch.fill(0)
                    sketch.text(abbrNum(value, 2), xOriginOffset + 2, yOriginOffset + 12);
                    sketch.text(date, xOriginOffset + 2, yOriginOffset + 25);
                })
            }
        }
        new p5(s1)
    }
    //-------------------------------------------------------------
}

const graphsList = [];

const drawLineGraph = (x, values, gap, congregation, year, campus) => {
    const graphObject = new LineGraph(x, values, gap, congregation, year, campus, graphsList.length);
    graphsList.push(graphObject)

    graphObject.draw();

}