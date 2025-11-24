/* GamesArc client-side logic
   - Data stored in localStorage:
     - users: array of { name, username, pass, isPremium }
     - currentUser: username
     - games: object sections => arrays of games
     - requests: array of {title, by}
     - suggestions: array of {text, by}
     - messages: array of {from, text, ts}
*/

// Helper: localStorage wrappers
function read(key, fallback){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e){return fallback} }
function write(key,val){ localStorage.setItem(key, JSON.stringify(val)) }

// seed initial data if empty
if(!read('gamesarc_games')) {
  const initial = {
    pc: [
      { id:'elden', title:'Elden Ring', price:499, cover:'https://i.imgur.com/8QfKQ6h.jpeg', logo:'https://i.imgur.com/8QfKQ6h.jpeg', screenshots:[
          'https://i.imgur.com/8QfKQ6h.jpeg',
          '/mnt/data/Screenshot 2025-11-24 at 2.57.31 PM.png' // your uploaded screenshot path
        ],
        minSpecs: "OS: Windows 10\nCPU: Intel i5-8400\nRAM: 12 GB\nGPU: GTX 1060 3GB\nDisk: 60 GB",
        recSpecs: "OS: Windows 10/11\nCPU: AMD Ryzen 5 3600\nRAM: 16 GB\nGPU: RTX 2060\nDisk: 60 GB",
        section:'pc', locked:false
      },
      { id:'gta5', title:'GTA V', price:299, cover:'https://i.imgur.com/5u1K4A1.jpeg', logo:'https://i.imgur.com/5u1K4A1.jpeg', screenshots:[
          'https://i.imgur.com/5u1K4A1.jpeg',
          'https://i.imgur.com/5u1K4A1.jpeg'
        ],
        minSpecs:"OS: Windows 8.1\nCPU: Intel Core 2 Quad Q6600\nRAM:4GB\nGPU: 512MB VRAM\nDisk:72GB", 
        recSpecs:"OS: Windows 10\nCPU: Intel i7-4770\nRAM:8GB\nGPU: GTX 1060\nDisk:72GB",
        section:'pc', locked:false
      }
    ],
    mac: [
      { id:'ghost-tsuma', title:'Ghosts of Tsuma', price:399, cover:'https://i.imgur.com/3XH3QeV.jpeg', logo:'https://i.imgur.com/3XH3QeV.jpeg', screenshots:[
          'https://i.imgur.com/3XH3QeV.jpeg'
        ],
        minSpecs:"macOS 11\nCPU: Apple Intel i5\nRAM:8GB\nGPU: Integrated\nDisk:50GB", 
        recSpecs:"macOS 12\nCPU: Apple M1\nRAM:16GB\nGPU: M1 Max\nDisk:50GB",
        section:'mac', locked:true
      },
      { id:'ghost-yeathe', title:'Ghost of Yeathe', price:349, cover:'https://i.imgur.com/7Y1vQ0d.jpeg', logo:'https://i.imgur.com/7Y1vQ0d.jpeg', screenshots:[
          'https://i.imgur.com/7Y1vQ0d.jpeg'
        ], minSpecs:"TBD", recSpecs:"TBD", section:'mac', locked:true }
    ],
    arm: [
      { id:'mc-arm', title:'Minecraft (ARM)', price:199, cover:'https://i.imgur.com/r1G4B3V.jpeg', logo:'https://i.imgur.com/r1G4B3V.jpeg', screenshots:[
          'https://i.imgur.com/r1G4B3V.jpeg'
        ], minSpecs:"ARM CPU", recSpecs:"ARM+4GB", section:'arm', locked:false }
    ],
    self: [
      { id:'myshmup', title:'My 2D Shooter', price:0, cover:'https://i.imgur.com/jl3VhXr.jpeg', logo:'https://i.imgur.com/jl3VhXr.jpeg', screenshots:[
          'https://i.imgur.com/jl3VhXr.jpeg'
        ], minSpecs:"Any", recSpecs:"Any", section:'self', locked:false }
    ]
  };
  write('gamesarc_games', initial);
}

// ensure users array exists
if(!read('gamesarc_users')) {
  write('gamesarc_users', [{ name:'Admin', username:'admin', pass:'adminpass', isPremium:true, isAdmin:true }]);
}

// other containers
if(!read('gamesarc_requests')) write('gamesarc_requests', []);
if(!read('gamesarc_suggestions')) write('gamesarc_suggestions', []);
if(!read('gamesarc_msgs')) write('gamesarc_msgs', []);

// utilities
function uid(){ return 'id-'+Math.random().toString(36).slice(2,9) }
function el(id){ return document.getElementById(id) }

