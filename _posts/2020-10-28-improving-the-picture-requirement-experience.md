---
title: Improving the picture requirement experience
layout: post
tags: [technical, javascript, electron.js, face-api.js]
---

I was tasked with building a prototype of a visitor management solution for the K-12 safety industry. There are a multitude of pre-existing options within the market already so creating something innovative that solved the problems that school officials were repeatedly experiencing with those current solutions was paramount. To achieve that goal, the most important design decision was to focus on eliminating as many unnecessary interactions and pain-points as possible. How could I make the process faster and simpler than any of the competition?<!--more-->

This article will focus on a single aspect of that goal: improving the picture requirement of the visitor check-in process. Whenever a visitor comes to a school, they must check in to the visitor management system which involves having their picture taken and printed onto a sticker badge. The entire project was to be a kiosk visitors could use themselves, a distributed application most likely installed on a touchscreen all-in-one pc, so I chose to work with Electron.js. While I will be discussing my specific use-case and implementation, these ideas could apply to lots of different projects that require a user to have their picture taken.

### Defining the project's goals
I broke down improving the picture requirement into three sub-goals: remove friction, guide users to improve quality, and finally to make it fun. First, to remove friction I aimed to eliminate physical interaction via haptic or interface devices. Next, to guide the users into improving the quality of both the final image and the smoothness of the process, I added feedback through the use of both visual and audio cues. And then to make it fun I sprinkled in some razzle-dazzle by utilizing a sound effect and making their smile literally sparkle.

### Implementation

#### Smile detection as a trigger

![Smile detection]({{ site.url }}/assets/media/posts/improving-the-picture-requirement-experience/smile-detection.gif)

The visitor management application as a whole was designed to work via touch as a kiosk but also to be completely operational in a touchless environment utilizing speech-to-intent with NLP. In pre-existing visitor management solutions, users are prompted to press a button on the screen to take their picture. Any user input adds friction, albeit very slight in this case, to the overall process. I decided to reduce this friction I would prompt the user both textually on the screen and audibly to smile to have their picture taken, at which point the detection of a smile within the frame would engage the action automatically. Some of the competing solutions I tested didn't even offer a countdown in preparation for the picture taking, meaning the user had to position themselves in such a way to hide the fact that they were reaching towards the screen or mouse to take the picture.

So how do we actually detect a smile in realtime to fire off an event? I used <a href="https://github.com/justadudewhohacks/face-api.js/" target="_BLANK">face-api.js</a> which is an API implementation of face recognition using <a href="https://github.com/tensorflow/tfjs" target="_BLANK">tensorflow.js</a>. Face-api.js will make our job a lot easier by handling most of the complicated aspects of working with <a href="https://www.tensorflow.org/" target="_BLANK">TensorFlow</a> and offers a lot of useful features including face recognition (obviously), multi-face landmark detection, and age/gender/expression recognition. It also works in ReactNative, albeit with some finessing. However, I find that it is much faster and a better experience to stream the camera source to a server-side Node.js implementation of the recognition.

I used a semblance of a service worker within Electron.js to parallel process the face recognition and prevent its more resource-heavy nature from impacting the UI experience during the check-in process, but that would be overkill for this article. If you are interested in doing that, it basically involves creating an additional hidden renderer, since each renderer has its own process, and then you can communicate from the worker to the main renderer through the main application process using the IPC (Inter-Process Communication) events. You could also use a web worker but you would be limited in some aspects which you can learn more about it <a href="https://medium.com/swlh/how-to-run-background-worker-processes-in-an-electron-app-e0dc310a93cc" target="_BLANK">here</a>.

So with all of that background now said, if you choose to use face-api.js, you can take advantage of the expression detection and start the picture countdown whenever a "happy" expression is detected. *If you don't want to use face-api.js, I will explain another method using extracted face landmarks from any library that we will also use for adding sparkly teeth later on.*

First, install face-api.js and tensorflow core for client-side with Electron and monkey patch the environment:
<pre><code>
npm i face-api.js @tensorflow/tfjs-core
</code></pre>

<pre><code>
//no need to require tensorflow core
const faceapi = require('face-api.js');

faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});
</code></pre>

Alternatively, if you are server-side you will use tfjs-node and add the canvas module to monkey patch the DOM polyfills for Node:
<pre><code>
npm i face-api.js canvas @tensorflow/tfjs-node
</code></pre>

