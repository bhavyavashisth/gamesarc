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