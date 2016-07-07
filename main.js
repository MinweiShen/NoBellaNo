'use strict';

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var ctx, ctxVolume, ctxStage;
var video = document.querySelector('video');
var addAudio = document.querySelector("#audio-file");
var audioPlayer = document.querySelector("#audio-player");
var volumeThreshold = document.querySelector("#volume-threshold");
var volumeValue = document.querySelector("#volume-value");
var frequencyThreshold = document.querySelector("#frequency-threshold");
var img = document.querySelector("#screenshot");
var hiddenStage = document.querySelector("#hidden-stage");
var analyser;
var audioFiles;
var volumeDetector, motionDetector;

function initContext(){
    ctx = document.querySelector("#chart").getContext("2d");
    let gradient1 = ctx.createLinearGradient(0,0,0,300);
    gradient1.addColorStop(0,"white");
    gradient1.addColorStop(1,"green");
    ctx.fillStyle = gradient1;

    ctxVolume = document.querySelector("#volume-meter").getContext("2d");
    let gradient2 = ctxVolume.createLinearGradient(0,0,800,0);
    gradient2.addColorStop(0,"green");
    gradient2.addColorStop(1,"white");
    ctxVolume.fillStyle = gradient2;

    ctxStage = document.querySelector("#hidden-stage").getContext("2d");
}


function drawFrequencySpectrum(ctx, buff){
    ctx.clearRect(0, 0, 800, 300);
    for(let i = 0; i < buff.length; i++ ){
        let value = buff[i];
        ctx.fillRect(i*3,300-value,2, value);
    }
}


function drawVolume(ctx, average){
    volumeValue.innerHTML = average;
    ctx.clearRect(0, 0, 800, 30);
    ctx.fillRect(0, 0, 4*average, 30);
}


function analyze() {
    analyser.getByteFrequencyData(volumeDetector.frequencyBuff);

    drawFrequencySpectrum(ctx, volumeDetector.frequencyBuff);

    volumeDetector.updateAverageVolume();
    drawVolume(ctxVolume, volumeDetector.averageVolume);

    if(volumeDetector.reachThreshold() && audioFiles && !volumeDetector.isPlaying){
        let cnt = audioFiles.length;
        let vendorURL = window.URL || window.webkitURL;
        audioPlayer.src = vendorURL.createObjectURL(audioFiles[Math.floor(Math.random()*cnt)]);
        audioPlayer.loop = false;
        volumeDetector.isPlaying = true;
        audioPlayer.play();
    }


    motionDetector.capture();
}


function notSupported(err){
    alert(err);
}

function handleSuccess(stream){
    volumeDetector = new VolumeDetector(parseFloat(frequencyThreshold.value),parseFloat(volumeThreshold.value));
    motionDetector = new MotionDetector(hiddenStage, video, img);
    let source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    source.connect(analyser);
    let jsnode = audioContext.createScriptProcessor(2048);
    jsnode.onaudioprocess = analyze;
    analyser.connect(jsnode);
    volumeDetector.frequencyBuff =  new Uint8Array(analyser.frequencyBinCount);
    video.srcObject = stream;


}

window.onload = function () {
    initContext();

    if('getUserMedia' in navigator.mediaDevices){
        let p = navigator.mediaDevices.getUserMedia({
            "audio": true,
            "video": {width:400, height:300},
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
       volumeDetector.isPlaying = false;
    };

    frequencyThreshold.onchange = function(){
        volumeDetector.updateFrequencyThreshold(parseFloat(frequencyThreshold.value));
    };

    volumeThreshold.onchange = function(){
        volumeDetector.updateVolumeThreshold(parseFloat(volumeThreshold.value));
    };
};

