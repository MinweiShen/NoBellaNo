(function () {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var p = navigator.mediaDevices.getUserMedia({"audio":true});
    var source, analyser, javascriptNode;
    var ctx = document.getElementById("chart").getContext("2d");
    var volume = document.getElementById("volume");
    var audio_file = document.getElementById("audio_file");
    var audio_player = document.getElementById("audio_player");
    var play_btn = document.getElementById("play");
    var threshold = document.getElementById("threshold");
    var threshold_value = parseFloat(threshold.value);
    console.log(threshold_value);

    audio_file.onchange = function(){
        var files = this.files;
        var file = URL.createObjectURL(files[0]);
        audio_player.src = file;
    };

    play_btn.onclick = function(){
        audio_player.play();
    };

    threshold.onchange = function(){
        threshold_value = parseFloat(threshold.value);
        console.log(threshold_value);

    }

    p.then(function(stream){
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 512;
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 0);
        source.connect(analyser);
        analyser.connect(javascriptNode);

        javascriptNode.onaudioprocess = function() {
            // get the average, bincount is fftsize / 2
            var arr =  new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(arr);
            ctx.clearRect(0, 0, 1000, 325);
            // set the fill style
            drawSpectrum(arr);
            var average = getAverageVolume(arr);
            volume.innerHTML = average;
            if(average > threshold_value){
                console.log(average, threshold_value, 'louder');
                audio_player.play();
            }
        }
    });

    p.catch(function(err){
        console.log(err);
    });

    function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            // console.log("array", i , array[i]);
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