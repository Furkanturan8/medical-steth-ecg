import serial
import wave
import time

# ----------------------------
# Configuration
# ----------------------------
PORT = "COM7"          # Change to your ESP32 COM port
BAUD = 921600

SAMPLE_RATE = 16000
CHANNELS = 1
BITS = 16

TIMEOUT_SECONDS = 68

# ----------------------------

ser = serial.Serial(PORT, BAUD, timeout=0.1)

print("Waiting for recording...")

# Wait for START
while True:
    line = ser.readline().decode(errors="ignore").strip()
    if line == "START":
        print("Recording started.")
        break

audio = bytearray()

start_time = time.time()

while True:

    # Stop if timeout expires
    if (time.time() - start_time) >= TIMEOUT_SECONDS:
        print("Timeout reached.")
        break

    data = ser.read(1024)

    if len(data) == 0:
        continue

    end_index = data.find(b"END")

    if end_index != -1:
        print("Received END.")
        audio.extend(data[:end_index])
        break

    audio.extend(data)

ser.close()

print(f"Received {len(audio)} bytes")

with wave.open("yahia_heart2.wav", "wb") as wf:
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(BITS // 8)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(audio)

print("Saved recording.wav")