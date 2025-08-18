// Advanced animations and interactive effects

document.addEventListener('DOMContentLoaded', function() {
    initParallaxEffects();
    initHoverEffects();
    initScrollReveal();
    initTypingAnimation();
    initFloatingElements();
});

// Parallax scrolling effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.dashboard-preview, .about-image');
    
    if (window.innerWidth > 768) { // Only on desktop
        window.addEventListener('scroll', throttle(function() {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.1;
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    }
}

// Enhanced hover effects
function initHoverEffects() {
    // Feature cards tilt effect
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mousemove', function(e) {
            if (window.innerWidth > 768) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Scroll reveal animations
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.section-header, .hero-text, .hero-visual');
    
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        revealObserver.observe(element);
    });
}

// Typing animation for hero title
function initTypingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const originalText = heroTitle.innerHTML;
    const words = originalText.split(' ');
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    
    // Only animate the gradient text part
    const gradientTextIndex = words.findIndex(word => word.includes('gradient-text'));
    if (gradientTextIndex === -1) return;
    
    const staticPart = words.slice(0, gradientTextIndex).join(' ') + ' ';
    const animatedWords = ['AutoFlow', 'Efficiency', 'Innovation', 'Success'];
    
    function typeWriter() {
        const currentWord = animatedWords[currentWordIndex];
        
        if (isDeleting) {
            currentCharIndex--;
        } else {
            currentCharIndex++;
        }
        
        const displayText = currentWord.substring(0, currentCharIndex);
        heroTitle.innerHTML = staticPart + `<span class="gradient-text">${displayText}</span>`;
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && currentCharIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentWordIndex = (currentWordIndex + 1) % animatedWords.length;
            typeSpeed = 500; // Pause before next word
        }
        
        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start animation after a delay
    setTimeout(typeWriter, 1000);
}

// Floating elements animation
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.workflow-card');
    
    floatingElements.forEach((element, index) => {
        const delay = index * 0.5;
        const duration = 3 + (index * 0.5);
        
        element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
}

// Smooth scroll progress indicator
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        z-index: 10000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrollPercent + '%';
    });
}

// Interactive dashboard preview
function initDashboardInteraction() {
    const dashboardPreview = document.querySelector('.dashboard-preview');
    if (!dashboardPreview) return;
    
    const workflowCards = dashboardPreview.querySelectorAll('.workflow-card');
    
    // Simulate real-time updates
    setInterval(() => {
        workflowCards.forEach(card => {
            const status = card.querySelector('.workflow-status');
            const info = card.querySelector('.workflow-info p');
            
            if (Math.random() > 0.7) { // 30% chance to update
                const executions = parseInt(info.textContent.match(/\d+/)[0]) + Math.floor(Math.random() * 5);
                const statusText = info.textContent.split('•')[0].trim();
                info.textContent = `${statusText} • ${executions.toLocaleString()} executions`;
                
                // Add pulse effect
                status.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    status.style.animation = '';
                }, 500);
            }
        });
    }, 5000);
}

// Mouse trail effect
function initMouseTrail() {
    if (window.innerWidth <= 768) return; // Skip on mobile
    
    const trail = [];
    const trailLength = 10;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: ${1 - (i / trailLength)};
            transition: opacity 0.1s ease;
        `;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        let x = mouseX;
        let y = mouseY;
        
        trail.forEach((dot, index) => {
            const nextDot = trail[index + 1] || trail[0];
            
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            
            if (nextDot) {
                x += (parseFloat(nextDot.style.left) - x) * 0.3;
                y += (parseFloat(nextDot.style.top) - y) * 0.3;
            }
        });
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// Add CSS for animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .feature-card {
        transform-style: preserve-3d;
    }
    
    .dashboard-preview {
        transform-style: preserve-3d;
    }
    
    /* Smooth scrolling for all browsers */
    html {
        scroll-behavior: smooth;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: var(--gray-100);
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--primary-dark);
    }
`;
document.head.appendChild(animationStyles);

// Initialize additional effects
setTimeout(() => {
    initScrollProgress();
    initDashboardInteraction();
    initMouseTrail();
}, 1000);

// Utility function for throttling
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}