# SEO y Metadatos - Ecopark Mundo de Colores

## 🔍 Optimizaciones SEO Implementadas

### Meta Tags en HTML (index.html)

```html
<!-- Encoding UTF-8 -->
<meta charset="UTF-8">

<!-- Viewport para Mobile First -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Title (55-60 caracteres) -->
<title>Ecopark Mundo de Colores - Microaventura Emocional</title>

<!-- Meta Description (155-160 caracteres) -->
<meta name="description" content="Vive una microaventura sensorial a solo 3 horas de Bogotá. Descubre cómo los colores transforman tu estado de ánimo.">

<!-- Open Graph para Redes Sociales -->
<meta property="og:image" content="https://via.placeholder.com/1200x630?text=Ecopark+Mundo+de+Colores">
<meta property="og:title" content="Ecopark Mundo de Colores">
<meta property="og:description" content="Microaventura Emocional basada en Neuroarquitectura">
<meta property="og:url" content="https://ecoparkcolores.com">
<meta property="og:type" content="website">
```

---

## 📝 Palabras Clave Objetivo

### Primary Keywords (Alto volumen, Alta competencia)
- Parques temáticos Villavicencio
- Atracciones ecoturismo Meta
- Resbalador extremo Colombia
- Tours Villavicencio

### Secondary Keywords (Medio volumen, Menor competencia)
- Microaventura sensorial
- Carne llanera Villavicencio
- Cumpleaños familias Meta
- Escape Bogotá fin de semana

### Long-tail Keywords (Bajo volumen, Alta intención)
- Parque con restaurante Villavicencio
- Atracciones infantiles Meta con comida
- Dónde comer carne llanera Villavicencio
- Plan familia rápido desde Bogotá

---

## 🗺️ Sitemap XML

Crear archivo `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://ecoparkcolores.com/</loc>
        <lastmod>2026-05-13</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://ecoparkcolores.com/#pasaportes</loc>
        <lastmod>2026-05-13</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://ecoparkcolores.com/#gastronomia</loc>
        <lastmod>2026-05-13</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>
```

---

## 🤖 Robots.txt

Crear archivo `robots.txt`:

```
# Robots.txt para Ecopark Mundo de Colores

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /api/

Crawl-delay: 1

# Sitemap
Sitemap: https://ecoparkcolores.com/sitemap.xml

# Google
User-agent: Googlebot
Allow: /

# Bing
User-agent: Bingbot
Allow: /
```

---

## 📊 Google Analytics 4

Agregar a `index.html` (antes de `</head>`):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXXXXX');
  
  // Track page views
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href
  });
  
  // Track conversions
  gtag('event', 'reserve_passport', {
    event_category: 'engagement',
    event_label: 'reservation_click'
  });
</script>
```

---

## 📍 Schema Markup (JSON-LD)

Agregar a `index.html` (dentro de `<head>`):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "LocalBusiness",
  "name": "Ecopark Mundo de Colores",
  "description": "Microaventura sensorial basada en neuroarquitectura",
  "url": "https://ecoparkcolores.com",
  "telephone": "+573102200917",
  "email": "info@ecoparkcolores.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Villavicencio",
    "addressRegion": "Meta",
    "addressCountry": "CO"
  },
  "areaServed": [
    "Villavicencio",
    "Bogotá",
    "Meta",
    "Cundinamarca"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "87"
  },
  "priceRange": "$$",
  "image": "https://via.placeholder.com/1200x630?text=Ecopark+Mundo+de+Colores",
  "sameAs": [
    "https://instagram.com/ecoparkcolores",
    "https://tiktok.com/@ecoparkcolores",
    "https://facebook.com/ecoparkcolores"
  ]
}
</script>
```

---

## 🔗 Backlink Strategy

### High Authority Links (Gratis)
- Google My Business (verificado)
- TripAdvisor
- Booking.com
- Wikipedia (si es relevante)

### Regional Links (Pago)
- Guías de turismo Meta
- Directorios locales Colombia
- Blogs de viajeros

### Content Links
- Menciones en blogs de ecoturismo
- Partnerships con agencias de viajes
- Influencers de viajes

---

## 📱 Mobile Optimization

### Ya implementado ✅
- Responsive design
- Viewport meta tag
- Touch-friendly buttons (48px mínimo)
- Optimized images
- Fast loading time
- Mobile navigation

