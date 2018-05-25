/*
* Cupket.js
*
* An open source class for interacting with websocket servers
*
*
* @package Cupket.js < Cuppy Sockets >
*
* @author Frost  Codes( Oluwaseyi Aderinkomi )
*
* @license    http://www.dbad-license.org/  DON'T BE A DICK PUBLIC LICENSE
*
* @author     Frost  Codes( Oluwaseyi Aderinkomi ) <seyiaderinkomi@gmail.com>
*
* @version 1.1
*
* ----------- LICENSE ----------
*
*
*  # DON'T BE A DICK PUBLIC LICENSE
*  
*  > Version 1.1, MAY 2018
*  
*  > Copyright (C) 2018 Punchline Technologies
*  
*  Everyone is permitted to copy and distribute verbatim or modified
*  copies of this license document.
*  
*  > DON'T BE A DICK PUBLIC LICENSE
*  > TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
*  
*  1. Do whatever you like with the original work, just don't be a dick.
*  
*  Being a dick includes - but is not limited to - the following instances:
*  
*   1a. Outright copyright infringement - Don't just copy this and change the name.
*   1b. Selling the unmodified original with no work done what-so-ever, that's REALLY being a dick.
*  1c. Modifying the original work to contain hidden harmful content. That would make you a PROPER dick.
*
*  2. If you become rich through modifications, related works/services, or supporting the original work,
*  share the love. Only a dick would make loads off this work and not buy the original work's
*  creator(s) a pint.
*  
*  3. Code is provided with no warranty. Using somebody else's code and bitching when it goes wrong makes
*  you a DONKEY dick. Fix the problem yourself. A non-dick would submit the fix back.
*    
*  
*  
*/



class cupket {

	constructor(server='localhost', protocols, options ) {

let self = this; //reference to this instance


// Default settings
var settings = {

//defines if we should use web socket secured
secured: false,

//port of the web socket server
port: 9060,


/*
This id can be used to differentiate multiple instances
of cupket running at the same time, this is useful for the
web socket events...by default is generated randomly 
*/

id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),

//reconnect to server if connection gets lost?
autoReconnect: true, 

//The number of milliseconds to delay before attempting to reconnect.
reconnectInterval : 2500, 

//allow printing of debug infos
allowDebug : false, 

// allow logging of time certain events happened
TimeLogging : false, 





}
if (!options) { options = {}; }

