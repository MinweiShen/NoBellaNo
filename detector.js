var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var source, analyser;
var ctx = document.getElementById("chart").getContext("2d");
var video = document.getElementsByTagName('video');
var volume = document.getElementById("volume");
var addAudio = document.getElementById("audio_file");
var audioFiles;
var audioPlayer = document.getElementById("audio_player");
var volumeThreshold = document.getElementById("volume-threshold");
var volumeThresholdValue = parseFloat(volumeThreshold.value);
var frequencyThreshold = document.getElementById("frequency-threshold");
var frequencyThresholdValue = parseFloat(frequencyThreshold.value);
var frequencyBuff;
var isPlaying = false;

function reachFrequency(level){
    for(var i=level;i < frequency_buff.length;i++){
        if(frequency_buff[i] > 0){
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
    return values / length;
}

function analyze() {
    analyser.getByteFrequencyData(frequencyBuff);
    ctx.clearRect(0, 0, 800, 300);
    for(var i = 0; i < frequencyBuff.length; i++ ){
        var value = frequencyBuff[i];
        ctx.fillRect(i*3,300-value,2, value);
    }
    var average = getAverageVolume(frequencyBuff);
    volume.innerHTML = average;
    if(average > volumeThresholdValue && audioFiles && !isPlaying){
        var cnt = audioFiles.length;
        audioPlayer.src = URL.createObjectURL(audioFiles[Math.floor(Math.random()*cnt)]);
        audioPlayer.loop = false;
        isPlaying = true;
        audioPlayer.play();
    }

    requestAnimationFrame(analyze);
}


function notSupported(err){
    alert(err);
}

function handleSuccess(stream){
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    source.connect(analyser);
    frequencyBuff =  new Uint8Array(analyser.frequencyBinCount);
    analyze();

}

(function () {
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


})();