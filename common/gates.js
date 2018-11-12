exports.bitToFloat = function(bitArray) {
    let bitLength = bitArray.length;
    let floatTotal = 0;
    let intMax = Math.pow(2, bitLength) - 1;
    for (x = 0; x < bitLength; x++) {
        if (bitArray[bitLength - x - 1] != 0) {
            floatTotal += Math.pow(2, x) / intMax;
        }
    }
    return floatTotal;
}

exports.floatToBit = function(floatTotal, bitLength) {
    let intMax = Math.pow(2, bitLength) - 1;
    floatTotal = Math.min(Math.max(0, floatTotal), 1);
    let binaryString = Math.round(intMax * floatTotal);
    binaryString = parseInt(binaryString, 10);
    binaryString = binaryString.toString(2);
    let binary = [];
    for (x = 0;
        (binary.length + binaryString.length) < bitLength; x++) {
        binary[x] = 0;
    }
    let appendedZeros = binary.length;
    for (x = 0; x < binaryString.length; x++) {
        binary[appendedZeros + x] = parseInt(binaryString[x]);
    }
    return binary;
}

exports.componentBitSize = function(componentType) {
    let dataBitLength = 0;
    switch (componentType) {
        case "LED":
            dataBitLength = 1;
            break;
        case "DimmableLED":
            dataBitLength = 8;
            break;
        case "Voltmeter":
            dataBitLength = 8;
            break;
        case "Speaker":
            dataBitLength = 8;
            break;
        case "Servo":
            dataBitLength = 8;
            break;
        case "RGBLED":
            dataBitLength = 3;
            break;
        case "DimmableRGBLED":
            dataBitLength = 24;
            break;
        case "LCD":
            dataBitLength = 8;
            break;
        case "7seg":
            dataBitLength = 8;
            break;
        case "LEDBar":
            dataBitLength = 10;
            break;
        case "Buzzer":
            dataBitLength = 1;
            break;
        case "Fiberlight":
            dataBitLength = 1;
            break;
        case "Motor":
            dataBitLength = 1;
            break;
        case "Electro-MagLock":
            dataBitLength = 1;
            break;
        case "button":
            dataBitLength = 1;
            break;
        case "dumbCable":
            dataBitLength = 1;
            break;
        case "fiberCable":
            dataBitLength = 1;
            break;
        case "smartCable":
            dataBitLength = 1;
            break;
        case "2WaySwitch":
            dataBitLength = 1;
            break;
        case "3WaySwitch":
            dataBitLength = 2;
            break;
        case "rotaryEncoder":
            dataBitLength = 3;
            break;
        case "adc":
            dataBitLength = 8;
            break;
        case "chip":
            dataBitLength = 6;
            break;
        case "rod":
            dataBitLength = 6;
            break;
        case "rotarySwitch":
            dataBitLength = 8;
            break;
        default:
            dataBitLength = 0;
    }
    return dataBitLength;
}