/* ========================================
   ECOPARK - ADVANCED INTERACTIVITY
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 1. MUSIC CONTROLLER
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    const modalSound = document.getElementById('modalSound');
    let isPlaying = false;

    const playModalSound = () => {
        if (modalSound) {
            modalSound.volume = 0.4;
            modalSound.currentTime = 0;
            modalSound.play().catch(err => console.log("SFX play blocked", err));
        }
    };

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
            } else {
                bgMusic.play().catch(err => console.log("Audio play blocked", err));
                musicToggle.classList.add('playing');
            }
            isPlaying = !isPlaying;
        });
    }

    // 2. 3D TILT & GLINT EFFECT
    const cards = document.querySelectorAll('.service-card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Glint movement tracking
            const glintX = (x / rect.width) * 100;
            const glintY = (y / rect.height) * 100;
            card.style.setProperty('--glint-pos', `${glintX}% ${glintY}%`);
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // 3. MODAL & SWIPER LOGIC
    const modal = document.getElementById('serviceModal');
    const modalClose = document.querySelector('.modal-close');
    const swiperWrapper = document.getElementById('modalCarouselItems');
    const commentInput = document.getElementById('commentInput');
    const submitComment = document.getElementById('submitComment');
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    let serviceSwiper = null;
    let currentServiceTitle = "";

    // -- Persistence Logic --
    const getStorageData = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveStorageData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    const loadComments = (serviceTitle) => {
        const allComments = getStorageData('ecopark_comments');
        const filtered = allComments.filter(c => c.service === serviceTitle).reverse();
        
        commentCount.textContent = filtered.length;
        commentsList.innerHTML = filtered.length > 0 
            ? filtered.map(c => `
                <div class="flex gap-3 animate-fade-in">
                    <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                        ${c.user[0]}
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-center">
                            <p class="text-xs font-bold">${c.user}</p>
                            <p class="text-[10px] text-gray-400">${c.date}</p>
                        </div>
                        <p class="text-xs text-gray-600">${c.text}</p>
                    </div>
                </div>
            `).join('')
            : '<p class="text-xs text-gray-400 text-center py-4">Sé el primero en comentar...</p>';
    };

    const addComment = () => {
        const text = commentInput.value.trim();
        if (!text) return;

        const newComment = {
            service: currentServiceTitle,
            user: "Visitante",
            text: text,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };

        const allComments = getStorageData('ecopark_comments');
        allComments.push(newComment);
        saveStorageData('ecopark_comments', allComments);

        commentInput.value = "";
        loadComments(currentServiceTitle);
        logActivity(`¡Alguien comentó en ${currentServiceTitle}!`);
    };

    const logActivity = (msg) => {
        const logs = getStorageData('ecopark_activity_logs');
        logs.push({ msg, timestamp: Date.now() });
        if (logs.length > 10) logs.shift();
        saveStorageData('ecopark_activity_logs', logs);
    };

    const openModal = (data) => {
        if (!modal) return;
        currentServiceTitle = data.title;

        playModalSound();
        
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDescription').textContent = data.description;
        document.getElementById('modalIntensity').textContent = data.intensity;
        
        const iconContainer = document.getElementById('modalIcon');
        iconContainer.style.backgroundColor = data.color;
        iconContainer.innerHTML = `<i data-lucide="${data.icon}"></i>`;
        
        // Populate Swiper (Combine hardcoded and dynamic images from Admin/LocalStorage)
        const uploadedMedia = getStorageData('ecopark_medios');
        const categoryMap = {
            "Resbalador de Colores": "Resbalador",
            "Columpio 360": "Eventos",
            "Piscina Refrescante": "Piscina",
            "Granja Interactiva": "Granja",
            "Restaurante Mundo de Colores": "Restaurante"
        };
        
        const category = categoryMap[data.title];
        const dynamicPhotos = uploadedMedia
            .filter(m => m.type === 'Foto' && m.category === category)
            .map(m => m.url);

        let images = data.images.split(',').map(img => img.trim());
        if (dynamicPhotos.length > 0) {
            images = [...dynamicPhotos, ...images];
        }

        swiperWrapper.innerHTML = images.map(img => `
            <div class="swiper-slide h-full">
                <img src="${img}" class="w-full h-full object-cover rounded-2xl" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800'">
            </div>
        `).join('');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Mostrar precios específicos en el modal si existen
        const modalPriceEl = document.getElementById('modalServicePrice');
        if (modalPriceEl) {
            let priceText = "";
            if (data.serviceKey === "resbalador_colores") {
                priceText = `Adultos: ${cms[`service_${data.serviceKey}_precio_adulto`] || 'N/A'} / Niños: ${cms[`service_${data.serviceKey}_precio_nino`] || 'N/A'}`;
            } else if (data.serviceKey === "granja_interactiva") {
                priceText = `Alimentar: ${cms[`service_${data.serviceKey}_precio_alimentar`] || 'N/A'}`;
            } else if (cms[`service_${data.serviceKey}_precio`]) {
                priceText = `Precio: ${cms[`service_${data.serviceKey}_precio`]}`;
            }
            modalPriceEl.textContent = priceText;
        }
        
        loadComments(data.title);

        if (typeof Swiper !== 'undefined') {
            if (serviceSwiper) serviceSwiper.destroy();
            serviceSwiper = new Swiper('.serviceSwiper', {
                loop: true,
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                autoplay: { delay: 3000 }
            });
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const reserveBtn = document.getElementById('modalReserveBtn');
        const waMsg = encodeURIComponent(`¡Hola! Me interesa el servicio de ${data.title}. Quisiera más información.`);
        reserveBtn.href = `https://wa.me/573102200917?text=${waMsg}`;
        
        // Log booking attempt
        reserveBtn.onclick = () => logActivity(`¡Alguien está reservando ${data.title}!`);
    };

    if (submitComment) {
        submitComment.addEventListener('click', addComment);
        commentInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addComment(); });
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const data = {
                title: card.dataset.title,
                description: card.dataset.description,
                intensity: card.dataset.intensity,
                color: card.dataset.color,
                icon: card.dataset.icon,
                images: card.dataset.images,
                serviceKey: card.dataset.serviceKey // Pasar la clave del servicio
            };
            openModal(data);
        });
    });

    window.closeModal = () => {
        if (modal) modal.classList.remove('active');
        if (menuModal) menuModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (serviceSwiper) serviceSwiper.autoplay.stop();
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // 4. MENU MODAL LOGIC
    const menuModal = document.getElementById('menuModal');
    const openMenuBtn = document.getElementById('openMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    if (openMenuBtn && menuModal) {
        openMenuBtn.addEventListener('click', () => {
            playModalSound();
            menuModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeMenuBtn && menuModal) {
        closeMenuBtn.addEventListener('click', () => {
            closeModal();
        });
    }

    // Close menu modal on overlay click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            if (menuModal && menuModal.classList.contains('active')) {
                menuModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });

    // 5. NAVBAR & PARALLAX SCROLL EFFECT
    const navbar = document.querySelector('.navbar');
    const heroContent = document.querySelector('.hero-content');
    const clouds = document.querySelectorAll('.cloud');
    const whatsappBubble = document.getElementById('whatsappBubble');
    const whatsappWindow = document.getElementById('whatsappWindow');
    const activityBubble = document.getElementById('liveActivity');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / totalHeight) * 100;

        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
            scrollProgress.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--current-section-color');
        }

        // Navbar
        if (scrolled > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hero Parallax
        if (scrolled < window.innerHeight) {
            const scale = 1 - (scrolled / window.innerHeight) * 0.3;
            const opacity = 1 - (scrolled / window.innerHeight) * 1.5;
            const y = scrolled * 0.5;
            
            heroContent.style.setProperty('--hero-scale', scale);
            heroContent.style.setProperty('--hero-opacity', opacity);
            heroContent.style.setProperty('--hero-y', `${y}px`);

            // Clouds movement
            clouds.forEach((cloud, index) => {
                const speed = (index + 1) * 0.2; // Velocidad un poco más sutil
                const cloudY = -(scrolled * speed);
                // Actualizamos la variable para que el CSS maneje el movimiento vertical
                cloud.style.setProperty('--cloud-y', `${cloudY}px`);
            });
        }
    });

    // 5. REVEAL ANIMATIONS
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Mejora: Cambio de color dinámico basado en la sección
                const sectionColor = entry.target.dataset.sectionColor;
                if (sectionColor) {
                    document.documentElement.style.setProperty('--current-section-color', sectionColor);
                    // Creamos una versión con transparencia para el brillo (glow)
                    const glowColor = sectionColor + '4D'; // 4D es 30% de opacidad en HEX
                    document.documentElement.style.setProperty('--glow-color', glowColor);
                    
                    // Si el fondo es oscuro, ajustar contraste de navbar
                    if (navbar.classList.contains('scrolled')) {
                        const isDark = ['#065f46', '#1e1b4b', '#2E7D32'].includes(sectionColor);
                        navbar.style.color = isDark ? 'white' : 'var(--text-dark)';
                        navbar.querySelectorAll('a').forEach(a => a.style.color = isDark ? 'white' : 'inherit');
                    }
                }
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Efecto Magnético sutil para el botón de WhatsApp
    // 6. MOBILE MENU
    const mobileMenuBtn = document.querySelector('button.md\\:hidden');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
            navLinks.classList.toggle('flex');
            navLinks.classList.toggle('flex-col');
            navLinks.classList.toggle('absolute');
            navLinks.classList.toggle('top-full');
            navLinks.classList.toggle('left-0');
            navLinks.classList.toggle('right-0');
            navLinks.classList.toggle('bg-green-900');
            navLinks.classList.toggle('p-8');
            navLinks.classList.toggle('text-center');
        });

        // Cerrar menú al hacer clic en un link (UX móvil)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('flex-col')) mobileMenuBtn.click();
            });
        });
    }

    if (whatsappBubble) {
        whatsappBubble.addEventListener('mousemove', (e) => {
            const rect = whatsappBubble.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
            whatsappBubble.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.1)`;
        });
        whatsappBubble.addEventListener('mouseleave', () => {
            whatsappBubble.style.transform = `translate3d(0, 0, 0) scale(1)`;
        });
    }

    // 7. LIVE ACTIVITY SIMULATION (MIXED WITH REAL LOGS)
    const activityText = document.getElementById('activityText');
    const simulatedMessages = [
        "¡Alguien acaba de reservar el Resbalador!",
        "5 personas están viendo el Restaurante ahora",
        "¡Nueva reserva para el Columpio 360!",
        "Familia Rodríguez acaba de llegar al parque",
        "¡Quedan pocas mesas para el almuerzo!",
        "Alguien está preguntando por la Granja"
    ];

    const showActivity = () => {
        const realLogs = JSON.parse(localStorage.getItem('ecopark_activity_logs')) || [];
        let msg = "";

        if (realLogs.length > 0 && Math.random() > 0.4) {
            // Mostrar actividad real el 60% de las veces si existe
            const randomLog = realLogs[Math.floor(Math.random() * realLogs.length)];
            msg = randomLog.msg;
        } else {
            // Mostrar simulación
            msg = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
        }

        activityText.textContent = msg;
        activityBubble.classList.add('active');

        setTimeout(() => {
            activityBubble.classList.remove('active');
        }, 5000);
    };

    // Iniciar simulación después de 4 segundos
    setTimeout(() => {
        showActivity();
        setInterval(showActivity, 15000); // Cada 15 segundos
    }, 4000);

    // 8. SMART WHATSAPP TOGGLE
    if (whatsappBubble && whatsappWindow) {
        whatsappBubble.addEventListener('click', () => {
            whatsappWindow.classList.toggle('active');
        });
    }

    // 9. CURSOR AURA & TOUCH BURST
    const cursorAura = document.getElementById('cursorAura');
    
    // Mouse Tracking
    document.addEventListener('mousemove', (e) => {
        if (cursorAura) {
            cursorAura.style.left = e.clientX + 'px';
            cursorAura.style.top = e.clientY + 'px';
        }
    });

    // Touch Sparkle for Mobile
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const burst = document.createElement('div');
        burst.className = 'touch-burst';
        burst.style.left = touch.clientX + 'px';
        burst.style.top = touch.clientY + 'px';
        document.body.appendChild(burst);
        
        setTimeout(() => burst.remove(), 600);
    }, { passive: true });

    // 10. MOBILE 3D SCROLL TRIGGER
    if (window.innerWidth < 768) {
        window.addEventListener('scroll', () => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const center = window.innerHeight / 2;
                if (Math.abs(rect.top + rect.height/2 - center) < 100) {
                    card.style.transform = 'perspective(1000px) rotateX(10deg) scale(1.05)';
                } else {
                    card.style.transform = 'perspective(1000px) rotateX(0) scale(1)';
                }
            });
        });
    }

    // 11. ANIMAL HUNT GAME
    const animals = document.querySelectorAll('.hidden-animal');
    let foundAnimals = new Set();

    animals.forEach(animal => {
        animal.addEventListener('click', () => {
            const name = animal.dataset.animal;
            if (!foundAnimals.has(name)) {
                foundAnimals.add(name);
                animal.style.opacity = "0.3";
                animal.style.transform = "scale(0.5)";
                
                if (foundAnimals.size === 3) {
                    alert("¡FELICITACIONES! 🌈 Has encontrado a todos los Amigos del Bosque. Muestra este mensaje en taquilla para un postre de cortesía.");
                } else {
                    alert(`¡Encontraste al ${name}! Te faltan ${3 - foundAnimals.size} para el premio.`);
                }
            }
        });
    });

    console.log('🚀 Ecopark V3 - Interactive Experience Ready');

    // ==================== CMS READER ====================
    // Lee datos del CMS guardados en el admin y actualiza la landing
    const cms = JSON.parse(localStorage.getItem('ecopark_cms') || '{}');
    const applyIfExists = (id, val) => {
        const el = document.getElementById(id);
        if (el && val) el.textContent = val;
    };
    const applyHrefIfExists = (id, val, prefix='') => {
        const el = document.getElementById(id);
        if (el && val) { el.textContent = val; el.href = prefix + val; }
    };

    // Actualización dinámica de textos del Hero
    if (cms.hero_titulo) {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.innerHTML = cms.hero_titulo;
    }
    if (cms.hero_subtitulo) {
        const heroDesc = document.querySelector('.hero-content p');
        if (heroDesc) heroDesc.textContent = cms.hero_subtitulo;
    }

    // Actualización dinámica de descripciones de servicios (cards)
    const updateCardDesc = (title, newDesc) => {
        const card = document.querySelector(`.service-card-3d[data-title="${title}"]`);
        if (card && newDesc) {
            card.dataset.description = newDesc;
        }
    };

    updateCardDesc("Resbalador de Colores", cms.srv_resbalador_desc);
    updateCardDesc("Columpio 360", cms.srv_columpio_desc);
    updateCardDesc("Piscina Refrescante", cms.srv_piscina_desc);
    updateCardDesc("Granja Interactiva", cms.srv_granja_desc);
    updateCardDesc("Restaurante Mundo de Colores", cms.srv_restaurante_desc);

    // Actualización dinámica de precios de pasaportes
    if (cms.pasaporte_experiencia_precio) {
        const el = document.getElementById('pasaporte_experiencia_precio_display');
        if (el) el.textContent = cms.pasaporte_experiencia_precio;
    }
    if (cms.plan_cumpleanos_precio) {
        const el = document.getElementById('plan_cumpleanos_precio_display');
        if (el) el.textContent = cms.plan_cumpleanos_precio;
    }
    if (cms.escapada_bogotana_precio) {
        const el = document.getElementById('escapada_bogotana_precio_display');
        if (el) el.textContent = cms.escapada_bogotana_precio;
    }

    // Actualización de los precios en los data-attributes de los pasaportes (si existen)
    // No hay un modal de pasaportes, así que solo actualizamos el display.


    // Sincronización de Botones de reserva en modales/tarjetas
    // Si se quiere cambiar el número de WhatsApp centralizado
    const contactWa = cms.contacto_whatsapp || '573102200917';
    
    // Actualizar botones de reserva específicos de la página
    document.querySelectorAll('a[href^="https://wa.me/573102200917"]').forEach(btn => {
        const currentUrl = new URL(btn.href);
        const text = currentUrl.searchParams.get('text') || '';
        btn.href = `https://wa.me/${contactWa}?text=${encodeURIComponent(text)}`;
    });

    applyIfExists('footer_descripcion', cms.footer_descripcion);
    applyIfExists('footer_rnt', cms.rnt_numero ? `RNT N.° ${cms.rnt_numero}` : null);
    applyIfExists('footer_horario', cms.horarios);
    applyIfExists('footer_direccion', cms.contacto_direccion);
    
    // Actualización dinámica de botones de contacto desde el CMS
    if (cms.contacto_telefono) {
        const telEl = document.getElementById('footer_telefono');
        if (telEl) { telEl.textContent = cms.contacto_telefono; telEl.href = 'tel:' + cms.contacto_telefono.replace(/\s/g,''); }
    }
    if (cms.contacto_email) {
        const emEl = document.getElementById('footer_email');
        if (emEl) { emEl.textContent = cms.contacto_email; emEl.href = 'mailto:' + cms.contacto_email; }
    }
    if (cms.habeas_data_texto) {
        const hEl = document.getElementById('habeas_contenido');
        if (hEl) hEl.innerHTML = cms.habeas_data_texto;
    }
    if (cms.terminos_texto) {
        const tEl = document.getElementById('terminos_contenido');
        if (tEl) tEl.innerHTML = cms.terminos_texto;
    }

    // Actualización dinámica del logo
    if (cms.logo_url) {
        const mainLogo = document.getElementById('mainLogo');
        if (mainLogo) mainLogo.src = cms.logo_url;
    }

    // ==================== GESTIÓN DE ATRACCIONES (PRECIOS Y VISIBILIDAD) ====================
    const serviceCards = document.querySelectorAll('.service-card-3d');
    serviceCards.forEach(card => {
        const serviceKey = card.dataset.serviceKey;
        if (!serviceKey) return;

        // Visibilidad
        const isVisible = cms[`service_${serviceKey}_visible`];
        if (isVisible === false) { // Si está explícitamente en false
            card.classList.add('hidden');
        } else {
            card.classList.remove('hidden');
        }

        // Precios
        const priceDisplayEl = card.querySelector('.service-price');
        if (priceDisplayEl) {
            let priceText = "";
            if (serviceKey === "resbalador_colores") {
                const precioAdulto = cms[`service_${serviceKey}_precio_adulto`];
                const precioNino = cms[`service_${serviceKey}_precio_nino`];
                if (precioAdulto && precioNino) {
                    priceText = `Adultos: ${precioAdulto} / Niños: ${precioNino}`;
                } else if (precioAdulto) {
                    priceText = `Adultos: ${precioAdulto}`;
                } else if (precioNino) {
                    priceText = `Niños: ${precioNino}`;
                }
            } else if (serviceKey === "granja_interactiva") {
                const precioAlimentar = cms[`service_${serviceKey}_precio_alimentar`];
                if (precioAlimentar) {
                    priceText = `Alimentar: ${precioAlimentar}`;
                } else {
                    priceText = "Entrada gratis";
                }
            } else if (cms[`service_${serviceKey}_precio`]) {
                priceText = `Precio: ${cms[`service_${serviceKey}_precio`]}`;
            } else if (serviceKey === "piscina_refrescante") {
                priceText = cms[`service_${serviceKey}_precio`] || "Entrada gratis";
            }
            priceDisplayEl.textContent = priceText;
        }
    });
    // ==================== MODALES LEGALES ====================
    window.abrirModalLegal = (tipo) => {
        const id = tipo === 'habeas' ? 'modalHabeas' : 'modalTerminos';
        const modal = document.getElementById(id);
        playModalSound();
        if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    window.cerrarModalLegal = (tipo) => {
        const id = tipo === 'habeas' ? 'modalHabeas' : 'modalTerminos';
        const modal = document.getElementById(id);
        if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }
    };

    // ==================== CONTADOR DE PERSONAS ====================
    document.querySelectorAll('.counter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const action = btn.dataset.action;
            const input = document.getElementById(targetId);
            if (!input) return;
            let val = parseInt(input.value) || 0;
            const min = parseInt(input.min) || 0;
            const max = parseInt(input.max) || 99;
            if (action === '+') val = Math.min(val + 1, max);
            if (action === '-') val = Math.max(val - 1, min);
            input.value = val;
        });
    });

    // ==================== SELECTOR DE PLAN DESDE URL ====================
    // Permite pre-seleccionar plan desde enlace #reservar?plan=cumpleanos
    const urlParams = new URLSearchParams(window.location.search);
    const preplan = urlParams.get('plan');
    if (preplan === 'cumpleanos') {
        const radioCP = document.querySelector('input[name="plan"][value="Celebración de Cumpleaños"]');
        if (radioCP) radioCP.checked = true;
    }

    // ==================== FORMULARIO DE RESERVAS ====================
    const reservaForm = document.getElementById('reservaForm');
    const reservaConfirmacion = document.getElementById('reservaConfirmacion');
    const btnReservar = document.getElementById('btnReservar');
    const btnReservarText = document.getElementById('btnReservarText');

    // Bloquear fechas pasadas
    const fechaInput = document.getElementById('res_fecha');
    if (fechaInput) {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 1); // Mínimo mañana
        fechaInput.min = hoy.toISOString().split('T')[0];
    }

    if (reservaForm) {
        reservaForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validación manual
            const nombre = document.getElementById('res_nombre').value.trim();
            const whatsapp = document.getElementById('res_whatsapp').value.trim();
            const correo = document.getElementById('res_correo').value.trim();
            const fecha = document.getElementById('res_fecha').value;
            const adultos = parseInt(document.getElementById('res_adultos').value) || 0;
            const ninos = parseInt(document.getElementById('res_ninos').value) || 0;
            const planRadio = document.querySelector('input[name="plan"]:checked');
            const habeas = document.getElementById('res_habeas').checked;
            const notas = document.getElementById('res_notas').value.trim();

            // Clear errors
            document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => el.classList.remove('error'));

            let errors = [];
            if (!nombre) { document.getElementById('res_nombre').classList.add('error'); errors.push('nombre'); }
            if (!whatsapp || whatsapp.length < 7) { document.getElementById('res_whatsapp').classList.add('error'); errors.push('whatsapp'); }
            if (!correo || !correo.includes('@')) { document.getElementById('res_correo').classList.add('error'); errors.push('correo'); }
            if (!fecha) { document.getElementById('res_fecha').classList.add('error'); errors.push('fecha'); }
            if (adultos < 1) errors.push('adultos');
            if (!planRadio) errors.push('plan');
            if (!habeas) errors.push('habeas');

            if (errors.length > 0) {
                if (!planRadio) {
                    const planSel = document.getElementById('planSelector');
                    if (planSel) planSel.style.outline = '2px solid #ef4444';
                }
                if (!habeas) {
                    const hCheck = document.querySelector('.form-check');
                    if (hCheck) hCheck.style.borderColor = '#ef4444';
                }
                return;
            }

            // Reset visual errors
            const planSel = document.getElementById('planSelector');
            if (planSel) planSel.style.outline = 'none';
            const hCheck = document.querySelector('.form-check');
            if (hCheck) hCheck.style.borderColor = '#a7f3d0';

            // Loading state
            btnReservar.disabled = true;
            btnReservarText.textContent = '⏳ Enviando...';

            // Guardar reserva en localStorage
            const nuevaReserva = {
                id: Date.now().toString(),
                cliente: nombre,
                telefono: '+57' + whatsapp,
                correo: correo,
                fecha: fecha,
                adultos: adultos,
                ninos: ninos,
                plan: planRadio.value,
                servicio: planRadio.value,
                notas: notas,
                estado: 'pendiente',
                asistido: false,
                timestamp_asistencia: null,
                agradecimiento_enviado: false, // Inicializar para el seguimiento de reseñas
                syncGoogle: false,
                timestamp: Date.now(),
                fuente: 'landing'
            };

            const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');
            citas.push(nuevaReserva);
            localStorage.setItem('ecopark_citas', JSON.stringify(citas));

            // Log de actividad
            logActivity(`¡Nueva reserva de ${nombre} para ${planRadio.value}!`);

            // Simular pequeña espera (1s) para UX
            setTimeout(() => {
                // Mostrar confirmación
                reservaForm.style.display = 'none';
                reservaConfirmacion.style.display = 'block';

                // Detalles de confirmación
                const formatFecha = (f) => {
                    const [y,m,d] = f.split('-');
                    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                    return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
                };

                document.getElementById('confirmDetalles').innerHTML = `
                    <strong>👤 Nombre:</strong> ${nombre}<br>
                    <strong>📱 WhatsApp:</strong> +57 ${whatsapp}<br>
                    <strong>📧 Correo:</strong> ${correo}<br>
                    <strong>📅 Fecha:</strong> ${formatFecha(fecha)}<br>
                    <strong>👥 Visitantes:</strong> ${adultos} adulto${adultos!==1?'s':''} + ${ninos} niño${ninos!==1?'s':''}<br>
                    <strong>🎯 Plan:</strong> ${planRadio.value}
                `;

                // ===== NOTIFICACIÓN WHATSAPP AL ADMIN =====
                // Número admin configurable desde CMS, por defecto el del parque
                const adminWaNum = (JSON.parse(localStorage.getItem('ecopark_cms') || '{}').contacto_whatsapp || '573102200917').replace(/\D/g,'');

                const msgAdmin = encodeURIComponent(
                    `🌈 *NUEVA RESERVA — Ecopark*\n\n` +
                    `👤 *Cliente:* ${nombre}\n` +
                    `📱 *WhatsApp:* +57 ${whatsapp}\n` +
                    `📧 *Correo:* ${correo}\n` +
                    `📅 *Fecha de visita:* ${formatFecha(fecha)}\n` +
                    `👥 *Adultos:* ${adultos}   🧒 *Niños:* ${ninos}\n` +
                    `🎯 *Plan:* ${planRadio.value}\n` +
                    `${notas ? '📝 *Notas:* ' + notas + '\n' : ''}` +
                    `\n_Solicitud recibida desde la web el ${new Date().toLocaleString('es-CO')}_`
                );

                // WhatsApp de respaldo para el cliente (botón en pantalla de confirmación)
                const msgCliente = encodeURIComponent(
                    `¡Hola Ecopark! 🌈 Acabo de enviar mi solicitud de reserva.\n\n` +
                    `👤 Nombre: ${nombre}\n📅 Fecha: ${formatFecha(fecha)}\n` +
                    `👥 ${adultos} adulto(s) + ${ninos} niño(s)\n🎯 Plan: ${planRadio.value}\n\n` +
                    `¿Pueden confirmarme la disponibilidad? ¡Gracias!`
                );
                document.getElementById('confirmWA').href = `https://wa.me/${adminWaNum}?text=${msgCliente}`;

                // ===== ABRIR WHATSAPP AL ADMIN AUTOMÁTICAMENTE =====
                // Se abre en nueva pestaña para notificar al parque sin interrumpir la experiencia del cliente
                setTimeout(() => {
                    window.open(`https://wa.me/${adminWaNum}?text=${msgAdmin}`, '_blank');
                }, 800);

                btnReservar.disabled = false;
                btnReservarText.textContent = '📅 Enviar Solicitud de Reserva';
            }, 1000);
        });
    }
});
