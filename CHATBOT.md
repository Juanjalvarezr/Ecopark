# 🤖 INTEGRACIÓN DE CHATBOT DE IA - Ecopark Mundo de Colores

## 📌 Visión General

El footer ya tiene espacio preparado para integrar un **Chatbot de IA 24/7**. Esta guía te muestra las mejores opciones y cómo implementarlas.

---

## 🎯 Chatbots Recomendados

### 1️⃣ CHATBASE (Recomendado)
**Mejor para:** Entrenar con tus documentos, respuestas personalizadas

- **Precio:** Gratis (limitado) - $99/mes (Pro)
- **Características:**
  - Entrenable con PDFs, URLs, documentos
  - Embebible en cualquier sitio
  - Soporte para 100+ idiomas
  - Analytics incluido
  - Integraciones: Slack, Discord, WhatsApp

**Implementación:**

```html
<!-- Agregar antes de </body> en index.html -->
<script>
  window.addEventListener('load', () => {
    window.dataLayer = window.dataLayer || [];
    
    // Cargar Chatbase
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = 'your-chatbase-id';
    script.domain = 'www.chatbase.co';
    script.defer = true;
    document.body.appendChild(script);
  });
</script>
```

**Setup:**
1. Ir a chatbase.co
2. Sign up gratis
3. Crear nuevo chatbot
4. Entrenar con información Ecopark (PDFs, FAQs, etc.)
5. Copiar embed code
6. Pegar en `index.html`

---

### 2️⃣ TIDIO (Muy Popular)
**Mejor para:** Soporte en vivo + IA automática

- **Precio:** Gratis - $25/mes
- **Características:**
  - Chat en vivo + Bot IA
  - Integración WhatsApp
  - Tickets de soporte
  - Visitantes anónimos
  - Chatbots preentrenados

**Implementación:**

```html
<!-- Agregar antes de </body> en index.html -->
<script src="//code.tidio.co/XXXXX.js" async></script>
```

**Setup:**
1. Ir a tidio.co
2. Crear cuenta
3. Conectar sitio web
4. Copiar script
5. Pegar en `index.html`
6. Personalizar: Colores, mensajes, horarios

---

### 3️⃣ DRIFT (Premium)
**Mejor para:** Conversiones B2C, leads calificados

- **Precio:** $500+/mes
- **Características:**
  - Conversational marketing
  - Lead scoring
  - Integración Salesforce
  - Video calls
  - Muy avanzado

---

### 4️⃣ INTERCOM (Enterprise)
**Mejor para:** Empresas con presupuesto

- **Precio:** $99+/mes
- **Características:**
  - Soporte completo
  - Segmentación usuarios
  - Automation workflows
  - Análisis detallado

---

### 5️⃣ RASA (Self-Hosted - Técnico)
**Mejor para:** Control total, no guardar datos en terceros

- **Precio:** Gratis (open source)
- **Complejidad:** Alta (requiere developer)

---

## 🏆 Recomendación: CHATBASE

### Por qué CHATBASE:
1. ✅ Gratis para empezar
2. ✅ Muy fácil de entrenar
3. ✅ Excelente precisión
4. ✅ Soporte en español
5. ✅ Integración WhatsApp
6. ✅ Analytics
7. ✅ Respeta privacidad

---

## 🚀 SETUP PASO A PASO - CHATBASE

### Paso 1: Crear Cuenta

1. Ir a https://www.chatbase.co
2. Click "Sign up free"
3. Email + Contraseña
4. Verificar email

### Paso 2: Crear Chatbot

1. Dashboard > "New chatbot"
2. Nombre: "Ecopark Mundo de Colores"
3. Descripción: "Asistente para reservas y consultas"
4. Idioma: Español
5. Click "Create"

### Paso 3: Entrenar el Chatbot

#### Opción A: Con Documentos
1. Upload > "Upload file"
2. Subir PDF con:
   - Información general Ecopark
   - Precios pasaportes
   - Horarios
   - Ubicación
   - FAQs

