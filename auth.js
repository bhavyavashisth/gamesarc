// auth.js - UPDATED VERSION
// Add this at the VERY TOP of auth.js
if (!window.GamesArcDB) {
    console.error('GamesArcDB not loaded! Loading it now...');
    // Optionally load it dynamically
    const script = document.createElement('script');
    script.src = 'gamesarc-db.js';
    document.head.appendChild(script);
    
    // Wait for it to load
    script.onload = function() {
        console.log('GamesArcDB loaded dynamically');
        // Re-initialize auth
        window.auth = new AuthSystem();
    };
}
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.currentUser = GamesArcDB.getCurrentUser();
        this.updateUI();
    }
    
    async login(email, password) {
        try {
            const { user } = GamesArcDB.loginUser(email, password);
            this.currentUser = user;
            
            // 🔴 IMPORTANT: Update UI immediately
            this.updateUI();
            
            this.showNotification('Login successful!', 'success');
            return true;
        } catch (error) {
            this.showNotification('Invalid email or password', 'error');
            return false;
        }
    }
    
    async register(userData) {
        try {
            GamesArcDB.registerUser(userData);
            // Auto login after registration
            return await this.login(userData.email, userData.password);
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }
    
    logout() {
        GamesArcDB.logoutUser();
        this.currentUser = null;
        this.updateUI();
        this.showNotification('Logged out', 'info');
        window.location.href = 'index.html';
    }
    
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileBtn = document.getElementById('profileBtn');
        const userMenu = document.getElementById('userMenu');
        
        console.log('Updating UI... Current user:', this.currentUser); // Debug
        
        if (this.currentUser) {
            // User is logged in - SHOW PROFILE, HIDE LOGIN
            if (loginBtn) {
                loginBtn.style.display = 'none';
                loginBtn.style.visibility = 'hidden';
            }
            if (profileBtn) {
                profileBtn.style.display = 'flex';
                profileBtn.style.visibility = 'visible';
                
                // Update profile info
                const usernameSpan = profileBtn.querySelector('#headerUsername');
                const pointsSpan = profileBtn.querySelector('#headerPoints');
                const avatarImg = profileBtn.querySelector('.avatar-small');
                
                if (usernameSpan) usernameSpan.textContent = this.currentUser.username;
                if (pointsSpan) pointsSpan.textContent = this.currentUser.points + ' pts';
                if (avatarImg) {
                    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.username)}&background=8b5cf6&color=fff`;
                }
            }
            if (userMenu) {
                userMenu.innerHTML = `
                    <a href="profile.html">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="membership.html">
                        <i class="fas fa-crown"></i> Membership
                    </a>
                    <a href="#" onclick="auth.logout()" style="color: #ef4444;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                `;
            }
        } else {
            // User is not logged in - SHOW LOGIN, HIDE PROFILE
            if (loginBtn) {
                loginBtn.style.display = 'flex';
                loginBtn.style.visibility = 'visible';
            }
            if (profileBtn) {
                profileBtn.style.display = 'none';
                profileBtn.style.visibility = 'hidden';
            }
        }
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

// Create global instance
window.auth = new AuthSystem();