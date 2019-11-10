const video = document.getElementById('video');

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var voiceEdibles = ['wine', 'coffee'];
var grammar = '#JSGF V1.0; grammar voiceEdibles; public <voiceEdibles> = ' + voiceEdibles.join(' | ') + ' ;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var baguette = new Image();
var croissant = new Image();
var wine = new Image();
var coffee = new Image();

var indexOfTheEdible;
var buttonStatus = document.getElementById('score').innerText;
var score = 0;
var videoWidth = getComputedStyle(video).getPropertyValue("width").replace("px", "");
var videoHeight = getComputedStyle(video).getPropertyValue("height").replace("px", "");

const foodOptions = [baguette, croissant];
const drinkOptions = [wine, coffee];

var edibles = [];
var imagePositions = [];
var imageBoundary = [];
var isEdibleNearMouth = [];

var drinks = [];
var drinksPositions = [];

baguette.src = "images/baguette.png";
croissant.src = "images/croissant.png";
wine.src = "images/wine.png";
coffee.src = "images/coffee.png";

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

recognition.onresult = function (event) {
    //recognition.start();
    var last = event.results.length - 1;
    var detectDrink = event.results[last][0].transcript;

    console.log(detectDrink + "***************");
    if (detectDrink == " wine" || detectDrink == " coffee" || detectDrink == "wine" || detectDrink == "coffee" || 
    detectDrink == "Wine" || detectDrink == "Coffee" || 
    detectDrink == "wayne"||detectDrink == "Wayne" || detectDrink == "espresso") {
        if (drinks.length > 0) {
            console.log("in the pop part !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            drinks.pop();
            drinksPositions.pop();
            score += 5;
            document.getElementById('score').innerHTML = score;
            //debugger;
        }
    }
}

recognition.onspeechend = function () {
    recognition.stop();
}


function startGame() {
    if (edibles.length == 0) {
        document.getElementById('details').style.display = "block";
        //document.getElementById('time').innerHTML = "01:00";
        document.getElementById('score').innerHTML = score;
        for (var i = 0; i < 10; i++) {
            generateEdible();
        }
        generateWineOrCoffee();
        startTimer();
        recognition.start();
        console.log("ready to detect Wine/Coffee");
    }
}

function startTimer() {
    var countDownTime = new Date(new Date().getTime() + 62000).getTime();

    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var remaining = countDownTime - now;

        // Time calculations for days, hours, minutes and seconds
        var seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        document.getElementById("time").innerHTML = seconds + "s ";

        // If the count down is over, write some text 
        if (remaining < 0) {
            clearInterval(x);
            document.getElementById("time").innerHTML = "EXPIRED";
            window.location.href = "finish.html";
            document.getElementById("score").innerHTML = score;
        }
    }, 1000);
}

function generateWineOrCoffee() {
    var drinkInterval = setInterval(function () {
        let newDrink = drinkOptions[Math.floor(Math.random() * foodOptions.length)];
        let randomPositionX = Math.floor(Math.random() * (videoWidth - 150)) + 40;
        let randomPositionY = Math.floor(Math.random() * (videoHeight - 150)) + 40;
        addDrinkAndItsPosition(newDrink, randomPositionX, randomPositionY);
        removeWineOrCoffee();
    }, 10000);
}

function removeWineOrCoffee() {
        var removeDrinkInterval = setInterval(function () {
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            if (drinks.length > 0) {
            drinks = [];
            drinksPositions = [];
            }
            clearInterval(removeDrinkInterval);
        }, 5000)
}

function addDrinkAndItsPosition(drink, xPos, yPos) {
    drinksPositions.push({ x: xPos, y: yPos });
    drinks.push(drink);
}


function generateEdible() {
    let newEdible = foodOptions[Math.floor(Math.random() * foodOptions.length)];
    let randomPositionX = Math.floor(Math.random() * (videoWidth - 150)) + 40;
    let randomPositionY = Math.floor(Math.random() * (videoHeight - 150)) + 40;

    let boxCoOrdinates = generateBoxAroundEdible(randomPositionX, randomPositionY);

    addEdibleAndItsPosition(newEdible, randomPositionX, randomPositionY, boxCoOrdinates);
    console.log(randomPositionX, randomPositionY, newEdible);
}

function generateBoxAroundEdible(X, Y) {
    return [[X - 35, Y + 15], [X + 35, Y + 15], [X + 35, Y - 15], [X - 35, Y - 15]];
}

function addEdibleAndItsPosition(newEdible, xPos, yPos, boxCoOrdinates) {
    edibles.push(newEdible);
    imageBoundary.push(boxCoOrdinates);
    imagePositions.push({ x: xPos, y: yPos });
}

//Change the pattern of removing edibles
function removeEdibleAndItsPosition(indexPos) {
    edibles.splice(indexPos, 1);
    imagePositions.splice(indexPos, 1);
    imageBoundary.splice(indexPos, 1);
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
    //console.log(poly);

    for (var v = 0; v < imageBoundary.length; v++) {
        for (var i = 0; i < imageBoundary[v].length; i++) {
            //console.log("*****************"+imageBoundary[v]);
            if (nearAnEdible(poly, imageBoundary[v][i][0], imageBoundary[v][i][1])) {
                // console.log(imagePositions[v].x , imagePositions[v].y +"!!!!!!!!!!!!!!!!!!!");
                // console.log(poly);
                removeEdibleAndItsPosition(v);
                score += 1;
                document.getElementById('score').innerHTML = score;
                generateEdible();
                console.log("removed an edible at pos " + v + "in array ");
            }
        }
    }
}

function nearAnEdible(vs, x, y) {
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

            // if (buttonStatus != "START" && edibles.length < 10){
            //     generateEdible();
            // }

            if (eating(detections[0].landmarks.getMouth())) {
                console.log("voila !!!" + edibles.length);

            }

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < edibles.length; i++) {
                drawEdibles(canvas, edibles[i], imagePositions[i].x, imagePositions[i].y);
            }

            for (var j = 0; j < drinks.length; j++) {
                drawEdibles(canvas, drinks[j], drinksPositions[j].x, drinksPositions[j].y);
            }

            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100)
})