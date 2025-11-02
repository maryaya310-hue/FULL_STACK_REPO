// Base URL of the PokeAPI
const API_BASE = "https://pokeapi.co/api/v2";

// Get references to DOM elements by their IDs
const searchInput = document.getElementById("searchInput");   // Input field for Pokémon search
const searchBtn = document.getElementById("searchBtn");       // Button to search by name/id
const surpriseBtn = document.getElementById("surpriseBtn");   // Button to get a random Pokémon
const cancelBtn = document.getElementById("cancelBtn");       // Button to cancel a request
const statusEl = document.getElementById("status");           // Element to display status messages
const resultsEl = document.getElementById("results");         // Element to display Pokémon details
const historyList = document.getElementById("historyList");   // Element to display recent search history

// Variables for state management
let controller = null;        // Stores the current AbortController (for cancelling fetches)
let history = [];             // Stores recent search history (up to 10 entries)
let cache = new Map();        // Stores previously fetched Pokémon data for faster access

// -------------------------
// Helpers
// -------------------------

// Function to set status messages (loading, success, error, etc.)
function setStatus(msg) {
  statusEl.textContent = msg;
}

// Save history and lastPokemonData to localStorage
function saveToStorage() {
  localStorage.setItem('pokeHistory', JSON.stringify(history));
  if (lastPokemonData) {
    localStorage.setItem('lastPokemon', JSON.stringify(lastPokemonData));
  }
}

// Load history and lastPokemonData from localStorage
function loadFromStorage() {
  const hist = localStorage.getItem('pokeHistory');
  if (hist) {
    history = JSON.parse(hist);
    historyList.innerHTML = history.map(h => `<li>${h}</li>`).join("");
  }
  const last = localStorage.getItem('lastPokemon');
  if (last) {
    try {
      lastPokemonData = JSON.parse(last);
      renderPokemon(lastPokemonData.pokemon, lastPokemonData.species);
      setStatus("Restored last Pokémon ✅");
    } catch {}
  }
}

// Function to display Pokémon details on the page
function renderPokemon(pokemon, species) {
  // Type badges
  const typeBadges = pokemon.types.map(t => `<span class=\"type-badge\" style=\"background:linear-gradient(90deg,#43e97b 60%,#38f9d7 100%)\">${t.type.name}</span>`).join(" ");
  // English flavor text
  const flavor = (species.flavor_text_entries.find(e => e.language.name === "en") || {}).flavor_text || "No description available.";
  // Stats table
  const statsTable = `
    <table style="width:100%;margin-top:8px;font-size:1rem;">
      <tbody>
        ${pokemon.stats.map(s => `<tr><td style='color:#2a75bb;font-weight:600;'>${s.stat.name}</td><td style='text-align:right;'>${s.base_stat}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
  resultsEl.innerHTML = `
    <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} <span style="color:#888;font-size:1.1rem;">#${pokemon.id}</span></h2>
    <img class="image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <div style="margin:10px 0 8px 0;">${typeBadges}</div>
    <p style="font-style:italic;line-height:1.4;color:#444;background:rgba(255,255,255,0.13);padding:8px 12px;border-radius:8px;">${flavor}</p>
    <div style="margin-top:12px;margin-bottom:4px;font-weight:700;color:#2a75bb;">Base Stats</div>
    ${statsTable}
  `;
  resultsEl.classList.remove("hidden");
}
  function renderPokemon(pokemon, species) {
    // Type badges
    const typeBadges = pokemon.types.map(t => `<span class="type-badge">${t.type.name}</span>`).join(" ");
    // English flavor text
    const flavor = (species.flavor_text_entries.find(e => e.language.name === "en") || {}).flavor_text || "No description available.";
    // Abilities
    const abilities = pokemon.abilities.map(a => a.ability.name.replace(/-/g, ' ')).join(', ');
    // Genus (species info)
    const genus = (species.genera.find(g => g.language.name === "en") || {}).genus || "Pokémon";
    // Animated sprite (if available)
    const animated = pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
    // Stats table
    const statsTable = `
      <table style=\"width:100%;margin-top:8px;font-size:1rem;border-collapse:collapse;\">
        <tbody>
          ${pokemon.stats.map(s => `<tr><td style='color:#1db954;font-weight:600;padding:2px 0;'>${s.stat.name}</td><td style='text-align:right;padding:2px 0;'><div style='background:linear-gradient(90deg,#43e97b 60%,#38f9d7 100%);height:8px;border-radius:4px;width:${Math.min(s.base_stat,150)/1.5}%;display:inline-block;vertical-align:middle;margin-right:6px;'></div><span style='font-weight:700;'>${s.base_stat}</span></td></tr>`).join("")}
        </tbody>
      </table>
    `;
    resultsEl.innerHTML = `
    <h2 style=\"display:flex;align-items:center;gap:10px;justify-content:center;color:#1db954;\">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} <span style=\"color:#888;font-size:1.1rem;\">#${pokemon.id}</span></h2>
      <div style="display:flex;justify-content:center;align-items:center;gap:18px;margin-bottom:8px;">
        <img class="image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        ${animated ? `<img class="image" src="${animated}" alt="${pokemon.name} animated" style="width:90px;height:90px;background:transparent;box-shadow:none;">` : ''}
      </div>
      <div style="margin:10px 0 8px 0;">${typeBadges}</div>
      <div style="margin-bottom:8px;color:#555;font-size:1.08rem;"><b>Abilities:</b> ${abilities}</div>
      <p style="font-style:italic;line-height:1.4;color:#444;background:rgba(10, 1, 1, 0.13);padding:8px 12px;border-radius:8px;">${flavor}</p>
    <div style=\"margin-top:12px;margin-bottom:4px;font-weight:700;color:#1db954;\">Base Stats</div>
      ${statsTable}
      <div style="margin-top:18px;text-align:right;font-size:1.02rem;color:#888;font-style:italic;">${genus}</div>
    `;
    resultsEl.classList.remove("hidden");
  }

