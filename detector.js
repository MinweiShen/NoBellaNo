var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var ctx = document.querySelector("#chart").getContext("2d");
var gradient1 = ctx.createLinearGradient(0,0,0,300);
gradient1.addColorStop(0,"white");
gradient1.addColorStop(1,"green");
ctx.fillStyle = gradient1;

var ctxVolume = document.querySelector("#volume-meter").getContext("2d");
var gradient2 = ctxVolume.createLinearGradient(0,0,800,0);
gradient2.addColorStop(0,"green");
gradient2.addColorStop(1,"white");
ctxVolume.fillStyle = gradient2;
var ctxStage = document.querySelector("#hidden-stage").getContext('2d');
var screenshot = document.querySelector("#screenshot")
var video = document.querySelector('video');
var addAudio = document.querySelector("#audio_file");
var audioPlayer = document.querySelector("#audio_player");
var volumeThreshold = document.querySelector("#volume-threshold");
var volumeThresholdValue = parseFloat(volumeThreshold.value);
var volumeValue = document.querySelector("#volume-value");
var frequencyThreshold = document.querySelector("#frequency-threshold");
var frequencyThresholdValue = parseFloat(frequencyThreshold.value);
var frequencyBuff, analyser;
var isPlaying = false;
var audioFiles;


function takePhoto(){
    ctxStage.drawImage(video, 0, 0, 400, 300);
    var data = document.querySelector("#hidden-stage").toDataURL('image/png');
    screenshot.setAttribute('src', data);
}

function reachFrequency(level){
    for(var i=level;i < frequencyBuff.length;i++){
        if(frequencyBuff[i] > 0){
            return true;
        }
    }
    return false;
}


function getAverageVolume(array) {
    var values = 0;
    var length = array.length;
    for (var i = 0; i < length; i++) {
        values += array[i];
    }
    return Math.round(values / length);
}

function reachThreshold(average, level){
    return average > volumeThresholdValue && audioFiles && !isPlaying && reachFrequency(level)
}

function analyze() {
    analyser.getByteFrequencyData(frequencyBuff);

    // visual canvas
    ctx.clearRect(0, 0, 800, 300);
    for(var i = 0; i < frequencyBuff.length; i++ ){
        var value = frequencyBuff[i];
        ctx.fillRect(i*3,300-value,2, value);
    }
    var average = getAverageVolume(frequencyBuff);
    volumeValue.innerHTML = average;
    ctxVolume.clearRect(0, 0, 800, 30);
    ctxVolume.fillRect(0, 0, 4*average, 30);

    // see if need to trigger handler
    if(reachThreshold(average, frequencyThresholdValue)){
        takePhoto();
        var cnt = audioFiles.length;
        var vendorURL = window.URL || window.webkitURL;
        audioPlayer.src = vendorURL.createObjectURL(audioFiles[Math.floor(Math.random()*cnt)]);
        audioPlayer.loop = false;
        isPlaying = true;
        audioPlayer.play();
    }
    // requestAnimationFrame(analyze);
}


function notSupported(err){
    alert(err);
}

function handleSuccess(stream){
    var source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    source.connect(analyser);
    // not using requestAnimationFrame because that's too fast
    var jsnode = audioContext.createScriptProcessor(2048);
    jsnode.onaudioprocess = analyze;
    analyser.connect(jsnode);
    frequencyBuff =  new Uint8Array(analyser.frequencyBinCount);
    video.srcObject = stream;

}

window.onload = function () {
    if('getUserMedia' in navigator.mediaDevices){
        var p = navigator.mediaDevices.getUserMedia({
            "audio": true,
            "video": true,
        });
        p.then(handleSuccess).catch(notSupported);
    }
    else{
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        navigator.getUserMedia({
            "audio": false,
            "video": true
        }, handleSuccess, notSupported);
    }
    addAudio.onchange = function(){
        audioFiles = this.files;
    };

    audioPlayer.onended = function(){
      isPlaying = false;
    };

    frequencyThreshold.onchange = function(){
        frequencyThresholdValue = parseFloat(frequencyThreshold.value);
    };

    volumeThreshold.onchange = function(){
        volumeThresholdValue = parseFloat(volumeThreshold.value);
    };
};