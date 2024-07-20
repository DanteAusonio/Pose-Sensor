int greenLEDPin = 7;
int redLEDPin = 8;

void setup() {
    pinMode(greenLEDPin, OUTPUT);
    pinMode(redLEDPin, OUTPUT);
    Serial.begin(9600);
    Serial.println("Hello, Arduino!");
}

void loop() {
    if (Serial.available() > 0) {
        Serial.println("Serial Available");
        char command = Serial.read();
        if (command == 'G') {
            Serial.println("Activate Green");
            digitalWrite(greenLEDPin, HIGH);
            digitalWrite(redLEDPin, LOW);
        } else if (command == 'R') {
            digitalWrite(greenLEDPin, LOW);
            digitalWrite(redLEDPin, HIGH);
            Serial.println("Activate Red");
        }
    } else {
        Serial.println("Serial Unavailable");
    }
}
