(function() {
    function $(q) {
        //simple selector
        return document.querySelectorAll(q);
    }

    function makeDetector(classifier) {
        return new objectdetect.detector(canvas.clientWidth, canvas.clientHeight, 1.2, classifier);
    }

    var video = $('#video')[0];
    var canvas = $('#canvas')[0];
    var context = canvas.getContext('2d');
    var detectors = {};
    var smoother = new Smoother([0.9999999, 0.9999999, 0.999, 0.999], [0, 0, 0, 0]);
    var detectorsSetup = false;

    function initVideo() {
        try {
            compatibility.getUserMedia({
                video: true
            }, function(stream) {
                try {
                    video.src = compatibility.URL.createObjectURL(stream);
                } catch (error) {
                    video.src = stream;
                }
                compatibility.requestAnimationFrame(play);
            }, function(error) {
                alert('WebRTC not available');
            });
        } catch (error) {
            alert(error);
        }
    }

    //Happens for each frame of video
    function play() {
        compatibility.requestAnimationFrame(play);
        setupDetectors();
    }

    function setupDetectors() {
        if (video.paused) video.play();
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
            if (!detectorsSetup) {
                //Matches the canvas size & position to be right over top of the video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.style.top = video.offsetTop;
                canvas.style.left = video.offsetLeft;
                detectors = {
                    face: makeDetector(objectdetect.frontalface),
                    mouth: makeDetector(objectdetect.mouth),
                    eye: makeDetector(objectdetect.eye),
                    smile: makeDetector(objectdetect.smile),
                    cat: makeDetector(objectdetect.frontalcatface)
                }
                detectorsSetup = true;
            }
        }
    }

    function detectThings(myDetector) {
        clearCanvas();

        if (myDetector) {
            // Detect things in the source
            var rects = myDetector.detect(video, 1);
            //var rect = rects[0];
            var rect = smoother.smooth(rects[0]);
            console.log(rect)
            drawBox(rect[0], rect[1], rect[2], rect[3], 2);

            // Draw rectangles around detected things:
            //for (var i = 0; i < rects.length; ++i) {
            //    var coord = rects[i];
            //    drawBox(coord[0], coord[1], coord[2], coord[3], 2);
            //}
        }
    }

    function drawBox(x, y, w, h, s) {
        //console.log(arguments)
        context.beginPath();
        context.lineWidth = '' + s * .5;
        context.strokeStyle = 'rgba(0, 0, 255, 0.9)';
        context.rect(x, y, w, h);
        context.stroke();
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function addClick(q, fn) {
        $(q)[0].addEventListener('click', fn, false);
    }

    window.onload = function() {
        initVideo();
        //drawBox(10, 20, 30, 40, 1);

        addClick('#clear-boxes', clearCanvas);
        addClick('#detect-face', function() {
            detectThings(detectors.face)
        }, false);
        addClick('#detect-mouth', function() {
            detectThings(detectors.mouth)
        }, false);
        addClick('#detect-eyes', function() {
            detectThings(detectors.eye)
        });
        addClick('#detect-smile', function() {
            detectThings(detectors.smile)
        });
        addClick('#detect-cat', function() {
            detectThings(detectors.cat)
        });
    };
})();