    // Overwrite and define settings with options if they exist.
    for (var key in settings) {
    	if (typeof options[key] !== 'undefined') {
    		this[key] = options[key];
    	} else {
    		this[key] = settings[key];
    	}
    }



this.connString = ''; //connection string used in making connection
this.protocols = protocols; // protocol(s) used for connection

//enum to store the states of connections

this.connectionStates = {

CONNECTING: 0, //The connection is not yet open.
OPEN: 1, //The connection is open and ready to communicate.
CLOSING: 2, //The connection is in the process of closing.
CLOSED: 3 //The connection is closed or couldn't be opened.

};




//Data Statistics...

this.statistics = {}; // object to hold statistics data

this.statistics.totalPacketSent = 0; // total bytes of data sent to server 
this.statistics.totalFailedRequests= 0;  //  total number of requests that failed to send to server

this.statistics.totalDataRequests = 0; // total number of request sent to server  

this.statistics.totalPacketReceived = 0; // total bytes of data received from server 
this.statistics.totalDataReceived = 0; // total number of request sent to server

this.statistics.totalReconnects = 0; // total number of times cupket tried reconnecting to server





//lanch an instance of the web socket conncetion...  

try {


//enable support for old browsers

if (!window.WebSocket) {

	window.WebSocket = window.MozWebSocket;

}


console.log('Started Cupket Sockets!');
console.log('Initial Cupket Sockets ID: ' + this.id); 


//verify the user browser can run cupket

if(!this.isSupported()){ 

// browser does not support web socket 

console.warn('Cupket cant run... The current browser does not support web sockets!');

console.log('Setting Cupket Object to undefined!');

self = undefined;
return undefined;

}
else
{


	if(this.secured){

//web socket should be secured

this.connString = 'wss://' + server + ':' + this.port;

}
else

{

//web socket should not be secured

this.connString = 'ws://' + server + ':' + this.port; 

}

this.ws = new WebSocket(this.connString , this.protocols || []);  //connect


if(this.allowDebug){

	console.log('Debugging is active...');

	console.log('Connecting to server !');
	console.log('Connecting using configs: {  ' + this.connString + '  } and current cupket id is: ' + this.id );

	if(this.protocols) {

		console.log('Protocols used for connection :');
		console.log(this.protocols);

	}


}

//SECTION:  Manage web socket events

this.ws.onopen = function(evt){

	if(self.allowDebug){

		console.log('Cupket was able to open connection @ ' + new Date());
		console.log(evt);

	}

self.cupket_event('cupket_onopen' , evt); // send event for onopen

};


this.ws.onmessage = function(evt){

	if(self.allowDebug){

		console.log('Message packets received @ ' + new Date());
		console.log(evt);

	}


//BUG: does not resume counting when connection is lost... 

self.statistics.totalDataReceived++;

self.__updateTotalPacketReceived(evt.data);

self.cupket_event('cupket_onmessage' , evt); // send event for onmessage


};


this.ws.onclose = function(evt){

	if (self.isTimeLogging) {

		console.warn('Cupket sockets disconnected from server @ ' + new Date());

	}


	if(self.allowDebug){

		console.log('Connection Closed: ');
		console.log('Code: ' + evt.code + '    Type: ' + evt.type);

		console.log('Extra data...');
		console.log(evt);

	}



	if (self.isAutoReconnect()){

		self.reconnect();

	}


self.cupket_event('cupket_onclose' , evt); // send event for onclose



};



this.ws.onerror = function(evt){

	if (self.isTimeLogging) {

		console.warn('Cupket sockets encountered an error @ ' + new Date());

	}

	if(self.allowDebug){

		console.warn('Error Occured ' + evt.data);

		console.log('Extra info...');
		console.log(evt);

	}

self.cupket_event('cupket_onerror' , evt); // send event for onerror


};


}



}
catch(err) {

	console.log(err.message);
	return false;
}



}


//returns the instance of the web socket

cupket(){

	return this.ws;

}

//returns the connection string used while connecting to web socket

connectionString(){

	return this.connString;

}


//checks if auto reconnect is on

isAutoReconnect() {

	return this.autoReconnect;

}

//turn on auto reconnect

enableAutoReconnect() {

	this.autoReconnect = true;

}

//turn off auto reconnect

disableAutoReconnect() {

	this.autoReconnect = false;

}

//checks if debugging mode is on

isDebugging() {

	return this.allowDebug;

}

//turn on debugging mode

enableDebugging() {

	this.allowDebug = true;

}

//turn off debugging mode

disableDebugging() {

	this.allowDebug = false;

}


isTimeLogging() {

	return this.TimeLogging;

}


enableTimeLogging(){

	this.TimeLogging = true;

}


disableTimeLogging(){

	this.TimeLogging = false;


}


//cupket event manager for web socket events

cupket_event(type , data){

	try {

window[type](this.id, data); // try and call the event handler...

}
catch(err) {

	console.warn('There is no available handler for [  ' + type + '  ]. Events would not be handled. Please consider adding one!');

	if(this.isDebugging()){

		console.log('There is no Event handler for [  ' + type + '  ], current Cupket id is : ' + this.id);

	}

}

}


//check if cupket is connected to server...

isConnected() {

	return (this.cupket().readyState === this.connectionStates.OPEN);

}


//returns the current connection state...

connectionState() {

	return cupket.readyState;  

}



//use this to compare current connection state to another state
isConnectionState(connectionState) {

	return (this.isConnected() == connectionState);  

}


//reconnect to the web socket server

