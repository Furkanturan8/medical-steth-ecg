/*
  ESP32 + MAX9814 Audio Recorder
  Sends raw 16-bit PCM samples over Serial

  MAX9814 OUT -> GPIO36
  MAX9814 VCC -> 3.3V
  MAX9814 GND -> GND
*/

const int MIC_PIN = 34;

// ===== Recording Settings =====
const uint32_t SAMPLE_RATE = 16000;   // Hz (modifiable)
const uint16_t RECORD_SECONDS = 60;    // seconds (modifiable)



// ==============================

void setup()
{
    Serial.begin(921600);

    analogReadResolution(12);          // 0-4095
    analogSetAttenuation(ADC_11db);    // ~0-3.3V input range

    delay(8000);

    Serial.println("START");
}

void loop()
{
    uint32_t samplePeriod = 1000000UL / SAMPLE_RATE;
    uint32_t nextSample = micros();

    uint32_t startTime = millis();

    while ((millis() - startTime) < (RECORD_SECONDS * 1000UL))
    {
        while ((int32_t)(micros() - nextSample) < 0);

        nextSample += samplePeriod;

        uint16_t adc = analogRead(MIC_PIN);

        // Convert unsigned ADC to signed 16-bit PCM
        int16_t pcm = ((int32_t)adc - 2048) << 4;

        Serial.write((uint8_t*)&pcm, sizeof(pcm));
    }

    // Ensure all bytes have been transmitted
    Serial.flush();

    Serial.println("END");

    while (true);
}