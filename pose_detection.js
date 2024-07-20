const socket = io();
const URL = 'https://teachablemachine.withgoogle.com/models/BhwA3kcdV/';
let model, webcam, ctx, labelContainer, maxPredictions, serial;

// replace this with actual port name
let portName = '/dev/tty.usbmodem1101'; 


async function init() {
    console.log("Start Button Pressed");
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 500;
    const flip = true;
    webcam = new tmPose.Webcam(size, size, flip);

    try {
        await webcam.setup();
        console.log("Webcam setup successful");
    } catch (error) {
        console.error("Webcam setup failed:", error);
        alert("Webcam setup failed. Please ensure your webcam is connected and you have granted permissions.");
        return;
    }

    await webcam.play();
    window.requestAnimationFrame(loop);


    const canvas = document.getElementById("canvas"); // changed from canvas
    if (canvas) {
        canvas.width = size;
        canvas.height = size;
        ctx = canvas.getContext("2d");
    } else {
        console.error("Canvas element not found");
        return;
    }

    labelContainer = document.getElementById("label-container");
    if (labelContainer) {
        labelContainer.innerHTML = ''; // Clear any existing children
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    } else {
        console.error("Label container not found");
        return;
    }

}


async function loop(timestamp) {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}



async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    let handSignDetected = false;
    if (labelContainer) {
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            if (labelContainer.childNodes[i]) {
                console.log("Should Deactivate");
                labelContainer.childNodes[i].innerHTML = classPrediction;
            }

            if (prediction[i].className === "Valid Pose" && prediction[i].probability > 0.5) {
                console.log("Should Activate")
                handSignDetected = true;
            }
        }
    }

    if (handSignDetected) {
        console.log("Should Activate")
        socket.emit('active', { status: 'G' }); 
    } else {
        console.log("Should Deactivate")
        socket.emit('active', { status: 'R' });  
    }

    drawPose(pose);
}



function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}


document.getElementById('startBtn').addEventListener('click', init);

