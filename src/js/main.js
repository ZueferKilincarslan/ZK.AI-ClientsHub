/**
 * Main Application Controller
 * Handles global functionality, navigation, and UI interactions
 */

class ZKAIDashboard {
    constructor() {
        this.isLoaded = false;
        this.scrollThreshold = 100;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupScrollEffects();
        this.setupNavigation();
        this.setupAnimations();
        this.setupResponsiveHandlers();
        this.isLoaded = true;
    }

    bindEvents() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.scrollToElement(target);
                }
            });
        });

        // Window scroll event
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // ~60fps

        // Window resize event
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    setupScrollEffects() {
        // Navbar background on scroll
        const navbar = document.querySelector('.navbar');
        const hero = document.querySelector('.hero');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }, {
            rootMargin: '-100px 0px 0px 0px'
        });

        if (hero) {
            observer.observe(hero);
        }
    }

    setupNavigation() {
        // Active navigation highlighting
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;
                    
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section link
                    const activeLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupAnimations() {
        // Intersection Observer for animations
        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Elements to animate
        const animateElements = document.querySelectorAll('.kpi-card, .chart-container, .review-item');
        animateElements.forEach(el => {
            animateOnScroll.observe(el);
        });
    }

    setupResponsiveHandlers() {
        // Mobile menu toggle (if needed in future)
        this.isMobile = window.innerWidth <= 768;
        
        // Handle touch events for mobile
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Parallax effect for neural network
        const neuralNetwork = document.querySelector('.neural-network');
        if (neuralNetwork && scrollY < window.innerHeight) {
            const parallaxOffset = scrollY * 0.3;
            neuralNetwork.style.transform = `translate(-50%, -50%) translateY(${parallaxOffset}px)`;
        }

        // Update scroll progress indicator (if added)
        this.updateScrollProgress();
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // Refresh charts on significant resize
        if (wasMobile !== this.isMobile && window.analyticsDashboard) {
            setTimeout(() => {
                window.analyticsDashboard.refreshAllCharts();
            }, 300);
        }
    }

    handleKeyboardNavigation(e) {
        // ESC key functionality
        if (e.key === 'Escape') {
            // Close any open modals or dropdowns
            this.closeAllOverlays();
        }

        // Arrow key navigation for sections
        if (e.altKey) {
            switch (e.key) {
                case 'ArrowUp':
                    this.navigateToPreviousSection();
                    break;
                case 'ArrowDown':
                    this.navigateToNextSection();
                    break;
            }
        }
    }

    scrollToElement(element, offset = 80) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        // Update progress bar if it exists
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    }

    navigateToPreviousSection() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = this.getCurrentSectionIndex(sections);
        
        if (currentIndex > 0) {
            this.scrollToElement(sections[currentIndex - 1]);
        }
    }

    navigateToNextSection() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = this.getCurrentSectionIndex(sections);
        
        if (currentIndex < sections.length - 1) {
            this.scrollToElement(sections[currentIndex + 1]);
        }
    }

    getCurrentSectionIndex(sections) {
        const scrollPos = window.scrollY + 100;
        
        for (let i = sections.length - 1; i >= 0; i--) {
            if (sections[i].offsetTop <= scrollPos) {
                return i;
            }
        }
        return 0;
    }

    closeAllOverlays() {
        // Close any open modals, tooltips, etc.
        document.querySelectorAll('.modal.show, .tooltip.show').forEach(overlay => {
            overlay.classList.remove('show');
        });
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Public methods for external use
    refreshDashboard() {
        if (window.reviewsManager) {
            window.reviewsManager.updateKPIs();
        }
        if (window.analyticsDashboard) {
            window.analyticsDashboard.updateCharts();
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zkaiDashboard = new ZKAIDashboard();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZKAIDashboard;
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Dashboard Error:', e.error);
    
    // Optional: Send error to analytics
    if (window.gtag) {
        gtag('event', 'exception', {
            description: e.error.toString(),
            fatal: false
        });
    }
});

// Performance monitoring
if (window.performance && window.performance.mark) {
    window.performance.mark('dashboard-start');
    
    window.addEventListener('load', () => {
        window.performance.mark('dashboard-end');
        window.performance.measure('dashboard-init', 'dashboard-start', 'dashboard-end');
        
        const measure = window.performance.getEntriesByName('dashboard-init')[0];
        console.log(`Dashboard loaded in ${measure.duration.toFixed(2)}ms`);
    });
}