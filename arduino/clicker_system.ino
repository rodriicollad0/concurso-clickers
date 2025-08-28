/*
  Sistema de Clicker para Concursos - Arduino
  
  Hardware requerido:
  - Arduino Uno/Nano/ESP32
  - 4 botones (A, B, C, D)
  - 4 resistencias pull-up de 10kΩ (opcional si se usan pull-ups internas)
  - LEDs indicadores (opcional)
  
  Conexiones:
  - Botón A: Pin digital 2
  - Botón B: Pin digital 3  
  - Botón C: Pin digital 4
  - Botón D: Pin digital 5
  - LED indicador: Pin 13 (LED interno)
  
  Comunicación:
  - Velocidad: 9600 baudios
  - Formato: "CLICKER_ID:RESPUESTA\n"
  - Ejemplo: "001:A\n"
  
  @author Rodrigo Collado
  @date Agosto 2025
*/

// Configuración de pines
const int BUTTON_A = 2;
const int BUTTON_B = 3;
const int BUTTON_C = 4;
const int BUTTON_D = 5;
const int LED_PIN = 13;

// ID único del clicker (cambiar para cada dispositivo)
const String CLICKER_ID = "001";

// Variables para debounce
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 200; // 200ms entre pulsaciones

// Estados previos de los botones
bool lastButtonState[4] = {HIGH, HIGH, HIGH, HIGH};
bool buttonState[4] = {HIGH, HIGH, HIGH, HIGH};

void setup() {
  // Inicializar comunicación serie
  Serial.begin(9600);
  
  // Configurar pines de entrada con pull-up interno
  pinMode(BUTTON_A, INPUT_PULLUP);
  pinMode(BUTTON_B, INPUT_PULLUP);
  pinMode(BUTTON_C, INPUT_PULLUP);
  pinMode(BUTTON_D, INPUT_PULLUP);
  
  // Configurar LED indicador
  pinMode(LED_PIN, OUTPUT);
  
  // Secuencia de inicio (LED parpadea 3 veces)
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  // Mensaje de inicio
  Serial.println("CLICKER_READY:" + CLICKER_ID);
  delay(1000);
}

void loop() {
  // Leer estado actual de todos los botones
  buttonState[0] = digitalRead(BUTTON_A);
  buttonState[1] = digitalRead(BUTTON_B);
  buttonState[2] = digitalRead(BUTTON_C);
  buttonState[3] = digitalRead(BUTTON_D);
  
  // Array con las respuestas correspondientes
  char answers[] = {'A', 'B', 'C', 'D'};
  
  // Verificar si algún botón fue presionado
  for (int i = 0; i < 4; i++) {
    // Detectar flanco descendente (botón presionado)
    if (lastButtonState[i] == HIGH && buttonState[i] == LOW) {
      // Aplicar debounce
      if ((millis() - lastDebounceTime) > debounceDelay) {
        // Enviar respuesta por serie
        sendAnswer(answers[i]);
        
        // Actualizar tiempo de debounce
        lastDebounceTime = millis();
        
        // Indicar respuesta enviada con LED
        blinkLED(1);
        
        // Debug: mostrar en monitor serie local
        Serial.print("DEBUG: Botón ");
        Serial.print(answers[i]);
        Serial.println(" presionado");
      }
    }
    
    // Actualizar estado previo
    lastButtonState[i] = buttonState[i];
  }
  
  // Pequeña pausa para estabilidad
  delay(10);
}

/**
 * Envía la respuesta por puerto serie
 * @param answer Respuesta seleccionada (A, B, C, D)
 */
void sendAnswer(char answer) {
  // Formato: "CLICKER_ID:RESPUESTA\n"
  String message = CLICKER_ID + ":" + String(answer) + "\n";
  Serial.print(message);
  Serial.flush(); // Asegurar envío inmediato
}

/**
 * Hace parpadear el LED indicador
 * @param times Número de parpadeos
 */
void blinkLED(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
}

/**
 * Función de prueba de botones (opcional)
 * Llama desde setup() para probar el hardware
 */
void testButtons() {
  Serial.println("=== PRUEBA DE BOTONES ===");
  Serial.println("Presiona cada botón para probar:");
  Serial.println("A, B, C, D");
  
  unsigned long testStart = millis();
  const unsigned long testDuration = 10000; // 10 segundos
  
  while (millis() - testStart < testDuration) {
    // Probar cada botón
    if (digitalRead(BUTTON_A) == LOW) {
      Serial.println("✓ Botón A funcionando");
      blinkLED(1);
      delay(500);
    }
    if (digitalRead(BUTTON_B) == LOW) {
      Serial.println("✓ Botón B funcionando");
      blinkLED(2);
      delay(500);
    }
    if (digitalRead(BUTTON_C) == LOW) {
      Serial.println("✓ Botón C funcionando");
      blinkLED(3);
      delay(500);
    }
    if (digitalRead(BUTTON_D) == LOW) {
      Serial.println("✓ Botón D funcionando");
      blinkLED(4);
      delay(500);
    }
  }
  
  Serial.println("=== PRUEBA COMPLETADA ===");
}

/**
 * Función de diagnóstico (opcional)
 * Envía información del sistema
 */
void sendDiagnostics() {
  Serial.println("DIAGNOSTICS:" + CLICKER_ID);
  Serial.println("VERSION:1.0");
  Serial.println("BUTTONS:4");
  Serial.println("STATUS:OK");
}
