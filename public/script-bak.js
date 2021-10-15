//canvas for signature

var canvas = document.getElementById("signature-pad");
var ctx = canvas.getContext("2d");
var submit = document.getElementById("submit");
//var clear = document.getElementsByClassName("clear");
var sigimg = document.getElementById("sigimg");
var clearButton = document.getElementById("clear");

//variables needed
let currentX;
let currentY;
let lastX;
let lastY;
let startDrawing;

//First, i need to track the mouse position
function trackPositions(e) {
    lastX = currentX;
    lastY = currentY;
    currentX = e.pageX - canvas.offsetLeft;
    currentY = e.pageY - canvas.offsetTop;
}
canvas.addEventListener("mousedown", function (e) {
    startDrawing = true;
    // lastX = e.pageX - canvas.offsetLeft;
    // lastY = e.pageY - canvas.offsetTop;
    trackPositions(e);
});

canvas.addEventListener("mousemove", function (e) {
    if (startDrawing == true) {
        trackPositions(e);
        draw();
    }
    // lastX = e.pageX - canvas.offsetLeft;
    // lastY = e.pageY - canvas.offsetTop;
});

canvas.addEventListener("mouseup", function (e) {
    startDrawing = false;

    trackPositions(e);

    // console.log(canvas.offsetLeft);
    // console.log("LAST X IS: ", currentX);
    // console.log(e.clientX, "IS clientX");
    //
    // console.log(canvas.offsetTop);
    // console.log("LAST Y IS: ", currentY);
    // console.log(e.clientY, "IS clientY");
});

function draw() {
    if (startDrawing == true) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY); //first click
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.lineTo(currentX, currentY); //last known coord. of mouse
        ctx.stroke();
    } else if (startDrawing == false) {
        //checking if startDrawing is true
        ctx.closePath();
    }
}

submit.addEventListener("click", function () {
    sigimg.value = canvas.toDataURL();
});

clearButton.addEventListener("click", function () {
    ctx.clearRect(0, 0, 500, 100);
});

// Set up touch events for mobile, etc
canvas.addEventListener(
    "touchstart",
    function (e) {
        e.preventDefault();
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);
canvas.addEventListener(
    "touchend",
    function (e) {
        e.preventDefault();
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    },
    false
);
canvas.addEventListener(
    "touchmove",
    function (e) {
        var touch = e.touches[0];
        e.preventDefault();
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top,
    };
}

document.body.addEventListener(
    "touchstart",
    function (e) {
        if (e.target == canvas) {
            document.body.style.overflow = "hidden";
        }
    },
    false
);
document.body.addEventListener(
    "touchend",
    function (e) {
        if (e.target == canvas) {
            document.body.style.overflowY = "scroll";
        }
    },
    false
);
document.body.addEventListener(
    "touchmove",
    function (e) {
        if (e.target == canvas) {
            document.body.style.overflow = "hidden";
        }
    },
    false
);
