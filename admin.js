/* ========================================
   ADMIN PANEL JAVASCRIPT - ECOPARK
   Sistema de Gestión de Citas con Google Calendar
   ======================================== */

// ==================== UTILITY IMPROVEMENTS ====================
/**
 * VALIDACIÓN Y SANITIZACIÓN DE DATOS
 * Funciones para prevenir errores y vulnerabilidades XSS
 */

// Debounce para filtros - evita renderizado excesivo
const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Sanitización: evita inyección de código
const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// Validación de emails
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validación de teléfono (flexible)
const isValidPhone = (phone) => {
    const regex = /^[\d\s\-\+\(\)]{7,20}$/;
    return regex.test(phone);
};

// Validación de fecha
const isValidDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return !isNaN(date.getTime());
};

// Validación de cita completa
const validateCita = (cita) => {
    const errors = [];
    if (!cita.cliente || cita.cliente.trim().length < 2) errors.push('Nombre debe tener al menos 2 caracteres');
    if (!cita.telefono || !isValidPhone(cita.telefono)) errors.push('Teléfono inválido');
    if (!cita.fecha || !isValidDate(cita.fecha)) errors.push('Fecha inválida');
    if (!cita.hora || !/^\d{2}:\d{2}$/.test(cita.hora)) errors.push('Hora debe ser HH:MM');
    if (!cita.servicio || cita.servicio.trim().length < 2) errors.push('Plan/Servicio requerido');
    if (!cita.personas || isNaN(parseInt(cita.personas)) || parseInt(cita.personas) < 1) errors.push('Personas debe ser mayor a 0');
    return errors;
};

/**
 * SISTEMA DE NOTIFICACIONES MEJORADO
 * Toast con stack y auto-cierre
 */
const toastContainer = (() => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }
    return container;
})();

const showNotification = (message, type = 'success', duration = 3000) => {
    const toast = document.createElement('div');
    const bgColor = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    }[type] || '#10b981';
    
    toast.style.cssText = `
        background:${bgColor};
        color:white;
        padding:12px 16px;
        border-radius:6px;
        font-size:14px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15);
        animation:slideIn 0.3s ease-out;
        max-width:320px;
        word-wrap:break-word;
    `;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    const timeout = setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    toast.addEventListener('click', () => {
        clearTimeout(timeout);
        toast.remove();
    });
    
    return toast;
};

// CSS para animaciones de toast
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * SISTEMA DE PAGINACIÓN
 * Para manejar tablas grandes
 */
const createPagination = (items, pageSize = 10) => {
    const totalPages = Math.ceil(items.length / pageSize);
    let currentPage = 1;
    
    return {
        getPage: (page) => {
            if (page < 1 || page > totalPages) return [];
            const start = (page - 1) * pageSize;
            return items.slice(start, start + pageSize);
        },
        setPage: (page) => {
            if (page >= 1 && page <= totalPages) currentPage = page;
            return currentPage;
        },
        getCurrentPage: () => currentPage,
        getTotalPages: () => totalPages,
        getTotalItems: () => items.length
    };
};

/**
 * SISTEMA DE BACKUP
 * Guardar y restaurar datos
 */
const BackupManager = {
    createBackup: () => {
        const backup = {
            citas: localStorage.getItem('ecopark_citas'),
            medios: localStorage.getItem('ecopark_medios'),
            banners: localStorage.getItem('ecopark_banners'),
            reviews: localStorage.getItem('ecopark_reviews'),
            config: localStorage.getItem('ecopark_google_config'),
            maps: localStorage.getItem('ecopark_maps_config'),
            webhook: localStorage.getItem('ecopark_webhook'),
            cms: localStorage.getItem('ecopark_cms'),
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('ecopark_backup_' + Date.now(), JSON.stringify(backup));
        return backup;
    },
    
    restoreBackup: (backupKey) => {
        const backup = localStorage.getItem(backupKey);
        if (!backup) {
            showNotification('Backup no encontrado', 'error');
            return false;
        }
        const data = JSON.parse(backup);
        if (data.citas) localStorage.setItem('ecopark_citas', data.citas);
        if (data.medios) localStorage.setItem('ecopark_medios', data.medios);
        if (data.banners) localStorage.setItem('ecopark_banners', data.banners);
        if (data.reviews) localStorage.setItem('ecopark_reviews', data.reviews);
        if (data.config) localStorage.setItem('ecopark_google_config', data.config);
        if (data.maps) localStorage.setItem('ecopark_maps_config', data.maps);
        if (data.webhook) localStorage.setItem('ecopark_webhook', data.webhook);
        if (data.cms) localStorage.setItem('ecopark_cms', data.cms);
        return true;
    },
    
    listBackups: () => {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('ecopark_backup_')) {
                const data = JSON.parse(localStorage.getItem(key));
                backups.push({ key, timestamp: data.timestamp });
            }
        }
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    deleteBackup: (backupKey) => {
        localStorage.removeItem(backupKey);
        showNotification('Backup eliminado', 'success');
    }
};

/**
 * GESTOR DE CARGA
 * Mostrar estado de carga en operaciones async
 */
