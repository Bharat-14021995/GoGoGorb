// # Example call for the demo at http//cbrandolino.github.com/camvas

// If the browser does not support any URL, getUserMedia or
// In this example call, we will directly draw the webcam stream on a canvas.
window.onload = function(){
  var ctx = document.getElementsByTagName('canvas')[0].getContext('2d')
  var baguette = new Image();
  var croissant = new Image();

  baguette.src = "images/baguette.png";
  croissant.src = "images/croissant.png";

  // var positionX = Number();
  // var positionY = Number();

  // positionX = Math.random()*1000;
  // positionY = Math.random()*1000;

  var draw = function(canvas, dt) {
    ctx.drawImage(canvas, 0, 0)
      ctx.drawImage(baguette,0,0)
      ctx.drawImage(croissant,500,300)
  }

  var myCamvas = new camvas(ctx, draw)
}