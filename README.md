# Sapphire ISO Panel
### created by Matt Ricks

Make sure that "isoProgram" is in the cron jobs <crontab -e>, and that it starts on startup


## Pin configuration for Linear Bus
```
               74HC595 SIPO
Output <=   QB  | 01  16 | Vcc     => 5v
Output <=   QC  | 02  15 | QA      => Output
Output <=   QD  | 03  14 | SER     => Ser In (MOSI)
Output <=   QE  | 04  13 | OE      => GND
Output <=   QF  | 05  12 | RCLK    => CE1
Output <=   QG  | 06  11 | SRCLK   => SCLK
Output <=   QH  | 07  10 | SRCLR   => 5v
GND    <=   GND | 08  09 | QH'     => SER Out
http://www.ti.com/lit/ds/symlink/sn74hc595.pdf
```

```
                 74HC165 PISO
LOAD  <=   SH/LD  | 01  16 | Vcc      => 5v
SCLK  <=   CLK    | 02  15 | CLK INH  => GND
Input <=   E      | 03  14 | D        => Input
Input <=   F      | 04  13 | C        => Input
Input <=   G      | 05  12 | B        => Input
Input <=   H      | 06  11 | A        => Input
           QH'    | 07  10 | SER      => SER In
GND   <=   GND    | 08  09 | QH       => SER Out (MISO)
http://www.ti.com/lit/ds/symlink/sn74hc165.pdf
```

## Pin configuration for LCD "Parallel" Bus
```
                   74HC595 SIPO
LCDSelect  <=   QB  | 01  16 | Vcc     => 5v
LCDSelect  <=   QC  | 02  15 | QA      => LCDSelect
LCDSelect  <=   QD  | 03  14 | SER     => LCDp
LCDSelect  <=   QE  | 04  13 | OE      => GND
LCDSelect  <=   QF  | 05  12 | RCLK    => LCDclk
LCDSelect  <=   QG  | 06  11 | SRCLK   => LCDclk
LCDSelect  <=   QH  | 07  10 | SRCLR   => 5v
GND        <=   GND | 08  09 | QH'     => SER Out
http://www.ti.com/lit/ds/symlink/sn74hc595.pdf
```

```
             HD44780U LCD
01 | GND    => GND
02 | VCC    => 5v
03 | V0     => POT (Display Contrast)
04 | RS     => LCDd0
05 | RW     => GND
06 | E      => LCDSelect
07 | DB0    => LCDd1
08 | DB1    => LCDd2
09 | DB2    => LCDd3
10 | DB3    => LCDd4
11 | DB4    => LCDd5
12 | DB5    => LCDd6
13 | DB6    => LCDd7
14 | DB7    => LCDd8
15 | LED+   => 5v
16 | LED R- => 200 ohm resistor to GND
--------------------------------------
17 | LED G- => 250 ohm resistor to GND
18 | LED B- => 250 ohm resistor to GND
https://cdn-shop.adafruit.com/datasheets/HD44780.pdf
```

```
 Potentiometer
01 | GND => GND
02 | OUT => POT
03 | VCC => 5v
https://components101.com/sites/default/files/component_pin/potentiometer-pinout.png
```

## Pin configuration Raspberry Pi
```
               Raspberry Pi
        3.3v   | 01  02 | 5v     => 5v
LCDp <= GPIO2  | 03  04 | 5v     => 5v
PWR  <= GPIO3  | 05  06 | GND    => GND
LCDd0<= GPIO4  | 07  08 | GPIO14 => LCDd1
GND  <= GND    | 09  10 | GPIO15 => LCDd2
LCDd3<= GPIO17 | 11  12 | GPIO18 => LCDd4
LCDd5<= GPIO27 | 13  14 | GND    => GND
LCDd6<= GPIO22 | 15  16 | GPIO23 => LCDd7
        3.3v   | 17  18 | GPIO24 => LCDd8
MOSI <= GPIO10 | 19  20 | GND    => GND
MISO <= GPIO9  | 21  22 | GPIO25 => LCDclk
SCLK <= GPIO11 | 23  24 | GPIO8  => CE0
GND  <= GND    | 25  26 | GPIO7  => CE1
---------------------------------------
        DNC    | 27  28 | DNC
     <= GPIO5  | 29  30 | GND    => GND
     <= GPIO6  | 31  32 | GPIO12 =>
     <= GPIO13 | 33  34 | GND    => GND
     <= GPIO19 | 35  36 | GPIO16 =>
     <= GPIO26 | 37  38 | GPIO20 =>
GND  <= GND    | 39  40 | GPIO21 =>
```




## Finite State Machine (FSM)
States are contained in constant objects
The current state of the FSM is contained in the FSM variable
Each state has Outputs, Inputs, Operator, and NextState
The outputs are set either statically by the state, or by running the "Operate" function
The inputs are set externally, and are passed from variable to variable as the state changes
The operate function allows you to perform output logic, or other functions while in that state
The nextState is to change to go to the next state. Logic can be set to go to two different states
    Additionally, in order to pass the inputs, "FSM.inputs = this.inputs" must be included in this
    function.  Also, the "operate" function can be included in here to automatically run their
    operations when they switch to the new state.
Use the Initialization State to set initial input / output values, or perform initial operations


## Config Files Include:
Thorium Server Address / Ship Config Information
Pulls initial state from the Thorium Server if possible
Registers itself and current configuration on the thorium Server
initializes the circuit into the logical analyzer
Get the thorium queries and store them in keyvalue map with the UUID as key
Get the Panel Inputs from the Circuit, and store them in a key-value map  UUID as key
Get the Panel outputs from the Circuit, and store them in a key-value map  UUID as key
Get the thorium mutations and store them in keyvalue map with the UUID as key


## This is for the logical analyzer data structures
```
var scheduler = [ /*uuid,uuid,...*/ ];

var circuit = {
    /*  {
            component: "emitter|driver|gate",
            type: string (depending on the component),

            id: uuid,
            to: [uuid],
            from: [uuid],

            level: float,

            label: string,
            color: valid CSS Color,
            X: float,
            Y: float,
            scale: float,
        },
        {
            ...
        }*/
};

//The stability map is not in the component description,
//because I didn't want to have it exported to a file,
//when it is only used in the evaluation of the component.
var stabilityMap = {
    /*
    uuid: int,
    uuid: int,
    ,...
    */
};
```



## Setting up the Pi
* Install Raspbian on the pi
* Access the Command line
* run the follwoing: ```sudo apt upgrade
sudo apt update
sudo apt install node
sudo apt install npm
cd ~
git checkout https://github.com/Emrix/sapphire-panels.git && cd sapphire-panels
git checkout node_mvp
npm install
npm start```
* open up a browswer window, and navigate to the pi's IP address.