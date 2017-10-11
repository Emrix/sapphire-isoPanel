/*
This is now only here just for reference... Sapphire Pin refers to the Bus Pin, and are found on the main board
The other number refers to the wiringPi numbering scheme
physcal	WirngPi	Sapphr	Purpose
N/A	N/A	1	5v
N/A	N/A	2	GND
1	N/A	N/A	3.3v
2	N/A	N/A	5v
3	8	3	Address 1
4	N/A	N/A	5v
5	9	4	Address 5
6	N/A	N/A	GND
7	7	5	Address 2
8	15	6	Address 4
9	N/A	N/A	GND
10	16	7	Output 1
11	0	10	Input 1
12	1	8	Address 3
13	2	12	Input 2
14	N/A	N/A	GND
15	3	14	Input 3
16	4	9	Output 2
17	N/A	N/A	3.3v
18	5	11	Output 3
19	12	16	Input 4
20	N/A	N/A	GND
21	13	18	Input 5
22	6	13	Output 4
23	14	20	Input 6
24	10	15	Output 5
25	N/A	N/A	GND
26	11	17	Output 6
FIND-OUT-WIRINGPI-FOR-PI-2B+
27	N/A	N/A	N/A
28	N/A	N/A	N/A
29	???	22	Input 7
30	N/A	N/A	GND
31	???	24	Input 8
32	???	19	Output 7
33	???	26	Input 9
34	N/A	N/A	GND
35	???	28	Input 10
36	???	21	Output 8
37	???	27	Output 11
38	???	23	Output 9
39	N/A	N/A	GND
40	???	25	Output 10
N/A	N/A	29	GND
N/A	N/A	30	5v
*/

#include <wiringPi.h>
#include <iostream>
#include <fstream>
#include <ctime>

using namespace std;

string lastInputUpdate;
//These numbers refer to the WIRINGPI numbering scheme, NOT the sapphire nor physical numbering schemes
const int ADDRESS_PIN_ARRAY[] = { 8, 7, 1, 15, 9 };
const int ADDRESS_ARRAY_SIZE = 5;//This will tell us how many we use in the program
const int OUTPUT_PIN_ARRAY[] = { 16, 4, 5, 6, 10, 11 };//Though not all used, provided for compatibility
const int OUTPUT_ARRAY_SIZE = 6;//This will tell us how many we use in the program
const int INPUT_PIN_ARRAY[] = { 0, 2, 3, 12, 13, 14 };//Though not all used, provided for copatibility
const int INPUT_ARRAY_SIZE = 6;//This will tell us how many we use in the program
const double TIME_DELAY = 0.5;//In milliseconds //About 60 hz
const int TOTAL_MODULES = 24;
const int TIMESTAMP_SIZE = 10;

int reportFail() {
	cout << "\nINVALID INPUT.\n";
	cin.clear();
	cin.ignore(1000, '\n');
	return 0;
}

//Pin Setup
void pinSetup() {
	//Address
	for (int x = 0;x < ADDRESS_ARRAY_SIZE;x++) {
		pinMode(ADDRESS_PIN_ARRAY[x], OUTPUT);
	}
	//Output
	for (int y = 0;y < OUTPUT_ARRAY_SIZE;y++) {
		pinMode(OUTPUT_PIN_ARRAY[y], OUTPUT);
	}
	//Input
	for (int z = 0;z < INPUT_ARRAY_SIZE;z++) {
		pinMode(INPUT_PIN_ARRAY[z], INPUT);
	}
}