// Function to update search history (shows last 10 Pokémon searched)
function updateHistory(id) {
  history.unshift(id);                           // Add new search at the beginning
  history = history.slice(0, 10);                // Keep only the 10 most recent searches
  historyList.innerHTML = history.map(h => `<li>${h}</li>`).join("");  // Update list in UI
}

// -------------------------
// Fetch with async/await
// -------------------------

// Function to fetch Pokémon data (by name or ID)
async function fetchPokemon(query) {
  if (!query) return;   // If input is empty=false, do nothing

  // Cancel previous request if one is still pending
  if (controller) controller.abort();
  controller = new AbortController();  // Create a new AbortController for this request

  setStatus("Loading...");  // Show loading message

  try {
    // If data is already cached, use it instead of fetching again
    if (cache.has(query)) {
      setStatus("From cache ✅");
      renderPokemon(cache.get(query).pokemon, cache.get(query).species);
      updateHistory(query);
      return;
    }

    // Fetch Pokémon data (pokemon details and species info) in parallel
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`${API_BASE}/pokemon/${query}`, { signal: controller.signal }),
      fetch(`${API_BASE}/pokemon-species/${query}`, { signal: controller.signal })
    ]);

    // If either request failed, throw an error
    if (!pokemonRes.ok || !speciesRes.ok) throw new Error("Pokémon not found");

    // Parse JSON responses
    const pokemon = await pokemonRes.json();
    const species = await speciesRes.json();

    // Store result in cache for faster future access
    cache.set(query, { pokemon, species });

    // Render Pokémon data on the page
    renderPokemon(pokemon, species);

    // Update history list
    updateHistory(query);

    setStatus("Success ✅");  // Show success message

  } catch (err) {
    // If request was cancelled
    if (err.name === "AbortError") {
      setStatus("Request cancelled ❌");
    } 
    // If another error occurred (e.g., Pokémon not found)
    else {
      setStatus("Error: " + err.message);
    }
  }
}

// -------------------------
// Event Listeners
// -------------------------

// When "Search" button is clicked → fetch Pokémon by input value
searchBtn.addEventListener("click", () => {
  fetchPokemon(searchInput.value.toLowerCase().trim());
});

// When "Surprise Me" button is clicked → fetch random Pokémon (ID 1–898)
surpriseBtn.addEventListener("click", () => {
  const id = Math.floor(Math.random() * 898) + 1;
  fetchPokemon(id);
});

// When "Cancel" button is clicked → abort current fetch
cancelBtn.addEventListener("click", () => {
  if (controller) controller.abort();
  setStatus("Cancelled ❌");
});
