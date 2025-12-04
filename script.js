// GamesArc Main Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the platform
    GamesArcAuth.initAuth();
    
    // Check authentication on every page
    const currentUser = GamesArcAuth.getCurrentUser();
    
    // Update navigation based on auth state
    GamesArcAuth.updateNavigation();
    
    // Handle page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            // Homepage specific functions
            initializeHomepage();
            break;
        case 'games.html':
            // Games page
            initializeGamesPage();
            break;
        case 'profile.html':
            // Profile page
            initializeProfilePage();
            break;
        case 'gta-v.html':
        case 'elden-ring.html':
        case 'cyberpunk-2077.html':
        case 'red-dead-redemption-2.html':
        case 'the-witcher-3.html':
        case 'minecraft.html':
            // Individual game pages
            initializeGamePage();
            break;
        case 'membership.html':
            // Membership page
            initializeMembershipPage();
            break;
    }
});

function initializeHomepage() {
    // Stats animation
    const statElements = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseInt(element.textContent.replace(/,/g, ''));
                animateCounter(element, targetValue);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statElements.forEach(el => observer.observe(el));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 1500;
    const stepTime = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

function initializeGamesPage() {
    // Load all games
    const games = GamesArcDB.getAllGames();
    const container = document.getElementById('games-container');
    
    if (container) {
        container.innerHTML = games.map(game => `
            <div class="game-card">
                <img src="${game.image}" alt="${game.title}" class="game-image">
                <div class="game-content">
                    <h3 class="game-title">${game.title}</h3>
                    <div class="game-meta">
                        <span class="game-genre">${game.genre}</span>
                        <span class="game-rating">
                            <i class="fas fa-star"></i> ${game.rating}
                        </span>
                    </div>
                    <p class="game-size">Size: ${game.size}</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: var(--spacing-md);">
                        ${game.description.substring(0, 120)}...
                    </p>
                    <div class="game-stats">
                        <span class="game-downloads">${game.downloads.toLocaleString()} downloads</span>
                        <a href="${game.slug}.html" class="btn btn-primary btn-sm">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Setup search functionality
    const searchInput = document.getElementById('game-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredGames = games.filter(game => 
                game.title.toLowerCase().includes(searchTerm) ||
                game.genre.toLowerCase().includes(searchTerm)
            );
            
            container.innerHTML = filteredGames.map(game => `
                <div class="game-card">
                    <img src="${game.image}" alt="${game.title}" class="game-image">
                    <div class="game-content">
                        <h3 class="game-title">${game.title}</h3>
                        <div class="game-meta">
                            <span class="game-genre">${game.genre}</span>
                            <span class="game-rating">
                                <i class="fas fa-star"></i> ${game.rating}
                            </span>
                        </div>
                        <p class="game-size">Size: ${game.size}</p>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: var(--spacing-md);">
                            ${game.description.substring(0, 120)}...
                        </p>
                        <div class="game-stats">
                            <span class="game-downloads">${game.downloads.toLocaleString()} downloads</span>
                            <a href="${game.slug}.html" class="btn btn-primary btn-sm">
                                <i class="fas fa-download"></i> Download
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }
}

function initializeProfilePage() {
    const currentUser = GamesArcAuth.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update profile information
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-points').textContent = currentUser.points.toLocaleString();
    document.getElementById('profile-level').textContent = currentUser.level;
    document.getElementById('profile-join-date').textContent = currentUser.joinDate;
    document.getElementById('profile-downloads').textContent = currentUser.downloads || 0;
    
    // Set avatar initial
    const avatarInitial = currentUser.username.charAt(0).toUpperCase();
    document.querySelector('.profile-avatar').textContent = avatarInitial;
    
    // Update progress bar
    const progressPercent = (currentUser.points % 1000) / 10;
    document.getElementById('level-progress').style.width = `${progressPercent}%`;
    
    // Load achievements
    const achievementsContainer = document.getElementById('achievements-list');
    if (achievementsContainer) {
        achievementsContainer.innerHTML = currentUser.achievements.map(achievement => `
            <div class="achievement-card">
                <div class="achievement-icon">🏆</div>
                <h4>${achievement}</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Unlocked achievement</p>
            </div>
        `).join('');
    }
    
    // Load download history
    const downloads = GamesArcDB.getUserDownloads(currentUser.id);
    const downloadsContainer = document.getElementById('downloads-list');
    
    if (downloadsContainer && downloads.length > 0) {
        const db = GamesArcDB.getDB();
        downloadsContainer.innerHTML = downloads.slice(0, 5).map(download => {
            const game = db.games.find(g => g.id === download.gameId);
            if (!game) return '';
            
            const date = new Date(download.downloadedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm); border-bottom: 1px solid var(--border-color);">
                    <div>
                        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${game.title}</h4>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Downloaded on ${formattedDate}</p>
                    </div>
                    <span style="color: var(--accent); font-weight: 600;">+10 pts</span>
                </div>
            `;
        }).join('');
    } else if (downloadsContainer) {
        downloadsContainer.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-lg); color: var(--text-muted);">
                <i class="fas fa-download" style="font-size: 2rem; margin-bottom: var(--spacing-sm);"></i>
                <p>No downloads yet. Start downloading games to earn points!</p>
            </div>
        `;
    }
}

function initializeGamePage() {
    const currentUser = GamesArcAuth.getCurrentUser();
    const gameSlug = window.location.pathname.split('/').pop().replace('.html', '');
    const game = GamesArcDB.getGameBySlug(gameSlug);
    
    if (!game) {
        window.location.href = 'games.html';
        return;
    }
    
    // Update page title and content
    document.title = `${game.title} | GamesArc`;
    
    // Set game information
    const elements = {
        'game-title': game.title,
        'game-description': game.description,
        'game-genre': game.genre,
        'game-size': game.size,
        'game-rating': game.rating,
        'game-downloads': game.downloads.toLocaleString(),
        'game-image': game.image
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'game-image') {
                element.src = game.image;
                element.alt = game.title;
            } else {
                element.textContent = elements[id];
            }
        }
    });
    
    // Set system requirements
    const requirementsContainer = document.getElementById('game-requirements');
    if (requirementsContainer && game.requirements) {
        requirementsContainer.innerHTML = `
            <li><strong>OS:</strong> ${game.requirements.os}</li>
            <li><strong>Processor:</strong> ${game.requirements.processor}</li>
            <li><strong>Memory:</strong> ${game.requirements.memory}</li>
            <li><strong>Graphics:</strong> ${game.requirements.graphics}</li>
            <li><strong>Storage:</strong> ${game.requirements.storage}</li>
        `;
    }
    
    // Setup download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const result = GamesArcAuth.downloadGame(game.id);
            
            if (result.success) {
                GamesArcAuth.showNotification(result.message, 'success');
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                downloadBtn.disabled = true;
                downloadBtn.classList.remove('btn-primary');
                downloadBtn.classList.add('btn-secondary');
                
                // Update user points display
                GamesArcAuth.updateNavigation();
                
                // Simulate download progress
                simulateDownload();
            } else {
                GamesArcAuth.showNotification(result.message, 'danger');
                if (result.message.includes('login')) {
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            }
        });
    }
}