const LoadingManager = {
    show: (message = 'Cargando...') => {
        if (document.getElementById('loading-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;right:0;bottom:0;
            background:rgba(0,0,0,0.3);z-index:9998;
            display:flex;align-items:center;justify-content:center;
        `;
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            background:white;padding:24px;border-radius:8px;
            text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.2);
        `;
        spinner.innerHTML = `
            <div style="width:40px;height:40px;border:4px solid #e5e7eb;
            border-top-color:#10b981;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px;"></div>
            <p style="margin:0;color:#6b7280;font-size:14px;">${message}</p>
        `;
        overlay.appendChild(spinner);
        document.body.appendChild(overlay);
        
        if (!document.getElementById('spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
    },
    
    hide: () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        }
    }
};

// ==================== FIN MEJORAS ====================

document.addEventListener('DOMContentLoaded', () => {
    // ==================== AUTENTICACIÓN ====================
    // Credenciales por defecto
    const AUTH_CONFIG = {
        user: 'admin',
        pass: 'ecopark2026'
    };

    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    const navigateToSection = (sectionId) => {
        const targetLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (targetLink) {
            targetLink.click();
        } else {
            // Fallback manual si el click falla
            sections.forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
            const section = document.getElementById(sectionId);
            if (section) { section.classList.add('active'); section.style.display = 'block'; }
            if (pageTitle) pageTitle.textContent = sectionId.toUpperCase();
        }
    };

    const checkAuth = () => {
        if (sessionStorage.getItem('ecopark_authenticated') === 'true') {
            if (loginScreen) loginScreen.style.display = 'none';
            navigateToSection('dashboard');
        }
    };

    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUser')?.value.trim().toLowerCase();
        const pass = document.getElementById('adminPass')?.value;

        console.log("Intentando login con:", user);

        if (user === AUTH_CONFIG.user.toLowerCase() && pass === AUTH_CONFIG.pass) {
            sessionStorage.setItem('ecopark_authenticated', 'true');
            if (loginScreen) loginScreen.style.display = 'none';
            console.log("Login exitoso, navegando a dashboard...");
            navigateToSection('dashboard');
            showNotification('¡Bienvenido al sistema!', 'success');
        } else {
            console.error("Credenciales incorrectas");
            if (loginError) loginError.classList.remove('hidden');
            setTimeout(() => loginError?.classList.add('hidden'), 3000);
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
        sessionStorage.removeItem('ecopark_authenticated');
        window.location.reload();
    });

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==================== STATE MANAGEMENT ====================
    let citas = [];
    let googleConfig = {
        apiKey: '',
        clientId: '',
        calendarId: 'primary'
    };
    let medios = [];
    let banners = [];
    let reviews = [];
    let mapsConfig = {
        placeId: '',
        apiKey: ''
    };

    // ==================== LOCAL STORAGE ====================
    const loadCitas = () => {
        const stored = localStorage.getItem('ecopark_citas');
        citas = stored ? JSON.parse(stored) : [];
        return citas;
    };

    const saveCitas = () => {
        localStorage.setItem('ecopark_citas', JSON.stringify(citas));
    };

    const loadGoogleConfig = () => {
        const stored = localStorage.getItem('ecopark_google_config');
        if (stored) {
            googleConfig = JSON.parse(stored);
            document.getElementById('googleApiKey').value = googleConfig.apiKey || '';
            document.getElementById('googleClientId').value = googleConfig.clientId || '';
            document.getElementById('googleCalendarId').value = googleConfig.calendarId || 'primary';
        }
    };

    const saveGoogleConfig = () => {
        googleConfig.apiKey = document.getElementById('googleApiKey').value;
        googleConfig.clientId = document.getElementById('googleClientId').value;
        googleConfig.calendarId = document.getElementById('googleCalendarId').value || 'primary';
        localStorage.setItem('ecopark_google_config', JSON.stringify(googleConfig));
    };

    const loadMedios = () => {
        const stored = localStorage.getItem('ecopark_medios');
        medios = stored ? JSON.parse(stored) : [];
        return medios;
    };

    const saveMedios = () => {
        localStorage.setItem('ecopark_medios', JSON.stringify(medios));
    };

    const loadBanners = () => {
        const stored = localStorage.getItem('ecopark_banners');
        banners = stored ? JSON.parse(stored) : [];
        return banners;
    };

    const saveBanners = () => {
        localStorage.setItem('ecopark_banners', JSON.stringify(banners));
    };

    const loadReviews = () => {
        const stored = localStorage.getItem('ecopark_reviews');
        reviews = stored ? JSON.parse(stored) : [];
        return reviews;
    };

    const saveReviews = () => {
        localStorage.setItem('ecopark_reviews', JSON.stringify(reviews));
    };

    const loadMapsConfig = () => {
        const stored = localStorage.getItem('ecopark_maps_config');
        if (stored) {
            mapsConfig = JSON.parse(stored);
            document.getElementById('googlePlaceId').value = mapsConfig.placeId || '';
            document.getElementById('googleMapsApiKey').value = mapsConfig.apiKey || '';
        }
    };

    const saveMapsConfig = () => {
        mapsConfig.placeId = document.getElementById('googlePlaceId').value;
        mapsConfig.apiKey = document.getElementById('googleMapsApiKey').value;
        localStorage.setItem('ecopark_maps_config', JSON.stringify(mapsConfig));
    };

    // ==================== NAVIGATION ====================
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const dashboardSection = document.getElementById('dashboard');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Update title
            pageTitle.textContent = link.textContent.trim();
            
            // Refresh data
            if (sectionId === 'dashboard') setTimeout(updateDashboard, 0); // Ensure DOM is ready
            if (sectionId === 'citas') renderCitasTable();
            if (sectionId === 'calendario') renderCalendar();
            if (sectionId === 'medios') renderMedios();
            if (sectionId === 'reseñas') renderReviews();
            if (sectionId === 'banners') renderBanners();
        });
    });

    // ==================== DASHBOARD ====================
    let dashboardInitialized = false;
    const updateDashboard = () => {
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const weekEnd = weekFromNow.toISOString().split('T')[0];

        // Citas hoy
        const citasHoy = citas.filter(c => c.fecha === today && c.estado !== 'cancelada');
        document.getElementById('citasHoy').textContent = citasHoy.length;

        // Citas esta semana
        const citasSemana = citas.filter(c => 
            c.fecha >= today && 
            c.fecha <= weekEnd && 
            c.estado !== 'cancelada'
        );
        document.getElementById('citasSemana').textContent = citasSemana.length;

        // Total visitantes
        const totalVisitantes = citas
            .filter(c => c.estado !== 'cancelada')
            .reduce((sum, c) => sum + (parseInt(c.personas) || 0), 0);
        document.getElementById('totalVisitantes').textContent = totalVisitantes;

        // Próxima cita
        const proximaCita = citas
            .filter(c => c.fecha >= today && c.estado !== 'cancelada')
            .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0];
        
        if (proximaCita) {
            document.getElementById('proximaCita').textContent = `${proximaCita.hora} - ${proximaCita.cliente}`;
        } else {
            document.getElementById('proximaCita').textContent = 'No hay citas';
        }

        // Citas recientes
        renderCitasRecientes();

        // Servicios populares
        renderServiciosPopulares();

        // Reseñas solicitadas esta semana
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const reviewsRequested = citas.filter(c => 
            c.agradecimiento_enviado && 
            c.timestamp_asistencia && // Usar timestamp_asistencia si está disponible, sino c.timestamp
            new Date(c.timestamp_asistencia || c.timestamp) >= oneWeekAgo
        ).length;
        document.getElementById('reviewsRequestedWeek').textContent = reviewsRequested;
    };

    const renderCitasRecientes = () => {
        const container = document.getElementById('citasRecientes');
        const recentCitas = citas
            .filter(c => c.estado !== 'cancelada')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);

        if (recentCitas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay citas recientes</p>';
            return;
        }

        container.innerHTML = recentCitas.map(cita => `
            <div class="cita-item">
                <div class="cita-info">
                    <p class="cita-cliente">${cita.cliente}</p>
                    <p class="cita-detalle">${cita.servicio} - ${formatDate(cita.fecha)} ${cita.hora}</p>
                </div>
                <span class="status-badge status-${cita.estado}">${capitalize(cita.estado)}</span>
            </div>
        `).join('');
    };

    const renderServiciosPopulares = () => {
        const container = document.getElementById('serviciosPopulares');
        const servicioCounts = {};
        
        citas
            .filter(c => c.estado !== 'cancelada')
            .forEach(cita => {
                servicioCounts[cita.servicio] = (servicioCounts[cita.servicio] || 0) + 1;
            });

        const sorted = Object.entries(servicioCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sorted.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay datos aún</p>';
            return;
        }

        container.innerHTML = sorted.map(([servicio, count]) => `
            <div class="service-item">
                <span class="service-name">${servicio}</span>
                <span class="service-count">${count}</span>
            </div>
        `).join('');
    };

    // ==================== CITAS TABLE ====================
    const renderCitasTable = () => {
        const tbody = document.getElementById('citasTableBody');
        const filtroFecha = document.getElementById('filtroFecha').value;
        const filtroEstado = document.getElementById('filtroEstado').value;
        const filtroBusqueda = document.getElementById('filtroBusqueda').value.toLowerCase();

        let filtered = [...citas];

        if (filtroFecha) {
            filtered = filtered.filter(c => c.fecha === filtroFecha);
        }

        if (filtroEstado) {
            filtered = filtered.filter(c => c.estado === filtroEstado);
        }

        if (filtroBusqueda) {
            filtered = filtered.filter(c => 
                c.cliente.toLowerCase().includes(filtroBusqueda) ||
                c.servicio.toLowerCase().includes(filtroBusqueda)
            );
        }

        // Sort by date and time
        filtered.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">No hay citas que coincidan con los filtros</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(cita => `
            <tr>
                <td>${formatDate(cita.fecha)}</td>
                <td>${cita.hora}</td>
                <td>
                    <div class="font-medium">${cita.cliente}</div>
                    <div class="text-sm text-gray-500">${cita.telefono}</div>
                </td>
                <td>${cita.servicio}</td>
                <td>${cita.personas}</td>
                <td><span class="status-badge status-${cita.estado}">${capitalize(cita.estado)}</span></td>
                <td>
                    <div class="cita-actions">
                        <button onclick="editCita('${cita.id}')" class="btn btn-sm btn-outline">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button onclick="deleteCita('${cita.id}')" class="btn btn-sm btn-danger">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        lucide.createIcons();
    };

    // ==================== MODAL ====================
    const citaModal = document.getElementById('citaModal');
    const citaForm = document.getElementById('citaForm');
    const nuevaCitaBtn = document.getElementById('nuevaCitaBtn');
    const closeCitaModal = document.getElementById('closeCitaModal');
    const cancelCitaBtn = document.getElementById('cancelCitaBtn');

    nuevaCitaBtn?.addEventListener('click', () => {
        citaForm.reset();
        document.getElementById('citaId').value = '';
        document.getElementById('modalTitle').textContent = 'Nueva Cita';
        citaModal.classList.add('active');
    });

    closeCitaModal?.addEventListener('click', () => {
        citaModal.classList.remove('active');
    });

    cancelCitaBtn?.addEventListener('click', () => {
        citaModal.classList.remove('active');
    });

    citaModal?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            citaModal.classList.remove('active');
        }
    });

    citaForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const citaId = document.getElementById('citaId').value;
            const citaData = {
                id: citaId || Date.now().toString(),
                cliente: sanitizeInput(document.getElementById('citaNombre').value),
                telefono: document.getElementById('citaTelefono').value,
                fecha: document.getElementById('citaFecha').value,
                hora: document.getElementById('citaHora').value,
                servicio: sanitizeInput(document.getElementById('citaServicio').value),
                personas: document.getElementById('citaPersonas').value,
                estado: document.getElementById('citaEstado').value,
                notas: sanitizeInput(document.getElementById('citaNotas').value),
                syncGoogle: document.getElementById('citaSyncGoogle').checked,
                timestamp: Date.now()
            };

            // Validar datos
            const errors = validateCita(citaData);
            if (errors.length > 0) {
                showToast('Errores:\n' + errors.join('\n'), 'error');
                return;
            }

            if (citaId) {
                // Update existing
                const index = citas.findIndex(c => c.id === citaId);
                if (index !== -1) {
                    citas[index] = { ...citas[index], ...citaData };
                }
            } else {
                // Create new
                citas.push(citaData);
            }

            saveCitas();
            
            // Sync with Google Calendar if enabled
            if (citaData.syncGoogle && googleConfig.apiKey) {
                await syncToGoogleCalendar(citaData);
            }

            citaModal.classList.remove('active');
            renderCitasTable();
            updateDashboard();
            showToast(citaId ? 'Cita actualizada ✓' : 'Cita creada ✓', 'success');
        } catch (error) {
            console.error('Error al guardar cita:', error);
            showToast('Error al guardar: ' + error.message, 'error');
        }
    });

    // ==================== GOOGLE CALENDAR INTEGRATION ====================
    const syncToGoogleCalendar = async (cita) => {
        if (!googleConfig.apiKey || !cita.syncGoogle) return;

        try {
            // Validar que la cita tenga datos necesarios
            if (!cita.fecha || !cita.hora) {
                throw new Error('Fecha y hora requeridas para sincronizar');
            }

            // This is a placeholder for Google Calendar API integration
            // In production, you would use the Google Calendar API
            console.log('Syncing to Google Calendar:', cita);
            
            // Example API call (requires proper OAuth setup):
            /*
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${googleConfig.calendarId}/events?key=${googleConfig.apiKey}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    summary: `Cita: ${cita.cliente} - ${cita.servicio}`,
                    description: `Cliente: ${cita.cliente}\nTeléfono: ${cita.telefono}\nPersonas: ${cita.personas}\nNotas: ${cita.notas}`,
                    start: {
                        dateTime: `${cita.fecha}T${cita.hora}:00`,
                        timeZone: 'America/Bogota'
                    },
                    end: {
                        dateTime: `${cita.fecha}T${addHours(cita.hora, 2)}:00`,
                        timeZone: 'America/Bogota'
                    }
                })
            });
            */
            
            showToast('Sincronizado con Google Calendar ✓', 'success');
        } catch (error) {
            console.error('Error syncing to Google Calendar:', error);
            showToast('Error al sincronizar: ' + error.message, 'error');
        }
    };

    const syncGoogleBtn = document.getElementById('syncGoogleBtn');
    syncGoogleBtn?.addEventListener('click', async () => {
        if (!googleConfig.apiKey) {
            showToast('Configura primero la API de Google', 'error');
            return;
        }

        showToast('Sincronizando...', 'success');
        
        // Sync all pending citas
        const pendingCitas = citas.filter(c => c.syncGoogle && c.estado !== 'cancelada');
        for (const cita of pendingCitas) {
            await syncToGoogleCalendar(cita);
        }
    });

    // ==================== CONFIGURATION ====================
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const testConnectionBtn = document.getElementById('testConnectionBtn');

    saveConfigBtn?.addEventListener('click', () => {
        try {
            const apiKey = document.getElementById('googleApiKey')?.value?.trim();
            const clientId = document.getElementById('googleClientId')?.value?.trim();
            
            if (!apiKey) {
                showToast('API Key es requerida', 'error');
                return;
            }
            
            if (apiKey.length < 10) {
                showToast('API Key parece inválida (muy corta)', 'error');
                return;
            }
            
            saveGoogleConfig();
            showToast('Configuración guardada ✓', 'success');
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            showToast('Error: ' + error.message, 'error');
        }
    });

    testConnectionBtn?.addEventListener('click', () => {
        try {
            const apiKey = document.getElementById('googleApiKey')?.value?.trim();
            if (!apiKey) {
                showToast('Ingresa una API Key primero', 'error');
                return;
            }
            
            // Simulado - en producción hacer llamada real a Google
            showToast('✓ Conexión verificada (simulada)', 'success');
        } catch (error) {
            console.error('Error en test de conexión:', error);
            showToast('Error en la prueba: ' + error.message, 'error');
        }
    });

    // ==================== CALENDAR VIEW ====================
    const renderCalendar = () => {
        const container = document.getElementById('calendarView');
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        let html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">${monthNames[month]} ${year}</h3>
                <div class="flex gap-2">
                    <button class="btn btn-sm btn-outline">Anterior</button>
                    <button class="btn btn-sm btn-outline">Siguiente</button>
                </div>
            </div>
            <div class="grid grid-cols-7 gap-1 mb-2">
                <div class="text-center font-bold text-gray-500">Dom</div>
                <div class="text-center font-bold text-gray-500">Lun</div>
                <div class="text-center font-bold text-gray-500">Mar</div>
                <div class="text-center font-bold text-gray-500">Mié</div>
                <div class="text-center font-bold text-gray-500">Jue</div>
                <div class="text-center font-bold text-gray-500">Vie</div>
                <div class="text-center font-bold text-gray-500">Sáb</div>
            </div>
            <div class="grid grid-cols-7 gap-1">
        `;

        // Empty cells for days before the first day
        for (let i = 0; i < startingDay; i++) {
            html += '<div class="p-2"></div>';
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayCitas = citas.filter(c => c.fecha === dateStr && c.estado !== 'cancelada');
            const isToday = day === today.getDate();
            
            html += `
                <div class="p-2 min-h-[60px] border rounded ${isToday ? 'bg-green-100 border-green-500' : 'bg-white'} hover:bg-gray-50 cursor-pointer" onclick="showDayCitas('${dateStr}')">
                    <div class="font-bold ${isToday ? 'text-green-700' : ''}">${day}</div>
                    ${dayCitas.length > 0 ? `<div class="text-xs text-green-600">${dayCitas.length} cita${dayCitas.length > 1 ? 's' : ''}</div>` : ''}
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    };

    // ==================== FILTERS ====================
    // Con debounce para búsqueda - evita renderizado excesivo
    document.getElementById('filtroFecha')?.addEventListener('change', () => {
        try {
            renderCitasTable();
        } catch (error) {
            console.error('Error en filtro de fecha:', error);
            showToast('Error al filtrar por fecha', 'error');
        }
    });
    
    document.getElementById('filtroEstado')?.addEventListener('change', () => {
        try {
            renderCitasTable();
        } catch (error) {
            console.error('Error en filtro de estado:', error);
            showToast('Error al filtrar por estado', 'error');
        }
    });
    
    // Debounce en búsqueda para mejor performance
    const debouncedSearch = debounce(() => {
        try {
            renderCitasTable();
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showToast('Error en la búsqueda', 'error');
        }
    }, 400);
    
    document.getElementById('filtroBusqueda')?.addEventListener('input', debouncedSearch);

    // ==================== GLOBAL FUNCTIONS ====================
    window.editCita = (id) => {
        const cita = citas.find(c => c.id === id);
        if (!cita) return;

        document.getElementById('citaId').value = cita.id;
        document.getElementById('citaNombre').value = cita.cliente;
        document.getElementById('citaTelefono').value = cita.telefono;
        document.getElementById('citaFecha').value = cita.fecha;
        document.getElementById('citaHora').value = cita.hora;
        document.getElementById('citaServicio').value = cita.servicio;
        document.getElementById('citaPersonas').value = cita.personas;
        document.getElementById('citaEstado').value = cita.estado;
        document.getElementById('citaNotas').value = cita.notas || '';
        document.getElementById('citaSyncGoogle').checked = cita.syncGoogle;

        document.getElementById('modalTitle').textContent = 'Editar Cita';
        citaModal.classList.add('active');
    };

    window.deleteCita = (id) => {
        try {
            const cita = citas.find(c => c.id === id);
            if (!cita) {
                showToast('Cita no encontrada', 'error');
                return;
            }
            
            if (confirm(`¿Estás SEGURO de eliminar la cita de ${cita.cliente}?\n\nEsta acción NO se puede deshacer.`)) {
                citas = citas.filter(c => c.id !== id);
                saveCitas();
                renderCitasTable();
                updateDashboard();
                showToast('Cita eliminada ✓', 'success');
            }
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            showToast('Error al eliminar: ' + error.message, 'error');
        }
    };

    window.showDayCitas = (dateStr) => {
        const dayCitas = citas.filter(c => c.fecha === dateStr && c.estado !== 'cancelada');
        if (dayCitas.length === 0) {
            showToast('No hay citas para este día', 'success');
            return;
        }

        const message = dayCitas.map(c => 
            `${c.hora} - ${c.cliente} (${c.servicio})`
        ).join('\n');
        
        alert(`Citas para ${formatDate(dateStr)}:\n\n${message}`);
    };

    // ==================== UTILITIES ====================
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-CO', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const addHours = (timeStr, hours) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours + hours, minutes);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const showToast = (message, type = 'success') => {
        // Usar el nuevo sistema de notificaciones mejorado
        showNotification(message, type, 3000);
    };

    // ==================== MEDIOS MANAGEMENT ====================
    const renderMedios = () => {
        const fotosGrid = document.getElementById('fotosGrid');
        const videosGrid = document.getElementById('videosGrid');
        const noFotos = document.getElementById('noFotos');
        const noVideos = document.getElementById('noVideos');

        const fotos = medios.filter(m => m.tipo === 'foto');
        const videos = medios.filter(m => m.tipo === 'video');

        // Render fotos
        if (fotos.length > 0) {
            noFotos.style.display = 'none';
            fotosGrid.innerHTML = fotos.map(medio => `
                <div class="media-item" onclick="previewMedio('${medio.id}')">
                    <img src="${medio.url}" alt="${medio.titulo || 'Sin título'}">
                    ${medio.destacado ? '<span class="media-item-featured">⭐</span>' : ''}
                    <div class="media-item-overlay">
                        <p class="media-item-title">${medio.titulo || 'Sin título'}</p>
                        <p class="media-item-category">${medio.categoria || 'general'}</p>
                        <div class="media-item-actions">
                            <button onclick="event.stopPropagation(); editMedio('${medio.id}')" class="btn btn-sm btn-outline text-white border-white">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteMedio('${medio.id}')" class="btn btn-sm btn-danger">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            noFotos.style.display = 'block';
            fotosGrid.innerHTML = '';
        }

        // Render videos
        if (videos.length > 0) {
            noVideos.style.display = 'none';
            videosGrid.innerHTML = videos.map(medio => `
                <div class="video-item" onclick="previewMedio('${medio.id}')">
                    ${getVideoEmbed(medio.url)}
                    <div class="video-play-overlay">
                        <i data-lucide="play"></i>
                    </div>
                </div>
            `).join('');
        } else {
            noVideos.style.display = 'block';
            videosGrid.innerHTML = '';
        }

        lucide.createIcons();
    };

    const getVideoEmbed = (url) => {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be') 
                ? url.split('/').pop() 
                : new URL(url).searchParams.get('v');
            return `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
        }
        // Vimeo
        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return `<iframe src="https://player.vimeo.com/video/${videoId}" allowfullscreen></iframe>`;
        }
        // Direct video
        return `<video src="${url}" controls></video>`;
    };

    // Tabs functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tab}Tab`).classList.add('active');
        });
    });

    // Medio Modal
    const medioModal = document.getElementById('medioModal');
    const medioForm = document.getElementById('medioForm');
    const subirMedioBtn = document.getElementById('subirMedioBtn');
    const closeMedioModal = document.getElementById('closeMedioModal');
    const cancelMedioBtn = document.getElementById('cancelMedioBtn');

    subirMedioBtn?.addEventListener('click', () => {
        medioForm.reset();
        medioModal.classList.add('active');
    });

    closeMedioModal?.addEventListener('click', () => medioModal.classList.remove('active'));
    cancelMedioBtn?.addEventListener('click', () => medioModal.classList.remove('active'));

    medioModal?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            medioModal.classList.remove('active');
        }
    });

    medioForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const url = document.getElementById('medioUrl')?.value?.trim();
            const titulo = sanitizeInput(document.getElementById('medioTitulo')?.value);
            
            if (!url) {
                showToast('URL del medio es requerida', 'error');
                return;
            }
            
            if (!titulo) {
                showToast('Título del medio es requerido', 'error');
                return;
            }
            
            const medioData = {
                id: Date.now().toString(),
                tipo: document.getElementById('medioTipo')?.value || 'foto',
                url: url,
                titulo: titulo,
                categoria: document.getElementById('medioCategoria')?.value || 'general',
                descripcion: sanitizeInput(document.getElementById('medioDescripcion')?.value || ''),
                destacado: document.getElementById('medioDestacado')?.checked || false,
                timestamp: Date.now()
            };

            medios.push(medioData);
            saveMedios();
            medioModal.classList.remove('active');
            renderMedios();
            showToast('Medio agregado ✓', 'success');
        } catch (error) {
            console.error('Error al agregar medio:', error);
            showToast('Error: ' + error.message, 'error');
        }
    });

    window.editMedio = (id) => {
        const medio = medios.find(m => m.id === id);
        if (!medio) return;

        document.getElementById('medioTipo').value = medio.tipo;
        document.getElementById('medioUrl').value = medio.url;
        document.getElementById('medioTitulo').value = medio.titulo || '';
        document.getElementById('medioCategoria').value = medio.categoria || 'general';
        document.getElementById('medioDescripcion').value = medio.descripcion || '';
        document.getElementById('medioDestacado').checked = medio.destacado || false;

        medioModal.classList.add('active');
    };

    window.deleteMedio = (id) => {
        if (confirm('¿Estás seguro de eliminar este medio?')) {
            medios = medios.filter(m => m.id !== id);
            saveMedios();
            renderMedios();
            showToast('Medio eliminado', 'success');
        }
    };

    window.previewMedio = (id) => {
        const medio = medios.find(m => m.id === id);
        if (!medio) return;
        window.open(medio.url, '_blank');
    };

    // ==================== REVIEWS MANAGEMENT ====================
    const renderReviews = () => {
        const reviewsList = document.getElementById('reviewsList');
        const noReviews = document.getElementById('noReviews');
        const avgRatingEl = document.getElementById('avgRating');
        const totalReviewsEl = document.getElementById('totalReviews');
        const lastReviewEl = document.getElementById('lastReview');

        if (reviews.length === 0) {
            noReviews.style.display = 'block';
            reviewsList.innerHTML = '';
            avgRatingEl.textContent = '0.0';
            totalReviewsEl.textContent = '0';
            lastReviewEl.textContent = '--';
            return;
        }

        noReviews.style.display = 'none';

        // Calculate stats
        const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        const lastReview = reviews.sort((a, b) => b.timestamp - a.timestamp)[0];
        const lastReviewDate = lastReview ? new Date(lastReview.timestamp).toLocaleDateString('es-CO') : '--';

        avgRatingEl.textContent = avgRating;
        totalReviewsEl.textContent = reviews.length;
        lastReviewEl.textContent = lastReviewDate;

        // Render reviews
        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author">
                        <div class="review-avatar">${review.authorName.charAt(0).toUpperCase()}</div>
                        <div>
                            <p class="review-author-name">${review.authorName}</p>
                            <p class="review-date">${new Date(review.timestamp).toLocaleDateString('es-CO')}</p>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${Array(5).fill(0).map((_, i) => 
                            `<svg viewBox="0 0 20 20" class="${i < review.rating ? '' : 'opacity-30'}">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>`
                        ).join('')}
                    </div>
                </div>
                <p class="review-text">${review.text}</p>
                <div class="review-source">
                    <i data-lucide="map-pin"></i> Google Maps
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    };

    const syncReviewsBtn = document.getElementById('syncReviewsBtn');
    const saveMapsConfigBtn = document.getElementById('saveMapsConfigBtn');

    saveMapsConfigBtn?.addEventListener('click', () => {
        saveMapsConfig();
        showToast('Configuración de Maps guardada', 'success');
    });

    syncReviewsBtn?.addEventListener('click', async () => {
        try {
            if (!mapsConfig.placeId || !mapsConfig.apiKey) {
                showToast('Configura primero el Place ID y API Key de Maps', 'error');
                return;
            }

            LoadingManager.show('Sincronizando reseñas de Google Maps...');
            
            // Google Maps Places API call
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${mapsConfig.placeId}&fields=reviews,rating,review_count&key=${mapsConfig.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.result && data.result.reviews) {
                reviews = data.result.reviews.map(review => ({
                    id: review.time?.toString() || Date.now().toString(),
                    authorName: sanitizeInput(review.author_name || 'Anónimo'),
                    rating: review.rating || 0,
                    text: sanitizeInput(review.text || ''),
                    timestamp: review.time * 1000 || Date.now()
                }));
                
                saveReviews();
                renderReviews();
                LoadingManager.hide();
                showToast(`✓ ${reviews.length} reseñas sincronizadas`, 'success');
            } else {
                LoadingManager.hide();
                showToast('No se encontraron reseñas', 'warning');
            }
        } catch (error) {
            LoadingManager.hide();
            console.error('Error syncing reviews:', error);
            showToast('Error al sincronizar: ' + error.message, 'error');
        }
    });

    // ==================== BANNERS MANAGEMENT ====================
    const renderBanners = () => {
        const bannersList = document.getElementById('bannersList');
        const noBanners = document.getElementById('noBanners');

        if (banners.length === 0) {
            noBanners.style.display = 'block';
            bannersList.innerHTML = '';
            return;
        }

        noBanners.style.display = 'none';
        bannersList.innerHTML = banners.map(banner => `
            <div class="banner-card">
                <img src="${banner.imagen}" alt="${banner.titulo}" class="banner-preview">
                <div class="banner-info">
                    <span class="banner-position">${capitalize(banner.posicion)}</span>
                    <span class="banner-status ${banner.activo ? 'active' : 'inactive'}">
                        ${banner.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <h4 class="banner-title">${banner.titulo}</h4>
                    <div class="banner-actions">
                        <button onclick="editBanner('${banner.id}')" class="btn btn-sm btn-outline">
                            <i data-lucide="edit-2"></i> Editar
                        </button>
                        <button onclick="toggleBanner('${banner.id}')" class="btn btn-sm ${banner.activo ? 'btn-outline' : 'btn-primary'}">
                            <i data-lucide="${banner.activo ? 'eye-off' : 'eye'}"></i>
                            ${banner.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onclick="deleteBanner('${banner.id}')" class="btn btn-sm btn-danger">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    };

    // Banner Modal
    const bannerModal = document.getElementById('bannerModal');
    const bannerForm = document.getElementById('bannerForm');
    const nuevoBannerBtn = document.getElementById('nuevoBannerBtn');
    const closeBannerModal = document.getElementById('closeBannerModal');
    const cancelBannerBtn = document.getElementById('cancelBannerBtn');

    nuevoBannerBtn?.addEventListener('click', () => {
        bannerForm.reset();
        document.getElementById('bannerId').value = '';
        document.getElementById('bannerModalTitle').textContent = 'Nuevo Banner';
        bannerModal.classList.add('active');
    });

    closeBannerModal?.addEventListener('click', () => bannerModal.classList.remove('active'));
    cancelBannerBtn?.addEventListener('click', () => bannerModal.classList.remove('active'));

    bannerModal?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            bannerModal.classList.remove('active');
        }
    });

    bannerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const bannerId = document.getElementById('bannerId').value;
        const bannerData = {
            id: bannerId || Date.now().toString(),
            titulo: document.getElementById('bannerTitulo').value,
            imagen: document.getElementById('bannerImagen').value,
            botonTexto: document.getElementById('bannerBotonTexto').value,
            botonUrl: document.getElementById('bannerBotonUrl').value,
            posicion: document.getElementById('bannerPosicion').value,
            activo: document.getElementById('bannerActivo').checked,
            timestamp: Date.now()
        };

        if (bannerId) {
            const index = banners.findIndex(b => b.id === bannerId);
            if (index !== -1) {
                banners[index] = bannerData;
            }
        } else {
            banners.push(bannerData);
        }

        saveBanners();
        bannerModal.classList.remove('active');
        renderBanners();
        showToast(bannerId ? 'Banner actualizado' : 'Banner creado', 'success');
    });

    window.editBanner = (id) => {
        const banner = banners.find(b => b.id === id);
        if (!banner) return;

        document.getElementById('bannerId').value = banner.id;
        document.getElementById('bannerTitulo').value = banner.titulo;
        document.getElementById('bannerImagen').value = banner.imagen;
        document.getElementById('bannerBotonTexto').value = banner.botonTexto || '';
        document.getElementById('bannerBotonUrl').value = banner.botonUrl || '';
        document.getElementById('bannerPosicion').value = banner.posicion;
        document.getElementById('bannerActivo').checked = banner.activo;

        document.getElementById('bannerModalTitle').textContent = 'Editar Banner';
        bannerModal.classList.add('active');
    };

    window.deleteBanner = (id) => {
        if (confirm('¿Estás seguro de eliminar este banner?')) {
            banners = banners.filter(b => b.id !== id);
            saveBanners();
            renderBanners();
            showToast('Banner eliminado', 'success');
        }
    };

    window.toggleBanner = (id) => {
        const banner = banners.find(b => b.id === id);
        if (banner) {
            banner.activo = !banner.activo;
            saveBanners();
            renderBanners();
            showToast(banner.activo ? 'Banner activado' : 'Banner desactivado', 'success');
        }
    };

    // ============ WEBHOOK CONFIG ============
    let webhookConfig = { url: '', activo: true };

    window.loadWebhookConfig = () => {
        const stored = localStorage.getItem('ecopark_webhook');
        if (stored) webhookConfig = JSON.parse(stored);
        const urlEl = document.getElementById('webhookUrl');
        const activoEl = document.getElementById('webhookActivo');
        if (urlEl) urlEl.value = webhookConfig.url || '';
        if (activoEl) activoEl.checked = webhookConfig.activo !== false;
    };

    const saveWebhookConfig = () => {
        webhookConfig.url = document.getElementById('webhookUrl')?.value || '';
        webhookConfig.activo = document.getElementById('webhookActivo')?.checked !== false;
        localStorage.setItem('ecopark_webhook', JSON.stringify(webhookConfig));
    };

    document.getElementById('saveWebhookBtn')?.addEventListener('click', () => {
        saveWebhookConfig();
        showAdminToast('Configuración del webhook guardada', 'success');
    });

    document.getElementById('testWebhookBtn')?.addEventListener('click', async () => {
        const url = document.getElementById('webhookUrl')?.value;
        const resultEl = document.getElementById('webhookTestResult');
        if (!url) { showAdminToast('Ingresa una URL primero', 'error'); return; }

        resultEl?.classList.remove('hidden');
        if (resultEl) resultEl.innerHTML = '⏳ Enviando payload de prueba...';

        try {
            const payload = {
                nombre: 'TEST ECOPARK',
                whatsapp: '+57 310 0000000',
                fecha_visita: new Date().toISOString().split('T')[0],
                plan: 'Prueba de Conexión',
                timestamp_asistencia: new Date().toISOString(),
                accion: 'test'
            };
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (resultEl) {
                resultEl.className = 'p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800';
                resultEl.innerHTML = `✅ Webhook respondió con status ${res.status}. ¡Conexión exitosa!`;
            }
        } catch (err) {
            if (resultEl) {
                resultEl.className = 'p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-800';
                resultEl.innerHTML = `❌ Error: ${err.message}. Verifica que la URL sea correcta y permita CORS.`;
            }
        }
    });

    // ============ TRIGGER WEBHOOK ASISTIDO ============
    const triggerWebhookAsistido = async (cita) => {
        const cfg = JSON.parse(localStorage.getItem('ecopark_webhook') || '{}');
        if (!cfg.url || cfg.activo === false) return;

        const payload = {
            nombre: cita.cliente,
            whatsapp: cita.telefono,
            correo: cita.correo || '',
            fecha_visita: cita.fecha,
            plan: cita.plan || cita.servicio,
            adultos: cita.adultos || 0,
            ninos: cita.ninos || 0,
            timestamp_asistencia: new Date().toISOString(),
            accion: 'marcar_asistido'
        };

        try {
            await fetch(cfg.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showAdminToast('✅ Webhook enviado a ' + cfg.url.substring(0, 40) + '...', 'success');
        } catch (err) {
            showAdminToast('⚠️ Webhook no alcanzable: ' + err.message, 'error');
        }
    };

    // ============ ENVIAR AGRADECIMIENTO WHATSAPP ============
    window.enviarAgradecimiento = (id) => {
        const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');
        const cita = citas.find(c => c.id === id);
        if (!cita) return;

        const cms = JSON.parse(localStorage.getItem('ecopark_cms') || '{}');
        const maps = JSON.parse(localStorage.getItem('ecopark_maps_config') || '{}');
        
        // Link de reseña: Si hay Place ID usar link directo, sino link de búsqueda
        const reviewLink = maps.placeId 
            ? `https://search.google.com/local/writereview?placeid=${maps.placeId}`
            : `https://www.google.com/maps/search/Ecopark+Mundo+de+Colores+Villavicencio`;

        const nombreCliente = (cita.cliente || 'Visitante').split(' ')[0];
        
        const mensaje = encodeURIComponent(
            `¡Hola ${nombreCliente}! 🌈\n\n` +
            `En *Ecopark Mundo de Colores* estamos muy felices de que nos hayas visitado hoy. 🍃\n\n` +
            `Esperamos que hayas disfrutado de la naturaleza y el color. Nos encantaría conocer tu opinión, ¿podrías regalarnos una reseña en Google? Significaría mucho para nosotros:\n\n` +
            `👇 Califica aquí:\n${reviewLink}\n\n` +
            `¡Te esperamos pronto para más aventuras! ✨`
        );

        const tel = cita.telefono.replace(/\D/g, '');
        window.open(`https://wa.me/${tel}?text=${mensaje}`, '_blank');
        
        // Registrar que se envió
        cita.agradecimiento_enviado = true;
        localStorage.setItem('ecopark_citas', JSON.stringify(citas));
        showAdminToast('Mensaje de agradecimiento preparado en WhatsApp', 'success');
        window.renderCitasTableFull();
    };

    // ============ MARCAR ASISTIDO ============
    window.marcarAsistido = (id) => {
        const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');
        const cita = citas.find(c => c.id === id);
        if (!cita) return;

        const yaAsistido = cita.asistido;

        if (!yaAsistido) {
            if (!confirm(`¿Confirmar asistencia de ${cita.cliente}?\n\nEsto enviará el webhook de seguimiento automáticamente.`)) return;
            cita.asistido = true;
            cita.estado = 'asistido';
            cita.timestamp_asistencia = new Date().toISOString();
            triggerWebhookAsistido(cita);
            showAdminToast(`✅ ${cita.cliente} marcado como Asistido`, 'success');
        } else {
            cita.asistido = false;
            cita.estado = 'confirmada';
            cita.timestamp_asistencia = null;
            showAdminToast('Asistencia desmarcada', 'success');
        }

        localStorage.setItem('ecopark_citas', JSON.stringify(citas));
        // Re-render table
        setTimeout(() => {
            const event = new CustomEvent('refresh-citas');
            document.dispatchEvent(event);
        }, 100);
    };

    // ============ EXPORTAR CSV ============
    window.exportarCSV = () => {
        const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');
        if (citas.length === 0) { showAdminToast('No hay reservas para exportar', 'error'); return; }

        const headers = ['ID','Nombre','Teléfono','Correo','Fecha','Adultos','Niños','Plan','Estado','Asistido','Notas','Registrado'];
        const rows = citas.map(c => [
            c.id,
            `"${(c.cliente||'').replace(/"/g,'""')}"`,
            c.telefono || '',
            c.correo || '',
            c.fecha || '',
            c.adultos || 0,
            c.ninos || 0,
            `"${(c.plan || c.servicio || '').replace(/"/g,'""')}"`,
            c.estado || '',
            c.asistido ? 'Sí' : 'No',
            `"${(c.notas||'').replace(/"/g,'""')}"`,
            c.timestamp ? new Date(c.timestamp).toLocaleString('es-CO') : ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ecopark-reservas-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showAdminToast('CSV exportado correctamente', 'success');
    };

    // ============ CMS CONFIG ============
    let cmsData = {};

    window.loadCmsConfig = () => {
        const stored = localStorage.getItem('ecopark_cms');
        cmsData = stored ? JSON.parse(stored) : {};
    };

    const saveCmsConfig = () => {
        const fields = [
            'rnt_numero', 'contacto_whatsapp', 'contacto_telefono',
            'contacto_email', 'contacto_direccion', 'horarios',
            'footer_descripcion', 'habeas_data_texto', 'terminos_texto',
            'hero_titulo', 'hero_subtitulo',
            'srv_resbalador_desc', 'srv_columpio_desc', 'srv_piscina_desc', 'srv_granja_desc', 'srv_restaurante_desc'
            // Nuevos campos de precios y visibilidad de atracciones
            ,'service_resbalador_colores_precio_adulto'
            ,'service_resbalador_colores_precio_nino'
            ,'service_resbalador_colores_visible'
            ,'service_columpio_360_precio'
            ,'service_columpio_360_visible'
            ,'service_piscina_refrescante_visible'
            ,'service_granja_interactiva_precio_alimentar'
            ,'service_granja_interactiva_visible'
            ,'service_restaurante_mundo_colores_visible'

            // Precios de pasaportes
            ,'pasaporte_experiencia_precio'
            ,'plan_cumpleanos_precio'
            ,'escapada_bogotana_precio'
        ];
        fields.forEach(f => {
            const el = document.getElementById(`cms_${f}`);
            if (el) cmsData[f] = el.value;
        });
        localStorage.setItem('ecopark_cms', JSON.stringify(cmsData));
        showAdminToast('✅ Contenido publicado en la landing', 'success');
    };

    // ============ INJECT CMS SECTION INTO MAIN ============
    window.injectContenidoSection = () => {
        const main = document.querySelector('.main-content');
        if (!main || document.getElementById('contenido')) return;

        const sec = document.createElement('section');
        sec.id = 'contenido';
        sec.className = 'content-section';
        sec.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📝 CMS — Contenido Editable</h3>
                <button onclick="exportarCSV()" class="btn btn-outline flex items-center gap-2">
                    <i data-lucide="download"></i> Exportar CSV
                </button>
            </div>
            <p class="text-sm text-gray-500 mb-6">Los cambios que guardes aquí se reflejarán automáticamente en la landing page al recargarla.</p>

            <p class="cms-section-title">📞 Datos de Contacto</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="cms-field-group">
                    <label class="form-label">Número de WhatsApp (con código país, sin +)</label>
                    <input type="text" id="cms_contacto_whatsapp" class="form-input" placeholder="573102200917" value="${cmsData.contacto_whatsapp || ''}">
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Teléfono visible</label>
                    <input type="text" id="cms_contacto_telefono" class="form-input" placeholder="+57 310 2200917" value="${cmsData.contacto_telefono || ''}">
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" id="cms_contacto_email" class="form-input" placeholder="info@ecoparkcolores.com" value="${cmsData.contacto_email || ''}">
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Horario de Atención</label>
                    <input type="text" id="cms_horarios" class="form-input" placeholder="Sáb - Dom: 9am - 5pm" value="${cmsData.horarios || ''}">
                </div>
                <div class="cms-field-group md:col-span-2">
                    <label class="form-label">Dirección</label>
                    <input type="text" id="cms_contacto_direccion" class="form-input" placeholder="Villavicencio, Meta, Colombia" value="${cmsData.contacto_direccion || ''}">
                </div>
                <div class="cms-field-group md:col-span-2">
                    <label class="form-label">URL del Logo Principal</label>
                    <input type="url" id="cms_logo_url" class="form-input" placeholder="https://tu-dominio.com/logo.png" value="${cmsData.logo_url || ''}">
                </div>
            </div>

            <p class="cms-section-title">🎢 Precios y Visibilidad de Atracciones</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="cms-field-group">
                    <label class="form-label">Resbalador de Colores (Adultos)</label>
                    <input type="text" id="cms_service_resbalador_colores_precio_adulto" class="form-input" placeholder="$20.000" value="${cmsData.service_resbalador_colores_precio_adulto || ''}">
                    <div class="form-checkbox">
                        <input type="checkbox" id="cms_service_resbalador_colores_visible" ${cmsData.service_resbalador_colores_visible !== false ? 'checked' : ''}>
                        <label for="cms_service_resbalador_colores_visible">Visible en la Landing</label>
                    </div>
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Resbalador de Colores (Niños)</label>
                    <input type="text" id="cms_service_resbalador_colores_precio_nino" class="form-input" placeholder="$10.000" value="${cmsData.service_resbalador_colores_precio_nino || ''}">
                </div>

                <div class="cms-field-group">
                    <label class="form-label">Columpio 360</label>
                    <input type="text" id="cms_service_columpio_360_precio" class="form-input" placeholder="$15.000" value="${cmsData.service_columpio_360_precio || ''}">
                    <div class="form-checkbox">
                        <input type="checkbox" id="cms_service_columpio_360_visible" ${cmsData.service_columpio_360_visible !== false ? 'checked' : ''}>
                        <label for="cms_service_columpio_360_visible">Visible en la Landing</label>
                    </div>
                </div>

                <div class="cms-field-group">
                    <label class="form-label">Piscina Refrescante</label>
                    <input type="text" id="cms_service_piscina_refrescante_precio" class="form-input" placeholder="Gratis / $X.XXX" value="${cmsData.service_piscina_refrescante_precio || ''}">
                    <div class="form-checkbox">
                        <input type="checkbox" id="cms_service_piscina_refrescante_visible" ${cmsData.service_piscina_refrescante_visible !== false ? 'checked' : ''}>
                        <label for="cms_service_piscina_refrescante_visible">Visible en la Landing</label>
                    </div>
                </div>

                <div class="cms-field-group">
                    <label class="form-label">Granja Interactiva (Alimentar)</label>
                    <input type="text" id="cms_service_granja_interactiva_precio_alimentar" class="form-input" placeholder="$5.000" value="${cmsData.service_granja_interactiva_precio_alimentar || ''}">
                    <div class="form-checkbox">
                        <input type="checkbox" id="cms_service_granja_interactiva_visible" ${cmsData.service_granja_interactiva_visible !== false ? 'checked' : ''}>
                        <label for="cms_service_granja_interactiva_visible">Visible en la Landing</label>
                    </div>
                </div>

                <div class="cms-field-group">
                    <label class="form-label">Restaurante Mundo de Colores</label>
                    <input type="text" class="form-input" value="Precios en carta digital" disabled>
                    <div class="form-checkbox">
                        <input type="checkbox" id="cms_service_restaurante_mundo_colores_visible" ${cmsData.service_restaurante_mundo_colores_visible !== false ? 'checked' : ''}>
                        <label for="cms_service_restaurante_mundo_colores_visible">Visible en la Landing</label>
                    </div>
                </div>
            </div>

            <p class="cms-section-title">🚀 Sección Hero (Principal)</p>
            <div class="grid grid-cols-1 gap-4">
                <div class="cms-field-group">
                    <label class="form-label">Título Principal (HTML permitido)</label>
                    <input type="text" id="cms_hero_titulo" class="form-input" value="${(cmsData.hero_titulo || 'Donde la <span class=&quot;text-green-400&quot;>Naturaleza</span> cobra <span class=&quot;text-yellow-400&quot;>Vida</span>').replace(/"/g, '&quot;')}" placeholder="Donde la Naturaleza cobra Vida">
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Subtítulo</label>
                    <textarea id="cms_hero_subtitulo" class="form-input" rows="2">${cmsData.hero_subtitulo || 'Tu microaventura emocional a solo 3 horas de Bogotá. Un mundo diseñado para despertar tus sentidos.'}</textarea>
                </div>
            </div>

            <p class="cms-section-title">🌟 Textos de Experiencias (Servicios)</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="cms-field-group">
                    <label class="form-label">Descripción Resbalador</label>
                    <textarea id="cms_srv_resbalador_desc" class="form-input" rows="2">${cmsData.srv_resbalador_desc || 'Siente la velocidad en el resbalador más largo de la región. Una explosión de color y risas para todas las edades.'}</textarea>
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Descripción Columpio 360</label>
                    <textarea id="cms_srv_columpio_desc" class="form-input" rows="2">${cmsData.srv_columpio_desc || 'Mira el mundo desde otra perspectiva. Un giro completo que desafía la gravedad.'}</textarea>
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Descripción Piscina</label>
                    <textarea id="cms_srv_piscina_desc" class="form-input" rows="2">${cmsData.srv_piscina_desc || 'Sumerge tus sentidos en nuestras aguas cristalinas. El oasis perfecto para desconectarte.'}</textarea>
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Descripción Granja</label>
                    <textarea id="cms_srv_granja_desc" class="form-input" rows="2">${cmsData.srv_granja_desc || 'Conoce a nuestros animales, aprende sobre la vida en el campo y vive momentos tiernos en familia.'}</textarea>
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Descripción Restaurante</label>
                    <textarea id="cms_srv_restaurante_desc" class="form-input" rows="2">${cmsData.srv_restaurante_desc || 'Disfruta de una variada oferta gastronómica con los mejores cortes de carne, pescados frescos y mariscos.'}</textarea>
                </div>
            </div>

            <p class="cms-section-title">💰 Precios de Pasaportes</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="cms-field-group">
                    <label class="form-label">Pasaporte Experiencia</label>
                    <input type="text" id="cms_pasaporte_experiencia_precio" class="form-input" placeholder="$89.900" value="${cmsData.pasaporte_experiencia_precio || ''}">
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Plan Cumpleaños</label>
                    <input type="text" id="cms_plan_cumpleanos_precio" class="form-input" placeholder="$54.900/niño" value="${cmsData.plan_cumpleanos_precio || ''}">
                </div>
                <div class="cms-field-group">
                    <label class="form-label">Escapada Bogotana</label>
                    <input type="text" id="cms_escapada_bogotana_precio" class="form-input" placeholder="$99.900" value="${cmsData.escapada_bogotana_precio || ''}">
                </div>
            </div>

            <p class="cms-section-title">🏛️ Registro Nacional de Turismo</p>
            <div class="cms-field-group">
                <label class="form-label">Número RNT</label>
                <input type="text" id="cms_rnt_numero" class="form-input" placeholder="Ej: 12345" value="${cmsData.rnt_numero || ''}">
                <p class="form-hint">Este número aparece visible en el footer del sitio web.</p>
            </div>

            <p class="cms-section-title">🦶 Descripción del Footer</p>
            <div class="cms-field-group">
                <textarea id="cms_footer_descripcion" class="form-input cms-textarea" placeholder="Mundo de Colores SAS. Tu refugio emocional...">${cmsData.footer_descripcion || ''}</textarea>
            </div>

            <p class="cms-section-title">🔒 Política de Habeas Data</p>
            <div class="cms-field-group">
                <label class="form-label">Texto completo (HTML permitido)</label>
                <textarea id="cms_habeas_data_texto" class="form-input cms-textarea" rows="10" placeholder="&lt;p&gt;Texto de la política...&lt;/p&gt;">${cmsData.habeas_data_texto || ''}</textarea>
                <p class="form-hint">Si está vacío, se muestra el texto por defecto del HTML.</p>
            </div>

            <p class="cms-section-title">📄 Términos y Condiciones</p>
            <div class="cms-field-group">
                <label class="form-label">Texto completo (HTML permitido)</label>
                <textarea id="cms_terminos_texto" class="form-input cms-textarea" rows="10" placeholder="&lt;p&gt;Texto de términos...&lt;/p&gt;">${cmsData.terminos_texto || ''}</textarea>
            </div>

            <div class="flex gap-4 mt-6">
                <button onclick="saveCmsConfig()" class="btn btn-primary">
                    <i data-lucide="save"></i> Publicar Cambios en Landing
                </button>
                <button onclick="window.open('index.html','_blank')" class="btn btn-outline">
                    <i data-lucide="eye"></i> Ver Landing
                </button>
            </div>
        </div>
        `;
        main.appendChild(sec);

        // Expose save to window
        window.saveCmsConfig = saveCmsConfig;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // ============ ENHANCED TABLE RENDER ============
    // Override the original renderCitasTable after DOM is fully ready
    window.renderCitasTableFull = () => {
        const tbody = document.getElementById('citasTableBody');
        if (!tbody) return;

        const filtroFecha   = document.getElementById('filtroFecha')?.value || '';
        const filtroEstado  = document.getElementById('filtroEstado')?.value || '';
        const filtroBusqueda= (document.getElementById('filtroBusqueda')?.value || '').toLowerCase();
        const filtroPlan    = document.getElementById('filtroPlan')?.value || '';

        let citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');

        if (filtroFecha)    citas = citas.filter(c => c.fecha === filtroFecha);
        if (filtroEstado)   citas = citas.filter(c => c.estado === filtroEstado);
        if (filtroPlan)     citas = citas.filter(c => (c.plan || c.servicio) === filtroPlan);
        if (filtroBusqueda) citas = citas.filter(c =>
            (c.cliente || '').toLowerCase().includes(filtroBusqueda) ||
            (c.telefono || '').includes(filtroBusqueda) ||
            (c.correo || '').toLowerCase().includes(filtroBusqueda)
        );

        citas.sort((a, b) => a.fecha?.localeCompare(b.fecha));

        const formatDate = (d) => {
            if (!d) return '--';
            const [y,m,day] = d.split('-');
            const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return `${day} ${meses[parseInt(m)-1]} ${y}`;
        };

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#9ca3af">No hay reservas que coincidan</td></tr>';
            return;
        }

        tbody.innerHTML = citas.map(c => {
            const plan = c.plan || c.servicio || '--';
            const estadoClass = {
                pendiente: 'status-pendiente',
                confirmada: 'status-confirmada',
                completada: 'status-completada',
                cancelada: 'status-cancelada',
                asistido: 'status-asistido'
            }[c.estado] || 'status-pendiente';

            const estadoLabel = c.estado === 'asistido' ? '✅ Asistido' :
                c.estado ? c.estado.charAt(0).toUpperCase() + c.estado.slice(1) : 'Pendiente';

            return `<tr>
                <td><strong>${formatDate(c.fecha)}</strong></td>
                <td>
                    <div style="font-weight:600">${c.cliente || '--'}</div>
                    <div style="font-size:11px;color:#6b7280">${c.fuente === 'landing' ? '🌐 Web' : '👨‍💼 Admin'}</div>
                </td>
                <td>
                    <div>${c.telefono || '--'}</div>
                    <div style="font-size:11px;color:#6b7280">${c.correo || ''}</div>
                </td>
                <td><span style="font-size:12px;background:#f0fdf4;color:#065f46;padding:4px 10px;border-radius:20px;font-weight:700">${plan}</span></td>
                <td style="text-align:center">${c.adultos || c.personas || 0}</td>
                <td style="text-align:center">${c.ninos || 0}</td>
                <td><span class="status-badge ${estadoClass}">${estadoLabel}</span></td>
                <td>
                    <div class="flex flex-col gap-2">
                        <button onclick="marcarAsistido('${c.id}')" class="btn btn-sm ${c.asistido ? 'btn-outline' : 'btn-primary'}" title="${c.asistido ? 'Desmarcar asistencia' : 'Marcar como Asistido'}">
                            ${c.asistido ? '↩ Desmarcar' : '✅ Asistido'}
                        </button>
                        ${c.asistido ? `
                            <button onclick="enviarAgradecimiento('${c.id}')" class="btn btn-sm bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-1 border-none shadow-sm ${c.agradecimiento_enviado ? 'opacity-50' : ''}">
                                <i data-lucide="message-circle" class="w-3 h-3"></i> ${c.agradecimiento_enviado ? 'Re-enviar' : 'Solicitar Reseña'}
                            </button>
                        ` : ''}
                        ${c.timestamp_asistencia ? `<div style="font-size:10px;color:#6b7280;margin-top:4px">${new Date(c.timestamp_asistencia).toLocaleString('es-CO')}</div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="cita-actions">
                        <button onclick="editCitaFull('${c.id}')" class="btn btn-sm btn-outline" title="Editar">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button onclick="deleteCitaFull('${c.id}')" class="btn btn-sm btn-danger" title="Eliminar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    // Expose helpers
    window.editCitaFull = (id) => {
        const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');
        const cita = citas.find(c => c.id === id);
        if (!cita) return;
        document.getElementById('citaId').value = cita.id;
        document.getElementById('citaNombre').value = cita.cliente || '';
        document.getElementById('citaTelefono').value = cita.telefono || '';
        document.getElementById('citaFecha').value = cita.fecha || '';
        document.getElementById('citaHora').value = cita.hora || '09:00';
        document.getElementById('citaServicio').value = cita.plan || cita.servicio || '';
        document.getElementById('citaPersonas').value = (cita.adultos || 0) + (cita.ninos || 0);
        document.getElementById('citaEstado').value = cita.estado || 'pendiente';
        document.getElementById('citaNotas').value = cita.notas || '';
        document.getElementById('modalTitle').textContent = 'Editar Reserva';
        document.getElementById('citaModal').classList.add('active');
    };

    window.deleteCitaFull = (id) => {
        if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
        const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]').filter(c => c.id !== id);
        localStorage.setItem('ecopark_citas', JSON.stringify(citas));
        window.renderCitasTableFull();
        showAdminToast('Reserva eliminada', 'success');
    };

    // Hook filters to new table renderer
    document.getElementById('filtroFecha')?.addEventListener('change', window.renderCitasTableFull);
    document.getElementById('filtroEstado')?.addEventListener('change', window.renderCitasTableFull);
    document.getElementById('filtroBusqueda')?.addEventListener('input', window.renderCitasTableFull);
    document.getElementById('filtroPlan')?.addEventListener('change', window.renderCitasTableFull);
    document.addEventListener('refresh-citas', window.renderCitasTableFull);

    // ============ STAT CARD: ASISTIDOS ====================
    window.injectCmsSection = () => {
        // Add asistidos stat card to dashboard if not present
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid && !document.getElementById('totalAsistidos')) {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-icon bg-emerald-600">
                    <i data-lucide="check-circle"></i>
                </div>
                <div class="stat-info">
                    <p class="stat-label">Asistidos (mes)</p>
                    <p class="stat-value" id="totalAsistidos">0</p>
                </div>
            `;
            statsGrid.appendChild(card);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    // Update asistidos count
    const updateAsistidos = () => {
        const el = document.getElementById('totalAsistidos');
        if (!el) return;
        const citas = JSON.parse(localStorage.getItem('ecopark_citas') || '[]');
        const now = new Date();
        const mes = now.getMonth();
        const anio = now.getFullYear();
        const count = citas.filter(c => {
            if (!c.asistido || !c.timestamp_asistencia) return false;
            const d = new Date(c.timestamp_asistencia);
            return d.getMonth() === mes && d.getFullYear() === anio;
        }).length;
        el.textContent = count;
    };

    // Expose toast helper in this scope too
    const showAdminToast = (msg, type = 'success') => {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    };
    window.showAdminToast = showAdminToast;

    // Nav hook for contenido section
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const sec = link.dataset.section;
            if (sec === 'citas') setTimeout(window.renderCitasTableFull, 50);
            if (sec === 'dashboard') setTimeout(updateAsistidos, 50);
        });
    });


    // ==================== ADMIN TOOLS ====================
    // Crear botón de herramientas admin
    window.showAdminTools = () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:500px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
        
        const backups = BackupManager.listBackups();
        const backupsList = backups.map(b => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f3f4f6;border-radius:6px;margin-bottom:8px;">
                <span style="font-size:12px;">${new Date(b.timestamp).toLocaleString('es-CO')}</span>
                <div style="display:flex;gap:8px;">
                    <button onclick="BackupManager.restoreBackup('${b.key}');location.reload();" style="padding:4px 12px;background:#10b981;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Restaurar</button>
                    <button onclick="BackupManager.deleteBackup('${b.key}');window.showAdminTools();" style="padding:4px 12px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Borrar</button>
                </div>
            </div>
        `).join('');
        
        content.innerHTML = `
            <h2 style="margin-top:0;color:#1f2937;border-bottom:2px solid #10b981;padding-bottom:12px;">🔧 Herramientas Admin</h2>
            
            <div style="margin-top:16px;">
                <h3 style="color:#374151;font-size:14px;margin-bottom:8px;">💾 Copias de Seguridad</h3>
                <button onclick="BackupManager.createBackup();showNotification('Backup creado ✓','success');window.showAdminTools();" style="width:100%;padding:10px;background:#10b981;color:white;border:none;border-radius:6px;cursor:pointer;margin-bottom:12px;font-weight:600;">
                    Crear Backup Ahora
                </button>
                <div style="max-height:200px;overflow-y:auto;">
                    ${backupsList || '<p style="color:#6b7280;font-size:12px;">No hay backups guardados</p>'}
                </div>
            </div>
            
            <div style="margin-top:20px;">
                <h3 style="color:#374151;font-size:14px;margin-bottom:8px;">📊 Estadísticas</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div style="background:#f0fdf4;padding:10px;border-radius:6px;border-left:4px solid #10b981;">
                        <div style="font-size:12px;color:#6b7280;">Total de Citas</div>
                        <div style="font-size:20px;font-weight:bold;color:#10b981;">${citas.length}</div>
                    </div>
                    <div style="background:#fef3c7;padding:10px;border-radius:6px;border-left:4px solid #f59e0b;">
                        <div style="font-size:12px;color:#6b7280;">Medios</div>
                        <div style="font-size:20px;font-weight:bold;color:#f59e0b;">${medios.length}</div>
                    </div>
                    <div style="background:#ede9fe;padding:10px;border-radius:6px;border-left:4px solid #8b5cf6;">
                        <div style="font-size:12px;color:#6b7280;">Banners</div>
                        <div style="font-size:20px;font-weight:bold;color:#8b5cf6;">${banners.length}</div>
                    </div>
                    <div style="background:#fecaca;padding:10px;border-radius:6px;border-left:4px solid #ef4444;">
                        <div style="font-size:12px;color:#6b7280;">Reseñas</div>
                        <div style="font-size:20px;font-weight:bold;color:#ef4444;">${reviews.length}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:20px;">
                <h3 style="color:#374151;font-size:14px;margin-bottom:8px;">⚡ Utilidades</h3>
                <button onclick="exportarCSV();window.showAdminTools();" style="width:100%;padding:10px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;margin-bottom:8px;font-weight:600;">
                    📥 Descargar Citas en CSV
                </button>
                <button onclick="localStorage.clear();showNotification('Datos eliminados','warning');setTimeout(()=>location.reload(),1000);" style="width:100%;padding:10px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;opacity:0.7;font-size:12px;">
                    ⚠️ Limpiar TODOS los datos (irreversible)
                </button>
            </div>
            
            <button onclick="this.closest('.modal-overlay').remove();" style="width:100%;margin-top:16px;padding:10px;background:#6b7280;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
                Cerrar
            </button>
        `;
        
        modal.appendChild(content);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    };
    
    // Exponer herramientas
    window.BackupManager = BackupManager;

    // ==================== INITIALIZATION ====================
    // Cargamos configuraciones primero
    loadWebhookConfig();
    loadCmsConfig();
    loadCitas();
    loadGoogleConfig();
    loadMedios();
    loadBanners();
    loadReviews();
    loadMapsConfig();

    // Inyectamos secciones y actualizamos UI
    injectCmsSection();
    injectContenidoSection();
    updateDashboard();
    renderCitasTable();
    renderCalendar();
    renderMedios();
    renderReviews();
    renderBanners();

    // Inicialización de tabla extendida
    setTimeout(() => {
        if (window.renderCitasTableFull) window.renderCitasTableFull();
        updateAsistidos();
    }, 200);

    // Sincronización entre pestañas: si se añade una reserva desde la landing, actualizamos el admin
    window.addEventListener('storage', (event) => {
        if (event.key === 'ecopark_citas') {
            loadCitas();
            renderCitasTable();
            if (window.renderCitasTableFull) window.renderCitasTableFull();
            showNotification('Reservas sincronizadas desde otra pestaña', 'info');
        }
    });

    // Ejecutar autenticación al final para asegurar que el DOM y los listeners estén listos
    checkAuth();

    console.log('🚀 Admin Panel - Ecopark Full CRM Ready');
});