### Por verificar
- Velocidad en 3G
- Legibilidad en pantallas pequeñas
- Accesibilidad táctil

---

## 🔐 Security Headers (Para Hosting)

Configurar en `.htaccess` (Apache):

```apache
# HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' www.googletagmanager.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'"
```

---

## 🎯 Content Strategy

### Blog Topics (Futuro)
1. "Neuroarquitectura: Cómo los colores afectan tus emociones"
2. "5 razones para visitar Villavicencio en temporada baja"
3. "Guía de cumpleaños perfectos: Ecopark vs otros parques"
4. "Ruta gastronómica: Carne llanera colombiana"
5. "Escapada de fin de semana desde Bogotá: Itinerario 48h"

### Keyword Density (Ideal 1-2%)
- Ecopark: 1.5%
- Villavicencio: 1.2%
- Microaventura: 0.8%
- Colores: 0.9%

---

## 📧 Email Marketing Setup

### Welcome Sequence
```
1. Bienvenida + Descuento 10%
2. Historia de marca (48h después)
3. Beneficio de un color específico (72h después)
4. Testimonio de cliente (96h después)
5. CTA de reserva (120h después)
```

### Segmentación
- Por pasaporte (Experiencia, Cumpleaños, Escapada)
- Por fuente (Organic, Ads, Social, Direct)
- Por comportamiento (Visitantes, No-convertidos, Clientes)

---

## 🎬 Video SEO

### YouTube Optimization
```yaml
Título: "Ecopark Mundo de Colores - Resbalador Extremo en Villavicencio"
Descripción: "[Párrafo con keywords] Reserva: link"
Tags: ["ecopark", "villavicencio", "resbalador", "parque temático"]
Thumbnail: Colores vibrantes + rostro de emoción
Playlist: "Atracciones Ecopark"
```

---

## 📊 Monitoreo y Análisis

### KPIs a Trackear
- Bounce rate (Meta: < 40%)
- Avg. session duration (Meta: > 2:30)
- Conversion rate (Meta: > 3%)
- Pages per session (Meta: > 2.5)
- Click-through rate WhatsApp (Meta: > 5%)

### Tools
- Google Analytics 4
- Google Search Console
- Hotjar (Heatmaps)
- Ahrefs o SEMrush

---

## 🌍 Localization (Futuro)

### Idiomas a Agregar
- Inglés (Turistas)
- Portugués (Brasileños)
- Francés (Europeos)

### Estructura hreflang
```html
<link rel="alternate" hreflang="es" href="https://ecoparkcolores.com/" />
<link rel="alternate" hreflang="en" href="https://ecoparkcolores.com/en/" />
<link rel="alternate" hreflang="pt" href="https://ecoparkcolores.com/pt/" />
<link rel="alternate" hreflang="x-default" href="https://ecoparkcolores.com/" />
```

---

## ✅ SEO Checklist Pre-Launch

- [ ] Title y Meta Description en todas las páginas
- [ ] H1, H2, H3 estructura correcta
- [ ] Alt text en todas las imágenes
- [ ] Internal links (breadcrumbs)
- [ ] Sitemap.xml creado y enviado a GSC
- [ ] Robots.txt configurado
- [ ] Google Analytics 4 instalado
- [ ] Google Search Console verificado
- [ ] Favicon agregado
- [ ] 404 personalizado creado
- [ ] Velocidad de carga < 3s
- [ ] Mobile friendly test pasado
- [ ] HTTPS certificado
- [ ] Backlinks de calidad comenzados

---

## 🚀 SEO Timeline (Roadmap)

### Semana 1
- [ ] Indexación en Google
- [ ] Optimizaciones on-page
- [ ] Google My Business completado

### Semana 2-4
- [ ] Primeros rankings (keywords long-tail)
- [ ] Contenido de blog comenzado
- [ ] Link building iniciado

### Mes 2-3
- [ ] Rankings keywords primary
- [ ] Email marketing active
- [ ] Social signals aumentando

### Mes 4-6
- [ ] Conversiones incrementadas
- [ ] Autoridad de dominio mejorada
- [ ] Contenido evergreen posicionado

---

**Para más detalles de SEO técnico, consulta la documentación de Google Search Central:**
https://developers.google.com/search

---

*Última actualización: Mayo 2026*
