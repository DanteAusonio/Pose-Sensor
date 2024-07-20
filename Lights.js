const SerialPort = require('serialport');
const http = require('http')
const fs = require('fs')
const express = require('express');
const path = require('path');
const socketIO = require('socket.io');

// Replace this with your actual arduino port
const ArduinoPortName = '/dev/tty.usbmodem1101'

const app = express();

app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);

const io = socketIO(server);

let port;
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
    delimiter: '\r\n'
});


function openSerialPort() {
    return new Promise((resolve, reject) => {
        port = new SerialPort(ArduinoPortName, {
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
        });

        // Error handling
        port.on('error', function(err) {
            console.error('Error: ', err.message);
            reject(err);
        });

        // Ensure port is open
        port.on('open', function() {
            console.log('Serial Port Opened');
            port.pipe(parser);
            resolve();
        });

        // Handle data from the serial port if needed
        parser.on('data', function(data) {
            console.log('Received data from Arduino: ' + data);
        });
    });
    
}





io.on('connection', (socket) => {
    console.log('WebSocket connection established');

    socket.on('active', (data) => {
        console.log(data);
        activateLight(data.status)
            .then(() => console.log('Light activated: ', data.status))
            .catch(err => console.error('Failed to activate light: ', err));
    });

    socket.on('disconnect', () => {
        console.log('WebSocket connection closed');
    });
});

server.listen(3000, async () => {
    console.log('Server listening on port 3000');
    try {
        await openSerialPort();
    } catch (error) {
        console.error('Failed to open serial port:', error);
    }
});







function activateLight(lightChar) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            port.write(lightChar + "\n", function(err) {  
                if (err) {
                    console.log('Error on write: ', err.message);
                    reject(err);
                } else {
                    console.log('Message written');
                    resolve();
                }
            });
        }, 500);
    });
}






//// FOR TESTING
async function alternateLight() {
    console.log("AlternateLight Called")
    let lightChar = 'R';
    while (true) {
        if (lightChar === 'R') {
            console.log("Setting to green");
            lightChar = 'G';
        } else {
            console.log("Setting to red");
            lightChar = 'R';
        }

        await new Promise(resolve => setTimeout(resolve, 500)); // 2-second delay
        await activateLight(lightChar);
        
    }
}

// Start alternating lights after an initial delay of 5 seconds
async function start() {
    console.log("Start Called")
    try {
        await openSerialPort();
        alternateLight();
    } catch (error) {
        console.error("Failed to open serial port:", error);
    }
}






// Call start() to test
//start()
