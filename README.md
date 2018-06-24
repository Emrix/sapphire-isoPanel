# Sapphire ISO Panel
### created by Matt Ricks

Make sure that "isoProgram" is in the cron jobs <crontab -e>, and that it starts on startup


## Pin configuration
               74HC595 SIPO
Output <=   QB  | 01  16 | Vcc     => 5v
Output <=   QC  | 02  15 | QA      => Output
Output <=   QD  | 03  14 | SER     => Ser In (MOSI)
Output <=   QE  | 04  13 | OE      => GND
Output <=   QF  | 05  12 | RCLK    => CE1
Output <=   QG  | 06  11 | SRCLK   => SCLK
Output <=   QH  | 07  10 | SRCLR   => 5v
GND    <=   GND | 08  09 | QH'     => SER Out

                  74HC165 PISO
LOAD   <=   SH/LD  | 01  16 | Vcc      => 5v
SCLK   <=   CLK    | 02  15 | CLK INH  => GND
Input  <=   E      | 03  14 | D        => Input
Input  <=   F      | 04  13 | C        => Input
Input  <=   G      | 05  12 | B        => Input
Input  <=   H      | 06  11 | A        => Input
            QH'    | 07  10 | SER      => SER In
GND    <=   GND    | 08  09 | QH       => SER Out (MISO)

               Raspberry Pi
        3.3v   | 01  02 | 5v
        GPIO2  | 03  04 | 5v
        GPIO3  | 05  06 | GND
     <= GPIO4  | 07  08 | GPIO14 =>
GND  <= GND    | 09  10 | GPIO15 =>
     <= GPIO17 | 11  12 | GPIO18 =>
     <= GPIO27 | 13  14 | GND
     <= GPIO22 | 15  16 | GPIO23 =>
        3.3v   | 17  18 | GPIO24 =>
MOSI <= GPIO10 | 19  20 | GND
MISO <= GPIO9  | 21  22 | GPIO25 => PWR
SCLK <= GPIO11 | 23  24 | GPIO8  => CE0
        GND    | 25  26 | GPIO7  => CE1
---------------------------------------
        DNC    | 27  28 | DNC
     <= GPIO5  | 29  30 | GND
     <= GPIO6  | 31  32 | GPIO12 =>
     <= GPIO13 | 33  34 | GND
     <= GPIO19 | 35  36 | GPIO16 =>
     <= GPIO26 | 37  38 | GPIO20 =>
        GND    | 39  40 | GPIO21 =>






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
