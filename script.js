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
