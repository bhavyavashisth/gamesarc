// GamesArc Database System - Updated Categories
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
                        category: "Action",
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
                        category: "RPG",
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
                        category: "RPG",
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
                        category: "Adventure",
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
                        category: "RPG",
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
                        category: "Adventure",
                        size: "2 GB",
                        rating: 4.8,
                        downloads: 200000,
                        description: "Create, explore, and survive in a blocky, procedurally-generated world.",
                        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 7/10",
                            processor: "Intel Core i3-3210",
                            memory: "4 GB RAM",
                            graphics: "Intel HD Graphics 4000",
                            storage: "2 GB available space"
                        },
                        featured: false
                    },
                    {
                        id: 7,
                        title: "FIFA 23",
                        slug: "fifa-23",
                        genre: "Sports, Simulation",
                        category: "Sports",
                        size: "50 GB",
                        rating: 4.5,
                        downloads: 180000,
                        description: "Experience the world's game with unrivaled authenticity in FIFA 23.",
                        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 10 64-bit",
                            processor: "Intel Core i5-3550",
                            memory: "8 GB RAM",
                            graphics: "NVIDIA GTX 670",
                            storage: "50 GB available space"
                        },
                        featured: false
                    },
                    {
                        id: 8,
                        title: "Civilization VI",
                        slug: "civilization-vi",
                        genre: "Strategy, Simulation",
                        category: "Strategy",
                        size: "15 GB",
                        rating: 4.6,
                        downloads: 75000,
                        description: "Build an empire to stand the test of time in Civilization VI.",
                        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                        requirements: {
                            os: "Windows 7/8/10",
                            processor: "Intel Core i3 2.5 Ghz",
                            memory: "4 GB RAM",
                            graphics: "1 GB NVIDIA GeForce 450",
                            storage: "15 GB available space"
                        },
                        featured: false
                    }
                ],
                categories: [
                    { id: 1, name: "Action", count: 42, icon: "⚔️", color: "#ef4444" },
                    { id: 2, name: "Adventure", count: 28, icon: "🗺️", color: "#10b981" },
                    { id: 3, name: "RPG", count: 36, icon: "🎭", color: "#8b5cf6" },
                    { id: 4, name: "Strategy", count: 24, icon: "♟️", color: "#f59e0b" },
                    { id: 5, name: "Sports", count: 18, icon: "⚽", color: "#3b82f6" },
                    { id: 6, name: "Simulation", count: 22, icon: "✈️", color: "#06b6d4" }
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
                    "Power User",
                    "Level 10 Master",
                    "Download Champion"
                ],
                downloads: 45,
                isAdmin: true
            });

            // Add sample regular user
            db.users.push({
                id: 2,
                email: "user@example.com",
                password: btoa("password123"),
                username: "GamerPro",
                points: 1250,
                level: 2,
                joinDate: "2023-10-20",
                achievements: [
                    "New Player",
                    "Level 2 Achiever",
                    "First Download"
                ],
                downloads: 5,
                isAdmin: false
            });

            localStorage.setItem('gamesarc_db', JSON.stringify(db));
        }
    };

    // ... [rest of the database functions remain the same] ...

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
        getGamesByCategory,
        recordDownload,
        getUserDownloads,
        createResetToken,
        validateResetToken,
        deleteResetToken,
        awardPoints,
        getPlatformStats
    };
})();