<pre><code>
import '@tensorflow/tfjs-node';
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

Next, you need to load the models, which you should have copied to a folder somewhere in your project from /weights. We will define an async function to load the models:
const loadNet = async () => {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromDisk('./data/weights'),
        faceapi.nets.faceLandmark68Net.loadFromDisk('./data/weights'),
        faceapi.nets.faceExpressionNet.loadFromDisk('./data/weights')
    ]);
};
</code></pre>

After that, we can create a function to initialize the camera:
<pre><code>
const initCamera = async (width, height) => {
    const video = document.getElementById('cam');
    video.width = width;
    video.height = height;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: 'user',
            width: width,
            height: height
        }
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
};
</code></pre>

Making sure you have added a video element to the DOM:
<pre><code>
&lt;video id="cam" autoplay muted playsinline>&lt;/video>
</code></pre>

We are going to need a function that performs the actual detection and does something with the results:
<pre><code>
const tinyFaceOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });

const realTimeDetectFace = async () => {
    let detections = await faceapi
                                .detectSingleFace(cam, tinyFaceOptions)
                                .withFaceLandmarks()
                                .withFaceExpressions();

    if (typeof detections !== 'undefined') {
        let result = Object.keys(detections.expressions).reduce((accumulator, expression) => {
            let value = detections.expressions[expression];
            if (+value > accumulator.value) {
                accumulator.expression = expression;
                accumulator.value = +value;
            }
            return accumulator;
        }, { expression: '', value: 0 });

        if (result && result.value >= .9 && result.expression != 'neutral') {
            onExpression(result.expression);
        }
    }

    realTimeDetectFace();
};
</code></pre>

The function is recursive and will immediately invoke itself whenever it completes a loop. The function onExpression can be whatever you need it to be. It could be as simple as starting the picture countdown if it is not already running, or, in my case, it sends a message from the worker to the main renderer which gets used in a number of ways. *Later I will show how to easily toggle detection on and off so if you are in a worker, you can disable detection when you aren't using it.*

The block of code where we reduce the results of the expression detection is to handle the way that the data is returned. The results look something like this:
<pre><code>
{
    angry: 0.00013293007214087993
    disgusted: 0.0000014775343970541144
    fearful: 0.0000010557954510659329
    happy: 0.000005145540399098536
    neutral: 0.7788083553314209
    sad: 0.2183576226234436
    surprised: 0.0026933762710541487
}
</code></pre>

So we have to go through and get the greatest value and return the key. I chose to only recognize the expression if the value of that expression is 90% or greater and I also ignore neutral as I emit an event whenever an expression is detected and neutral is the baseline.

And it can all be tied together like so:
<pre><code>
loadNet()
.then(_ => {
    console.log('FaceAPI network loaded.');
    return initCamera(640, 480);
})
.then(video => {
    console.log('Camera was initialized.');
    cam = video;

    realTimeDetectFace(); //start the detection loop
});
</code></pre>

The initCamera function has height and width properties that set the size of the video that we are using to detect facial expressions, but if you are using a worker like I am then the dimensions in the worker don't have to be the same as the one presented to the user in the main renderer. I use 640x480 in the worker with the TinyFace model to make detection fast at the cost of some accuracy, then the image is scaled to fit the responsive image container in the other renderer.

To take a picture I use something like this:
<pre><code>
function onExpression(expression) {
    if (expression == 'happy' && currentStep == 'takePicture' && canTakePic && picCountdown === null && checkinData.pic === null && faceCentered && faceInSweetSpot === true) {
        picCountdown = 3;
        setTimeout(() => {
            onPicCountdown();
        }, 1000);
    }
}
</code></pre>

I am using a wizard-like stepped process for checking in a visitor, so I not only check if the expression is "happy", but I also make sure we are in the picture taking step, the camera is ready, the countdown is currently not set, we haven't already taken a picture, and the face is in the right position (which I will be covering next). If all of that checks out, I set the countdown to my desired time, aka 3 "seconds", and set a timeout to call the countdown function. I put seconds in quotes since I actually use 650 milliseconds for the countdown after the initial full second. I overlay the seconds of the countdown centered on the user's camera feed and full seconds feel too sluggish, but the initial "second" being longer than the rest makes the countdown appear and then seemingly engage itself. All that to say it feels better this way and I am all for sacrificing correctness for feeling good.