function simulateDownload() {
    const progressBar = document.createElement('div');
    progressBar.className = 'download-progress';
    progressBar.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-card);
        padding: var(--spacing-md);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        width: 300px;
        z-index: 10000;
        box-shadow: var(--shadow-lg);
    `;
    
    progressBar.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
            <h4 style="font-size: 1rem; margin: 0;">Downloading...</h4>
            <span class="progress-percent">0%</span>
        </div>
        <div style="height: 6px; background: var(--bg-darker); border-radius: 3px; overflow: hidden;">
            <div class="progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width 0.3s ease;"></div>
        </div>
    `;
    
    document.body.appendChild(progressBar);
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                progressBar.style.opacity = '0';
                progressBar.style.transform = 'translateY(20px)';
                setTimeout(() => progressBar.remove(), 300);
            }, 1000);
        }
        
        const progressBarElement = progressBar.querySelector('.progress-bar');
        const percentElement = progressBar.querySelector('.progress-percent');
        
        progressBarElement.style.width = `${progress}%`;
        percentElement.textContent = `${Math.floor(progress)}%`;
    }, 200);
}

function initializeMembershipPage() {
    const currentUser = GamesArcAuth.getCurrentUser();
    
    // Update user info if logged in
    if (currentUser) {
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.25rem;">${currentUser.username}</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${currentUser.points.toLocaleString()} points • Level ${currentUser.level}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}