// gamesarc/gamesarc-db.js
class GamesArcDB {
    constructor() {
        this.dbName = 'gamesarc_database_v1'
        this.init()
    }

    // Initialize database
    init() {
        if (!localStorage.getItem(this.dbName)) {
            // First time setup - create empty database
            const emptyDB = {
                users: {},
                games: {
                    'cyber-nexus': {
                        id: 'cyber-nexus',
                        title: 'Cyber Nexus',
                        description: 'Futuristic RPG',
                        platforms: ['PC', 'Mac'],
                        totalVotes: 1245,
                        totalDownloads: 8900,
                        votes: {}, // user_id -> vote (1 or -1)
                        downloads: 0
                    },
                    'stellar-odyssey': {
                        id: 'stellar-odyssey',
                        title: 'Stellar Odyssey',
                        description: 'Space exploration',
                        platforms: ['PC', 'Mac ARM', 'Mac Intel'],
                        totalVotes: 892,
                        totalDownloads: 5600,
                        votes: {},
                        downloads: 0
                    }
                },
                memberships: {},
                analytics: {
                    pageViews: 0,
                    sessions: []
                },
                settings: {
                    version: '1.0',
                    createdAt: new Date().toISOString()
                }
            }
            this.save(emptyDB)
        }
    }

    // Get entire database
    getDB() {
        return JSON.parse(localStorage.getItem(this.dbName))
    }

