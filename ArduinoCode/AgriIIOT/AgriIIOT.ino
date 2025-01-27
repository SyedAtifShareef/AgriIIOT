#include "DHT.h"
#include<ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#define DPIN 4        // Pin to connect DHT sensor (GPIO number) D2
#define DTYPE DHT11   // Define DHT 11 or DHT22 sensor type
#define ldr_pin A0    // define the light sensor pin to A0
#define WIFI_SSID "IntraConnect"
#define WIFI_PASSWORD "?????????"
#define API_KEY "writekey"
#define DATABASE_URL "https://agri-iiot-default-rtdb.asia-southeast1.firebasedatabase.app/" 
// user credintials
#define USER_EMAIL ""
#define USER_PASSWORD ""

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;


unsigned long sendDataPrevMillis=0;
bool signupOK= false;

const int ledPin = D5;
const int ledPin2= D6;
const int ledPin3= D7;
int Moisture__dig_signal = 5; //Define the Digital Input on the Arduino for the sensor signal
int Sensor_State = 1; // soil moisture code
int light_intensity;
int light_brightness;
String soilMoisture= "dry";
String waterPumpStatus="AUTO";

float huLower=0.0;
float huUpper=60.0;
int minBrightnessTrigger=30;


DHT dht(DPIN,DTYPE);
 
void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while(WiFi.status()!= WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("connected with IP: ");
  Serial.print(WiFi.localIP());
  Serial.println();
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  /* Assign the user sign in credentials */
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  signupOK=true;

// anonymous sign up code block 
  // if(Firebase.signUp(&config, &auth,"","")){
  //   Serial.println("Signup OK");
  //   signupOK=true;
  // }
  // else{
  //   Serial.printf("%s\n",config.signer.signupError.message.c_str());
  // }



  config.token_status_callback= tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  pinMode(Moisture__dig_signal, INPUT); //Step pin as input
  pinMode(ledPin, OUTPUT); //led
  pinMode(ledPin2, OUTPUT); //led
  pinMode(ledPin3, OUTPUT); //led
  dht.begin();
}