reconnect() {

//remove any old connection..

if(this.isConnected()){

	this.close();
	this.ws = null;


} 

var self = this; //reference to self instance 

var tryReconnect = setInterval(function(){ 

	if(!self.isConnected()){

self.ws = new WebSocket(self.connString , self.protocols || []);  //try and reconnect

if(self.isDebugging()){

	console.log('Cupket is trying to reconnect to server ... @ ' + new
		Date());

}

self.statistics.totalReconnects ++;


}
else{

//we are connected stop trying to reconnect 

if(self.isDebugging()){

	console.log('Cupket was able to reconnect to server ... @ ' + new
		Date());

}


self.cupket_event('cupket_onreconnected' , self); // send event for onreconnected


clearInterval(tryReconnect); //stop!!

}


}, this.reconnectInterval);





}

//close the web socket connection
//reconnect defines if you want to stop auto reconnect also...
close(stopReconnect=false){

	if (this.isDebugging()) {

		console.log('Cupket sockets closed by user @ ' + new Date());

	}

	this.cupket().close();

	if(stopReconnect){

this.disableAutoReconnect();

	}

}

//check if the browser supports web socket..

isSupported(){

	if (window.WebSocket){

		if (this.isDebugging()) {

			console.log('Browser supports Web Sockets...');

		} 

		return true;

	} 
	else 
	{

		if (this.isDebugging()) {

			console.log('Browser does not support Web Sockets...');

		}

		return false;


	}

}






//reset the Statistics data

resetStatistics(){

	if (this.isTimeLogging) {

		console.log('Cupket sockets data statistics was reseted @ ' + new Date());

	}

	if(this.isDebugging()){

		console.log('Cupket sockets data statistics reseted !');

	}

	this.statistics.totalPacketSent = 0;
	this.statistics.totalFailedRequests= 0;

	this.statistics.totalDataRequests = 0;   

	this.statistics.totalPacketReceived = 0;
	this.statistics.totalDataReceived = 0; 

}


//this updates the total packets sent : private function maybe...
__updateTotalPacketSent(data){

//check if this is a blob 
var isBlob = data instanceof Blob;
var isArrayBuffer = data instanceof ArrayBuffer;


if (isBlob && !isArrayBuffer){

	this.statistics.totalPacketSent = data.size + this.statistics.totalPacketSent;

}
else if(isArrayBuffer){

	this.statistics.totalPacketSent = data.byteLength + this.statistics.totalPacketSent;
}
else 
{

//string related data

this.statistics.totalPacketSent = this.byteLengthOf(String(data)) + this.statistics.totalPacketSent;

}	

}




//this updates the total packets received : private function maybe...
__updateTotalPacketReceived(data){

//check if this is a blob 
var isBlob = data instanceof Blob;
var isArrayBuffer = data instanceof ArrayBuffer;


if (isBlob && !isArrayBuffer){

	this.statistics.totalPacketReceived = data.size + this.statistics.totalPacketReceived;

}
else if(isArrayBuffer){

	this.statistics.totalPacketReceived = data.byteLength + this.statistics.totalPacketReceived;
}
else 
{

//string related data

this.statistics.totalPacketReceived = this.byteLengthOf(String(data)) + this.statistics.totalPacketReceived;

}	

}



//use this to send raw data to server

send(data=''){

	this.statistics.totalDataRequests++;

this.cupket_event('cupket_onsend' , data); // send event for onsend


	// log time data was to be sent if enabled

	if(this.TimeLogging){

		console.log('Message packets scheduled to be sent @ ' + new Date());

	}


	try {


			//are we connected...

			if (!this.isConnected()){

				console.log('Cupket is not connected to server!');

				this.statistics.totalFailedRequests++;
				
				return false;

			}

			else
			{
				this.ws.send(data);

				this.__updateTotalPacketSent(data);

				return true;

			}



		}
		catch(err) {

			console.log(err.message);

			if(this.isDebugging()){
//are we connected...

if (!this.isConnected()){

	console.log('Cupket is not connected to server!');


}

}

return false;

}


}



/*
*
************************
*Credits to dandavis https://stackoverflow.com/a/16377813/1350598
*
*Example data given in question text
************

var data = [
['name1', 'city1', 'some other info'],
['name2', 'city2', 'more info']
];

*
*/


