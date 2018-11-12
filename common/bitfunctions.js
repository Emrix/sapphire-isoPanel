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