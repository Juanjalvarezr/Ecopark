# 🎯 Guía del Panel de Administración - Ecopark

## 📋 Resumen de Funcionalidades

El panel de administración ahora incluye:

### ✅ Funcionalidades Completadas
1. **Dashboard** - Vista general con estadísticas
2. **Gestión de Citas** - Agendar, editar, eliminar citas
3. **Calendario** - Vista mensual de citas
4. **Gestión de Medios** 📷🎬 - Subir y gestionar fotos y videos
5. **Reseñas de Google Maps** ⭐ - Sincronizar reseñas automáticamente
6. **Banners Editables** 🎨 - Crear banners personalizados
7. **Configuración** - Google Calendar y Google Maps

---

## 📷 Gestión de Medios (Fotos y Videos)

### Cómo usar:
1. Ve a la sección **Medios** en el sidebar
2. Haz clic en **Subir Medio**
3. Selecciona el tipo (Foto o Video)
4. Pega la URL del medio (puede ser de YouTube, Vimeo, o URL directa)
5. Agrega título, categoría y descripción
6. Marca como **destacado** si quieres que aparezca en la landing page

### Características:
- **Tabs** para cambiar entre Fotos y Videos
- **Hover effects** con acciones rápidas (editar, eliminar)
- **Categorías**: General, Resbalador, Piscina, Granja, Restaurante, Eventos
- **Videos de YouTube/Vimeo** se incrustan automáticamente
- **Medios destacados** con estrella ⭐

### URLs soportadas:
- **YouTube**: `https://www.youtube.com/watch?v=...` o `https://youtu.be/...`
- **Vimeo**: `https://vimeo.com/...`
- **Imágenes directas**: `https://ejemplo.com/imagen.jpg`
- **Videos directos**: `https://ejemplo.com/video.mp4`

---

## ⭐ Reseñas de Google Maps

### Configuración inicial:

#### 1. Obtener tu Place ID de Google Maps
1. Ve a [Google Maps Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Busca tu negocio "Ecopark Mundo de Colores"
3. Copia el Place ID (ejemplo: `ChIJ...`)

#### 2. Crear API Key de Google Maps
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Places API**
4. Crea credenciales → API Key
5. Copia tu API Key

#### 3. Configurar en el Admin
1. Ve a la sección **Reseñas** en el sidebar
2. En el cuadro azul de configuración:
   - Pega tu **Place ID**
   - Pega tu **API Key**
3. Haz clic en **Guardar Configuración Maps**
4. Haz clic en **Sincronizar Reseñas**

### Características:
- **Rating promedio** automático
- **Total de reseñas** 
- **Fecha de última reseña**
- **Cards de reseñas** con avatar, nombre, rating y texto
- **Sincronización manual** con un clic

---

## 🎨 Banners Editables

### Cómo usar:
1. Ve a la sección **Banners** en el sidebar
2. Haz clic en **Nuevo Banner**
3. Completa la información:
   - **Título**: Nombre del banner
   - **URL de la imagen**: Enlace de la imagen
   - **Texto del botón**: Texto del CTA (ej: "Reservar Ahora")
   - **URL del botón**: Enlace del botón (ej: "#contacto")
   - **Posición**: Hero, Servicios, Testimonios, Footer
   - **Activo**: Marca para mostrar el banner

### Características:
- **Preview visual** del banner
- **Posicionamiento** en diferentes secciones
- **Activar/Desactivar** banners sin eliminarlos
- **Editar y eliminar** banners existentes

---

## 📅 Google Calendar Integration

### Configuración:

#### 1. Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita **Google Calendar API**

#### 2. Crear credenciales
1. Ve a **APIs & Services** → **Credentials**
2. Crea **API Key**
3. Crea **OAuth 2.0 Client ID**
4. Configura los **origins autorizados** (tu dominio)
5. Copia el **Client ID**

#### 3. Configurar en el Admin
1. Ve a la sección **Configuración** en el sidebar
2. Ingresa:
   - **API Key de Google**
   - **Client ID**
   - **Calendar ID** (usa "primary" para tu calendario principal)
3. Haz clic en **Guardar Configuración**
4. Haz clic en **Probar Conexión**

### Características:
- **Sincronización automática** de citas
- **Checkbox** en cada cita para habilitar/deshabilitar sync
- **Botón de sincronización** manual en el header

---

## 🎨 Mejoras de Diseño y UX

### Nuevas características visuales:
- **Gradiente de fondo** en el body (gris a verde claro)
- **Sidebar con gradiente** verde más elegante
- **Tabs interactivos** con estados hover y active
- **Media items** con hover effects y overlay
- **Review cards** con avatares y estrellas
- **Banner cards** con preview y acciones
- **Toast notifications** animadas
- **Modal animations** slide-in

### Responsive:
- **Mobile-first** design
- **Adaptación** a tablets y desktop
- **Grid layouts** flexibles
- **Botones touch-friendly**

---

## 💾 Almacenamiento de Datos

Todos los datos se guardan en **localStorage** del navegador:
- `ecopark_citas` - Citas agendadas
- `ecopark_medios` - Fotos y videos
- `ecopark_banners` - Banners configurados
- `ecopark_reviews` - Reseñas sincronizadas
- `ecopark_google_config` - Configuración Google Calendar
- `ecopark_maps_config` - Configuración Google Maps

### Nota importante:
Los datos se guardan **localmente** en el navegador. Para producción, considera implementar un backend con base de datos real.

---

## 🚀 Próximos Pasos

### Para conectar con la landing page:
1. Agregar un enlace al admin en el footer de `index.html`
2. Implementar sistema de autenticación
3. Conectar los banners a la landing page
4. Mostrar las reseñas sincronizadas en la landing page
5. Usar los medios en las secciones correspondientes

### Para producción:
1. Migrar localStorage a base de datos real (Firebase, Supabase, etc.)
2. Implementar autenticación segura
3. Configurar CORS para las APIs de Google
4. Agregar sistema de backup de datos
5. Implementar logging de errores

---

## 📞 Soporte

Si necesitas ayuda con:
- **Configuración de Google APIs**: Consulta la documentación oficial de Google
- **Place ID**: Usa el [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
- **API Keys**: Ve a [Google Cloud Console](https://console.cloud.google.com)

---

## ✨ Tips

1. **Prueba las URLs de medios** antes de guardarlas
2. **Usa imágenes optimizadas** para mejor rendimiento
3. **Sincroniza reseñas** periódicamente para mantener actualizado
4. **Desactiva banners** en lugar de eliminarlos si planeas reusarlos
5. **Usa categorías** para organizar mejor tus medios

---

**¡Tu panel de administración está listo para usar! 🎉**