    // Save database
    save(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data))
    }

    // ========== GAME OPERATIONS ==========

    // Get all games
    getAllGames() {
        const db = this.getDB()
        return Object.values(db.games)
    }

    // Get single game
    getGame(gameId) {
        const db = this.getDB()
        return db.games[gameId]
    }

    // Vote for a game
    voteGame(gameId, userId, voteType) {
        const db = this.getDB()
        
        if (!db.games[gameId]) {
            console.error(`Game ${gameId} not found`)
            return false
        }

        const game = db.games[gameId]
        const previousVote = game.votes[userId]

        // Update vote
        game.votes[userId] = voteType // 1 = upvote, -1 = downvote
        
        // Update total votes
        if (previousVote === voteType) {
            // Same vote - remove it
            delete game.votes[userId]
            game.totalVotes -= voteType
        } else if (previousVote) {
            // Changed vote
            game.totalVotes += (voteType - previousVote)
        } else {
            // New vote
            game.totalVotes += voteType
        }

        this.save(db)
        return game.totalVotes
    }

    // Track download
    trackDownload(gameId, userId = 'anonymous') {
        const db = this.getDB()
        
        if (!db.games[gameId]) {
            console.error(`Game ${gameId} not found`)
            return false
        }

        const game = db.games[gameId]
        
        // Increment counters
        game.downloads = (game.downloads || 0) + 1
        game.totalDownloads += 1

        // Track user download
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                downloads: [],
                votes: {},
                membership: 'free'
            }
        }
        
        db.users[userId].downloads.push({
            gameId,
            gameTitle: game.title,
            timestamp: new Date().toISOString(),
            platform: navigator.platform
        })

        // Analytics
        db.analytics.totalDownloads = (db.analytics.totalDownloads || 0) + 1

        this.save(db)
        
        // Return download count
        return {
            gameDownloads: game.downloads,
            totalDownloads: game.totalDownloads
        }
    }

    // ========== USER OPERATIONS ==========

    // Create/Get user
    getUser(userId) {
        const db = this.getDB()
        
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                username: `user_${Date.now()}`,
                downloads: [],
                votes: {},
                membership: 'free',
                createdAt: new Date().toISOString()
            }
            this.save(db)
        }
        
        return db.users[userId]
    }

    // Update user membership
    updateMembership(userId, plan) {
        const db = this.getDB()
        
        if (!db.users[userId]) {
            this.getUser(userId) // Create user first
        }
        
        db.users[userId].membership = plan
        db.users[userId].membershipUpdated = new Date().toISOString()
        
        // Track in memberships
        db.memberships[userId] = {
            userId,
            plan,
            updatedAt: new Date().toISOString()
        }
        
        this.save(db)
        return true
    }

    // ========== ANALYTICS ==========

    // Track page view
    trackPageView(page) {
        const db = this.getDB()
        
        db.analytics.pageViews = (db.analytics.pageViews || 0) + 1
        
        if (!db.analytics.pages) {
            db.analytics.pages = {}
        }
        
        db.analytics.pages[page] = (db.analytics.pages[page] || 0) + 1
        db.analytics.lastVisit = new Date().toISOString()
        
        this.save(db)
    }

    // Get statistics
    getStats() {
        const db = this.getDB()
        const games = Object.values(db.games)
        
        return {
            totalGames: games.length,
            totalDownloads: games.reduce((sum, game) => sum + game.totalDownloads, 0),
            totalVotes: games.reduce((sum, game) => sum + game.totalVotes, 0),
            totalUsers: Object.keys(db.users).length,
            mostDownloaded: games.sort((a, b) => b.totalDownloads - a.totalDownloads)[0],
            topRated: games.sort((a, b) => b.totalVotes - a.totalVotes)[0],
            pageViews: db.analytics.pageViews || 0
        }
    }

    // ========== EXPORT/IMPORT ==========

    // Export database (for backup)
    exportData() {
        const db = this.getDB()
        const dataStr = JSON.stringify(db, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `gamesarc_backup_${new Date().toISOString().split('T')[0]}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    // Import database
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString)
            this.save(data)
            return true
        } catch (error) {
            console.error('Import failed:', error)
            return false
        }
    }

    // Reset database
    reset() {
        localStorage.removeItem(this.dbName)
        this.init()
        return 'Database reset complete'
    }
}

// Create global instance
window.GamesArcDB = new GamesArcDB()
// Add these methods to your existing GamesArcDB class
class GamesArcDB {
    // ... existing code ...

    // Get comment statistics
    getCommentStats() {
        const db = this.getDB()
        const comments = db.comments || {}
        
        let totalComments = 0
        let commentsByGame = {}
        let recentComments = []
        
        Object.entries(comments).forEach(([gameId, gameComments]) => {
            totalComments += gameComments.length
            commentsByGame[gameId] = gameComments.length
            
            // Get recent comments (last 5)
            gameComments.slice(0, 5).forEach(comment => {
                recentComments.push({
                    gameId,
                    username: comment.username,
                    comment: comment.comment.substring(0, 100) + '...',
                    timestamp: comment.timestamp
                })
            })
        })
        
        return {
            totalComments,
            commentsByGame,
            recentComments: recentComments.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            ).slice(0, 10)
        }
    }
    
    // Get top commenters
    getTopCommenters() {
        const db = this.getDB()
        const users = db.users || {}
        
        const topCommenters = Object.values(users)
            .filter(user => user.commentsCount && user.commentsCount > 0)
            .sort((a, b) => b.commentsCount - a.commentsCount)
            .slice(0, 10)
            .map(user => ({
                username: user.username,
                commentsCount: user.commentsCount
            }))
        
        return topCommenters
    }
}

// Add admin functions to view comments
function viewAllComments() {
    const comments = CommentsDB.getComments('gta-v').concat(
        CommentsDB.getComments('elden-ring'),
        CommentsDB.getComments('sekiro')
    )
    
    console.log('All Comments:', comments)
    
    let report = '=== COMMENTS REPORT ===\n\n'
    report += `Total Comments: ${comments.length}\n\n`
    
    comments.forEach((comment, index) => {
        report += `${index + 1}. ${comment.username} (${new Date(comment.timestamp).toLocaleDateString()})\n`
        report += `   Game: ${comment.gameId}\n`
        report += `   Comment: ${comment.comment.substring(0, 50)}${comment.comment.length > 50 ? '...' : ''}\n`
        report += `   Likes: ${comment.likes || 0} | Dislikes: ${comment.dislikes || 0}\n\n`
    })
    
    // Show in alert (truncated if too long)
    if (report.length > 2000) {
        report = report.substring(0, 2000) + '\n\n... (truncated)'
    }
    
    alert(report)
}
// gamesarc-db.js
const GamesArcDB = {
    users: JSON.parse(localStorage.getItem('gamesarc_users')) || [],
    sessions: JSON.parse(localStorage.getItem('gamesarc_sessions')) || [],
    downloads: JSON.parse(localStorage.getItem('gamesarc_downloads')) || [],
    
    // Initialize with admin user if empty
    init() {
        if (this.users.length === 0) {
            this.users.push({
                id: 1,
                username: 'admin',
                email: 'admin@gamesarc.com',
                password: this.hashPassword('admin123'),
                avatar: 'default.png',
                points: 1000,
                role: 'admin',
                createdAt: new Date().toISOString(),
                lastLogin: null
            });
            this.saveUsers();
        }
    },
    
    hashPassword(password) {
        // Simple hash - in production use bcrypt
        return btoa(password);
    },
    
    verifyPassword(inputPassword, storedHash) {
        return this.hashPassword(inputPassword) === storedHash;
    },
    
    // User CRUD operations
    registerUser(userData) {
        const exists = this.users.find(u => 
            u.email === userData.email || u.username === userData.username
        );
        
        if (exists) {
            throw new Error('User already exists');
        }
        
        const newUser = {
            id: this.users.length + 1,
            ...userData,
            password: this.hashPassword(userData.password),
            avatar: 'default.png',
            points: 0,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    },
    
    loginUser(email, password) {
        const user = this.users.find(u => u.email === email);
        
        if (!user || !this.verifyPassword(password, user.password)) {
            throw new Error('Invalid credentials');
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();
        
        // Create session
        const session = {
            userId: user.id,
            token: this.generateToken(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        this.sessions.push(session);
        this.saveSessions();
        
        return { user, session };
    },
    
    logoutUser(token) {
        this.sessions = this.sessions.filter(s => s.token !== token);
        this.saveSessions();
    },
    
    getCurrentUser() {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;
        
        const session = this.sessions.find(s => s.token === token);
        if (!session || new Date(session.expiresAt) < new Date()) {
            this.logoutUser(token);
            return null;
        }
        
        return this.users.find(u => u.id === session.userId);
    },
    
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) throw new Error('User not found');
        
        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();
        return this.users[userIndex];
    },
    
    changePassword(email, newPassword) {
        const user = this.users.find(u => u.email === email);
        if (!user) throw new Error('User not found');
        
        user.password = this.hashPassword(newPassword);
        this.saveUsers();
        return true;
    },
    
    addDownloadPoints(userId, gameId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        // Check if already downloaded today
        const today = new Date().toDateString();
        const alreadyDownloaded = this.downloads.some(d => 
            d.userId === userId && d.gameId === gameId && 
            new Date(d.date).toDateString() === today
        );
        
        if (!alreadyDownloaded) {
            user.points += 10; // 10 points per game per day
            this.downloads.push({
                userId,
                gameId,
                date: new Date().toISOString(),
                points: 10
            });
            this.saveUsers();
            this.saveDownloads();
        }
        
        return user.points;
    },
    
    // Helper methods
    generateToken() {
        return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    },
    
    saveUsers() {
        localStorage.setItem('gamesarc_users', JSON.stringify(this.users));
    },
    
    saveSessions() {
        localStorage.setItem('gamesarc_sessions', JSON.stringify(this.sessions));
    },
    
    saveDownloads() {
        localStorage.setItem('gamesarc_downloads', JSON.stringify(this.downloads));
    }
};

// Initialize database
GamesArcDB.init();
// Add to gamesarc-db.js
achievements: JSON.parse(localStorage.getItem('gamesarc_achievements')) || [],

addAchievement(userId, achievementId) 
{
    const achievement = {
        id: achievementId,
        userId,
        date: new Date().toISOString(),
        points: this.calculateAchievementPoints(achievementId)
    };
    this.achievements.push(achievement);
    this.saveAchievements();
}