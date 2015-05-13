# Coffee Machine Node
*Disclaimer: this is a student project and lacks both security and optimization. Use at your own risk.*

This is part of a software framework that allows developers to make use of GCM and WebSockets to push multicast messages between devices.
The program will create a small NodeJS server on the device, where smartphones can subscribe to events. These events can be everything from
a coffee machine that is about to brew some coffee, to a vending machine or any other shared device. 
## Installation
To install the project run the installation script.
```
sudo sh install.sh
```
This starts up a webserver on the device, but it needs a set of configurations to be fully functional.

To configure this, go to the ip address suggested in the installation.

## Running the server
When the server is installed you can run it using `node machine.js` in the terminal. 
Note that it is not possible to run multiple instances of the same server and this will produce an `EADDRINUSE` error.

## Configuring the server
Configurations can be done while the machine is running and don't require the user to restart the server.
```
<ip>:<port>/config      <-- Configure the server
<ip>:<port>/addSensor   <-- add external sensors
```
## Sensor requirements
The system is optimized for SparkCore sensors, but can be modified to use any HTTP enabled sensors.
To add a sensor it must be accessible to the device over http and have a `GET startRoutine` http method. 
This method should invoke some functionality on the sensor and when done, it should make a  `/postValue?value=<value>` 
to the routing server. Information about the routing server and machine is posted in the body of the GET request.
```
body.params = "id,pin,activation,description,thresshold"
```
An example of a SparkCore program made for a coffee machine can be found in `sensor-examples/coffee.c`
## Clearing subscribers
To clear list of subscribers go to:
```
<ip>:<port>/clearSubscribers
```
Note that this clears **ALL** subscribers from the list and if you want to delete subscribers manually, you have to erase them from the subscribers.json list.
