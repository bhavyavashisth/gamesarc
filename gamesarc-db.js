// gamesarc-db.js - Complete Database System
(function() {
    // Only create if doesn't exist
    if (window.GamesArcDB) {
        console.log('GamesArcDB already exists');
        return;
    }
    
    const GamesArcDB = {
        // ======================
        // DATA STORAGE
        // ======================
        users: JSON.parse(localStorage.getItem('gamesarc_users')) || [],
        sessions: JSON.parse(localStorage.getItem('gamesarc_sessions')) || [],
        downloads: JSON.parse(localStorage.getItem('gamesarc_downloads')) || [],
        gameStats: JSON.parse(localStorage.getItem('gamesarc_game_stats')) || {},
        userActivities: JSON.parse(localStorage.getItem('gamesarc_user_activities')) || [],
        resetTokens: JSON.parse(localStorage.getItem('gamesarc_reset_tokens')) || {},
        
        // ======================
        // INITIALIZATION
        // ======================
        init() {
            console.log('Initializing GamesArcDB...');
            
            // Initialize with admin user if empty
            if (this.users.length === 0) {
                this.registerUser({
                    username: 'admin',
                    email: 'admin@gamesarc.com',
                    password: 'admin123',
                    avatar: 'default-admin.png',
                    role: 'admin'
                });
                console.log('Admin user created');
            }
            
            // Initialize game stats if empty
            if (Object.keys(this.gameStats).length === 0) {
                this.initializeGameStats();
            }
            
            console.log('GamesArcDB initialized successfully');
            console.log('Total users:', this.users.length);
            console.log('Total downloads:', this.downloads.length);
        },
        
        // ======================
        // USER MANAGEMENT
        // ======================
        hashPassword(password) {
            // Simple hash for demo - in production use bcrypt
            return btoa(encodeURIComponent(password));
        },
        
        verifyPassword(inputPassword, storedHash) {
            return this.hashPassword(inputPassword) === storedHash;
        },
        
        registerUser(userData) {
            // Check if user already exists
            const exists = this.users.find(u => 
                u.email.toLowerCase() === userData.email.toLowerCase() || 
                u.username.toLowerCase() === userData.username.toLowerCase()
            );
            
            if (exists) {
                throw new Error('User already exists with this email or username');
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString() + Math.random().toString(36).substr(2),
                username: userData.username,
                email: userData.email.toLowerCase(),
                password: this.hashPassword(userData.password),
                avatar: userData.avatar || 'default.png',
                points: 100, // Starting points
                role: userData.role || 'user',
                level: 1,
                experience: 0,
                badges: ['newbie'],
                createdAt: new Date().toISOString(),
                lastLogin: null,
                lastActive: new Date().toISOString(),
                profile: {
                    bio: '',
                    location: '',
                    website: '',
                    social: {}
                },
                stats: {
                    totalDownloads: 0,
                    gamesDownloaded: [],
                    totalPointsEarned: 100,
                    achievements: [],
                    streak: 0,
                    lastDownloadDate: null
                },
                settings: {
                    emailNotifications: true,
                    newsletter: true,
                    theme: 'dark',
                    language: 'en'
                }
            };
            
            this.users.push(newUser);
            this.saveUsers();
            
            // Log activity
            this.logActivity(newUser.id, 'account_created', {
                ip: this.getClientIP()
            });
            
            console.log('New user registered:', newUser.username);
            return newUser;
        },
        
        loginUser(email, password) {
            const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
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
                token: this.generateToken(),
                ip: this.getClientIP(),
                userAgent: navigator.userAgent,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };
            
            this.sessions.push(session);
            this.saveSessions();
            
            // Store token in localStorage
            localStorage.setItem('auth_token', session.token);
            
            // Log activity
            this.logActivity(user.id, 'login', {
                ip: session.ip,
                userAgent: session.userAgent
            });
            
            console.log('User logged in:', user.email);
            return { user, session };
        },
        
        getCurrentUser() {
            const token = localStorage.getItem('auth_token');
            if (!token) return null;
            
            const session = this.sessions.find(s => s.token === token);
            if (!session || new Date(session.expiresAt) < new Date()) {
                // Session expired
                this.logoutUser(token);
                return null;
            }
            
            const user = this.users.find(u => u.id === session.userId);
            if (!user) {
                this.logoutUser(token);
                return null;
            }
            
            return user;
        },
        
        logoutUser(token = null) {
            const currentToken = token || localStorage.getItem('auth_token');
            
            if (currentToken) {
                // Log activity before removing session
                const session = this.sessions.find(s => s.token === currentToken);
                if (session) {
                    this.logActivity(session.userId, 'logout');
                }
                
                // Remove session
                this.sessions = this.sessions.filter(s => s.token !== currentToken);
                this.saveSessions();
            }
            
            localStorage.removeItem('auth_token');
            console.log('User logged out');
        },
        
        updateUser(userId, updates) {
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) throw new Error('User not found');
            
            // Don't allow updating certain fields
            const allowedUpdates = ['avatar', 'profile', 'settings', 'username', 'lastActive'];
            const filteredUpdates = {};
            
            for (const key in updates) {
                if (allowedUpdates.includes(key) || key.startsWith('profile.') || key.startsWith('settings.')) {
                    if (key.includes('.')) {
                        // Handle nested updates (profile.bio, settings.theme)
                        const [parent, child] = key.split('.');
                        if (!filteredUpdates[parent]) filteredUpdates[parent] = {};
                        filteredUpdates[parent][child] = updates[key];
                    } else {
                        filteredUpdates[key] = updates[key];
                    }
                }
            }
            
            this.users[userIndex] = { ...this.users[userIndex], ...filteredUpdates };
            this.saveUsers();
            
            // Log activity
            this.logActivity(userId, 'profile_updated', { fields: Object.keys(filteredUpdates) });
            
            return this.users[userIndex];
        },
        
        changePassword(email, newPassword) {
            const user = this.users.find(u => u.email === email);
            if (!user) throw new Error('User not found');
            
            user.password = this.hashPassword(newPassword);
            this.saveUsers();
            
            // Log activity
            this.logActivity(user.id, 'password_changed');
            
            return true;
        },
        
        // ======================
        // GAME DOWNLOADS & POINTS
        // ======================
        addDownload(userId, gameId, gameTitle) {
            const user = this.users.find(u => u.id === userId);
            if (!user) throw new Error('User not found');
            
            const downloadId = Date.now().toString() + Math.random().toString(36).substr(2);
            const downloadDate = new Date().toISOString();
            
            // Create download record
            const download = {
                id: downloadId,
                userId: userId,
                gameId: gameId,
                gameTitle: gameTitle,
                date: downloadDate,
                pointsEarned: 10,
                ip: this.getClientIP()
            };
            
            this.downloads.push(download);
            this.saveDownloads();
            
            // Update user stats
            user.stats.totalDownloads += 1;
            if (!user.stats.gamesDownloaded.includes(gameId)) {
                user.stats.gamesDownloaded.push(gameId);
            }
            user.stats.lastDownloadDate = downloadDate;
            
            // Award points
            user.points += 10;
            user.stats.totalPointsEarned += 10;
            
            // Check for streak
            this.updateUserStreak(user);
            
            // Update game stats
            this.updateGameStats(gameId, gameTitle);
            
            this.saveUsers();
            
            // Log activity
            this.logActivity(userId, 'game_downloaded', {
                gameId: gameId,
                gameTitle: gameTitle,
                pointsEarned: 10
            });
            
            // Check for achievements
            this.checkAchievements(userId);
            
            console.log(`User ${user.username} downloaded ${gameTitle}, +10 points`);
            return { user, download };
        },
        
        updateGameStats(gameId, gameTitle) {
            if (!this.gameStats[gameId]) {
                this.gameStats[gameId] = {
                    gameId: gameId,
                    gameTitle: gameTitle,
                    totalDownloads: 0,
                    uniqueDownloaders: [],
                    lastDownloadDate: null,
                    createdAt: new Date().toISOString()
                };
            }
            
            this.gameStats[gameId].totalDownloads += 1;
            this.gameStats[gameId].lastDownloadDate = new Date().toISOString();
            this.saveGameStats();
        },
        
        updateUserStreak(user) {
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const lastDownload = user.stats.lastDownloadDate ? 
                new Date(user.stats.lastDownloadDate).toDateString() : null;
            
            if (lastDownload === yesterday) {
                user.stats.streak += 1;
            } else if (lastDownload !== today) {
                user.stats.streak = 1;
            }
            
            // Award bonus for streaks
            if (user.stats.streak % 7 === 0) {
                const bonus = Math.floor(user.stats.streak / 7) * 50;
                user.points += bonus;
                user.stats.totalPointsEarned += bonus;
                console.log(`Streak bonus: +${bonus} points for ${user.stats.streak} days streak`);
            }
        },
        
        checkAchievements(userId) {
            const user = this.users.find(u => u.id === userId);
            if (!user) return;
            
            const achievements = [];
            
            // Download milestones
            if (user.stats.totalDownloads >= 1 && !user.badges.includes('first_download')) {
                achievements.push('first_download');
                user.badges.push('first_download');
                user.points += 50;
            }
            
            if (user.stats.totalDownloads >= 5 && !user.badges.includes('game_collector')) {
                achievements.push('game_collector');
                user.badges.push('game_collector');
                user.points += 100;
            }
            
            if (user.stats.totalDownloads >= 10 && !user.badges.includes('hardcore_gamer')) {
                achievements.push('hardcore_gamer');
                user.badges.push('hardcore_gamer');
                user.points += 200;
            }
            
            // Points milestones
            if (user.points >= 500 && !user.badges.includes('point_master')) {
                achievements.push('point_master');
                user.badges.push('point_master');
            }
            
            // Streak achievements
            if (user.stats.streak >= 7 && !user.badges.includes('weekly_warrior')) {
                achievements.push('weekly_warrior');
                user.badges.push('weekly_warrior');
                user.points += 150;
            }
            
            if (user.stats.streak >= 30 && !user.badges.includes('monthly_champion')) {
                achievements.push('monthly_champion');
                user.badges.push('monthly_champion');
                user.points += 500;
            }
            
            if (achievements.length > 0) {
                user.stats.achievements.push(...achievements.map(ach => ({
                    id: ach,
                    date: new Date().toISOString(),
                    pointsAwarded: ach.includes('first') ? 50 : ach.includes('weekly') ? 150 : ach.includes('monthly') ? 500 : 0
                })));
                
                this.saveUsers();
                this.logActivity(userId, 'achievement_unlocked', { achievements: achievements });
                
                console.log(`Achievements unlocked: ${achievements.join(', ')}`);
            }
            
            // Level up based on points
            const newLevel = Math.floor(user.points / 1000) + 1;
            if (newLevel > user.level) {
                const oldLevel = user.level;
                user.level = newLevel;
                user.points += newLevel * 100; // Level up bonus
                
                this.saveUsers();
                this.logActivity(userId, 'level_up', { 
                    oldLevel: oldLevel, 
                    newLevel: newLevel,
                    bonusPoints: newLevel * 100
                });
                
                console.log(`User leveled up from ${oldLevel} to ${newLevel}, +${newLevel * 100} points`);
            }
        },
        
        // ======================
        // DATA RETRIEVAL
        // ======================
        getUserById(userId) {
            return this.users.find(u => u.id === userId);
        },
        
        getUserByEmail(email) {
            return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        },
        
        getTopUsers(limit = 10) {
            return [...this.users]
                .sort((a, b) => b.points - a.points)
                .slice(0, limit)
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    points: user.points,
                    level: user.level,
                    avatar: user.avatar,
                    stats: user.stats
                }));
        },
        
        getGameDownloads(gameId) {
            return this.downloads.filter(d => d.gameId === gameId);
        },
        
        getUserDownloads(userId) {
            return this.downloads.filter(d => d.userId === userId);
        },
        
        getRecentDownloads(limit = 10) {
            return [...this.downloads]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, limit);
        },
        
        getGameStats(gameId) {
            return this.gameStats[gameId] || {
                gameId: gameId,
                totalDownloads: 0,
                uniqueDownloaders: 0
            };
        },
        
        getAllGameStats() {
            return Object.values(this.gameStats).sort((a, b) => b.totalDownloads - a.totalDownloads);
        },
        
        getUserActivity(userId, limit = 20) {
            return this.userActivities
                .filter(a => a.userId === userId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        },
        
        // ======================
        // PASSWORD RESET
        // ======================
        createResetToken(email) {
            const user = this.getUserByEmail(email);
            if (!user) throw new Error('User not found');
            
            const token = this.generateToken();
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour
            
            this.resetTokens[token] = {
                userId: user.id,
                email: email,
                expiresAt: expiresAt.toISOString(),
                used: false,
                createdAt: new Date().toISOString()
            };
            
            this.saveResetTokens();
            this.logActivity(user.id, 'password_reset_requested');
            
            return token;
        },
        
        validateResetToken(token) {
            const tokenData = this.resetTokens[token];
            
            if (!tokenData) {
                return { valid: false, message: 'Invalid token' };
            }
            
            if (tokenData.used) {
                return { valid: false, message: 'Token already used' };
            }
            
            if (new Date(tokenData.expiresAt) < new Date()) {
                return { valid: false, message: 'Token expired' };
            }
            
            return { 
                valid: true, 
                userId: tokenData.userId, 
                email: tokenData.email 
            };
        },
        
        useResetToken(token) {
            if (this.resetTokens[token]) {
                this.resetTokens[token].used = true;
                this.resetTokens[token].usedAt = new Date().toISOString();
                this.saveResetTokens();
                return true;
            }
            return false;
        },
        
        // ======================
        // UTILITY FUNCTIONS
        // ======================
        generateToken() {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        },
        
        getClientIP() {
            // Note: This won't get real IP in browser due to security
            // In production, this should be handled server-side
            return '127.0.0.1'; // Placeholder
        },
        
        logActivity(userId, action, metadata = {}) {
            const activity = {
                id: Date.now().toString() + Math.random().toString(36).substr(2),
                userId: userId,
                action: action,
                metadata: metadata,
                timestamp: new Date().toISOString(),
                ip: this.getClientIP(),
                userAgent: navigator.userAgent
            };
            
            this.userActivities.push(activity);
            this.saveUserActivities();
        },
        
        initializeGameStats() {
            // Pre-populate with popular games
            const games = [
                { id: 'gta-v', title: 'Grand Theft Auto V' },
                { id: 'elden-ring', title: 'Elden Ring' },
                { id: 'sekiro', title: 'Sekiro: Shadows Die Twice' },
                { id: 'cyberpunk', title: 'Cyberpunk 2077' },
                { id: 'rdr2', title: 'Red Dead Redemption 2' }
            ];
            
            games.forEach(game => {
                this.gameStats[game.id] = {
                    gameId: game.id,
                    gameTitle: game.title,
                    totalDownloads: Math.floor(Math.random() * 1000) + 500,
                    uniqueDownloaders: [],
                    lastDownloadDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
            });
            
            this.saveGameStats();
        },
        
        // ======================
        // DATA PERSISTENCE
        // ======================
        saveUsers() {
            localStorage.setItem('gamesarc_users', JSON.stringify(this.users));
        },
        
        saveSessions() {
            localStorage.setItem('gamesarc_sessions', JSON.stringify(this.sessions));
        },
        
        saveDownloads() {
            localStorage.setItem('gamesarc_downloads', JSON.stringify(this.downloads));
        },
        
        saveGameStats() {
            localStorage.setItem('gamesarc_game_stats', JSON.stringify(this.gameStats));
        },
        
        saveUserActivities() {
            // Keep only last 1000 activities to prevent localStorage overflow
            if (this.userActivities.length > 1000) {
                this.userActivities = this.userActivities.slice(-1000);
            }
            localStorage.setItem('gamesarc_user_activities', JSON.stringify(this.userActivities));
        },
        
        saveResetTokens() {
            localStorage.setItem('gamesarc_reset_tokens', JSON.stringify(this.resetTokens));
        },
        
        // ======================
        // ADMIN FUNCTIONS
        // ======================
        adminGetAllData() {
            return {
                users: this.users.length,
                sessions: this.sessions.length,
                downloads: this.downloads.length,
                games: Object.keys(this.gameStats).length,
                activities: this.userActivities.length,
                totalPoints: this.users.reduce((sum, user) => sum + user.points, 0),
                totalDownloads: this.downloads.length,
                recentActivities: this.userActivities.slice(-20),
                topGames: this.getAllGameStats().slice(0, 5),
                topUsers: this.getTopUsers(5)
            };
        },
        
        adminResetDatabase() {
            if (confirm('⚠️ WARNING: This will delete ALL data. Are you sure?')) {
                localStorage.removeItem('gamesarc_users');
                localStorage.removeItem('gamesarc_sessions');
                localStorage.removeItem('gamesarc_downloads');
                localStorage.removeItem('gamesarc_game_stats');
                localStorage.removeItem('gamesarc_user_activities');
                localStorage.removeItem('gamesarc_reset_tokens');
                localStorage.removeItem('auth_token');
                
                // Reload the database
                this.users = [];
                this.sessions = [];
                this.downloads = [];
                this.gameStats = {};
                this.userActivities = [];
                this.resetTokens = {};
                
                this.init();
                console.log('Database reset complete');
                return true;
            }
            return false;
        },
        
        exportUserData(userId) {
            const user = this.getUserById(userId);
            if (!user) throw new Error('User not found');
            
            const userDownloads = this.getUserDownloads(userId);
            const userActivities = this.getUserActivity(userId, 100);
            
            return {
                profile: {
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                },
                stats: user.stats,
                downloads: userDownloads,
                activities: userActivities,
                exportDate: new Date().toISOString()
            };
        }
    };
    
    // Initialize the database
    GamesArcDB.init();
    
    // Make it globally available
    window.GamesArcDB = GamesArcDB;
    
    console.log('GamesArcDB loaded successfully');
})();