//Address Pin Settup
void setAddressPins(int tempModuleNum) {
	if (tempModuleNum >= 16) { //Modules 16 to 31
		digitalWrite(ADDRESS_PIN_ARRAY[4], HIGH);
		tempModuleNum = tempModuleNum - 16;
	}
	else {
		digitalWrite(ADDRESS_PIN_ARRAY[4], LOW);
	}
	if (tempModuleNum >= 8) { //Modules 8 to 15
		digitalWrite(ADDRESS_PIN_ARRAY[3], HIGH);
		tempModuleNum = tempModuleNum - 8;
	}
	else {
		digitalWrite(ADDRESS_PIN_ARRAY[3], LOW);
	}
	if (tempModuleNum >= 4) { //Modules 4 to 7
		digitalWrite(ADDRESS_PIN_ARRAY[2], HIGH);
		tempModuleNum = tempModuleNum - 4;
	}
	else {
		digitalWrite(ADDRESS_PIN_ARRAY[2], LOW);
	}
	if (tempModuleNum >= 2) { //Modules 2 to 3
		digitalWrite(ADDRESS_PIN_ARRAY[1], HIGH);
		tempModuleNum = tempModuleNum - 2;
	}
	else {
		digitalWrite(ADDRESS_PIN_ARRAY[1], LOW);
	}
	if (tempModuleNum == 1) { //Modules 0 to 1
		digitalWrite(ADDRESS_PIN_ARRAY[0], HIGH);
	}
	else {
		digitalWrite(ADDRESS_PIN_ARRAY[0], LOW);
	}
}

//Output Pin Reset
void outputPinReset() {
	for (int x = 0;x < OUTPUT_ARRAY_SIZE;x++) {
		digitalWrite(OUTPUT_PIN_ARRAY[x], LOW);
	}
}

//Write to Output pins
void setOutputPins(int outputAmountInt, char outputArray[OUTPUT_ARRAY_SIZE]) {
	for (int x = 0;x < outputAmountInt;x++) {
		if (outputArray[x] == '1') {
			digitalWrite(OUTPUT_PIN_ARRAY[x], HIGH);
		}
		else {
			digitalWrite(OUTPUT_PIN_ARRAY[x], LOW);
		}
	}
}

//Read from the Input Pins
void checkInputPins() {
	bool cachedInputValues[INPUT_ARRAY_SIZE];
	for (int x = 0;x < INPUT_ARRAY_SIZE;x++) {
		if (cachedInputValues[x] != digitalRead(INPUT_PIN_ARRAY[x])) {
			cachedInputValues[x] = digitalRead(INPUT_PIN_ARRAY[x]);
		}
	}
}


//Now we are actually going to get to our actual function
int main(void) {
	//Pin Setup
	wiringPiSetup();
	pinSetup();
	int userChoice;
	int pinNumber;
	int value;
	int pin;
	bool isInput;

	while (true) {
		cout << "\nOptions: \n\t1-Change Address\n\t2-Change An Output\n\t3-Read An Input\n\t4-Write All Outputs\n\t5-Read All Inputs\n\t6-Quit\nChoose An Option: ";
		cin >> userChoice;

		if (userChoice == 1) { //Change Address
			cout << "Choose an address [0-31]: ";
			cin >> value;
			setAddressPins(value);
		} else if (userChoice == 2) { //Change Input
			cout << "Choose an input [0-5]: ";
			cin >> pin;
			cout << "Choose an value [0-1]: ";
			cin >> value;
			if (value) {
				digitalWrite(OUTPUT_PIN_ARRAY[pin], HIGH);
			} else {
				digitalWrite(OUTPUT_PIN_ARRAY[pin], LOW);
			}
		} else if (userChoice == 3) { //Read Output
			cout << "Choose an output [0-5]: ";
			cin >> pin;
			cout << "Pin " << pin << " Output: " << digitalRead(INPUT_PIN_ARRAY[pin]) << endl;
		} else if (userChoice == 4) { //Write all
			cout << "Enter a Space Delimited String of 1 or 0:\n";
			for (int x = 0; x < 6; x++) {
				cin >> value;
				if (value) {
					digitalWrite(OUTPUT_PIN_ARRAY[x], HIGH);
				} else {
					digitalWrite(OUTPUT_PIN_ARRAY[x], LOW);
				}
			}
		} else if (userChoice == 5) { //Read All
			cout << "Pin Readouts:\n";
			for (int x = 0; x < 6; x++) {
				cout << "Pin " << x << " Output: " << digitalRead(INPUT_PIN_ARRAY[x]) << endl;
			}
		} else {
			break;
		}
	}
	return 0;
}
