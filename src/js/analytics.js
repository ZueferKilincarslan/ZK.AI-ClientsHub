/**
 * Analytics Dashboard System
 * Handles chart creation and data visualization
 */

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#8B5CF6',
            secondary: '#A855F7',
            accent: '#C084FC',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            text: '#FFFFFF',
            textSecondary: '#B8B8D4'
        };
    }

    init() {
        // Wait for reviews manager to initialize
        setTimeout(() => {
            this.createRatingChart();
            this.createMonthlyChart();
            this.createSatisfactionChart();
            this.createSourcesChart();
            this.setupChartAnimations();
        }, 500);
    }

    createRatingChart() {
        const ctx = document.getElementById('ratingChart').getContext('2d');
        const distribution = reviewsManager ? reviewsManager.getRatingDistribution() : { 1: 2, 2: 5, 3: 12, 4: 28, 5: 53 };

        this.charts.rating = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['1 Stern', '2 Sterne', '3 Sterne', '4 Sterne', '5 Sterne'],
                datasets: [{
                    data: Object.values(distribution),
                    backgroundColor: [
                        this.colors.error,
                        '#FF6B6B',
                        this.colors.warning,
                        this.colors.success,
                        this.colors.primary
                    ],
                    borderColor: '#1A1A2E',
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.colors.textSecondary,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    }

    createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        const monthlyData = reviewsManager ? reviewsManager.getMonthlyData() : 
            { months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'], data: [12, 19, 15, 25, 22, 30] };

        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.months,
                datasets: [{
                    label: 'Anzahl Reviews',
                    data: monthlyData.data,
                    borderColor: this.colors.primary,
                    backgroundColor: `${this.colors.primary}20`,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: this.colors.textSecondary
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: this.colors.textSecondary
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutCubic'
                }
            }
        });
    }

    createSatisfactionChart() {
        const ctx = document.getElementById('satisfactionChart').getContext('2d');
        
        this.charts.satisfaction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'Zufriedenheit %',
                    data: [89, 92, 96, 94],
                    backgroundColor: [
                        `${this.colors.primary}80`,
                        `${this.colors.secondary}80`,
                        `${this.colors.success}80`,
                        `${this.colors.accent}80`
                    ],
                    borderColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.success,
                        this.colors.accent
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: this.colors.textSecondary
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: this.colors.textSecondary,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    createSourcesChart() {
        const ctx = document.getElementById('sourcesChart').getContext('2d');
        
        this.charts.sources = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Website', 'Google', 'Empfehlungen', 'Social Media', 'Direct'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        `${this.colors.primary}80`,
                        `${this.colors.secondary}80`,
                        `${this.colors.success}80`,
                        `${this.colors.warning}80`,
                        `${this.colors.accent}80`
                    ],
                    borderColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.success,
                        this.colors.warning,
                        this.colors.accent
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.colors.textSecondary,
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: this.colors.textSecondary,
                            backdropColor: 'transparent'
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200
                }
            }
        });
    }

    setupChartAnimations() {
        // Animate charts on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartContainer = entry.target;
                    chartContainer.classList.add('fade-in-up');
                    
                    // Re-animate chart
                    const canvas = chartContainer.querySelector('canvas');
                    const chartId = canvas.id;
                    
                    if (this.charts[chartId.replace('Chart', '')]) {
                        this.charts[chartId.replace('Chart', '')].update('none');
                        setTimeout(() => {
                            this.charts[chartId.replace('Chart', '')].update();
                        }, 100);
                    }
                }
            });
        }, {
            threshold: 0.3
        });

        document.querySelectorAll('.chart-container').forEach(container => {
            observer.observe(container);
        });
    }

    updateCharts() {
        // Update charts when new reviews are added
        if (reviewsManager) {
            const distribution = reviewsManager.getRatingDistribution();
            const monthlyData = reviewsManager.getMonthlyData();
            
            if (this.charts.rating) {
                this.charts.rating.data.datasets[0].data = Object.values(distribution);
                this.charts.rating.update();
            }
            
            if (this.charts.monthly) {
                this.charts.monthly.data.datasets[0].data = monthlyData.data;
                this.charts.monthly.update();
            }
        }
    }

    // Method to refresh all charts
    refreshAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.update();
            }
        });
    }

    // Destroy all charts (useful for cleanup)
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Initialize analytics dashboard
let analyticsDashboard;
document.addEventListener('DOMContentLoaded', () => {
    analyticsDashboard = new AnalyticsDashboard();
    
    // Initialize charts after a short delay to ensure other scripts have loaded
    setTimeout(() => {
        analyticsDashboard.init();
    }, 1000);
});

// Update charts when reviews change
document.addEventListener('reviewsUpdated', () => {
    if (analyticsDashboard) {
        analyticsDashboard.updateCharts();
    }
});