/*
Out of 640x480         (starting from lower left corner of block)
City                    x  y  h  w   
Londonium:              18 11 59 53
Augusta Treverorum:     121 45 58 52
Lugdundum:              100 143 49 48
Tarraco:                37 235 48 52
Carthago:               184 336 49 51
Roma:                   207 238 46 47
Sirmium:                315 156 46 47
Corinthus:              368 278 45 48
Constantinoplis:        447 228 45 57
Antiochia:              538 324 52 61
*/

'use strict';
var videoElement = document.querySelector('video');
var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');
const myButton = document.getElementById('cameraButton');;
var logiCam; 
var captureImg = document.getElementById('capture');

const canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

var detectedCoordinates=[]

navigator.mediaDevices.enumerateDevices()
  .then(gotDevices).then(getStream).catch(handleError);

myButton.onclick = function() {
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  var imgURL = canvas.toDataURL('image/png');
  detectColors(captureImg);
};

function gotDevices(deviceInfos) {
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label ||
        'microphone ' + (audioSelect.length + 1);
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      if (videoSelect.length === 2) {
        logiCam = String(option.value);
      }
      option.text = deviceInfo.label || 'camera ' +
        (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Found one other kind of source/device: ', deviceInfo);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  var constraints = {
    audio: {
      deviceId: {exact: audioSelect.value}
    },
    video: {
      deviceId: {exact: logiCam}
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.log('Error: ', error);
}


/*
returns an object with the following items:
    detectedCoords.x 
    detectedCoords.y
    detectedCoords.height
    detectedCoords.width
    detectedCoords.color
currently called in button.onclick
*/

function detectColors(img) {
  var detectedCoords = new Object(); 

  tracking.ColorTracker.registerColor('red', function(r, g, b) {
    var threshold = 50,
      dx = r - 255,
      dy = g - 0,
      dz = b - 0;

    if ((r - b) >= threshold) {
      return true;
    }
    return dx * dx + dy * dy + dz * dz < 10000;
  });

  tracking.ColorTracker.registerColor('green', function(r, g, b) {
    var threshold = 50,
      dx = r - 0,
      dy = g - 255,
      dz = b - 0;

    if ((g - b) >= threshold) {
      return true;
    }
    return dx * dx + dy * dy + dz * dz < 19600;
  });

  var colors = new tracking.ColorTracker(['red', 'green']);

  colors.on('track', function(event) {
    if (event.data.length === 0) {
      // No colors were detected in this frame.
    } else {
      event.data.forEach(function(rect) {
        detectedCoords.x = rect.x; 
        detectedCoords.y = rect.y;
        detectedCoords.height = rect.height; 
        detectedCoords.width = rect.width; 
        detectedCoords.color = rect.color;
        console.log(rect.x, rect.y, rect.height, rect.width, rect.color);


        //Keep length isn't two or flush
        if (detectedCoordinates.length==2) {
          console.log("detectedcoordinates length is 2");
          detectedCoordinates=[];
        }
        detectedCoordinates.push(detectedCoords)
        checkLocation(rect.x, rect.y, rect.height, rect.width);
      });
    }
  });

  tracking.track('#myCanvas', colors);

  return detectedCoords;



}





function checkLocation(x,y,h,w) {
  console.log("in checkLocation");
  if (detectedCoordinates.length!=2) {
    console.log("detectedCoords not 2");
    return;
  }

  city1=checkCity(detectedCoordinates[0])
  city2=checkCity(detectedCoordinates[2])

  //If rome is an object, render rome to constantinople
  if ((city1=="Rome" || city2=="Rome") && (city1=="Constantinoplis" || city2=="Constantinoplis")) {
    document.getElementById("mymap").src = "media/map3.png";
    $('#mymap').fadeOut();
    $('#mymap').fadeIn();
    $('#explanation').fadeOut();$('#explanation2').fadeOut();
    document.getElementById("description").innerText="The Fastest journey from Roma to Constantinopolis in July takes 21.3 days, covering 2724 kilometers.";
    document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 4.93";
    document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 5.7";
    document.getElementById("carriage").innerText="Per passenger in a carriage: 606.24";
    $('#explanation').fadeIn();$('#explanation2').fadeIn();
    var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
    window.speechSynthesis.speak(msg);
  }

}



/*
Out of 640x480         (starting from lower left corner of block)
City                    x  y  h  w   
Londonium:              18 11 59 53
Augusta Treverorum:     121 45 58 52
Lugdundum:              100 143 49 48
Tarraco:                37 235 48 52
Carthago:               184 336 49 51
Roma:                   207 238 46 47
Sirmium:                315 156 46 47
Corinthus:              368 278 45 48
Constantinoplis:        447 228 45 57
Antiochia:              538 324 52 61
*/


function checkCity(myCoords) {
  console.log(myCoords);
  if ((myCoords.x>187 || myCoords.x<227) && (myCoords.y>170 || myCoords.y<258) && (myCoords.height>26 || myCoords.height<66) && (myCoords.width>27 && myCoords.width<67)) {
    console.log("found rome");
    return "Rome";
  }
  if ((myCoords.x>427 || myCoords.x<467) && (myCoords.y>208 || myCoords.y<248) && (myCoords.height>25 || myCoords.height<65) && (myCoords.width>37 && myCoords.width<77)) {
    console.log("found constantinoplis");
    return "Constantinopolis";
  }
}


