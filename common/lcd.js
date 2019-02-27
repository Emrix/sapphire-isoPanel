let resetSequence = [
    [0, 0, 0, 0, 0, 0, 0, 0, 1], //Clear display
    [0, 0, 0, 0, 0, 0, 0, 1, 0], //Return Home
    [0, 0, 0, 0, 0, 0, 1, 1, 0], //Entry Mode Set
    [0, 0, 0, 0, 0, 1, 1, 0, 0], //Display on/off control
    [0, 0, 0, 0, 1, 0, 1, 0, 0], //Cursor or display shift
    [0, 0, 0, 1, 1, 1, 1, 0, 0], //Function set
    [0, 0, 0, 0, 0, 0, 0, 1, 0], //Return Home
]; 

const firstLine = [0, 0, 0, 0, 0, 0, 0, 1, 0];
const nextLine = [0, 1, 1, 0, 0, 0, 0, 0, 0];


const clk = 25; //LCDclk
const latch = 7; //CE1
const data = 2; //LCDp

const timeDelay = 0;
const numberOfLCDs = 3;

const dBusR = 4; //LCDd0
const dBus0 = 14; //LCDd1
const dBus1 = 15; //LCDd2
const dBus2 = 17; //LCDd3
const dBus3 = 18; //LCDd4
const dBus4 = 27; //LCDd5
const dBus5 = 22; //LCDd6
const dBus6 = 23; //LCDd7
const dBus7 = 24; //LCDd8


function delay(t) {

}

function clock() {
    delay(timeDelay);
    digitalWrite(clk, HIGH);
    digitalWrite(latch, HIGH);
    delay(timeDelay);
    digitalWrite(clk, LOW);
    digitalWrite(latch, LOW);
}

function startPulse() {
    digitalWrite(data, HIGH);
    clock();
    digitalWrite(data, LOW);
}





let lcdData;

function writeToLCD(phrase, lineNumber, LCDNumber) {
    for (let x = 0; x < 16; x++) {
        lcdData[LCDNumber - 1][lineNumber - 1][x] = phrase[x];
    }
}

function commit() {
    //Switch to first line
    delay(timeDelay);
    writeBus(firstLine);
    startPulse();
    for (let LCDNum = 0; LCDNum < numberOfLCDs; LCDNum++) {
        clock();
    }
    //Write First Line
    for (let charNum = 0; charNum < 16; charNum++) {
        startPulse();
        for (let lcdNum = 0; lcdNum < numberOfLCDs; lcdNum++) {
            delay(timeDelay);
            writeBus(lookup[lcdData[lcdNum][0][charNum]]);
            clock();
        }
    }
    //Switch to next line
    delay(timeDelay);
    writeBus(nextLine);
    startPulse();
    for (let LCDNum = 0; LCDNum < numberOfLCDs; LCDNum++) {
        clock();
    }
    //Write 2nd Line
    for (let charNum = 0; charNum < 16; charNum++) {
        startPulse();
        for (let lcdNum = 0; lcdNum < numberOfLCDs; lcdNum++) {
            delay(timeDelay);
            writeBus(lookup[
                lcdData[lcdNum][1][charNum]
            ]);
            clock();
        }
    }
}

function writeBus(data) {
    digitalWrite(dBusR, data[0]);
    digitalWrite(dBus7, data[1]);
    digitalWrite(dBus6, data[2]);
    digitalWrite(dBus5, data[3]);
    digitalWrite(dBus4, data[4]);
    digitalWrite(dBus3, data[5]);
    digitalWrite(dBus2, data[6]);
    digitalWrite(dBus1, data[7]);
    digitalWrite(dBus0, data[8]);
}

function setupPins() {
    pinMode(data, OUTPUT);
    pinMode(clk, OUTPUT);
    pinMode(latch, OUTPUT);

    pinMode(dBus0, OUTPUT);
    pinMode(dBus1, OUTPUT);
    pinMode(dBus2, OUTPUT);
    pinMode(dBus3, OUTPUT);
    pinMode(dBus4, OUTPUT);
    pinMode(dBus5, OUTPUT);
    pinMode(dBus6, OUTPUT);
    pinMode(dBus7, OUTPUT);
    pinMode(dBusR, OUTPUT);

    digitalWrite(data, LOW);
    digitalWrite(clk, LOW);
    digitalWrite(latch, LOW);

    writeBus(resetSequence[6]);
}

function resetLCDs() {
    for (let resetStep = 0; resetStep < 7; resetStep++) {
        delay(timeDelay);
        writeBus(resetSequence[resetStep]);
        startPulse();
        for (let LCDNum = 0; LCDNum < numberOfLCDs; LCDNum++) {
            clock();
        }
    }
    for (let x = 0; x < numberOfLCDs; x++) {
        for (let y = 0; y < 2; y++) {
            for (let z = 0; z < 16; z++) {
                lcdData[x][y][z] = ' ';
            }
        }
    }
}

const line1 = 1;
const line2 = 2;
const lcd1 = 1;
const lcd2 = 2;
const lcd3 = 3;

function setup() {
    setupPins();
    resetLCDs();

    writeToLCD("0123456789abcdef", line1, lcd1);
    writeToLCD("First LCD!      ", line2, lcd1);
    writeToLCD("Second LCD!     ", line2, lcd2);
    writeToLCD("123456789abcdef0", line1, lcd2);
    writeToLCD("Third LCD!      ", line1, lcd3);
    writeToLCD("Power at!@#$%^&*", line2, lcd3);

    commit();

    delay(5000);

    writeToLCD("     Power      ", line1, lcd1);
    writeToLCD("  Distribution  ", line2, lcd1);
    writeToLCD("Power Node 1:   ", line1, lcd2);
    writeToLCD("0400 Units/Power", line2, lcd2);
    writeToLCD("Power Node 2:   ", line1, lcd3);
    writeToLCD("4400 Units/Power", line2, lcd3);

    commit();
}




let lookup = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 1, 0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0],
    [1, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 0],
    [1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 1, 1, 1, 1]
];