exports.run = function(sclk,cs,MOSI,SPIbitOutputs) {
    for (var x = 0; x < SPIbitOutputs.length; x++) {
        //Clock tick
        sclk.writeSync(1);
        sclk.writeSync(0);
        //Read input
        MOSI.writeSync(SPIbitOutputs[x]);
        console.log(SPIbitOutputs[x]);
    }
    cs.writeSync(1);
    cs.writeSync(0);
}