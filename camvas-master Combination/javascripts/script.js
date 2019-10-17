const video = document.getElementById('video');

var baguette = new Image();
var croissant = new Image();
var randomPositionX = new Number();
var randomPositionY = new Number();
var videoWidth = new Number();
var videoHeight = new Number();

var indexOfTheEdible;
videoWidth = getComputedStyle(video).getPropertyValue("width").replace("px","");
videoHeight = getComputedStyle(video).getPropertyValue("height").replace("px","");

var edibles = [];
var imagePositions = [];
var isEdibleNearMouth = [];


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
    randomPositionY = Math.floor(Math.random() * videoHeight - 50);
    return randomPositionY;
}

for (i = 0; i < 5; i++) {
    randomPositionX = getRandomNumberX();
    randomPositionY = getRandomNumberY();
    addEdibleAndItsPosition(baguette, randomPositionX,randomPositionY);
}    

for (i = 0; i < 3; i++) {
    randomPositionX = getRandomNumberX();
    randomPositionY = getRandomNumberY();
    addEdibleAndItsPosition(croissant, randomPositionX, randomPositionY);
}

function addEdibleAndItsPosition(newEdible, xVal, yVal) {
    edibles.push(newEdible);
    imagePositions.push({ x: xVal, y: yVal });
}

//Change the pattern of removing edibles
function removeEdibleAndItsPosition(indexPos) {
    edibles.splice(indexPos, 1);
    imagePositions.splice(indexPos, 1);
}

function drawEdibles(canvas, newEdible, Xposition, Yposition) {
    canvas.getContext('2d').drawImage(newEdible, Xposition, Yposition);
}

function findTheMouthRegion(points) {
    var smallX = points[0].x;
    var largeX = points[0].x;
    var smallY = points[0].y;
    var largeY = points[0].y;

    for (var i = 1; i < points.length; i++) {
        if (points[i].x > largeX) {
            largeX = points[i].x;
        }
        else if (points[i].x < smallX) {
            smallX = points[i].x;
        }
        if (points[i].y > largeY) {
            largeY = points[i].y;
        }
        else if (points[i].y < smallY) {
            smallY = points[i].y;
        }
    }

    // console.log(smallX + "--small--" + smallY);
    // console.log(largeX + "--large--" + largeY);

    return [[smallX, smallY], [smallX, largeY], [largeX, largeY], [largeX, smallY]];
}

function eating(mouthPositionPoints) {
    //construct a region from the mouth positions and then try to find one-by-one if imgPos{} is inside the region 
    // if yes return true and save the index position of the matched Item.

    //console.log(mouthPositionPoints);
    var poly = findTheMouthRegion(mouthPositionPoints);

    // console.log("***********************");
    console.log(poly);

    for (var v = 0; v < imagePositions.length; v++) {
        console.log(imagePositions[v]);
        if (nearAnEdible(poly, imagePositions[v].x, imagePositions[v].y)) {
            removeEdibleAndItsPosition(v);
            console.log("removed an edible at pos "+v +"in array ");
        }
    }

}

function nearAnEdible(vs, x, y){
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

// function nearAnEdible(vs, x, y) {
//     var n = vs.length
//     var inside = 1
//     var lim = n
//     for (var i = 0, j = n - 1; i < lim; j = i++) {
//         var a = vs[i]
//         var b = vs[j]
//         var yi = a[1]
//         var yj = b[1]
//         if (yj < yi) {
//             if (yj < y && y < yi) {
//                 var s = orient(a, b, point)
//                 if (s === 0) {
//                     return 0
//                 } else {
//                     inside ^= (0 < s) | 0
//                 }
//             } else if (y === yi) {
//                 var c = vs[(i + 1) % n]
//                 var yk = c[1]
//                 if (yi < yk) {
//                     var s = orient(a, b, point)
//                     if (s === 0) {
//                         return 0
//                     } else {
//                         inside ^= (0 < s) | 0
//                     }
//                 }
//             }
//         } else if (yi < yj) {
//             if (yi < y && y < yj) {
//                 var s = orient(a, b, point)
//                 if (s === 0) {
//                     return 0
//                 } else {
//                     inside ^= (s < 0) | 0
//                 }
//             } else if (y === yi) {
//                 var c = vs[(i + 1) % n]
//                 var yk = c[1]
//                 if (yk < yi) {
//                     var s = orient(a, b, point)
//                     if (s === 0) {
//                         return 0
//                     } else {
//                         inside ^= (s < 0) | 0
//                     }
//                 }
//             }
//         } else if (y === yi) {
//             var x0 = Math.min(a[0], b[0])
//             var x1 = Math.max(a[0], b[0])
//             if (i === 0) {
//                 while (j > 0) {
//                     var k = (j + n - 1) % n
//                     var p = vs[k]
//                     if (p[1] !== y) {
//                         break
//                     }
//                     var px = p[0]
//                     x0 = Math.min(x0, px)
//                     x1 = Math.max(x1, px)
//                     j = k
//                 }
//                 if (j === 0) {
//                     if (x0 <= x && x <= x1) {
//                         return 0
//                     }
//                     return 1
//                 }
//                 lim = j + 1
//             }
//             var y0 = vs[(j + n - 1) % n][1]
//             while (i + 1 < lim) {
//                 var p = vs[i + 1]
//                 if (p[1] !== y) {
//                     break
//                 }
//                 var px = p[0]
//                 x0 = Math.min(x0, px)
//                 x1 = Math.max(x1, px)
//                 i += 1
//             }
//             if (x0 <= x && x <= x1) {
//                 return 0
//             }
//             var y1 = vs[(i + 1) % n][1]
//             if (x < x0 && (y0 < y !== y1 < y)) {
//                 inside ^= 1
//             }
//         }
//     }
//     return 2 * inside - 1
// }


video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.getElementById('wrapper').append(canvas);
    const displaySize = {
        width: videoWidth, height: videoHeight
    }

    faceapi.matchDimensions(canvas, displaySize);
    setInterval(
        async () => {
            const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // If the mouth points are near the image 
            /**
             *$$$$$$$$$$$$$  change the function to detect the current object location and make em dissapper by 
             * running a function
             * (Math.abs(detections[0].landmarks.getMouth()[0]._x - 500) < 50)
             * may be later  try detections[1] for a second palyer
             * 
             * eating(detections[0].landmarks.getMouth()
             */
            if (eating(detections[0].landmarks.getMouth())) {
                console.log("volia !!!" + edibles.length);

            }

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);


            for (var i = 0; i < edibles.length; i++) {
                drawEdibles(canvas, edibles[i], imagePositions[i].x, imagePositions[i].y);
            }
            // canvas.getContext('2d').drawImage(baguette,0,0);
            // canvas.getContext('2d').drawImage(croissant,500,300);

            //-------------- removed the drawings of the points of landmarks
            //faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100)

})
