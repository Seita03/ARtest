// let video;
// let yolo;
// let status;
// let objects = [];

// function setup() {
//   createCanvas(1000, 550);
//   video = createCapture(VIDEO);
//   video.size(1000, 550);

//   // Create a YOLO method
//   yolo = ml5.YOLO(video, startDetecting);

//   // Hide the original video
//   video.hide();
//   status = select('#status');
// }

// function draw() {
//   image(video, 0, 0, width, height);
//   for (let i = 0; i < objects.length; i += 1) {
//     noStroke();
//     fill(0, 255, 0);
//     text(objects[i].label, objects[i].x + 5, objects[i].y + 15);
//     noFill();
//     strokeWeight(4);
//     stroke(0, 255, 0);
//     rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
//   }
// }

// function startDetecting() {
//   status.html('Model loaded!');
//   detect();
// }

// function detect() {
//   yolo.detect(function(err, results) {
//     objects = results;
//     detect();
//   });
// }



function getStream(video){
    return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "environment"
        }
    })
    .then((stream)=>{
        video.srcObject = stream;
        return video;
    });
}

function detectObject(video, canvas){
    const render = canvas.getContext("2d");

    render.beginPath();
    render.lineWidth = 2;
    render.strokeStyle = "#2fad09";

    render.font = "16px consolas";

    render.fillStyle = "#ffffff";
    render.fillRect(0, 0, canvas.width, canvas.height);
    render.fillStyle = "#000000";
    render.fillText("Model Loading...", 4, 14);
    render.fillStyle = "#2fad09";

    return ml5.YOLO({
        filterBoxesThreshold: 0.01,
        IOUThreshold: 0.2,
        classProbThreshold: 0.5
    }).ready
    .then((model)=>{
        render.clearRect(0, 0, canvas.width, canvas.height);
        video.play();

        return setInterval(()=>{
            if(!model.isPredicting){
                model.detect(video)
                .then((results)=>{
                    render.clearRect(0, 0, canvas.width, canvas.height);

                    for(const result of results){
                        render.strokeRect(result.x * canvas.width, result.y * canvas.height, result.w * canvas.width, result.h * canvas.height);
                        render.fillText(`${result.label}: ${Math.round(result.confidence * 100)} %`, result.x * canvas.width + 4, result.y * canvas.height + 14);
                    }
                });
            }
        }, 67);
    });
}

getStream(document.getElementById("capture"))
.then(video => detectObject(video, document.getElementById("detect")))
.catch(error => alert(error.message));