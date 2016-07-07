'use strict';

function VolumeDetector(){
    this.isPlaying = false;
    this.volumeThreshold = null;
    this.frequencyThreshold = null;
    this.frequencyBuff = null;
}

VolumeDetector.prototype.togglePlay = function(){
    this.isPlaying = !this.isPlaying;
};

VolumeDetector.prototype.updateVolumeThreshold = function(v){
    this.volumeThreshold = v;
};


VolumeDetector.prototype.updateFrequencyThreshold = function(v){
    this.frequencyThreshold = v;
};


VolumeDetector.prototype._reachFrequency = function(){
    for(let i=this.frequencyThreshold;i < this.frequencyBuff.length;i++){
        if(frequencyBuff[i] > 0){
            return true;
        }
    }
    return false;
}

VolumeDetector.prototype.updateAverageVolume = function(){
        let values = 0,
            length = this.frequencyBuff.length;
        for (let i = 0; i < length; i++) {
            values += this.frequencyBuff[i];
        }
        this.averageVolume = Math.round(values / length);
};

VolumeDetector.prototype.reachThreshold = function(){
    return this._reachFrequency() && this.averageVolume > this.volumeThreshold;
};

