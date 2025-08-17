/**
 * Reviews Management System
 * Handles review submission, display, and local storage
 */

class ReviewsManager {
    constructor() {
        this.reviews = this.loadReviews();
        this.currentRating = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderReviews();
        this.updateKPIs();
    }

    bindEvents() {
        // Star rating functionality
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.target.dataset.rating));
            });

            star.addEventListener('mouseenter', (e) => {
                this.highlightStars(parseInt(e.target.dataset.rating));
            });
        });

        // Reset star highlighting on mouse leave
        const starRating = document.getElementById('starRating');
        starRating.addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });

        // Form submission
        const form = document.getElementById('reviewForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });
    }

    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    submitReview() {
        const name = document.getElementById('reviewerName').value.trim();
        const comment = document.getElementById('reviewComment').value.trim();

        if (!name || !comment || this.currentRating === 0) {
            this.showError('Bitte füllen Sie alle Felder aus und wählen Sie eine Bewertung.');
            return;
        }

        const review = {
            id: Date.now(),
            name: name,
            rating: this.currentRating,
            comment: comment,
            date: new Date().toLocaleDateString('de-DE'),
            timestamp: Date.now()
        };

        this.reviews.unshift(review);
        this.saveReviews();
        this.renderReviews();
        this.updateKPIs();
        this.resetForm();
        this.showSuccess('Vielen Dank für Ihre Bewertung!');

        // Animate the new review
        setTimeout(() => {
            const firstReview = document.querySelector('.review-item');
            if (firstReview) {
                firstReview.classList.add('fade-in-up');
            }
        }, 100);
    }

    resetForm() {
        document.getElementById('reviewForm').reset();
        this.currentRating = 0;
        this.highlightStars(0);
    }

    showSuccess(message) {
        // Remove existing success message
        const existing = document.querySelector('.success-message');
        if (existing) {
            existing.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const form = document.getElementById('reviewForm');
        form.parentNode.insertBefore(successDiv, form);
        
        // Trigger animation
        setTimeout(() => successDiv.classList.add('show'), 10);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => successDiv.remove(), 300);
        }, 5000);
    }

    showError(message) {
        // Simple alert for now - could be enhanced with custom modal
        alert(message);
    }

    renderReviews() {
        const container = document.getElementById('reviewsList');
        
        if (this.reviews.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <p>Noch keine Bewertungen vorhanden.</p>
                    <p>Seien Sie der erste, der eine Bewertung abgibt!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="reviewer-name">${this.escapeHtml(review.name)}</span>
                    <div class="review-meta">
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                        <small style="color: var(--text-muted); margin-left: 1rem;">${review.date}</small>
                    </div>
                </div>
                <div class="review-comment">${this.escapeHtml(review.comment)}</div>
            </div>
        `).join('');
    }

    updateKPIs() {
        if (this.reviews.length === 0) return;

        // Calculate average rating
        const avgRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);

        // Update total reviews
        document.getElementById('totalReviews').textContent = this.reviews.length;

        // Calculate satisfaction rate (4+ stars)
        const satisfiedReviews = this.reviews.filter(review => review.rating >= 4).length;
        const satisfactionRate = (satisfiedReviews / this.reviews.length * 100).toFixed(0);
        document.getElementById('satisfactionRate').textContent = `${satisfactionRate}%`;

        // Simulate monthly growth (in real app, this would come from backend)
        const growth = Math.floor(Math.random() * 30) + 10;
        document.getElementById('monthlyGrowth').textContent = `+${growth}%`;
    }

    loadReviews() {
        try {
            const stored = localStorage.getItem('zk-ai-reviews');
            return stored ? JSON.parse(stored) : this.getDefaultReviews();
        } catch (error) {
            console.error('Error loading reviews:', error);
            return this.getDefaultReviews();
        }
    }

    saveReviews() {
        try {
            localStorage.setItem('zk-ai-reviews', JSON.stringify(this.reviews));
        } catch (error) {
            console.error('Error saving reviews:', error);
        }
    }

    getDefaultReviews() {
        return [
            {
                id: 1,
                name: "Maria Schmidt",
                rating: 5,
                comment: "Ausgezeichnete KI-Automatisierung! Hat unsere Kundeninteraktionen revolutioniert.",
                date: "15.12.2024",
                timestamp: Date.now() - 86400000
            },
            {
                id: 2,
                name: "Thomas Weber",
                rating: 4,
                comment: "Sehr professionelle Beratung und Implementation. Empfehlenswert!",
                date: "12.12.2024",
                timestamp: Date.now() - 259200000
            },
            {
                id: 3,
                name: "Anna Müller",
                rating: 5,
                comment: "Die KI-Chatbots funktionieren perfekt. Unser Team ist begeistert!",
                date: "10.12.2024",
                timestamp: Date.now() - 432000000
            },
            {
                id: 4,
                name: "Lars Nielsen",
                rating: 4,
                comment: "Innovative Lösungen und kompetente Umsetzung. Sehr zufrieden.",
                date: "08.12.2024",
                timestamp: Date.now() - 604800000
            }
        ];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get reviews data for analytics
    getReviewsData() {
        return this.reviews;
    }

    // Get rating distribution for charts
    getRatingDistribution() {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        this.reviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    }

    // Get monthly review counts (simulated)
    getMonthlyData() {
        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
        const data = [];
        
        for (let i = 0; i < months.length; i++) {
            data.push(Math.floor(Math.random() * 20) + 10);
        }
        
        return { months, data };
    }
}

// Initialize when DOM is loaded
let reviewsManager;
document.addEventListener('DOMContentLoaded', () => {
    reviewsManager = new ReviewsManager();
});