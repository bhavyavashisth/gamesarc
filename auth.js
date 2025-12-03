// auth.js
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.checkAuthStatus();
        this.updateUI();
        this.setupEventListeners();
    }
    
    checkAuthStatus() {
        this.currentUser = GamesArcDB.getCurrentUser();
    }
    
    async login(email, password) {
        try {
            const { user, session } = GamesArcDB.loginUser(email, password);
            localStorage.setItem('auth_token', session.token);
            this.currentUser = user;
            this.updateUI();
            this.showNotification('Login successful!', 'success');
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
            this.showNotification('Registration successful!', 'success');
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
    }
    
    async changePassword(email, newPassword) {
        try {
            GamesArcDB.changePassword(email, newPassword);
            this.showNotification('Password changed successfully', 'success');
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
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) {
                profileBtn.style.display = 'block';
                profileBtn.innerHTML = `
                    <img src="images/avatars/${this.currentUser.avatar}" 
                         alt="${this.currentUser.username}" 
                         class="avatar-small">
                    <span>${this.currentUser.username} (${this.currentUser.points} pts)</span>
                `;
            }
            if (userMenu) {
                userMenu.innerHTML = `
                    <div class="user-info">
                        <img src="images/avatars/${this.currentUser.avatar}" 
                             alt="${this.currentUser.username}" 
                             class="avatar-medium">
                        <div>
                            <h4>${this.currentUser.username}</h4>
                            <p>${this.currentUser.email}</p>
                            <p>${this.currentUser.points} points</p>
                        </div>
                    </div>
                    <a href="profile.html" class="menu-item">Profile</a>
                    <a href="membership.html" class="menu-item">Membership</a>
                    <a href="#" id="logoutBtn" class="menu-item">Logout</a>
                `;
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (profileBtn) profileBtn.style.display = 'none';
            if (userMenu) {
                userMenu.innerHTML = `
                    <a href="login.html" class="menu-item">Login</a>
                    <a href="register.html" class="menu-item">Register</a>
                `;
            }
        }
    }
    
    setupEventListeners() {
        // Handle logout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn') {
                e.preventDefault();
                this.logout();
            }
        });
        
        // Handle download points
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-btn')) {
                this.handleDownload(e.target.dataset.gameId);
            }
        });
    }
    
    handleDownload(gameId) {
        if (!this.currentUser) {
            this.showNotification('Please login to download games', 'warning');
            return;
        }
        
        const newPoints = GamesArcDB.addDownloadPoints(this.currentUser.id, gameId);
        this.currentUser.points = newPoints;
        this.updateUI();
        this.showNotification(`+10 points! Total: ${newPoints} points`, 'success');
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
}

// Initialize auth system
const auth = new AuthSystem();