My onPicCountdown function just checks if the picCountdown is greater than zero, and if so, decrements it and sets another timeout for 650 milliseconds. If picCountdown == 0, I set it to null and call a capture function. In my specific Electron/React setup, to capture the image I get the canvas ref with this.canvasRef.current and set checkinData.pic = canvas.toDataURL('image/jpeg', 1.0).

![Face landmarks]({{ site.url }}/assets/media/posts/improving-the-picture-requirement-experience/landmarks.jpg)

If you aren't using face-api.js and the recognition library or service you have chosen doesn't offer built-in expression detection, you can also detect a smile with mouth landmarks and a simple slope calculation.

Face-api.js has a useful method detections.landmarks.getMouth(), which gets all the mouth points. The example below will be using it but you could easily modify the code to work with your landmark data. The concept remains the same, when a person is smiling, both the left and rightmost points of their smile have an incline from the centermost points of their lower lip.

We are going to get the left corner of their mouths x and y coordinates and then measure the slope of it from the center of their lower lips coordinates. If the slope is greater than or equal to 40%, I consider their mouth open, and in this specific case where we have prompted them, smiling. The in-built expression detection actually compares eye and nose points as well, so it is more accurate overall.

The function itself will also be returning the coordinates of the mouths bounding box in relation to the image, which we will later use to add the sparkle effect.

<pre><code>
function slope(x1, y1, x2, y2) {
    return (y1-y2)/(x1-x2);
}

function getMouthBox(mouthPoints) {
    let mouthBox = mouthPoints.reduce((accumulator, point) => {
        if (!accumulator.minX || point.x < accumulator.minX) {
            accumulator.minX = point.x;
        }
        if (!accumulator.maxX || point.x > accumulator.maxX) {
            accumulator.maxX = point.x;
        }
        if (!accumulator.minY || point.y < accumulator.minY) {
        	accumulator.minY = point.y;
        }
        if (!accumulator.maxY || point.y > accumulator.maxY) {
        	accumulator.maxY = point.y;
        }
        return accumulator;
    }, { minX: null, minY: null, maxX: null, maxY: null });

    return {
        x: mouthBox.minX,
        y: mouthBox.minY,
        width: mouthBox.maxX-mouthBox.minX,
        height: mouthBox.maxY-mouthBox.minY,
        open: !!(slope(mouthPoints[12].x, mouthPoints[12].y, mouthPoints[19].x, mouthPoints[19].y).toFixed(2) >= .4)
    };
}

getMouthBox(detections.landmarks.getMouth());
</code></pre>

#### Guiding the user with visual and audio feedback cues

![Visual guides]({{ site.url }}/assets/media/posts/improving-the-picture-requirement-experience/visual-guides.gif)

It was extremely important to me to make sure that the image that was taken of the user was high quality, meaning they were in the center of the frame and facing the camera. Luckily, I had an advantage over the other visitor management solutions, I already have face landmark coordinates which I can use to force the user to stand where I want them to. This task could be broken down into a few steps: make sure the user is not standing too close or too far away from the camera, make sure they are facing towards the camera, make sure they are horizontally centered in the frame, and indicate all of this to them both visually and audibly.

<pre><code>
let leftEye = 0;
detections.landmarks.getLeftEye().forEach((point) => {
    if (+point.x > leftEye) {
        leftEye = +point.x;
    }
});

let rightEye = detections.detection.imageWidth;
detections.landmarks.getRightEye().forEach((point) => {
    if (+point.x < rightEye) {
        rightEye = +point.x;
    }
});

let eyeDistance = (rightEye-leftEye).toFixed(2);

let jawOutline = detections.landmarks.getJawOutline(),
    jawFirstPoint = jawOutline[0],
    jawLastPoint = jawOutline[jawOutline.length-1],
    jawSkewCorrection = Math.pow(2/Math.pow(1-((detections.detection.box.width*detections.detection.box.height)/(detections.detection.imageWidth*detections.detection.imageHeight)).toFixed(2), 2), 2);

let noseCenterPoint = detections.landmarks.getNose()[0].x,
    faceWidth = jawLastPoint.x-jawFirstPoint.x;

//https://github.com/philiiiiiipp/Android-Screen-to-Face-Distance-Measurement

//modify ranges based on size of face and eye features (this bit is rudimentary for now)
let minRange = 20+(20*(.27-(eyeDistance/faceWidth)));
let maxRange = 32+(32*(.27-(eyeDistance/faceWidth)));

