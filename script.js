// Example game data
const games = {
    pc: [
        { name: "Valorant", img: "https://i.imgur.com/NnhYv7X.png" },
        { name: "GTA V", img: "https://i.imgur.com/5u1K4A1.jpeg" }
    ],
    mac: [
        { name: "Hades", img: "https://i.imgur.com/3ZD8y0V.jpeg" },
        { name: "Hollow Knight", img: "https://i.imgur.com/Jzyw0Fv.jpeg" }
    ],
    arm: [
        { name: "Minecraft ARM", img: "https://i.imgur.com/r1G4B3V.jpeg" }
    ],
    self: [
        { name: "My 2D Shooter", img: "https://i.imgur.com/jl3VhXr.jpeg" }
    ]
};

// Render game cards
function loadGames() {
    const sections = {
        pc: document.getElementById("pcGames"),
        mac: document.getElementById("macGames"),
        arm: document.getElementById("armGames"),
        self: document.getElementById("selfGames")
    };

    for (let key in games) {
        games[key].forEach(game => {
            const card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <img src="${game.img}" alt="${game.name}">
                <div class="game-title">${game.name}</div>
            `;
            sections[key].appendChild(card);
        });
    }
}

loadGames();


// SEARCH BAR FUNCTIONALITY
document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll(".game-card");

    cards.forEach(card => {
        const title = card.querySelector(".game-title").innerText.toLowerCase();
        card.style.display = title.includes(query) ? "block" : "none";
    });
});
const sampleGames = {
    renderSection: function(elId, items) {
        // Implementation of the function goes here
        console.log(`Rendering section with ID: ${elId} and items: ${items}`);
    }
};
{
const container = document.getElementById(elId);
container.innerHTML = '';
items.forEach(g => container.appendChild(createCard(g)));
}

function createCard(game){
const wrap = document.createElement('div');
wrap.className = 'game-card';

wrap.innerHTML = `
<div class="card-media"><img src="${game.cover}" alt="${escapeHtml(game.title)}"></div>
<div class="card-body">
<div class="title-row">
<div class="game-title">${escapeHtml(game.title)}</div>
<div class="game-meta">${game.price ? '₹'+game.price : 'Free'}</div>
</div>
<div class="card-actions">
<a class="btn-ghost" href="#" onclick="viewDetails('${game.id}')">Details</a>
<a class="btn-download" href="${game.fileUrl || '#'}" download>Download</a>
</div>
</div>
`;

// subtle hover elevation handled by CSS; keep whole card clickable for details
wrap.addEventListener('click', (e)=>{
// prevent following the download link double
if(e.target.tagName.toLowerCase() === 'a') return;
viewDetails(game.id);
});

return wrap;
}

function viewDetails(id){
alert('Open game page for: ' + id + '\n(Implement game page or modal later)');
}

// simple HTML escape
function escapeHtml(s){ return (s+'').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

// Search
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', ()=>{
const q = searchInput.value.trim().toLowerCase();
document.querySelectorAll('.game-card').forEach(card=>{
const title = card.querySelector('.game-title').innerText.toLowerCase();
card.style.display = title.includes(q) ? 'flex' : 'none';
});
});

// Login modal behavior (frontend-only stub)
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const performLogin = document.getElementById('performLogin');

loginBtn.addEventListener('click', ()=>{ loginModal.setAttribute('aria-hidden','false'); });
closeLogin.addEventListener('click', ()=>{ loginModal.setAttribute('aria-hidden','true'); });
performLogin.addEventListener('click', ()=>{
const email = document.getElementById('loginEmail').value.trim();
const pass = document.getElementById('loginPassword').value.trim();
if(!email || !pass){ alert('Enter email and password'); return }
// fake login: store token in localStorage
localStorage.setItem('gamesarc_user', JSON.stringify({email, token: 'demo-token'}));
loginModal.setAttribute('aria-hidden','true');
alert('Logged in as ' + email + ' (demo only)');
});

// ---- Admin integration (admin.html saves into localStorage) ----
function adminAddGame(section, title, price, coverDataUrl){
const id = section + '-' + Date.now();
const item = { id, title, price: price?Number(price):0, cover: coverDataUrl||'https://i.imgur.com/placeholder.png', fileUrl:'#' };
games[section] = games[section] || [];
games[section].unshift(item);
localStorage.setItem('gamesarc_games', JSON.stringify(games));
renderAll();
}

// initial render
renderAll();

// open small helper if user clicks details or download link
window.viewDetails = viewDetails; // expose for inline onclick
