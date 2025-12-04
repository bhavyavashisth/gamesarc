// auth.js - Updated for new database
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.currentUser = GamesArcDB.getCurrentUser();
        this.updateUI();
        this.setupEventListeners();
    }
    
    async login(email, password) {
        try {
            const { user } = GamesArcDB.loginUser(email, password);
            this.currentUser = user;
            this.updateUI();
            this.showNotification(`Welcome back, ${user.username}!`, 'success');
            return true;
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }
    
    async register(userData) {
        try {
            const user = GamesArcDB.registerUser(userData);
            const { session } = GamesArcDB.loginUser(userData.email, userData.password);
            localStorage.setItem('auth_token', session.token);
            this.currentUser = user;
            this.updateUI();
            this.showNotification(`Welcome to GamesArc, ${user.username}! You got 100 bonus points!`, 'success');
            return true;
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }
    
    logout() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            GamesArcDB.logoutUser(token);
        }
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        this.updateUI();
        this.showNotification('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    async downloadGame(gameId, gameTitle) {
        if (!this.currentUser) {
            this.showNotification('Please login to download games', 'warning');
            return false;
        }
        
        try {
            const { user, download } = GamesArcDB.addDownload(this.currentUser.id, gameId, gameTitle);
            this.currentUser = user;
            this.updateUI();
            
            // Check for achievements
            const newBadges = user.badges.filter(badge => 
                !this.currentUser.badges.includes(badge)
            );
            
            let message = `🎮 ${gameTitle} downloaded! +10 points`;
            
            if (newBadges.length > 0) {
                message += `\n🏆 Achievement unlocked: ${newBadges.join(', ')}`;
            }
            
            if (user.stats.streak > 1) {
                message += `\n🔥 ${user.stats.streak} day streak!`;
            }
            
            this.showNotification(message, 'success');
            return true;
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }
    
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileBtn = document.getElementById('profileBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) {
                profileBtn.style.display = 'flex';
                
                // Update profile info
                const usernameEl = profileBtn.querySelector('#headerUsername');
                const pointsEl = profileBtn.querySelector('#headerPoints');
                const levelEl = profileBtn.querySelector('#headerLevel');
                const avatarEl = profileBtn.querySelector('.avatar-small');
                
                if (usernameEl) usernameEl.textContent = this.currentUser.username;
                if (pointsEl) pointsEl.textContent = `${this.currentUser.points} pts`;
                if (levelEl) levelEl.textContent = `Level ${this.currentUser.level}`;
                if (avatarEl) {
                    avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.username)}&background=8b5cf6&color=fff`;
                }
            }
            if (userMenu) {
                userMenu.innerHTML = `
                    <div class="user-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.username)}&background=8b5cf6&color=fff" 
                             alt="${this.currentUser.username}" 
                             class="avatar-medium">
                        <div>
                            <h4>${this.currentUser.username}</h4>
                            <p>${this.currentUser.email}</p>
                            <p>Level ${this.currentUser.level} | ${this.currentUser.points} points</p>
                            <p>${this.currentUser.stats.totalDownloads} downloads</p>
                        </div>
                    </div>
                    <a href="profile.html" class="menu-item">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="downloads.html" class="menu-item">
                        <i class="fas fa-download"></i> My Downloads
                    </a>
                    <a href="achievements.html" class="menu-item">
                        <i class="fas fa-trophy"></i> Achievements
                    </a>
                    <a href="membership.html" class="menu-item">
                        <i class="fas fa-crown"></i> Membership
                    </a>
                    <div class="menu-divider"></div>
                    <a href="#" id="logoutBtn" class="menu-item">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                `;
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'flex';
            if (profileBtn) profileBtn.style.display = 'none';
            if (userMenu) {
                userMenu.innerHTML = `
                    <a href="login.html" class="menu-item">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="register.html" class="menu-item">
                        <i class="fas fa-user-plus"></i> Register
                    </a>
                `;
            }
        }
    }
    
    setupEventListeners() {
        // Handle logout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
        
        // Handle download buttons
        document.addEventListener('click', (e) => {
            const downloadBtn = e.target.closest('.download-btn');
            if (downloadBtn) {
                e.preventDefault();
                const gameId = downloadBtn.dataset.gameId;
                const gameTitle = downloadBtn.dataset.gameTitle || 'Game';
                
                if (gameId) {
                    this.downloadGame(gameId, gameTitle);
                }
            }
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        const container = document.getElementById('notification-container') || 
                         (() => {
                             const div = document.createElement('div');
                             div.id = 'notification-container';
                             div.style.cssText = `
                                 position: fixed;
                                 top: 20px;
                                 right: 20px;
                                 z-index: 9999;
                             `;
                             document.body.appendChild(div);
                             return div;
                         })();
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => notification.remove(), 5000);
        
        // Close button
        notification.querySelector('.notification-close').onclick = () => notification.remove();
    }
    
    // Get user stats
    getUserStats() {
        if (!this.currentUser) return null;
        
        return {
            points: this.currentUser.points,
            level: this.currentUser.level,
            downloads: this.currentUser.stats.totalDownloads,
            streak: this.currentUser.stats.streak,
            badges: this.currentUser.badges.length,
            gamesDownloaded: this.currentUser.stats.gamesDownloaded.length
        };
    }
}

// Create global instance
window.auth = new AuthSystem();