// This #include statement was automatically added by the Spark IDE.
#include "HttpClient/HttpClient.h"

HttpClient http;
http_request_t request;
http_response_t response;
bool isLow = true;
String machineid = "Device";
String pin = "Pin";
String description = "Description";
bool isActivated = false;
bool first = true;
bool activation = false;
int thresshold = 0;

// Headers currently need to be set at init, useful for API keys etc.
http_header_t headers[] = {
    //  { "Content-Type", "application/json" },
    //  { "Accept" , "application/json" },
    { "Accept" , "*/*"},
    { NULL, NULL } // NOTE: Always terminate headers will NULL
};

  // Create a variable that will store the temperature value
double temperature = 0.0;


void setup()
{
  // Register a Spark variable here
  Spark.variable("value", &temperature, DOUBLE);
  Spark.function("machine",setMachineID);
  Spark.function("startroutine",startNewRoutine);
  // Connect the temperature sensor to A7 and configure it
  // to be an input
  pinMode(A7, INPUT);
  
  request.hostname = "nikander-arts.com";
  request.port = 8080;
}

void loop()
{
  int reading = 0;

  // Keep reading the sensor value so when we make an API
  // call to read its value, we have the latest one
  reading = analogRead(A7);


    // The library also supports sending a body with your request:
    //request.body = "{\"key\":\"value\"}";

    // Get request
  // The returned value from the Core is going to be in the range from 0 to 4095
  // Calculate the voltage from the sensor reading

  // Calculate the temperature and update our static variable
  
  if((reading < thresshold) != activation && isActivated && first){
        first = false;
        delay(5000);
  }
  
  
  if((reading < thresshold) == activation && isActivated && !first){
        request.path = "/postValue?value=true";
        request.path +="&machine=" + machineid;
        request.path +="&description=" + description;
        isActivated = false;
        http.post(request, response, headers);
  }
  temperature = reading;
}


int setMachineID(String args){
    machineid = args;
    return 1;
}

int startNewRoutine(String args){
    isActivated = true;
    first = true;
    int machineIdLocation = args.indexOf(",");
    machineid = args.substring(0,machineIdLocation).c_str();
    
    int pinLocation = args.indexOf(",",machineIdLocation+1);
    pin  = args.substring(machineIdLocation+1,pinLocation).c_str();
    
    int activationLocation = args.indexOf(",",pinLocation+1);
    activation = args.substring(pinLocation+1,activationLocation) == "l";
    
    int descriptionLocation = args.indexOf(",",activationLocation+1);
    description = args.substring(activationLocation+1,descriptionLocation).c_str();
    
    thresshold = args.substring(descriptionLocation+1).toInt();
    
    return 1;
}