if (eyeDistance < minRange) {
    notifyRenderer('face-in-sweet-spot', 'FACE_CENTERED_TOO_FAR');
} else if (eyeDistance > maxRange) {
    notifyRenderer('face-in-sweet-spot', 'FACE_CENTERED_TOO_CLOSE');
} else if (jawFirstPoint.y < jawLastPoint.y-jawSkewCorrection || jawFirstPoint.y > jawLastPoint.y+jawSkewCorrection) {
    notifyRenderer('face-in-sweet-spot', 'FACE_CENTERED_ASKEW'); //face is askew
} else if (noseCenterPoint < jawFirstPoint.x+(faceWidth/2-faceWidth*.1) || noseCenterPoint > jawFirstPoint.x+(faceWidth/2+faceWidth*.1)) {
    notifyRenderer('face-in-sweet-spot', 'FACE_CENTERED_SIDE'); //nose not centered
} else {
    notifyRenderer('face-in-sweet-spot', true); //in the sweet spot (will improve with accurate monocular distance later)
}

notifyRenderer('face-centered', (jawFirstPoint.x >= detections.detection.imageWidth*.25 && jawLastPoint.x <= detections.detection.imageWidth*.75)); //whether face is in the center of frame or not
</code></pre>

That is a big chunk of code that goes in the realTimeDetectFace function and sends data back to the renderer from the worker using the notifyRenderer function, which looks like this:
<pre><code>
function notifyRenderer(command, payload) {
    ipcRenderer.send('window-message-from-worker', {
        command: command, payload: payload
    });
}
</code></pre>

Let me try to break some of that down. I basically dig into the landmark data that is available to me to do some extremely basic comparisons. For instance, I need the width of the face, so I get the difference between the two top points from each side of the head. I can also use the difference between the y values of both of those points to see if the head is tilted too much. I also use those points to check if the head is in the center 50% of the frame or not by comparing the x coordinate of each of those points with the desired padded area using the image width.

For distance from the camera, I actually cheated and implemented a very hacky but functional piece of code. Since this was just a prototype I didn't have the time to implement a solid monocular distance equation, but I followed a similar approach. The distance between a person's eyes in relation to the size of their face is actually pretty similar among normal adults, so I compare that relative size in pixels to sizes I got from standing at the nearest and most distant places using my face, and then account for the difference between my face and other peoples faces. It sounds complicated but it is only two lines of code:
<pre><code>
let minRange = 20+(20*(.27-(eyeDistance/faceWidth)));
let maxRange = 32+(32*(.27-(eyeDistance/faceWidth)));
</code></pre>

Where 20 represents the closest position (about 12 inches from the camera) and 32 represents the farthest (2.5 feet from the camera). I just console logged my eyeDistance values while position my head at those different distances and got the results 20 and 32. The .27 is from my faces dimensions, meaning that my eyeDistance compared to my faceWidth is 27%, so I offset the minimum and maximum range numbers based on the user's difference from my face size. And that is how you cheat at measuring the depth of a person from a camera when you are crunched for time. It is not precise, but it got the job done.

Once I had all of that data in the renderer, I was able to add a visual indicator to the user by placing a vector of a person's profile over the camera source. The overlay is white when no person is detected, green when you are centered, facing forward, and the right distance away, and it is red when you need to adjust. I also experimented with using the gender detection to switch the vector from the default male image to a female, depending on who was having their picture taken. One more adjustment to make is to mirror the camera source when it is being displayed or it is hard for the user to adjust themselves accordingly. You can do this easily by adding transform: scaleX(-1); to the style of the canvas. Your selfie camera on your cellphone is doing this by default unless you choose to shut it off in the settings.

I also added audio indicators that work in parallel with the colored overlay to give you detail as to how you need to adjust. So if you are standing to close, the kiosk will say "You are standing too close, please take a step back". It is not a complicated system, but it does have some cooldowns that make sure it doesn't keep repeating itself and annoy the user.

#### Making the experience stand out

![Mouth sparkles]({{ site.url }}/assets/media/posts/improving-the-picture-requirement-experience/mouth-sparkles.gif)