#### Opción B: Con URLs
1. "Add URLs"
2. Agregar:
   - Tu sitio web (https://ecoparkcolores.com)
   - Google My Business

#### Opción C: Entrenar Manualmente
```
Pregunta: ¿Cuál es el precio del pasaporte experiencia?
Respuesta: El Pasaporte Experiencia cuesta $89.900 por persona e incluye entrada, almuerzo, resbalador y piscina.

Pregunta: ¿Cuál es el horario de atención?
Respuesta: Estamos abiertos de 9:00 AM a 6:00 PM, todos los días.

Pregunta: ¿Cómo puedo hacer una reserva?
Respuesta: Puedes reservar por:
- WhatsApp: +57 310 2200917
- Email: info@ecoparkcolores.com
- Formulario en el sitio (próximamente)
```

### Paso 4: Personalizar Chatbot

**Appearance:**
- Color primario: #2E7D32 (Verde Ecopark)
- Mensaje de bienvenida: "¡Hola! Soy tu asistente Ecopark. ¿En qué puedo ayudarte?"
- Ícono: Logo Ecopark (emoji 🌿)

**Behavior:**
- Response time: Rápido
- Tone: Friendly y profesional
- Language: Español
- Show powered by: Sí (opción gratis)

### Paso 5: Obtener Embed Code

1. Settings > "Embed chatbot"
2. Copiar código:

```html
<script>
  window.chatbaseConfig = {
    chatbotId: "XXXXXX_ID_XXXXX",
  };
</script>
<script
  src="https://www.chatbase.co/embed.min.js"
  chatbotId="XXXXXX_ID_XXXXX"
  domain="www.chatbase.co"
></script>
```

### Paso 6: Integrar en Footer

En `index.html`, reemplazar línea ~540:

```html
<!-- Chatbot placeholder en footer -->
<div id="chatbase-container">
  <!-- Script aquí -->
  <script>
    window.chatbaseConfig = {
      chatbotId: "TU_ID_AQUI",
    };
  </script>
  <script
    src="https://www.chatbase.co/embed.min.js"
    chatbotId="TU_ID_AQUI"
    domain="www.chatbase.co"
  ></script>
</div>
```

### Paso 7: Probar

1. Recargar página
2. Buscar ícono en esquina inferior derecha
3. Escribir pregunta de prueba
4. Verificar respuesta

---

## 📱 INTEGRACIÓN CON WHATSAPP

### Conectar Chatbase a WhatsApp

1. Chatbase dashboard > Integrations
2. Click "WhatsApp"
3. Conectar con número de tu empresa
4. Usar número: +57 310 2200917

**Ventaja:** Un mismo chatbot en web + WhatsApp

---

## 📊 TRAINING DATA PARA ECOPARK

### Información Base para Entrenar

```
INFORMACIÓN GENERAL
- Nombre: Ecopark Mundo de Colores SAS
- Ubicación: Villavicencio, Meta
- Teléfono: +57 310 2200917
- Email: info@ecoparkcolores.com
- Concepto: Microaventura emocional basada en neuroarquitectura

HORARIOS
- De lunes a domingo: 9:00 AM a 6:00 PM
- Cerrado feriados nacionales
- Atención grupos: Agendar con antelación

PASAPORTES
1. Experiencia de Color: $89.900
   - Entrada + almuerzo
   - Resbalador extremo
   - Piscina y zonas de juego
   - Tours guiados
   
2. Plan Cumpleaños: $54.900/niño (mín 10)
   - Entrada + almuerzo
   - Pastel y decoración
   - Animador temático
   
3. Escapada Bogotana: $99.900
   - Entrada VIP
   - Todas las atracciones
   - Guía personal

UBICACIÓN Y TRANSPORTE
- Distancia desde Bogotá: 3 horas
- Vía: Ruta al Meta
- Parqueadero: Gratis y seguro
- Acceso: Carretera principal

ATRACCIONES
- El Resbalador Extremo (rojo - adrenalina)
- Piscina refrescante (azul - relajación)
- Caminatas naturales (verde - bienestar)
- Zona infantil (amarillo - diversión)
- Restaurante carne llanera (naranja - abundancia)

POLÍTICAS
- Cancelación: Hasta 48 horas antes
- Reembolso: Completo
- Menores de edad: Acompañante obligatorio
- Mascotas: No permitidas
- Alergias alimentarias: Avisar al reservar

PREGUNTAS FRECUENTES
P: ¿Es seguro?
R: Sí, contamos con personal certificado y equipo de seguridad certificado internacionalmente.

P: ¿Puedo llevar comida externa?
R: No, pero ofrecemos opciones vegetarianas y para alergias.

P: ¿Hay estacionamiento?
R: Sí, parking gratis y vigilado.

P: ¿Qué documentos necesito?
R: Solo cédula o pasaporte. Menores necesitan compañía de adulto.
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Flujos Automáticos (Workflows)

```
TRIGGER: Usuario pregunta sobre reservas
→ Bot responde con opciones
→ Si selecciona "Reservar", enviar link WhatsApp
→ Si selecciona "Más info", mostrar videos

TRIGGER: Fuera de horario
→ Bot responde: "Abierto 9am-6pm"
→ Registrar nombre + número
→ Enviar email confirmación
```

### Inteligencia Artificial

- **Fine-tuning:** Entrenar con respuestas históricas
- **Contexto:** Recordar conversación anterior
- **Fallback:** "No entendí, ¿puedes reformular?"
- **Escalation:** Si no entiende, ofrecer WhatsApp directo

---

## 📞 ALTERNATIVA: CHATBOT SIMPLE CON JAVASCRIPT

Si prefieres algo más simple sin dependencias externas:

```html
<!-- En index.html, agregar widget simple -->
<div id="custom-chatbot" class="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-2xl">
  <div class="bg-green-600 text-white p-4 font-bold">
    🤖 Asistente Ecopark
  </div>
  <div id="chatbot-messages" class="h-64 overflow-y-auto p-4"></div>
  <div class="border-t p-4 flex gap-2">
    <input type="text" id="chatbot-input" placeholder="Pregunta aquí..." class="flex-1 px-3 py-2 border rounded">
    <button onclick="sendChatMessage()" class="bg-green-600 text-white px-4 py-2 rounded">Enviar</button>
  </div>
</div>

<script>
const faqs = {
  'precio': 'Pasaporte Experiencia: $89.900',
  'horario': '9:00 AM a 6:00 PM todos los días',
  'reserva': 'Envía mensaje a WhatsApp +57 310 2200917',
  'ubicacion': 'Villavicencio, Meta. A 3 horas de Bogotá'
};

function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.toLowerCase();
  const messagesDiv = document.getElementById('chatbot-messages');
  
  // Mostrar mensaje usuario
  messagesDiv.innerHTML += `<div class="mb-2 text-right"><span class="bg-green-100 px-3 py-2 rounded">${input.value}</span></div>`;
  
  // Buscar respuesta
  let response = 'No entiendo, ¿puedo ayudarte de otra forma?';
  for (let key in faqs) {
    if (message.includes(key)) {
      response = faqs[key];
      break;
    }
  }
  
  // Mostrar respuesta bot
  messagesDiv.innerHTML += `<div class="mb-2"><span class="bg-gray-200 px-3 py-2 rounded">${response}</span></div>`;
  
  input.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
</script>
```

---

## 🎯 PRÓXIMOS PASOS

### Mes 1
- [ ] Entrenar chatbot con información básica
- [ ] Publicar en sitio web
- [ ] Recolectar preguntas frecuentes

### Mes 2-3
- [ ] Integrar con WhatsApp
- [ ] Mejorar respuestas basado en usuarios
- [ ] Agregar preguntas sobre promociones

### Mes 4+
- [ ] Integrar con sistema de reservas
- [ ] Procesar pagos directamente
- [ ] Análisis de conversación

---

## 📊 MÉTRICAS A TRACKEAR

| Métrica | Meta |
|---------|------|
| Engagement rate | > 40% |
| Resolution rate | > 60% |
| Avg. response time | < 2 seg |
| User satisfaction | > 4/5 estrellas |
| Conversión a reserva | > 5% |

---

## 🔒 PRIVACIDAD Y SEGURIDAD

- ✅ Cumplir GDPR/LOPD
- ✅ No guardar datos sensibles
- ✅ Encripción en tránsito
- ✅ Términos de servicio claros
- ✅ Opción para borrar conversaciones

---

## 💡 IDEAS BONUS

### Funcionalidades Futuras
- [ ] Chatbot que confirme disponibilidad en tiempo real
- [ ] Enviar documentos (mapas, menú)
- [ ] Video integrado (tour virtual)
- [ ] Encuesta de satisfacción automática
- [ ] Integración con Google Calendar (agendar)
- [ ] Integración Stripe (pagar directamente)

---

## 🎓 RECURSOS

- Chatbase Docs: docs.chatbase.co
- Tutorial YT: "Chatbase Español Tutorial"
- Community: Discord de Chatbase

---

**¡Tu asistente 24/7 está listo para servir! 🚀**

*Última actualización: Mayo 2026*
