/**
 * Author   :  BHARAT NARAYANAN 
 * Author   :  RUSNA 
 * Project  :  GoGoGorb - For Adv-UI Programming Course
 * Date     :  13 November 2019. 
 * Location :  University Of Paris-Sud
 */

/**
 * Setting up edibles 
 */
var baguette = new Image();
var croissant = new Image();
var feedBackEdible = new Image();
baguette.src = "images/baguette.png";
croissant.src = "images/croissant.png";
feedBackEdible.src = "images/star1.png";

const foodOptions = [baguette, croissant];

var edibleList = [];
var edibleBoundary = [];

var eatAudio = new Audio('audios/biteAudio.mp3');

/**
 * Setting up Drinks
 */
var wine = new Image();
var coffee = new Image();
var feedBackDrink = new Image();
wine.src = "images/wine.png";
coffee.src = "images/coffee.png";
feedBackDrink.src = "images/star5.png";

const drinkOptions = [wine, coffee];

var drinksList = [];
var feedBackList = [];

var orderAudio = new Audio('audios/yesAudio.mp3');

var score = 0;

/**
 * Setting up the speech Recognition
 */
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

/**
 * Setting up Video 
 */
const video = document.getElementById('video');
var videoWidth = getComputedStyle(video).getPropertyValue("width").replace("px", "");
var videoHeight = getComputedStyle(video).getPropertyValue("height").replace("px", "");

/**
 *  loading all the models async
 */
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

/**
 * Start the Game
 */
function startGame() {
    if (edibleList.length == 0) {
        document.getElementById('instructions').style.display = "none";
        document.getElementById('details').style.display = "block";
        document.getElementById('score').innerHTML = score;
        for (var i = 0; i < 10; i++) {
            generateEdible();
        }
        generateWineOrCoffee();
        startCountDownTimer();
        recognition.start();
    }
}

/**
 * voice recognition when detected  
 * @param {*} event 
 */
recognition.onresult = function (event) {
    var last = event.results.length - 1;
    var detectedDrink = event.results[last][0].transcript;

    console.log(detectedDrink);
    // had to add a lot of variations of wine and coffee to detect closely realted words as well.
    if ([' wine', ' coffee', 'wine', 'coffee', 'Wine', 'Coffee', 'wayne', 'Wayne', 'espresso'].includes(detectedDrink)) {
        if (drinksList.length > 0) {
            orderedADrink();
        }
    }
}

/**
 * on speech end
 */
recognition.onspeechend = function () {
    recognition.stop();
}

/**
 * Removes the drink from the array and adds a feedback of points added to score in the canvas
 * updates the score
 */
function orderedADrink() {
    orderAudio.play();
    addScoreAndItsPosition(feedBackDrink, drinksList[0].x, drinksList[0].y);
    removeFeedback();
    score += 5;
    document.getElementById('score').innerHTML = score;
    drinksList.pop();
}

/**
 * Interval fucntion called after 3 seconds to remove the feedback
 */
function removeFeedback() {
    var removeScoreInterval = setInterval(function () {
        feedBackList.shift();
        clearInterval(removeScoreInterval);
    }, 1000)
}

/**
 * starts the countdown timer set to approximately 60 (61 as delay in loading the images on canvas)
 * 
 * on finish: redirects the page to endGame.html to display the score 
 */
function startCountDownTimer() {

    // setting the count down timer
    var countDownTime = new Date(new Date().getTime() + 61000).getTime();
    // Update the count down every 1 second
    var countDownInterval = setInterval(function () {
        // Get current time
        var now = new Date().getTime();
        // Find the remaining time between now and the countdownTimer. 
        var remaining = countDownTime - now;
        // Time calculations for seconds
        seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        document.getElementById("time").innerHTML = seconds + "s ";
        // If the count down is over, Go to endGame page and display the score.
        if (remaining < 0) {
            clearInterval(countDownInterval);
            document.getElementById("time").innerHTML = "Bill please!";
            window.location.href = "endGame.html";
            localStorage.setItem("score", score); // setting the score in local storage to access in Finish page.
        }
    }, 1000);
}

/**
 * An interval function to generate drinks on canvas randomly every 10 seconds
 */
function generateWineOrCoffee() {
    var drinkInterval = setInterval(function () {
        let newDrink = drinkOptions[Math.floor(Math.random() * foodOptions.length)];
        let randomPositionX = Math.floor(Math.random() * (videoWidth - 250));
        let randomPositionY = Math.floor(Math.random() * (videoHeight - 250));
        addDrinkAndItsPosition(newDrink, randomPositionX, randomPositionY);
        removeWineOrCoffee();
    }, 10000);
}

