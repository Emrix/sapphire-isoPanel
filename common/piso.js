module.exports = function(sclk,cs,MISO,MAX_IO) {
    var SPIbitInputs = [];
    cs.writeSync(1);
    cs.writeSync(0);
    for (var x = 0; x < MAX_IO; x++) {
        //Clock tick
        sclk.writeSync(1);
        sclk.writeSync(0);
        //Read input
        SPIbitInputs[x] = MISO.readSync();
    }
    return SPIbitInputs;
}