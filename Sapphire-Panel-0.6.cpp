#include <wiringPi.h>
#include <fstream>
#include <iostream>
#include <ctime>

#include<stdio.h>
#include<stdlib.h>
#include<unistd.h>
#include<sys/socket.h>
#include<sys/types.h>
#include<netinet/in.h>
#include<strings.h>
#include<string.h>
#include<arpa/inet.h>

#define ERROR -1
#define BUFFER 1024

	struct sockaddr_in remote_server;
	int sock; //Socket ID
	char input[BUFFER]; //User input
	char output[BUFFER]; //Sent from the server
	int len;



using namespace std;

string lastInputUpdate;
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
/*	char currentOutputCacheTime[TIMESTAMP_SIZE];
	ifstream in_file("Output Cache.txt");//Open the file
	//Check the timestamp
	bool cacheIsUpdated = false;
	in_file.get(currentOutputCacheTime, TIMESTAMP_SIZE);
	for (int x = 0;x < TIMESTAMP_SIZE;x++) {
		if (lastOutputCacheTime[x] != currentOutputCacheTime[x]) { //Looping through each of the chars in the array to see if there is a difference
			cacheIsUpdated = true;//if the values are not the same, the cache has been updated
			lastOutputCacheTime[x] = currentOutputCacheTime[x];
		}
	}
	if (cacheIsUpdated) { //if the chache has been updated, update the cache values
		char c;
		char d[20];
		for (int x = 0;x < TOTAL_MODULES;x++) { //Loop through each of the modules and update the values
			in_file.get(c);//Get rid of the newline character
			in_file.get(cachedOutputValues[x], OUTPUT_ARRAY_SIZE);//Put the char array with the specific module
			in_file.get(d, 20);//get rid of anything else that's on this line
		}
	}
	in_file.close();
*/
	for (int x = 0; x < TOTAL_MODULES; x++) {
		for (int y = 0; y < OUTPUT_ARRAY_SIZE;y++) {
//			if (y == 2 || y == 3) {
			if (y == 4 || y == 5) {
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
if (false) {
	ofstream out_file("/var/www/html/index.html");
//	out_file.open("output.txt");
	out_file << "<!DOCTYPE html>\n  <head>\n  </head>\n  <body>\n";
	out_file << time(NULL) << endl;
	for (int y = 0;y < TOTAL_MODULES;y++) {
		for (int x = 0;x < INPUT_ARRAY_SIZE;x++) {
			out_file << cached[y][x];
//			cout << cached[y][x];
		}
		out_file << "\n";
//		cout << "\n";
	}
	out_file << "  </body>\n</html>";
	out_file.close();
} else {

	char out_file[BUFFER];
	for (int y = 0; y < TOTAL_MODULES; y++) {
		out_file[y * TOTAL_MODULES] = '\n';
		for (int x = 0; x < INPUT_ARRAY_SIZE; x++) {
			out_file[y * TOTAL_MODULES + x + 1] = cached[y][x];
		}
	}


	if((connect(sock, (struct sockaddr *)&remote_server, sizeof(struct sockaddr_in))) == ERROR) { //attempt to establish a connection to the server
		perror("connect");
//		exit(-1);
	}
//	while(1) {
//		fgets(input, BUFFER, stdin); //get input from the user
		send(sock, out_file, strlen(out_file), 0); //send that info to the server

//		len = recv(sock, output, BUFFER, 0); //Receive info from the server
//		output[len] = '\0'; //set the last input to a null char so printf doesn't error
//		printf("%s\n", output); //output the server response to the server
//	}
	close(sock); //Close the socket.
}
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
//Network Setup
//Insert something here to resolve the voyager-core.local address through DNS or mDNS
	if((sock = socket(AF_INET, SOCK_STREAM, 0)) == ERROR) { //attempt to create socket
		perror("socket");
		//exit(-1);
	}

	remote_server.sin_family = AF_INET; //fill out remote_server information
	remote_server.sin_port = htons(atoi("50000"));
	remote_server.sin_addr.s_addr = inet_addr("10.1.13.176");
	bzero(remote_server.sin_zero, 8);


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

