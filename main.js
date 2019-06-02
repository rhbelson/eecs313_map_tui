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
        var detectedCoords = new Object(); 
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
        console.log(detectedCoordinates);
        detectedCoordinates.push(detectedCoords);
        checkLocation(rect.x, rect.y, rect.height, rect.width);
      });
    }
  });

  tracking.track('#myCanvas', colors);

}





function checkLocation(x,y,h,w) {
  console.log("in checkLocation");
  if (detectedCoordinates.length!=2) {
    console.log("detectedCoords not 2");
    return;
  }

  var city1=checkCity(detectedCoordinates[0]);
  var city2=checkCity(detectedCoordinates[1]);
  console.log(city1);
  console.log(city2);

  //If rome is an object, render rome to constantinople
  if ((city1=="Rome" || city2=="Rome") && (city1=="Constantinopolis" || city2=="Constantinopolis")) {
    console.log("found both cities");
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


  //2 Key
    if((city1=="Rome" || city2=="Rome") && (city1=="Lugdunum" || city2=="Lugdunum")) {
        console.log("scenario 2");
        document.getElementById("mymap").src = "media/map2.png";
        $('#mymap').fadeOut();
        $('#mymap').fadeIn();
        $('#explanation').fadeOut();$('#explanation2').fadeOut();
        document.getElementById("description").innerText="The Fastest journey from Roma to Lugdunum in July takes 11.8 days, covering 1302 kilometers."
        document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 2.32"
        document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 2.49"
        document.getElementById("carriage").innerText="Per passenger in a carriage: 449.01"
        $('#explanation').fadeIn();$('#explanation2').fadeIn();
        var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
        window.speechSynthesis.speak(msg);
    }

    //4 Key
    if((city1=="Rome" || city2=="Rome") && (city1=="Tarraco" || city2=="Tarraco")) {
        console.log("scenario 4");
        document.getElementById("mymap").src = "media/map5.png";
        $('#mymap').fadeOut();
        $('#mymap').fadeIn();
        $('#explanation').fadeOut();$('#explanation2').fadeOut();
        document.getElementById("description").innerText="The Fastest journey from Roma to Tarraco in July takes 8 days, covering 1020 kilometers."
        document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 0.86"
        document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 0.86"
        document.getElementById("carriage").innerText="Per passenger in a carriage: 215.4"
        $('#explanation').fadeIn();$('#explanation2').fadeIn();
        var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
        window.speechSynthesis.speak(msg);
    }

    //5 Key
    if((city1=="Rome" || city2=="Rome") && (city1=="Corinthus" || city2=="Corinthus")) {
        console.log("scenario 5");
        document.getElementById("mymap").src = "media/map6.png";
        $('#mymap').fadeOut();
        $('#mymap').fadeIn();
        $('#explanation').fadeOut();$('#explanation2').fadeOut();
        document.getElementById("description").innerText="The Fastest journey from Roma to Corinthus in July takes 9.4 days, covering 1444 kilometers."
        document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 1"
        document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 1"
        document.getElementById("carriage").innerText="Per passenger in a carriage: 251.25"
        $('#explanation').fadeIn();$('#explanation2').fadeIn();var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
        window.speechSynthesis.speak(msg);
    }

    //6 Key
    if((city1=="Rome" || city2=="Rome") && (city1=="Antiochia" || city2=="Antiochia")) {
        console.log("scenario 6");
        document.getElementById("mymap").src = "media/map7.png";
        $('#mymap').fadeOut();
        $('#mymap').fadeIn();
        $('#explanation').fadeOut();$('#explanation2').fadeOut();
        document.getElementById("description").innerText="The Fastest journey from Roma to Antiochia in July takes 17.7 days, covering 2903 kilometers."
        document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 2.4"
        document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 2.57"
        document.getElementById("carriage").innerText="Per passenger in a carriage: 472.03"
        $('#explanation').fadeIn();$('#explanation2').fadeIn();var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
        window.speechSynthesis.speak(msg);
    }

    //8 Key
    if((city1=="Rome" || city2=="Rome") && (city1=="Londinium" || city2=="Londinium")) {
        console.log("scenario 8");
        document.getElementById("mymap").src = "media/map9.png";
        $('#mymap').fadeOut();
        $('#mymap').fadeIn();
        $('#explanation').fadeOut();$('#explanation2').fadeOut();
        document.getElementById("description").innerText="The Fastest journey from Roma to Londinium in July takes 27.1 days, covering 2967 kilometers."
        document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 6.85"
        document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 7.87"
        document.getElementById("carriage").innerText="Per passenger in a carriage: 900.93"
        $('#explanation').fadeIn();$('#explanation2').fadeIn();var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
        window.speechSynthesis.speak(msg);
    }

    //9 Key
    if((city1=="Rome" || city2=="Rome") && (city1=="Augusta Treverorum" || city2=="Augusta Treverorum")) {
        console.log("scenario 9");
        document.getElementById("mymap").src = "media/map10.png";
        $('#mymap').fadeOut();
        $('#mymap').fadeIn();
        $('#explanation').fadeOut();$('#explanation2').fadeOut();
        document.getElementById("description").innerText="The Fastest journey from Roma to Augusta Treverorum in July takes 32.9 days, covering 1464 kilometers."
        document.getElementById("donkey").innerText="Per kilogram of wheat (by donkey): 20.4"
        document.getElementById("wagon").innerText="Per kilogram of wheat (by wagon): 25.17"
        document.getElementById("carriage").innerText="Per passenger in a carriage: 1260.82"
        $('#explanation').fadeIn();$('#explanation2').fadeIn();var msg = new SpeechSynthesisUtterance(document.getElementById("description").innerText);
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
  console.log(myCoords.x, myCoords.y, myCoords.width, myCoords.height);
  if ((myCoords.x>187 && myCoords.x<227) && (myCoords.y>170 && myCoords.y<258) && (myCoords.height>26 && myCoords.height<66) && (myCoords.width>27 && myCoords.width<67)) {
    console.log("found rome");
    return "Rome";
  }
  else if ((myCoords.x>427 && myCoords.x<467) && (myCoords.y>208 && myCoords.y<248) && (myCoords.height>25 && myCoords.height<65) && (myCoords.width>37 && myCoords.width<77)) {
    console.log("found constantinoplis");
    return "Constantinopolis";
  }
  else if ((myCoords.x>1 && myCoords.x<38) && (myCoords.y>0 && myCoords.y<31) && (myCoords.height>39 && myCoords.height<79) && (myCoords.width>33 && myCoords.width<73)) {
    console.log("found Londinium");
    return "Londinium";
  }
  else if ((myCoords.x>1 && myCoords.x<38) && (myCoords.y>0 && myCoords.y<31) && (myCoords.height>39 && myCoords.height<79) && (myCoords.width>33 && myCoords.width<73)) {
    console.log("found Augusta Treverorum");
    return "Augusta Treverorum";
  }
  else if ((myCoords.x>80 && myCoords.x<120) && (myCoords.y>123 && myCoords.y<163) && (myCoords.height>29 && myCoords.height<69) && (myCoords.width>28 && myCoords.width<68)) {
    console.log("found Lugdundum");
    return "Lugdunum";
  }
  else if ((myCoords.x>17 && myCoords.x<57) && (myCoords.y>215 && myCoords.y<255) && (myCoords.height>28 && myCoords.height<68) && (myCoords.width>32 && myCoords.width<72)) {
    console.log("found Tarraco");
    return "Tarraco";
  }
  else if ((myCoords.x>295 && myCoords.x<225) && (myCoords.y>136 && myCoords.y<176) && (myCoords.height>29 && myCoords.height<69) && (myCoords.width>31 && myCoords.width<71)) {
    console.log("found Carthago");
    return "Carthago";
  }
  else if ((myCoords.x>164 && myCoords.x<204) && (myCoords.y>316 && myCoords.y<356) && (myCoords.height>26 && myCoords.height<66) && (myCoords.width>27 && myCoords.width<67)) {
    console.log("found Sirmium");
    return "Sirmium";
  }
  else if ((myCoords.x>348 && myCoords.x<388) && (myCoords.y>258 && myCoords.y<298) && (myCoords.height>25 && myCoords.height<65) && (myCoords.width>28 && myCoords.width<68)) {
    console.log("found Corinthus");
    return "Corinthus";
  }
  else if ((myCoords.x>518 && myCoords.x<558) && (myCoords.y>304 && myCoords.y<344) && (myCoords.height>32 && myCoords.height<72) && (myCoords.width>41 && myCoords.width<81)) {
    console.log("found Antiochia");
    return "Antiochia";
  }


}