void loop() {
  float tc = dht.readTemperature();  //Read temperature in C
  // float tf = dht.readTemperature(false);   //Read Temperature in F
  float hu = dht.readHumidity();         //Read Humidity

  if (hu>=huLower && hu<huUpper){
    digitalWrite(ledPin3,HIGH);
  }
  else{
    digitalWrite(ledPin3,LOW);
  }

  if(Firebase.ready()&& signupOK && (millis()- sendDataPrevMillis>5000 || sendDataPrevMillis==0)){
    sendDataPrevMillis = millis();
    // storing sensor data to RTDB
    if(Firebase.RTDB.setFloat(&fbdo,"Sensor/Temperature",tc)){
      Serial.println();
      Serial.print(tc);
      Serial.print("successfully saved to:"+ fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED"+fbdo.errorReason());
    }
    if(Firebase.RTDB.setFloat(&fbdo,"Sensor/Humidity",hu)){
      Serial.println();
      Serial.print(hu);
      Serial.print("successfully saved to:"+ fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED"+fbdo.errorReason());
    }
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/LightBrightness",light_brightness)){
      Serial.println();
      Serial.print(light_brightness);
      Serial.print("successfully saved to:"+ fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED"+fbdo.errorReason());
    }
    if(Firebase.RTDB.setString(&fbdo,"Sensor/SoilMoistureStatus",soilMoisture)){
      Serial.println();
      Serial.print(soilMoisture + "test");
      Serial.print("successfully saved to:"+ fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED"+fbdo.errorReason());
    }
  }

  // code for firebase control of hu upper hu lower and minbrightness trigger
  if(Firebase.RTDB.getFloat(&fbdo,"Actuators/humidifier/huLower")){
    if(fbdo.dataType()== "float"){
      huLower=fbdo.floatData();
      Serial.println("successfull Read from"+ fbdo.dataPath()+":"+ huLower+"("
      +")");

    }else{
      Serial.println("FAILED"+fbdo.errorReason());
    }
  
  }
  if(Firebase.RTDB.getFloat(&fbdo,"Actuators/humidifier/huUpper")){
    if(fbdo.dataType()== "float"){
      huUpper=fbdo.floatData();
      Serial.println("successfull Read from"+ fbdo.dataPath()+":"+ huUpper+"("
      +")");

    }else{
      Serial.println("FAILED2"+fbdo.errorReason());
    }
  
  }
  if(Firebase.RTDB.getInt(&fbdo,"/Actuators/ExternalLight/minBrightnessTrigger")){
    if(fbdo.dataType()== "int"){
      minBrightnessTrigger=fbdo.intData();
      Serial.println("successfull Read from"+ fbdo.dataPath()+":"+ minBrightnessTrigger+"("
      +")");

    }else{
      Serial.println("FAILED3"+fbdo.errorReason());
    }
  
  }
  if(Firebase.RTDB.getString(&fbdo,"/Actuators/WaterPump/waterPumpStatus")){
    if(fbdo.dataType()== "string"){
      waterPumpStatus=fbdo.stringData();
      Serial.println("successfull Read from"+ fbdo.dataPath()+":"+ waterPumpStatus+"("
      +")");

    }else{
      Serial.println("FAILED4"+fbdo.errorReason());
    }
  
  }

  
  
  
  // Serial.print("Soil Moisture Level: ");
  Sensor_State = digitalRead(Moisture__dig_signal);
  if(waterPumpStatus=="AUTO"){
   if (Sensor_State == 0) {
    // Serial.println("Wet");
    soilMoisture="Wet";
    digitalWrite(ledPin2,LOW); 
   }
   else {
    // Serial.println("Dry");
    soilMoisture="Dry";
    digitalWrite(ledPin2,HIGH);
    // digitalWrite(ledPin2,HIGH);
   }
  }
  else if(waterPumpStatus=="ON"){
    digitalWrite(ledPin2,HIGH);
  }
  else if(waterPumpStatus=="OFF"){
    digitalWrite(ledPin2,LOW);
  }
  else{
    Serial.println("invalid input given by user");
  }

  delay(1000);
  light_intensity=analogRead(ldr_pin);

  if (light_intensity>=900){
    light_brightness=0;
  }
  else if (light_intensity>=850 && light_intensity<900){
    light_brightness=10;
  }
  else if (light_intensity>=800 && light_intensity<850){
    light_brightness=20;
  }
  else if (light_intensity>=750 && light_intensity<800){
    light_brightness=30;
  }
  else if (light_intensity>=700 && light_intensity<800){
    light_brightness=40;
  }
  else if (light_intensity>=600 && light_intensity<700){
    light_brightness=50;
  }
  else if (light_intensity>=500 && light_intensity<600){
    light_brightness=60;
  }
  else if (light_intensity>=400 && light_intensity<500){
    light_brightness=65;
  }
  else if (light_intensity>=300 && light_intensity<400){
    light_brightness=70;
  }
  else if (light_intensity>=200 && light_intensity<300){
    light_brightness=75;
  }
  else if (light_intensity>=150 && light_intensity<200){
    light_brightness=80;
  }
  else if (light_intensity>=100 && light_intensity<150){
    light_brightness=85;
  }
  else if (light_intensity>=50 && light_intensity<100){
    light_brightness=90;
  }
  else if (light_intensity>=25 && light_intensity<50){
    light_brightness=95;
  }
  else if (light_intensity>=0 && light_intensity<25){
    light_brightness=100;
  }
  if(light_brightness<minBrightnessTrigger){
    digitalWrite(ledPin,HIGH);
  }
  else{
    digitalWrite(ledPin,LOW);
  }



  // Serial.print("Temp: ");
  // Serial.print(tc);
  // Serial.print(" C, ");
  // // Serial.print(tf);
  // Serial.print("Hum: ");
  // Serial.print(hu);
  // Serial.println("%");
  // Serial.print("Sunlight Intensity :");
  // Serial.print(light_brightness);
  // Serial.println("%");
  // Serial.println("Light sensor Higher is darker");
  // Serial.println(analogRead(ldr_pin));
}
