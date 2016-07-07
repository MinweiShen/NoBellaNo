const DELAY = 500;
const ATLEAST = 1000;
const VIDEO_HEIGHT = 300;
const VIDEO_WIDTH = 400;
const PIXEL_SCORE_THRESHOLD = 100;
const IMAGE_SCORE_THRESHOLD = VIDEO_HEIGHT * VIDEO_WIDTH / 200;

function MotionDetector(canvas, video, img) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.img = img;
    this.ctx.globalCompositeOperation = 'difference';
    this.video = video;
    this.throttledCapture = null;
    this.secondShot = false;
}

MotionDetector.prototype._throttle = function (fn, delay, atleast) {
    let timer = null;
    let previous = null;
    let self = this;

    return function(){
        let now = +new Date();
        if(!previous){
            previous = now;
        }
        if(now - previous > atleast){
            fn.call(self);
            previous = now;
        }else{
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.call(self);
            }, delay);
        }
    }
};


MotionDetector.prototype._capture = function(){
    this.ctx.drawImage(this.video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    function detect_motion(data){
        let imageScore = 0;

        for(let i = 0; i < data.length; i += 4){
            let r = data[i],
                g = data[i + 1],
                b = data[i + 2];
            let pixelScore = (r + g + b) / 3;

            if (pixelScore >= PIXEL_SCORE_THRESHOLD){
                imageScore++;
            }
        }
        if(imageScore >= IMAGE_SCORE_THRESHOLD){
            return true;
        }
        return false;
    }

    /* globalCompositeOperation = 'difference';
    *  when the second screenshot is taken, we can see if there is motion
    * */
    if(this.secondShot) {
        if (detect_motion(this.ctx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT).data)) {
            // clear the canvas and take a new photo, save it as image
            this.ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.drawImage(this.video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
            let data = this.canvas.toDataURL('image/png');
            this.img.setAttribute('src', data);
            this.ctx.globalCompositeOperation = 'difference';
        }
        this.ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    }
    this.secondShot = !this.secondShot;
};

MotionDetector.prototype.capture = function(){
    if(! this.throttledCapture){
        this.throttledCapture = this._throttle(this._capture, DELAY, ATLEAST);
    }
    this.throttledCapture();
};