//this allows us to generate seperator data formats like CSV, TSV etc
_generateCustomDataFormat(data, separator = ';'){

// Building the content from the Data two-dimensional array
// Each column is separated by a sperator and new line "\n" for next row
var Content = '';
var dataString ='';
data.forEach(function(infoArray, index) {
	dataString = infoArray.join(separator);
	Content += index < data.length ? dataString + '\n' : dataString;
});



this.cupket().binaryType = 'blob'; //set type ...

return Content;

}




// use this to send data as CSV

sendCSV(data){

	return this.send(this._generateCustomDataFormat(data));

}


// use this to send data as TSV( Tab seperated values)

sendTSV(data){

//tab length/size for seperator used is 4... 

return this.send(this._generateCustomDataFormat(data,'	'));

}




// use this to send data as user defined Custom Seperated Data

sendCustomSeperatedData(data, seperator){

	return this.send(this._generateCustomDataFormat(data, seperator));

}


//use this to send data a json

sendJSON(data){

	this.cupket().binaryType = 'blob';

	return this.send(JSON.stringify(data));

}


//use this to convert a data to Array Buffer

getArrayBytes(data){

	var bytes = [];
	for (var i = 0; i < data.length; i++){  
		bytes.push(data.charCodeAt(i));
	}

	return bytes;

}




//use this to send data as an array buffer

sendArrayBuffer(data){

	var array = new Uint8Array(this.getArrayBytes(data));
	this.cupket().binaryType = 'arraybuffer';

	if (this.isDebugging()) {

		console.log('Sending data as Array Buffer, buffer data:  ');

		console.log( array.buffer);

		console.log('Full array object data: ');

		console.log( array);

	}

	return this.send(array.buffer);

}






//use this to convert a data to Byte Array

getByteArray(data){

	var byteArray = [];

	for (var i = 0; i < data.length; ++i) {

		byteArray.push(data.charCodeAt(i) & 0xff);

	}

	return byteArray;

}




//convert ascii to hex values

//From : https://www.w3resource.com/javascript-exercises/javascript-string-exercise-27.php

ascii_to_hexa(str)
{
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) 
	{
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	}
	return arr1.join('');
}



//use this to send data as Byte Buffer

sendByteBuffer(data){

	var buffer = this.ascii_to_hexa(data);

	this.cupket().binaryType = 'bytebuffer';

	if (this.isDebugging()) {

		console.log('Sending data as Byte Buffer, buffer data:  ');

		console.log(buffer);

	}

	return this.send(buffer);


}


//use this to send data as Blob ..

sendBlob(data , type='text/plain'){

	var options ={};
options.type = type; //defines the MIME type

var blob = new Blob(data, options);

this.cupket().binaryType = 'blob';

if (this.isDebugging()) {

	console.log('Sending data as Blob, MIME type: ' + type + ' , Blob data:  ');

	console.log(blob);

}

return this.send(blob);


}


//get byte length for statistics.. by FuweiChin c
//FROM: https://gist.github.com/mathiasbynens/1010324

//count UTF-8 bytes of a string
byteLengthOf(s){
//assuming the String is UCS-2(aka UTF-16) encoded
var n=0;
for(var i=0,l=s.length; i<l; i++){
	var hi=s.charCodeAt(i);
if(hi<0x0080){ //[0x0000, 0x007F]
	n+=1;
}else if(hi<0x0800){ //[0x0080, 0x07FF]
	n+=2;
}else if(hi<0xD800){ //[0x0800, 0xD7FF]
	n+=3;
}else if(hi<0xDC00){ //[0xD800, 0xDBFF]
	var lo=s.charCodeAt(++i);
	if(i<l&&lo>=0xDC00&&lo<=0xDFFF){ //followed by [0xDC00, 0xDFFF]
		n+=4;
	}else{
		throw new Error("UCS-2 String malformed");
	}
}else if(hi<0xE000){ //[0xDC00, 0xDFFF]
	throw new Error("UCS-2 String malformed");
}else{ //[0xE000, 0xFFFF]
	n+=3;
}
}
return n ;
}








}