I experimented with a few different features to make the experience have some extra pizzazz. I added variables that track how long each step is taking a user to complete, whether or not they are getting too many error states, and use the expression results to check if they are frustrated or angry. With those combined, I was able to build an assistance system that automatically tried to help the user if they did happen to experience any issues. The whole check-in process features text-to-speech so the text on the screen is spoken aloud to them, along with undisplayed text such as the picture guidance cues and positive reinforcement. However, the largest and most noticeable of these features was adding an animated sparkling effect to their smile after their picture is taken.

I found <a href="https://joshwcomeau.com/react/animated-sparkles-in-react/" target="_BLANK">this article</a> on <a href="https://joshwcomeau.com/" target="_BLANK">Josh Comeau's blog</a> and used his Sparkles component wrapped around a div that is set to the position and dimensions of the mouthBox that we got previously. In practice, it looks like this:
<pre><code>
&lt;>
    &lt;video autoPlay muted playsInline ref={props.videoRef}/>
    &lt;canvas ref={props.canvasRef}/>
    { props.mouthBox &&
        &lt;div style=&#123;&#123;
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            left: (props.mouthBox.x/320*100).toFixed(2).toString() + '%',
            top: (props.mouthBox.y/240*100).toFixed(2).toString() + '%',
            width: (props.mouthBox.width/320*100).toFixed(2).toString() + '%',
            height: (props.mouthBox.height/240*100).toFixed(2).toString() + '%'
        }}>
            &lt;Sparkles style={{width: '80%', height: '60%'}}/> //sparkles smaller percentage area to account for lips and such, try to force sparkles to stay near center of smile/teeth
        &lt;/div>
    }
&lt;/>
</code></pre>

The mouthBox object is passed to a wrapper component as a prop. If the "open" property is true (remember we used the slope of the mouth to determine if the user was smiling), then I use the coordinates to calculate the responsive percentage position based on the dimensions that were passed to the TinyFace options. The <Sparkles/> component itself is smaller than the parent and centered so the sparkles stay closer to the teeth themselves in the center of the mouthBox area.

### Conclusion and extra details
In conclusion, the devil is in the detail. While it seems like a lot of effort to put into something as straightforward as taking the users picture, spending some extra time to make the experience look and feel better than the rest can really pay off in the long run. Visitor management is not a sexy thing from a user's perspective. I would bet money that none of the users who tested my prototype have ever enjoyed checking into a visitor management system or would describe the process as fun. But the feedback was almost completely positive with comments about how fast and easy the process was. They loved the countdown, which is so stupidly simple to add I'm not sure how the preexisting solutions could even overlook it, and the sparkles got their recognition as well.

A few extra details that I didn't cover is that I flash a white overlay very briefly during the capture moment to simulate the flash of a camera. I also play a camera sound effect from <a href="https://freesound.org/people/michorvath/" target="_BLANK">freesound.org</a>, which I highly recommend. The sound I used can be downloaded <a href="https://freesound.org/people/sonoplastico/sounds/98001/" target="_BLANK">here</a>. There is <a href="https://joshwcomeau.com/react/announcing-use-sound-react-hook/" target="_BLANK">a great article about using sound by Josh Comeau</a> (the one we stole the sparkles from earlier) that offers a use-sound React hook which I made use of in my project. I also toggle the detection function on/off from the renderer using two bools isRunning and isReady, which both start as false. In our promise chain when we finally call realTimeDetectFace() for the first time, we add the following snippet after:
<pre><code>
if (!isReady) {
    isReady = true;
    onReady();
}
</code></pre>

Then at the end of realTimeDetectFace(), when we go to call it again recursively, just check if isRunning is true.

And finally we receive a message in the worker from the renderer to toggle the active state:
<pre><code>
ipcRenderer.on('toggle-worker-active', (ev, active) => {
    if (active) {
        if (!isRunning) {
            console.log('activate worker');
            isRunning = true;
            if (isReady) {
                realTimeDetectFace();
            }
        }
    } else {
        console.log('deactivate worker');
        isRunning = false;
    }
});
</code></pre>

I didn't choose to focus on these improvements just to show off in a sales presentation. This check-in process will be the first thing a visitor to a school sees and if the experience is frustrating, that is going to make both the visitor and receptionist's day worse. But something as silly as putting some sparkles on the visitor's badge can make their day and that is what I am in the business of doing — not only making my code function and achieve its desire goal but also create memorable experiences out of seemingly tedious requirements.

Listen to your users' needs and then go above and beyond to not only meet those needs but to exceed them.
