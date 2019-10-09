const video = document.getElementById('video');

var baguette = new Image();
var croissant = new Image();

var edibles = [];
var imagePositions = [];

baguette.src = "images/baguette.png";
croissant.src = "images/croissant.png";


// loading all the models async
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(playVideo)

function playVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

function addEdibleAndItsPosition(newEdible , xVal, yVal) {
    edibles.push(newEdible);
    imagePositions.push({x: xVal, y:yVal});
}

function removeEdibleAndItsPosition(indexPos){
    edibles = edibles.slice(indexPos, indexPos+1);
    imagePositions = imagePositions.slice(indexPos, indexPos+1);
}

function drawEdibles(canvas, newEdible, Xposition, Yposition){
    canvas.getContext('2d').drawImage(newEdible, Xposition, Yposition);
}

addEdibleAndItsPosition(baguette, 20,20);
addEdibleAndItsPosition(croissant, 500,350);

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = {
        width: video.width, height: video.height
    }
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(
        async () => {
            const detections = await faceapi.detectAllFaces(video,
                new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            //console.log(detections[0].landmarks.getMouth()[0]._x);


            // If the mouth points are near the image 
            if(Math.abs(detections[0].landmarks.getMouth()[0]._x - 500) < 50){  
                console.log("volia !!!"+ edibles.length); 
                removeEdibleAndItsPosition(0);

            }
            
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            

            for(var i=0; i< edibles.length; i++){
                drawEdibles(canvas, edibles[i], imagePositions[i].x, imagePositions[i].y);
            }
            // canvas.getContext('2d').drawImage(baguette,0,0);
            // canvas.getContext('2d').drawImage(croissant,500,300);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100)

})
