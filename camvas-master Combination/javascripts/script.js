const video = document.getElementById('video');

var baguette = new Image();
var croissant = new Image();
var randomPositionX = new Number();
var randomPositionY = new Number();
var videoWidth = new Number();
var videoHeight = new Number();

videoWidth = video.width;
videoHeight = video.height;

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

function getRandomNumberX() {
    randomPositionX = Math.floor(Math.random() * (videoWidth-50));
    return randomPositionX;
}

function getRandomNumberY() {
    randomPositionY = Math.floor(Math.random() * videoHeight-50);
    return randomPositionY;
}

for (i = 0; i < 5; i++) {
    randomPositionX = getRandomNumberX();
    randomPositionY = getRandomNumberY();
    console.log(randomPositionX + " "+ randomPositionY);
}    

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
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);   
            canvas.getContext('2d').drawImage(croissant,randomPositionX,randomPositionY);
            canvas.getContext('2d').drawImage(baguette,0,0);             

            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100)

})
