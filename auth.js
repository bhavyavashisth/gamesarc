// GamesArc Authentication System
const GamesArcAuth = (function() {
    // Initialize auth system
    const initAuth = () => {
        GamesArcDB.initDB();
        checkAuthState();
    };

    // Check authentication state
    const checkAuthState = () => {
        const sessionId = localStorage.getItem('gamesarc_session');
        
        if (sessionId) {
            const session = GamesArcDB.getSession(sessionId);
            if (session && new Date(session.expiresAt) > new Date()) {
                return session.userId;
            } else {
                logout();
            }
        }
        
        return null;
    };

    // Get current user
    const getCurrentUser = () => {
        const userId = checkAuthState();
        if (userId) {
            return GamesArcDB.findUserById(userId);
        }
        return null;
    };

    // Login
    const login = (email, password) => {
        const user = GamesArcDB.findUserByEmail(email);
        
        if (!user) {
            return { success: false, message: "User not found" };
        }
        
        if (user.password !== btoa(password)) {
            return { success: false, message: "Invalid password" };
        }
        
        const session = GamesArcDB.createSession(user.id);
        localStorage.setItem('gamesarc_session', session.id);
        
        return { 
            success: true, 
            message: "Login successful",
            user: user 
        };
    };

    // Register
    const register = (email, password, username) => {
        if (GamesArcDB.findUserByEmail(email)) {
            return { success: false, message: "Email already registered" };
        }
        
        if (!email || !password || !username) {
            return { success: false, message: "All fields are required" };
        }
        
        if (password.length < 6) {
            return { success: false, message: "Password must be at least 6 characters" };
        }
        
        const user = GamesArcDB.createUser({ email, password, username });
        const session = GamesArcDB.createSession(user.id);
        localStorage.setItem('gamesarc_session', session.id);
        
        return { 
            success: true, 
            message: "Registration successful! Welcome bonus: 100 points",
            user: user 
        };
    };

    // Logout
    const logout = () => {
        const sessionId = localStorage.getItem('gamesarc_session');
        if (sessionId) {
            GamesArcDB.deleteSession(sessionId);
        }
        localStorage.removeItem('gamesarc_session');
        window.location.href = 'index.html';
    };

    // Request password reset
    const requestPasswordReset = (email) => {
        const user = GamesArcDB.findUserByEmail(email);
        
        if (!user) {
            return { success: false, message: "Email not found" };
        }
        
        const token = GamesArcDB.createResetToken(email);
        
        // In a real app, send email here
        // For demo, we'll store the token for the reset page
        localStorage.setItem('reset_token', token);
        
        return { 
            success: true, 
            message: "Password reset link has been sent to your email",
            token: token 
        };
    };

    // Reset password
    const resetPassword = (token, newPassword) => {
        const email = GamesArcDB.validateResetToken(token);
        
        if (!email) {
            return { success: false, message: "Invalid or expired token" };
        }
        
        const user = GamesArcDB.findUserByEmail(email);
        if (user) {
            user.password = btoa(newPassword);
            GamesArcDB.updateUser(user.id, { password: user.password });
            GamesArcDB.deleteResetToken(token);
            localStorage.removeItem('reset_token');
            
            return { success: true, message: "Password reset successful" };
        }
        
        return { success: false, message: "User not found" };
    };

    // Update profile
    const updateProfile = (userId, updates) => {
        return GamesArcDB.updateUser(userId, updates);
    };

    // Download game (awards points)
    const downloadGame = (gameId) => {
        const user = getCurrentUser();
        
        if (!user) {
            return { success: false, message: "Please login to download games" };
        }
        
        const download = GamesArcDB.recordDownload(user.id, gameId);
        const updatedUser = GamesArcDB.awardPoints(user.id, 10);
        
        return { 
            success: true, 
            message: "Download started! +10 points awarded",
            download: download,
            user: updatedUser
        };
    };

    // Update navigation based on auth state
    const updateNavigation = () => {
        const user = getCurrentUser();
        const navAuth = document.getElementById('nav-auth');
        
        if (navAuth) {
            if (user) {
                navAuth.innerHTML = `
                    <div class="user-menu">
                        <span class="user-points">🎮 ${user.points} pts</span>
                        <a href="profile.html" class="btn btn-secondary">
                            <i class="fas fa-user"></i> ${user.username}
                        </a>
                        <button onclick="GamesArcAuth.logout()" class="btn btn-outline">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                `;
            } else {
                navAuth.innerHTML = `
                    <a href="login.html" class="btn btn-secondary">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="login.html?register=true" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </a>
                `;
            }
        }
    };

    // Show notification
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    };

    return {
        initAuth,
        checkAuthState,
        getCurrentUser,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        downloadGame,
        updateNavigation,
        showNotification
    };
})();