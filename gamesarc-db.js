// gamesarc-db.js
(function() {
    console.log('🚀 Loading GamesArcDB...');
    
    // Only create if doesn't exist
    if (window.GamesArcDB) {
        console.log('✅ GamesArcDB already loaded');
        return;
    }
    
    // Main Database Object
    window.GamesArcDB = {
        // Data storage
        users: JSON.parse(localStorage.getItem('gamesarc_users')) || [],
        sessions: JSON.parse(localStorage.getItem('gamesarc_sessions')) || [],
        downloads: JSON.parse(localStorage.getItem('gamesarc_downloads')) || [],
        resetTokens: JSON.parse(localStorage.getItem('gamesarc_reset_tokens')) || {},
        
        // Initialize database
        init: function() {
            console.log('🔧 Initializing database...');
            
            // Create admin if no users exist
            if (this.users.length === 0) {
                console.log('👑 Creating admin user...');
                this.registerUser({
                    username: 'admin',
                    email: 'admin@gamesarc.com',
                    password: 'admin123',
                    avatar: 'default-admin.png'
                });
            }
            
            console.log(`✅ Database ready. Users: ${this.users.length}`);
            return this;
        },
        
        // Password hashing
        hashPassword: function(password) {
            return btoa(password); // Simple for demo
        },
        
        verifyPassword: function(inputPassword, storedHash) {
            return this.hashPassword(inputPassword) === storedHash;
        },
        
        // User Registration
        registerUser: function(userData) {
            console.log(`📝 Registering: ${userData.email}`);
            
            // Check if user exists
            const exists = this.users.find(u => 
                u.email === userData.email || 
                u.username === userData.username
            );
            
            if (exists) {
                throw new Error('User already exists');
            }
            
            // Create new user
            const newUser = {
                id: 'user_' + Date.now(),
                username: userData.username,
                email: userData.email,
                password: this.hashPassword(userData.password),
                avatar: userData.avatar || 'default.png',
                points: 100,
                level: 1,
                role: userData.role || 'user',
                badges: ['newbie'],
                createdAt: new Date().toISOString(),
                lastLogin: null,
                lastActive: new Date().toISOString(),
                stats: {
                    totalDownloads: 0,
                    gamesDownloaded: [],
                    totalPointsEarned: 100,
                    achievements: [],
                    streak: 0,
                    lastDownloadDate: null
                },
                profile: {
                    bio: '',
                    location: '',
                    website: ''
                },
                settings: {
                    theme: 'dark',
                    notifications: true
                }
            };
            
            this.users.push(newUser);
            this.saveUsers();
            
            console.log(`✅ User created: ${newUser.username}`);
            return newUser;
        },
        
        // User Login
        loginUser: function(email, password) {
            console.log(`🔐 Login attempt: ${email}`);
            
            const user = this.users.find(u => u.email === email);
            
            if (!user || !this.verifyPassword(password, user.password)) {
                throw new Error('Invalid email or password');
            }
            
            // Update user info
            user.lastLogin = new Date().toISOString();
            user.lastActive = new Date().toISOString();
            this.saveUsers();
            
            // Create session
            const session = {
                userId: user.id,
                token: 'token_' + Date.now(),
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };
            
            this.sessions.push(session);
            this.saveSessions();
            localStorage.setItem('auth_token', session.token);
            
            console.log(`✅ Login successful: ${user.username}`);
            return { user, session };
        },
        
        // Get current logged in user
        getCurrentUser: function() {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;
            
            const session = this.sessions.find(s => s.token === token);
            if (!session) return null;
            
            // Check if session expired
            if (new Date(session.expiresAt) < new Date()) {
                this.logoutUser();
                return null;
            }
            
            return this.users.find(u => u.id === session.userId);
        },
        
        // Logout
        logoutUser: function() {
            const token = localStorage.getItem('auth_token');
            if (token) {
                this.sessions = this.sessions.filter(s => s.token !== token);
                this.saveSessions();
            }
            localStorage.removeItem('auth_token');
            console.log('👋 User logged out');
        },
        
        // Add game download
        addDownload: function(userId, gameId, gameTitle) {
            const user = this.users.find(u => u.id === userId);
            if (!user) throw new Error('User not found');
            
            // Create download record
            const download = {
                id: 'dl_' + Date.now(),
                userId: userId,
                gameId: gameId,
                gameTitle: gameTitle,
                date: new Date().toISOString(),
                pointsEarned: 10
            };
            
            this.downloads.push(download);
            this.saveDownloads();
            
            // Update user
            user.points += 10;
            user.stats.totalDownloads += 1;
            user.stats.totalPointsEarned += 10;
            
            if (!user.stats.gamesDownloaded.includes(gameId)) {
                user.stats.gamesDownloaded.push(gameId);
            }
            
            this.saveUsers();
            console.log(`🎮 Download added: ${gameTitle} by ${user.username}`);
            
            return { user, download };
        },
        
        // Password reset
        createResetToken: function(email) {
            const user = this.users.find(u => u.email === email);
            if (!user) throw new Error('User not found');
            
            const token = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2);
            
            this.resetTokens[token] = {
                userId: user.id,
                email: email,
                expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
                used: false
            };
            
            this.saveResetTokens();
            console.log(`🔑 Reset token created for: ${email}`);
            
            return token;
        },
        
        validateResetToken: function(token) {
            const tokenData = this.resetTokens[token];
            
            if (!tokenData) return { valid: false, message: 'Invalid token' };
            if (tokenData.used) return { valid: false, message: 'Token already used' };
            if (new Date(tokenData.expiresAt) < new Date()) return { valid: false, message: 'Token expired' };
            
            return { 
                valid: true, 
                userId: tokenData.userId,
                email: tokenData.email 
            };
        },
        
        resetPassword: function(token, newPassword) {
            const validation = this.validateResetToken(token);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            const user = this.users.find(u => u.id === validation.userId);
            if (!user) throw new Error('User not found');
            
            user.password = this.hashPassword(newPassword);
            this.resetTokens[token].used = true;
            this.resetTokens[token].usedAt = new Date().toISOString();
            
            this.saveUsers();
            this.saveResetTokens();
            
            console.log(`✅ Password reset for: ${user.email}`);
            return true;
        },
        
        // Data persistence
        saveUsers: function() {
            localStorage.setItem('gamesarc_users', JSON.stringify(this.users));
        },
        
        saveSessions: function() {
            localStorage.setItem('gamesarc_sessions', JSON.stringify(this.sessions));
        },
        
        saveDownloads: function() {
            localStorage.setItem('gamesarc_downloads', JSON.stringify(this.downloads));
        },
        
        saveResetTokens: function() {
            localStorage.setItem('gamesarc_reset_tokens', JSON.stringify(this.resetTokens));
        },
        
        // Utility functions
        getTopUsers: function(limit = 10) {
            return [...this.users]
                .sort((a, b) => b.points - a.points)
                .slice(0, limit);
        },
        
        getUserDownloads: function(userId) {
            return this.downloads.filter(d => d.userId === userId);
        },
        
        // Debug info
        debug: function() {
            return {
                users: this.users.length,
                sessions: this.sessions.length,
                downloads: this.downloads.length,
                currentUser: this.getCurrentUser()?.email || 'None'
            };
        }
    };
    
    // Initialize database
    GamesArcDB.init();
    
    console.log('✅ GamesArcDB fully loaded');
})();