// render functions
function renderGrid(){
  const games = read('gamesarc_games', {});
  const grid = el('gameGrid'); grid.innerHTML = '';
  // flatten for slider
  const all = [];
  for(const sec of ['pc','mac','arm','self']){
    (games[sec]||[]).forEach(g=>{
      const card = document.createElement('div'); card.className='card';
      const lockedClass = g.locked ? 'locked' : '';
      card.innerHTML = `
        <div class="media ${lockedClass}"><img src="${g.cover}" alt="${g.title}"></div>
        <div class="body">
          <div class="title-row">
            <div class="name">${g.title}</div>
            <div class="price">${g.price ? '₹'+g.price : 'Free'}</div>
          </div>
          <div class="actions">
            <button class="btn" onclick="viewDetails('${g.id}')">Details</button>
            <button class="btn-download" onclick="tryDownload(event,'${g.id}')">${g.locked ? 'Locked' : 'Download'}</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
      all.push(g);
    });
  }
  renderSlider(all);
}

function renderSlider(items){
  const track = el('sliderTrack'); track.innerHTML='';
  items.forEach(it=>{
    const s = document.createElement('div'); s.className='slide';
    s.innerHTML = `<img src="${it.cover}" /><p>${it.title}</p>`;
    s.addEventListener('click', ()=> viewDetails(it.id));
    track.appendChild(s);
  });
}

// view details
function findGameById(id){
  const games = read('gamesarc_games'); for(const k in games) for(const g of games[k]) if(g.id===id) return g; return null;
}

function viewDetails(id){
  const g = findGameById(id);
  if(!g){ alert('Game not found'); return }
  el('gameLogo').src = g.logo || g.cover;
  el('gameTitleDetail').innerText = g.title;
  el('gamePriceDetail').innerText = g.price ? ('₹'+g.price) : 'Free';
  el('minSpecs').innerText = g.minSpecs || 'N/A';
  el('recSpecs').innerText = g.recSpecs || 'N/A';
  const shots = el('screenshots'); shots.innerHTML = '';
  (g.screenshots||[]).forEach(url=>{
    const im = document.createElement('img'); im.src=url; im.style.width='100%'; im.style.marginBottom='8px'; im.style.borderRadius='8px';
    shots.appendChild(im);
  });
  // download button updated
  const dl = el('downloadBtn'); dl.onclick = ()=> tryDownload(null, g.id);
  el('requestDetailBtn').onclick = ()=> {
    el('requestTitle').value = g.title;
    scrollToSection('requests');
  };
  el('gameModal').setAttribute('aria-hidden','false');
}

// download logic with membership check
function tryDownload(e, id){
  if(e) e.stopPropagation();
  const g = findGameById(id);
  if(!g) return alert('Game missing');
  const current = read('gamesarc_currentUser');
  if(g.locked){
    if(!current) return alert('This game requires membership. Please login and buy premium.');
    const users = read('gamesarc_users');
    const me = users.find(u=>u.username===current);
    if(!me || !me.isPremium) return alert('This is a members-only game. Buy membership to download.');
  }
  // in demo we just simulate download
  alert('Starting download for ' + g.title + ' (simulated).');
}

// close modals
el('closeGame').addEventListener('click', ()=> el('gameModal').setAttribute('aria-hidden','true'));

// search
el('searchInput').addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card=>{
    const t = card.querySelector('.name').innerText.toLowerCase();
    card.style.display = t.includes(q) ? 'flex' : 'none';
  });
});

// sticky slider navigation
el('sliderPrev').addEventListener('click', ()=> el('sliderTrack').scrollBy({left:-300, behavior:'smooth'}));
el('sliderNext').addEventListener('click', ()=> el('sliderTrack').scrollBy({left:300, behavior:'smooth'}));

// requests
el('requestBtn').addEventListener('click', ()=>{
  const title = el('requestTitle').value.trim();
  const user = read('gamesarc_currentUser') || 'guest';
  if(!title) return alert('Write a game name to request');
  const requests = read('gamesarc_requests'); requests.unshift({id:uid(), title, by:user, ts:Date.now()}); write('gamesarc_requests', requests);
  el('requestTitle').value = '';
  animateButton(el('requestBtn'));
  alert('Request sent — admin will review.');
});

// suggestion
el('submitSuggestion').addEventListener('click', ()=>{
  const text = el('suggestionText').value.trim();
  const user = read('gamesarc_currentUser') || 'guest';
  if(!text) return alert('Write a suggestion');
  const arr = read('gamesarc_suggestions'); arr.unshift({id:uid(), text, by:user, ts:Date.now()}); write('gamesarc_suggestions', arr);
  el('suggestionText').value='';
  alert('Suggestion saved. Admin can view it in Admin Panel.');
});

// animate request button hover/click
function animateButton(btn){
  btn.style.transform='translateY(-6px) scale(1.03)'; btn.style.boxShadow='0 12px 30px rgba(122,102,255,0.14)';
  setTimeout(()=>{ btn.style.transform=''; btn.style.boxShadow=''; }, 300);
}
// hover animation for request button
const rb = el('requestBtn'); rb.addEventListener('mouseover', ()=> rb.style.transform='translateY(-4px)');
rb.addEventListener('mouseout', ()=> rb.style.transform='');

// membership
el('buyPremiumBtn').addEventListener('click', ()=>{
  const user = read('gamesarc_currentUser');
  if(!user) return alert('Please login to buy membership');
  const users = read('gamesarc_users'); const me = users.find(u=>u.username===user);
  me.isPremium = true; write('gamesarc_users', users); alert('Premium activated (demo).');
});

// free plan
el('freePlanBtn').addEventListener('click', ()=> alert('Free plan selected'));

// contact/chat messaging (iPhone style)
function renderMessages(){
  const msgs = read('gamesarc_msgs',[]);
  const wrap = el('chatMessages'); wrap.innerHTML='';
  msgs.forEach(m=>{
    const d = document.createElement('div'); d.className='msg ' + (m.from==='me' ? 'me' : 'other');
    d.innerText = m.text; wrap.appendChild(d);
  });
  wrap.scrollTop = wrap.scrollHeight;
}
el('chatSend').addEventListener('click', ()=>{
  const text = el('chatText').value.trim(); if(!text) return;
  const msgs = read('gamesarc_msgs',[]); msgs.push({from:'me', text, ts:Date.now()}); write('gamesarc_msgs', msgs);
  el('chatText').value=''; renderMessages();
  // simulated admin reply
  setTimeout(()=>{ const msgs2 = read('gamesarc_msgs',[]); msgs2.push({from:'admin', text:'Thanks — we will reply soon.', ts:Date.now()}); write('gamesarc_msgs', msgs2); renderMessages(); }, 1200);
});

// login & signup modal logic
const authModal = el('authModal'), loginBtn = el('loginBtn'), closeAuth = el('closeAuth');
loginBtn.addEventListener('click', ()=> { authModal.setAttribute('aria-hidden','false'); });
closeAuth.addEventListener('click', ()=> authModal.setAttribute('aria-hidden','true'));

el('tabLogin').addEventListener('click', ()=> switchAuth('login'));
el('tabSignup').addEventListener('click', ()=> switchAuth('signup'));
function switchAuth(tab){ if(tab==='login'){ el('loginForm').classList.remove('hidden'); el('signupForm').classList.add('hidden'); el('tabLogin').classList.add('active'); el('tabSignup').classList.remove('active'); } else { el('loginForm').classList.add('hidden'); el('signupForm').classList.remove('hidden'); el('tabLogin').classList.remove('active'); el('tabSignup').classList.add('active'); } }

// perform signup
el('doSignup').addEventListener('click', (ev)=>{
  ev.preventDefault();
  const name = el('signupName').value.trim(), username=el('signupUser').value.trim(), pass=el('signupPass').value.trim();
  if(!name||!username||!pass) return alert('Fill all fields');
  const users = read('gamesarc_users',[]);
  if(users.find(u=>u.username===username)) return alert('Username taken');
  users.push({name, username, pass, isPremium:false, isAdmin:false});
  write('gamesarc_users', users);
  write('gamesarc_currentUser', username);
  authModal.setAttribute('aria-hidden','true'); alert('Signed up and logged in as ' + username);
  updateUserUI();
});

// perform login
el('doLogin').addEventListener('click', (ev)=>{
  ev.preventDefault();
  const username=el('loginUser').value.trim(), pass=el('loginPass').value.trim();
  const users = read('gamesarc_users',[]);
  const me = users.find(u=>u.username===username && u.pass===pass);
  if(!me) return alert('Invalid credentials');
  write('gamesarc_currentUser', username);
  authModal.setAttribute('aria-hidden','true');
  alert('Logged in as ' + username);
  updateUserUI();
});

function updateUserUI(){
  const user = read('gamesarc_currentUser');
  if(user){
    const users = read('gamesarc_users'); const me = users.find(u=>u.username===user);
    loginBtn.innerText = me ? (me.name || me.username) : 'Account';
    loginBtn.classList.add('outline');
  } else {
    loginBtn.innerText = 'Login';
  }
}

// initial UI update
updateUserUI();
renderGrid();
renderMessages();
el('year').innerText = (new Date()).getFullYear();

// Admin hint: allow opening admin.html if admin user exists (admin created in seed)
