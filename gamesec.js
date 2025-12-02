// Game Data - CORRECTED VERSION
const gamesData = [  // Changed from { to [
    {
        id: 1,
        title: "Cyber Nexus",  // Fixed typo from "Mexus" to "Nexus"
        description: "Futuristic RPG with cyberpunk elements and open world exploration",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
        platforms: ["PC", "Mac"],
        votes: 1245,
        downloads: 8900,
        rating: 4.8,
        tags: ["RPG", "Cyberpunk", "Open World"]
    },
    {
        id: 2,
        title: "Stellar Odyssey",
        description: "Space exploration game with intense combat and trading",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
        platforms: ["PC", "Mac ARM", "Mac Intel"],
        votes: 892,
        downloads: 5600,
        rating: 4.5,
        tags: ["Space", "Simulation", "Adventure"]
    },
    {
        id: 3,
        title: "Mythic Realms",
        description: "Fantasy MMORPG with epic quests and magical creatures",
        image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&h=300&fit=crop",
        platforms: ["PC", "Mobile"],
        votes: 2156,
        downloads: 12000,
        rating: 4.9,
        tags: ["MMORPG", "Fantasy", "Multiplayer"]
    },
    {
        id: 4,
        title: "Neon Racing",
        description: "High-speed racing in futuristic neon-lit cities",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
        platforms: ["PC", "Console"],
        votes: 756,
        downloads: 4300,
        rating: 4.3,
        tags: ["Racing", "Arcade", "Multiplayer"]
    },
    {
        id: 5,
        title: "Pixel Dungeon",
        description: "Retro-style dungeon crawler with roguelike elements",
        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
        platforms: ["PC", "Mac", "Mobile"],
        votes: 1543,
        downloads: 7800,
        rating: 4.7,
        tags: ["Retro", "Roguelike", "Adventure"]
    },
    {
        id: 6,
        title: "Ocean Explorer",
        description: "Underwater adventure with deep sea mysteries",
        image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop",
        platforms: ["PC", "Mac ARM"],
        votes: 623,
        downloads: 3200,
        rating: 4.4,
        tags: ["Adventure", "Exploration", "Puzzle"]
    }
];  // Changed from } to ]
// Voting functions
function voteUp(gameId) {
    const userId = getUserId()
    const newTotal = GamesArcDB.voteGame(gameId, userId, 1)
    
    // Update display
    document.querySelector(`[data-game-id="${gameId}"] .vote-count`).textContent = 
        newTotal.toLocaleString()
    
    // Visual feedback
    event.target.style.background = '#10B981'
    setTimeout(() => {
        event.target.style.background = ''
    }, 300)
}

function voteDown(gameId) {
    const userId = getUserId()
    const newTotal = GamesArcDB.voteGame(gameId, userId, -1)
    
    // Update display
    document.querySelector(`[data-game-id="${gameId}"] .vote-count`).textContent = 
        newTotal.toLocaleString()
    
    // Visual feedback
    event.target.style.background = '#EF4444'
    setTimeout(() => {
        event.target.style.background = ''
    }, 300)
}

// Download function
function downloadGame(gameId, gameName) {
    const userId = getUserId()
    const result = GamesArcDB.trackDownload(gameId, userId)
    
    // Update display
    const countElement = document.querySelector(`[data-game-id="${gameId}"] .download-count`)
    if (countElement) {
        countElement.textContent = `(${result.totalDownloads.toLocaleString()})`
    }
    
    // Show download dialog
    if (confirm(`Download "${gameName}"? This will track your download.`)) {
        alert(`Starting download... This is demo #${result.gameDownloads}`)
        
        // In real app, redirect to actual download
        // window.location.href = `/download/${gameId}`
    }
}

// Get user ID (creates if doesn't exist)
function getUserId() {
    let userId = localStorage.getItem('gamesarc_user_id')
    
    if (!userId) {
        // Create new user ID
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('gamesarc_user_id', userId)
        
        // Initialize user in database
        GamesArcDB.getUser(userId)
    }
    
    return userId
}

// Membership function
function upgradeMembership(plan) {
    const userId = getUserId()
    const success = GamesArcDB.updateMembership(userId, plan)
    
    if (success) {
        alert(`Upgraded to ${plan} membership!`)
        // Refresh page or show premium features
    }
}

// Admin function to view data
function viewDatabase() {
    const db = GamesArcDB.getDB()
    console.log('Full Database:', db)
    
    const stats = GamesArcDB.getStats()
    alert(`Stats:
Games: ${stats.totalGames}
Downloads: ${stats.totalDownloads.toLocaleString()}
Votes: ${stats.totalVotes.toLocaleString()}
Users: ${stats.totalUsers}
Page Views: ${stats.pageViews}`)
}