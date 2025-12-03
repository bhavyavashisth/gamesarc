// gamesarc/comments-db.js
class CommentsDB {
    constructor() {
        this.dbName = 'gamesarc_comments_v1'
        this.init()
    }

    init() {
        if (!localStorage.getItem(this.dbName)) {
            const emptyDB = {
                comments: {},
                users: {},
                settings: {
                    version: '1.0',
                    createdAt: new Date().toISOString()
                }
            }
            this.save(emptyDB)
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem(this.dbName))
    }

    save(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data))
    }

    // Add a comment to a game
    addComment(gameId, userId, username, comment) {
        const db = this.getDB()
        
        if (!db.comments[gameId]) {
            db.comments[gameId] = []
        }
        
        const newComment = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            gameId: gameId,
            userId: userId,
            username: username,
            comment: this.sanitize(comment),
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            userLikes: {},
            replies: []
        }
        
        db.comments[gameId].unshift(newComment) // Newest first
        
        // Save user info
        if (!db.users[userId]) {
            db.users[userId] = {
                id: userId,
                username: username,
                commentsCount: 0
            }
        }
        db.users[userId].commentsCount = (db.users[userId].commentsCount || 0) + 1
        
        this.save(db)
        return newComment
    }

    // Get all comments for a game
    getComments(gameId) {
        const db = this.getDB()
        return db.comments[gameId] || []
    }

    // Get comment count for a game
    getCommentCount(gameId) {
        const db = this.getDB()
        return (db.comments[gameId] || []).length
    }

    // Like a comment
    likeComment(gameId, commentId, userId) {
        const db = this.getDB()
        const gameComments = db.comments[gameId]
        
        if (!gameComments) return false
        
        const comment = gameComments.find(c => c.id === commentId)
        if (!comment) return false
        
        if (comment.userLikes[userId] === 1) {
            // Already liked, remove like
            comment.likes--
            delete comment.userLikes[userId]
        } else if (comment.userLikes[userId] === -1) {
            // Change from dislike to like
            comment.likes++
            comment.dislikes--
            comment.userLikes[userId] = 1
        } else {
            // New like
            comment.likes++
            comment.userLikes[userId] = 1
        }
        
        this.save(db)
        return { likes: comment.likes, dislikes: comment.dislikes }
    }

    // Dislike a comment
    dislikeComment(gameId, commentId, userId) {
        const db = this.getDB()
        const gameComments = db.comments[gameId]
        
        if (!gameComments) return false
        
        const comment = gameComments.find(c => c.id === commentId)
        if (!comment) return false
        
        if (comment.userLikes[userId] === -1) {
            // Already disliked, remove dislike
            comment.dislikes--
            delete comment.userLikes[userId]
        } else if (comment.userLikes[userId] === 1) {
            // Change from like to dislike
            comment.likes--
            comment.dislikes++
            comment.userLikes[userId] = -1
        } else {
            // New dislike
            comment.dislikes++
            comment.userLikes[userId] = -1
        }
        
        this.save(db)
        return { likes: comment.likes, dislikes: comment.dislikes }
    }

    // Reply to a comment
    addReply(gameId, commentId, userId, username, reply) {
        const db = this.getDB()
        const gameComments = db.comments[gameId]
        
        if (!gameComments) return false
        
        const comment = gameComments.find(c => c.id === commentId)
        if (!comment) return false
        
        if (!comment.replies) {
            comment.replies = []
        }
        
        const newReply = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            commentId: commentId,
            userId: userId,
            username: username,
            reply: this.sanitize(reply),
            timestamp: new Date().toISOString()
        }
        
        comment.replies.unshift(newReply)
        this.save(db)
        return newReply
    }

    // Delete a comment (only by owner or admin)
    deleteComment(gameId, commentId, userId) {
        const db = this.getDB()
        const gameComments = db.comments[gameId]
        
        if (!gameComments) return false
        
        const commentIndex = gameComments.findIndex(c => c.id === commentId)
        if (commentIndex === -1) return false
        
        // Check if user is owner
        if (gameComments[commentIndex].userId !== userId) {
            // Check if admin (you can add admin check here)
            return false
        }
        
        gameComments.splice(commentIndex, 1)
        this.save(db)
        return true
    }

    // Get user's display name
    getUserDisplayName(userId) {
        const db = this.getDB()
        return db.users[userId]?.username || 'Anonymous'
    }

    // Sanitize input
    sanitize(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    // Export comments
    exportComments() {
        const db = this.getDB()
        const dataStr = JSON.stringify(db, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', `comments_backup_${new Date().toISOString().split('T')[0]}.json`)
        linkElement.click()
    }

    // Clear all comments (admin only)
    clearAllComments() {
        const db = this.getDB()
        db.comments = {}
        this.save(db)
        return 'All comments cleared'
    }
}

// Create global instance
window.CommentsDB = new CommentsDB()