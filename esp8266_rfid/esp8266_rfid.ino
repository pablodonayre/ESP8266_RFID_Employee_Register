/**
 * Detector RFID
 * 
*/
#include <SPI.h>     //  Libreria SPI
#include <MFRC522.h> // Libreria  MFRC522

#define RST_PIN 9 // Pin de reset
#define SS_PIN 53 // Pin de slave select

MFRC522 mfrc522(SS_PIN, RST_PIN); // Objeto mfrc522 enviando pines de slave select y reset
byte LecturaUID[4];         // Array para almacenar el UID leido

/*
    ESP8266 Module
    Extracted from:
 * https://www.youtube.com/watch?v=hXAWG8xuusM
 * http://myengineeringstuffs.com/sending-data-to-thingspeak-server-using-esp8266-47


   Arduino Uno
 * https://www.arduino.cc/en/Reference/SoftwareSerial 

 * #include <SoftwareSerial.h>
 * SoftwareSerial ser(2, 3); 
 * TX cable from ESP8622 module connected to pin 2 on ArduinoUno
 * RX cable from ESP8622 module connected to pin 3 on ArduinoUno

 * Error with if(ser.find("Error")){
 * In the link below explained how to fix it:
 * if(ser.find((char*)"Error")){
 * https://stackoverflow.com/questions/36421213/deprecated-conversion-from-string-constant-to-char-wwrite-strings-error-in


 * Arduino Mega
 * Use Serial3(HardwareSerial) instead of SoftwareSerial
*/

String apiKey = "XXXXXXXXXXXXXXXX";

String wifi_name = "donayre3";
String wifi_pass = "@Sabueso@Mangosta@25";
String host = "159.65.185.107"; // Domain or IP
String url = "/arduino";

void setup()
{
    /**
     * RFID
    */
    SPI.begin();        // inicializa bus SPI
    mfrc522.PCD_Init(); // inicializa modulo lector

    /**
     * ESP8266
     */
    Serial3.begin(115200);
    Serial.begin(9600);

    unsigned char check_connection = 0;
    unsigned char times_check = 0;

    Serial.println("Connecting to Wifi");
    while (check_connection == 0)
    {
        Serial.print("..");
        Serial3.print("AT+CWJAP=\"" + wifi_name + "\",\"" + wifi_pass + "\"\r\n");

        Serial3.setTimeout(5000);

        if (Serial3.find((char *)"WIFI CONNECTED\r\n") == 1)
        {
            Serial.println("WIFI CONNECTED");
            break;
        }

        times_check++;
        if (times_check > 3)
        {
            times_check = 0;
            Serial.println("Trying to Reconnect..");
        }
    }

    delay(5000);
}

void loop()
{

    if (!mfrc522.PICC_IsNewCardPresent()) // si no hay una tarjeta presente
        return;                           // retorna al loop esperando por una tarjeta

    if (!mfrc522.PICC_ReadCardSerial()) // si no puede obtener datos de la tarjeta
        return;                         // retorna al loop esperando por otra tarjeta

    Serial.print("UID:"); // muestra texto UID:

    String numero_de_tarjeta = "";

    for (byte i = 0; i < 4; i++)
    { // bucle recorre de a un byte por vez el UID
        if (mfrc522.uid.uidByte[i] < 0x10)
        {                       // si el byte leido es menor a 0x10
            Serial.print(" 0"); // imprime espacio en blanco y numero cero
        }
        else
        {                      // sino
            Serial.print(" "); // imprime un espacio en blanco
        }
        Serial.print(mfrc522.uid.uidByte[i], HEX); // imprime el byte del UID leido en hexadecimal
        
        numero_de_tarjeta += String(mfrc522.uid.uidByte[i], HEX);
    }
    
    

    Serial.println("");
    Serial.println("Numero de tarjeta = " + numero_de_tarjeta);

    httpSend(numero_de_tarjeta);
    
    mfrc522.PICC_HaltA();     // detiene comunicacion con tarjeta
}

/* String acquireData()
{

    int humi, temp;

    humi = random(1000);
    temp = random(1000);

    String data = "&field1=";
    data += String(humi);
    data += "&field2=";
    data += String(temp);

    return data;
} */

void httpSend(String numero_identificacion) {

    // TCP connection
    String cmd = "AT+CIPSTART=\"TCP\",\"";
    cmd += host; // domain or ip
    cmd += "\",80";
    Serial3.println(cmd);

    if (Serial3.find((char *)"Error"))
    {
        Serial.println("AT+CIPSTART error");
        return;
    }

    // prepare GET string
    String getStr = "GET " + url + "?api_key=";
    getStr += apiKey;

    //getStr += acquireData();
    getStr += "&numero_identificacion=" + numero_identificacion;


    getStr += "\r\n\r\n";

    // send data length
    cmd = "AT+CIPSEND=";
    cmd += String(getStr.length());
    Serial3.println(cmd);

    if (Serial3.find((char *)">"))
    {
        Serial3.print(getStr);
        Serial.println(getStr);
    }
    else
    {
        Serial3.println("AT+CIPCLOSE");
        Serial.println("CIPCLOSE");
    }

    // server needs x sec delay between updates
    //delay(2000);

}
