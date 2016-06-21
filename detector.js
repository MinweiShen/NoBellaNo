(function () {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var p = navigator.mediaDevices.getUserMedia({"audio":true});
    var source, analyser, javascriptNode;
    var ctx = document.getElementById("chart").getContext("2d");
    var volume = document.getElementById("volume");
    var audio_file = document.getElementById("audio_file");
    var audio_player = document.getElementById("audio_player");
    var play_btn = document.getElementById("play");
    var volume_threshold = document.getElementById("volume-threshold");
    var volume_threshold_value = parseFloat(volume_threshold.value);
    var frequency_threshold = document.getElementById("frequency-threshold");
    var frequency_threshold_value = parseFloat(frequency_threshold.value);
    var frequency_buff;

    audio_file.onchange = function(){
        var files = this.files;
        var file = URL.createObjectURL(files[0]);
        audio_player.src = file;
    };

    play_btn.onclick = function(){
        audio_player.play();
    };

    frequency_threshold.onchange = function(){
        frequency_threshold_value = parseFloat(frequency_threshold.value);
        console.log(frequency_threshold_value);

    };

    volume_threshold.onchange = function(){
        volume_threshold_value = parseFloat(volume_threshold.value);
        console.log(volume_threshold_value);

    };

    p.then(function(stream){
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 512;
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 0);
        source.connect(analyser);
        analyser.connect(javascriptNode);
        frequency_buff =  new Uint8Array(analyser.frequencyBinCount);

        javascriptNode.onaudioprocess = function() {
            // get the average, bincount is fftsize / 2
            analyser.getByteFrequencyData(frequency_buff);
            ctx.clearRect(0, 0, 1000, 300);
            drawSpectrum(frequency_buff);
            var average = getAverageVolume(frequency_buff);
            volume.innerHTML = average;
            if(average > volume_threshold_value && audio_player.src && reach_frequency(frequency_threshold_value)){
                audio_player.play();
            }
        }
    });

    p.catch(function(err){
        console.log(err);
    });

    function reach_frequency(f){
        for(var i=f;i < frequency_buff.length;i++){
            if(frequency_buff[i] > 0){
                return true;
            }
        }
        return false;
    }
    function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }
        average = values / length;
        return average;
    }

    function drawSpectrum(array) {
        for(var i = 0; i < (array.length); i++ ){
            var value = array[i];
            ctx.fillRect(i*3,300-value,2, value);
        }
    }
})();