function addDrinkAndItsPosition(drink, xPos, yPos) {
    drinksList.push({ drink: drink, x: xPos, y: yPos });
}

function addScoreAndItsPosition(score, xPos, yPos) {
    feedBackList.push({ feedback: score, x: xPos, y: yPos });
}

function addEdibleAndItsPosition(newEdible, xPos, yPos, boundingBox) {
    edibleList.push({ edible: newEdible, x: xPos, y: yPos });
    edibleBoundary.push(boundingBox);
}

function generateEdible() {
    let newEdible = foodOptions[Math.floor(Math.random() * foodOptions.length)];
    let randomPositionX = Math.floor(Math.random() * (videoWidth - 280)) + 50;
    let randomPositionY = Math.floor(Math.random() * (videoHeight - 280)) + 100;

    let boundingBox = generateBoxAroundEdible(randomPositionX, randomPositionY);
    addEdibleAndItsPosition(newEdible, randomPositionX, randomPositionY, boundingBox);

}

function generateBoxAroundEdible(X, Y) {
    return [[X - 15, Y + 15], [X + 15, Y + 15], [X + 15, Y - 15], [X - 15, Y - 15]];
}

function removeEdibleAndItsPosition(indexPos) {
    eatAudio.play();
    addScoreAndItsPosition(feedBackEdible, edibleList[indexPos].x, edibleList[indexPos].y);
    removeFeedback();
    edibleList.splice(indexPos, 1);
    edibleBoundary.splice(indexPos, 1);
}

/**
 * Interval function to remove the drink objects after 5 seconds if not already 'ORDERED' by the user 
 */
function removeWineOrCoffee() {
    var removeDrinkInterval = setInterval(function () {
        if (drinksList.length > 0) {
            drinksList = [];
        }
        clearInterval(removeDrinkInterval);
    }, 5000)
}

/**
 * calculates the bounding box for the mouth and returns it
 */
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
    return [[smallX, smallY], [smallX, largeY], [largeX, largeY], [largeX, smallY]];
}

/**
 * Function to determine mouth is near an edible bounding box
 * @param {*} mouthPositionPoints 
 */
function eating(mouthPositionPoints) {
    
    var mouthBoundingBox = findTheMouthRegion(mouthPositionPoints);

    for (var v = 0; v < edibleBoundary.length; v++) {
        for (var i = 0; i < edibleBoundary[v].length; i++) {
            if (nearAnEdible(mouthBoundingBox, edibleBoundary[v][i][0], edibleBoundary[v][i][1])) {
                removeEdibleAndItsPosition(v);
                score += 1;
                document.getElementById('score').innerHTML = score;
                generateEdible();
            }
        }
    }
}

/**
 * Detects if the mouthBoundingBox is near and edible using the ray-casting algrithm
 * 
 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * 
 * @param {*} mouthBoundingBox 
 * @param {*} x 
 * @param {*} y 
 */
function nearAnEdible(mouthBoundingBox, x, y) {
    var inside = false;
    for (var i = 0, j = mouthBoundingBox.length - 1; i < mouthBoundingBox.length; j = i++) {
        var xi = mouthBoundingBox[i][0], yi = mouthBoundingBox[i][1];
        var xj = mouthBoundingBox[j][0], yj = mouthBoundingBox[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

/**
 * Event listener on video called every 100 ms to (re)draw the whole canvas
 */
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
            /**
             * detections[1] for a second palyer. ******Further improvements*******.
             */
            try {
                eating(detections[0].landmarks.getMouth());
            }
            catch (error) {
                console.error("cant get the landmark");
            }
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            drawCanvasObjects(canvas);

            //**** comment the next line if you don't want the face-landmarks to show while playing
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100)
})

/**
 * Function to draw any objects on the Canvas 2D.
 * @param {*} canvas 
 * @param {*} newEdible 
 * @param {*} Xposition 
 * @param {*} Yposition 
 */
function draw(canvas, newEdible, Xposition, Yposition) {
    canvas.getContext('2d').drawImage(newEdible, Xposition, Yposition);
}

/**
 * drawing all the objects i.e. Edibles, Drinks and the respective Feedback for them.
 * @param {*} canvas 
 */
function drawCanvasObjects(canvas) {
    for (var i = 0; i < edibleList.length; i++) {
        draw(canvas, edibleList[i].edible, edibleList[i].x, edibleList[i].y);
    }
    for (var j = 0; j < drinksList.length; j++) {
        draw(canvas, drinksList[j].drink, drinksList[j].x, drinksList[j].y);
    }
    for (var k = 0; k < feedBackList.length; k++) {
        draw(canvas, feedBackList[k].feedback, feedBackList[k].x, feedBackList[k].y);
    }
}

