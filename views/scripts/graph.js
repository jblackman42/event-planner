// const graphContainerDOM = document.getElementById('graph-container');

// const graphDOM = document.getElementById('graph');
// var canvasWidth = graphDOM.width;
// var canvasHeight = graphDOM.height;
// var ctx = graphDOM.getContext("2d"); 
// ctx.translate(0.5, 0.5);
// var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

// const xAxisDOM = document.getElementById('x-axis');
// const yAxisDOM = document.getElementById('y-axis');


const drawGraph = (x, values, gap) => {
    const points = [];
    let graphGap = 0;
    const currGraphId = document.querySelectorAll('.graph-container').length + 1;
    //create graph container
    const graphContainerDOM = document.createElement('div')
    graphContainerDOM.classList.add('graph-container')
    graphContainerDOM.id = `graph-container-${currGraphId}`;

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
    graphDOM.id = `graph-${currGraphId}`;
    //append graph to column
    col2.appendChild(graphDOM)

    graphGap = gap;

    //DRAW LAYOUT OF GRAPH
    const maxValue = Math.ceil(Math.max(...values) / gap) * gap;
    const y = [];
    let currVal = maxValue;
    while (currVal >= 0) {
        y.unshift(currVal)
        currVal -= gap;
    }

    xAxisDOM.innerHTML = x.map(val => {
        return `
            <p>${val}</p>
        `
    }).join('')
    yAxisDOM.innerHTML = y.map(val => {
        return `
            <p>${val}</p>
        `
    }).join('')

    //UPDATE GRAPH
    values.forEach(val => points.push(val))
    document.body.appendChild(graphContainerDOM)

    var s1 = function(sketch) {
        sketch.setup = function() {
            let canvas = sketch.createCanvas(xAxisDOM.offsetWidth, yAxisDOM.offsetHeight);
            canvas.parent(`#graph-${currGraphId}`)

        
            if (!points.length) return
            // ellipse(7 + 33, height - 9, 10, 10)
            
            const pointVectors = [];
            for (let i = 0; i < points.length; i ++) {
                pointVectors.push(sketch.createVector(33 * i + 7, sketch.height - 9 - (26.4 * (points[i] / graphGap))))
            }
            
            sketch.fill(255, 0, 0)
            for (let i = 0; i < pointVectors.length; i ++) {
                sketch.noStroke()
                sketch.ellipse(pointVectors[i].x, pointVectors[i].y, 10, 10);
                sketch.stroke(255, 0, 255);
                if (pointVectors[i + 1]) {
                    sketch.line(pointVectors[i].x, pointVectors[i].y, pointVectors[i + 1].x, pointVectors[i + 1].y)
                }
            }
        }
    }
    var newSketch = new p5(s1)
}