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
    let isPlaying = false;

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
        
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDescription').textContent = data.description;
        document.getElementById('modalIntensity').textContent = data.intensity;
        
        const iconContainer = document.getElementById('modalIcon');
        iconContainer.style.backgroundColor = data.color;
        iconContainer.innerHTML = `<i data-lucide="${data.icon}"></i>`;
        
        // Populate Swiper
        const images = data.images.split(',');
        swiperWrapper.innerHTML = images.map(img => `
            <div class="swiper-slide h-full">
                <img src="${img.trim()}" class="w-full h-full object-cover">
            </div>
        `).join('');
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
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
                images: card.dataset.images
            };
            openModal(data);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // 4. MENU MODAL LOGIC
    const menuModal = document.getElementById('menuModal');
    const openMenuBtn = document.getElementById('openMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    if (openMenuBtn && menuModal) {
        openMenuBtn.addEventListener('click', () => {
            menuModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeMenuBtn && menuModal) {
        closeMenuBtn.addEventListener('click', () => {
            menuModal.classList.remove('active');
            document.body.style.overflow = 'auto';
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

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
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
                const speed = (index + 1) * 0.4;
                const cloudY = -(scrolled * speed);
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
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

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
    }

    // 7. LIVE ACTIVITY SIMULATION (MIXED WITH REAL LOGS)
    const activityBubble = document.getElementById('liveActivity');
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

    console.log('🚀 Ecopark V2 - Experience Ready');
});
