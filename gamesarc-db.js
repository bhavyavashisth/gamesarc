// GamesArc Database System
const GamesArcDB = (function() {
    // Database initialization
    const initDB = () => {
        if (!localStorage.getItem('gamesarc_db')) {
            const db = {
                users: [],
                sessions: [],
                downloads: [],
                resetTokens: {},
                gameStats: {},
                games: [
                    {
                        id: 1,
                        title: "Grand Theft Auto V",
                        slug: "gta-v",
                        genre: "Action, Adventure",
                        size: "95 GB",
                        rating: 4.8,
                        downloads: 125000,
                        description: "Explore the stunning world of Los Santos and Blaine County in the ultimate Grand Theft Auto V experience.",
                        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 10 64-bit",
                            processor: "Intel Core i5-3470",
                            memory: "8 GB RAM",
                            graphics: "NVIDIA GTX 660 2GB",
                            storage: "95 GB available space"
                        },
                        featured: true
                    },
                    {
                        id: 2,
                        title: "Elden Ring",
                        slug: "elden-ring",
                        genre: "RPG, Action",
                        size: "60 GB",
                        rating: 4.9,
                        downloads: 89000,
                        description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
                        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 10",
                            processor: "Intel Core i5-8400",
                            memory: "12 GB RAM",
                            graphics: "NVIDIA GeForce GTX 1060",
                            storage: "60 GB available space"
                        },
                        featured: true
                    },
                    {
                        id: 3,
                        title: "Cyberpunk 2077",
                        slug: "cyberpunk-2077",
                        genre: "RPG, Action",
                        size: "70 GB",
                        rating: 4.7,
                        downloads: 105000,
                        description: "An open-world, action-adventure RPG set in the megalopolis of Night City.",
                        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 10",
                            processor: "Intel Core i7-4790",
                            memory: "12 GB RAM",
                            graphics: "NVIDIA GeForce GTX 1060",
                            storage: "70 GB available space"
                        },
                        featured: true
                    },
                    {
                        id: 4,
                        title: "Red Dead Redemption 2",
                        slug: "red-dead-redemption-2",
                        genre: "Action, Adventure",
                        size: "150 GB",
                        rating: 4.9,
                        downloads: 95000,
                        description: "America, 1899. The end of the wild west era has begun.",
                        image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 10",
                            processor: "Intel Core i7-4770K",
                            memory: "12 GB RAM",
                            graphics: "NVIDIA GeForce GTX 1060",
                            storage: "150 GB available space"
                        },
                        featured: false
                    },
                    {
                        id: 5,
                        title: "The Witcher 3: Wild Hunt",
                        slug: "the-witcher-3",
                        genre: "RPG, Adventure",
                        size: "50 GB",
                        rating: 4.9,
                        downloads: 150000,
                        description: "As war rages on, you take on the greatest contract of your life.",
                        image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 7/8/10",
                            processor: "Intel CPU Core i5-2500K",
                            memory: "6 GB RAM",
                            graphics: "NVIDIA GeForce GTX 660",
                            storage: "50 GB available space"
                        },
                        featured: false
                    },
                    {
                        id: 6,
                        title: "Minecraft",
                        slug: "minecraft",
                        genre: "Sandbox, Adventure",
                        size: "2 GB",
                        rating: 4.8,
                        downloads: 200000,
                        description: "Create, explore, and survive in a blocky, procedurally-generated world.",
                        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 7/10",
                            processor: "Intel Core i3-3210",
                            memory: "4 GB RAM",
                            graphics: "Intel HD Graphics 4000",
                            storage: "2 GB available space"
                        },
                        featured: false
                    }
                ],
                categories: [
                    { id: 1, name: "Action", count: 42 },
                    { id: 2, name: "Adventure", count: 28 },
                    { id: 3, name: "RPG", count: 36 },
                    { id: 4, name: "Strategy", count: 24 },
                    { id: 5, name: "Sports", count: 18 },
                    { id: 6, name: "Simulation", count: 22 }
                ],
                testimonials: [
                    {
                        name: "Alex Johnson",
                        role: "Professional Gamer",
                        text: "GamesArc has completely changed how I discover new games. The points system keeps me engaged!",
                        avatar: "👨‍🎮"
                    },
                    {
                        name: "Sarah Miller",
                        role: "Casual Player",
                        text: "As someone new to PC gaming, this platform made it so easy to find and download quality games.",
                        avatar: "👩‍💻"
                    },
                    {
                        name: "Mike Chen",
                        role: "Game Developer",
                        text: "The community here is amazing. I love tracking my gaming journey and unlocking achievements.",
                        avatar: "👨‍💼"
                    }
                ]
            };

            // Add admin user
            db.users.push({
                id: 1,
                email: "admin@gamesarc.com",
                password: btoa("admin123"), // Base64 encoding for demo
                username: "Admin",
                points: 5000,
                level: 10,
                joinDate: "2023-01-15",
                achievements: [
                    "Early Adopter",
                    "Game Collector",
                    "Power User"
                ],
                downloads: 45,
                isAdmin: true
            });

            localStorage.setItem('gamesarc_db', JSON.stringify(db));
        }
    };

    // Get database
    const getDB = () => {
        return JSON.parse(localStorage.getItem('gamesarc_db'));
    };

    // Save database
    const saveDB = (db) => {
        localStorage.setItem('gamesarc_db', JSON.stringify(db));
    };

    // User operations
    const findUserByEmail = (email) => {
        const db = getDB();
        return db.users.find(user => user.email === email);
    };

    const findUserById = (id) => {
        const db = getDB();
        return db.users.find(user => user.id === id);
    };

    const createUser = (userData) => {
        const db = getDB();
        const newUser = {
            id: Date.now(),
            email: userData.email,
            password: btoa(userData.password),
            username: userData.username,
            points: 100, // Starting bonus
            level: 1,
            joinDate: new Date().toISOString().split('T')[0],
            achievements: ["New Player"],
            downloads: 0,
            isAdmin: false
        };
        
        db.users.push(newUser);
        saveDB(db);
        return newUser;
    };

    const updateUser = (userId, updates) => {
        const db = getDB();
        const userIndex = db.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            db.users[userIndex] = { ...db.users[userIndex], ...updates };
            saveDB(db);
            return db.users[userIndex];
        }
        return null;
    };

    // Session management
    const createSession = (userId) => {
        const db = getDB();
        const sessionId = 'session_' + Date.now();
        const session = {
            id: sessionId,
            userId: userId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        db.sessions.push(session);
        saveDB(db);
        return session;
    };

    const getSession = (sessionId) => {
        const db = getDB();
        return db.sessions.find(s => s.id === sessionId);
    };

    const deleteSession = (sessionId) => {
        const db = getDB();
        db.sessions = db.sessions.filter(s => s.id !== sessionId);
        saveDB(db);
    };

    // Game operations
    const getAllGames = () => {
        const db = getDB();
        return db.games;
    };

    const getGameBySlug = (slug) => {
        const db = getDB();
        return db.games.find(game => game.slug === slug);
    };

    const getFeaturedGames = () => {
        const db = getDB();
        return db.games.filter(game => game.featured);
    };

    // Download tracking
    const recordDownload = (userId, gameId) => {
        const db = getDB();
        const download = {
            id: Date.now(),
            userId: userId,
            gameId: gameId,
            downloadedAt: new Date().toISOString(),
            pointsAwarded: 10
        };
        
        db.downloads.push(download);
        
        // Update game stats
        if (!db.gameStats[gameId]) {
            db.gameStats[gameId] = { downloadCount: 0 };
        }
        db.gameStats[gameId].downloadCount++;
        
        saveDB(db);
        return download;
    };

    const getUserDownloads = (userId) => {
        const db = getDB();
        return db.downloads.filter(d => d.userId === userId);
    };

    // Password reset tokens
    const createResetToken = (email) => {
        const db = getDB();
        const token = 'reset_' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        db.resetTokens[token] = {
            email: email,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hour
        };
        
        saveDB(db);
        return token;
    };

    const validateResetToken = (token) => {
        const db = getDB();
        const tokenData = db.resetTokens[token];
        
        if (!tokenData) return false;
        
        if (new Date(tokenData.expiresAt) < new Date()) {
            delete db.resetTokens[token];
            saveDB(db);
            return false;
        }
        
        return tokenData.email;
    };

    const deleteResetToken = (token) => {
        const db = getDB();
        delete db.resetTokens[token];
        saveDB(db);
    };

    // Points and achievements
    const awardPoints = (userId, points) => {
        const db = getDB();
        const user = findUserById(userId);
        
        if (user) {
            user.points += points;
            
            // Level up logic (1000 points per level)
            const newLevel = Math.floor(user.points / 1000) + 1;
            if (newLevel > user.level) {
                user.level = newLevel;
                user.achievements.push(`Level ${newLevel} Achiever`);
            }
            
            saveDB(db);
            return user;
        }
        
        return null;
    };

    // Stats
    const getPlatformStats = () => {
        const db = getDB();
        const totalDownloads = db.downloads.length;
        const totalUsers = db.users.length;
        const totalPoints = db.users.reduce((sum, user) => sum + user.points, 0);
        
        return {
            totalGames: db.games.length,
            totalDownloads: totalDownloads,
            totalUsers: totalUsers,
            totalPoints: totalPoints,
            activeUsers: db.sessions.length
        };
    };

    return {
        initDB,
        getDB,
        findUserByEmail,
        findUserById,
        createUser,
        updateUser,
        createSession,
        getSession,
        deleteSession,
        getAllGames,
        getGameBySlug,
        getFeaturedGames,
        recordDownload,
        getUserDownloads,
        createResetToken,
        validateResetToken,
        deleteResetToken,
        awardPoints,
        getPlatformStats
    };
})();