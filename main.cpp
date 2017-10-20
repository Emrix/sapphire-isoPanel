#include <wiringPi.h>
#include <fstream>
#include <iostream>
#include <ctime>

using namespace std;

//These numbers refer to the WIRINGPI numbering scheme, NOT the sapphire nor physical numbering schemes
const int ADDRESS_PIN_ARRAY[] = { 8, 7, 1, 15, 9 };
const int ADDRESS_ARRAY_SIZE = 5;//This will tell us how many we use in the program
const int OUTPUT_PIN_ARRAY[] = { 16, 4, 5, 6, 10, 11 };//Though not all used, provided for compatibility
const int OUTPUT_ARRAY_SIZE = 6;//This will tell us how many we use in the program
const int INPUT_PIN_ARRAY[] = { 0, 2, 3, 12, 13, 14 };//Though not all used, provided for copatibility
const int INPUT_ARRAY_SIZE = 6;//This will tell us how many we use in the program
const double TIME_DELAY = 1;//In milliseconds //About 60 hz
const int TOTAL_MODULES = 24;
const int TIMESTAMP_SIZE = 10;

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

//Reads From Output Cache
void checkOutputCache(char(&lastOutputCacheTime)[TIMESTAMP_SIZE], char(&cachedOutputValues)[TOTAL_MODULES][OUTPUT_ARRAY_SIZE]) {
	for (int x = 0; x < TOTAL_MODULES; x++) {
		for (int y = 0; y < OUTPUT_ARRAY_SIZE;y++) {
			if (y == 2 || y == 3 || y == 5) { //BLUE AND GREEN AND WHITE
//			if (y == 4 || y == 5) { //RED AND WHITE
				cachedOutputValues[x][y] = '1';
			} else {
				cachedOutputValues[x][y] = '0';
			}
		}
	}
}

//Write to Output pins
void setOutputPins(int moduleNumber, int outputAmountInt, char outputArray[][OUTPUT_ARRAY_SIZE]) {
	for (int x = 0;x < outputAmountInt;x++) {
		if (outputArray[moduleNumber][x] == '1') {
			digitalWrite(OUTPUT_PIN_ARRAY[x], HIGH);
		}
		else {
			digitalWrite(OUTPUT_PIN_ARRAY[x], LOW);
		}
	}
}

//Writes Input Cache
void setInputCache(bool(&cached)[TOTAL_MODULES][INPUT_ARRAY_SIZE]) {
	ofstream out_file("/var/www/html/index.html");
	out_file << "<!DOCTYPE html>\n  <head>\n  </head>\n  <body>\n";
	out_file << time(NULL) << endl;
	for (int y = 0;y < TOTAL_MODULES;y++) {
		for (int x = 0;x < INPUT_ARRAY_SIZE;x++) {
			out_file << cached[y][x];
		}
		out_file << "\n";
	}
	out_file << "  </body>\n</html>";
	out_file.close();
}

//Read from the Input Pins
void checkInputPins(int moduleNumber, bool(&cachedInputValues)[TOTAL_MODULES][INPUT_ARRAY_SIZE], bool&inputHasChanged) {
	for (int x = 0;x < INPUT_ARRAY_SIZE;x++) {
		if (cachedInputValues[moduleNumber][x] != digitalRead(INPUT_PIN_ARRAY[x])) {
			cachedInputValues[moduleNumber][x] = digitalRead(INPUT_PIN_ARRAY[x]);
			inputHasChanged = true;
		}
	}
}

//Now we are actually going to get to our actual function
int main(void) {
	//Pin Setup
	wiringPiSetup();
	pinSetup();
	//Output Setup
	char cachedOutputValues[TOTAL_MODULES][OUTPUT_ARRAY_SIZE];
	char lastOutputCacheTime[TIMESTAMP_SIZE];
	//Input Setup
	bool cachedInputValues[TOTAL_MODULES][INPUT_ARRAY_SIZE];
	bool inputHasChanged;

        while (true) {
		checkOutputCache(lastOutputCacheTime, cachedOutputValues);
		inputHasChanged = false;
		for (int currentModuleStepper = 0;currentModuleStepper < TOTAL_MODULES;currentModuleStepper++) {
			delay(TIME_DELAY);
			outputPinReset();
			setAddressPins(currentModuleStepper);
			setOutputPins(currentModuleStepper, OUTPUT_ARRAY_SIZE, cachedOutputValues);
			checkInputPins(currentModuleStepper, cachedInputValues, inputHasChanged);
		}
//		cout << inputHasChanged << endl;
		if (inputHasChanged){
			setInputCache(cachedInputValues);
		}
	}
	return 0;
}

