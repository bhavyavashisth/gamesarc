// auth-check.js - SIMPLE AUTH CHECK FOR ALL PAGES
function checkAuthStatus() {
    console.log('🔍 Checking auth status...');
    
    // Get elements
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    // Check if elements exist
    if (!loginBtn) {
        console.error('❌ loginBtn not found in HTML');
        return;
    }
    if (!profileBtn) {
        console.error('❌ profileBtn not found in HTML');
        return;
    }
    
    console.log('✅ Buttons found in HTML');
    
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const session = JSON.parse(localStorage.getItem('auth_session')) || {};
    const users = JSON.parse(localStorage.getItem('gamesarc_users')) || [];
    const user = users.find(u => u.id === session.userId);
    
    console.log('📊 Status:', {
        hasToken: !!token,
        hasSession: !!session.userId,
        hasUser: !!user,
        totalUsers: users.length
    });
    
    if (token && user) {
        // USER IS LOGGED IN
        console.log('✅ User logged in:', user.email);
        
        // Hide login, show profile
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'flex';
        
        // Update user info
        const usernameSpan = document.getElementById('headerUsername');
        const pointsSpan = document.getElementById('headerPoints');
        
        if (usernameSpan) usernameSpan.textContent = user.username || 'User';
        if (pointsSpan) pointsSpan.textContent = (user.points || 0) + ' pts';
        
    } else {
        // USER IS NOT LOGGED IN
        console.log('❌ User not logged in');
        
        // Show login, hide profile
        loginBtn.style.display = 'flex';
        profileBtn.style.display = 'none';
        
        // Clear any expired session
        if (token && !user) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_session');
            console.log('🗑️ Cleared expired session');
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Also run when coming back to page
window.addEventListener('pageshow', checkAuthStatus);

// Make it available globally
window.checkAuthStatus = checkAuthStatus;