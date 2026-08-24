/* =========================================================
   BOUTIQUE
========================================================= */

function openShop(){

    if(playing){
        setPaused(true);
    }

    document.getElementById("mainMenu").style.display    = "none";
    document.getElementById("gameOver").style.display    = "none";
    document.getElementById("pauseScreen").style.display = "none";
    document.getElementById("pauseBtn").style.display    = "none";
    document.getElementById("skillBar").style.display    = "none";

    document.getElementById("shop").style.display = "block";

    showLocker();

}

function closeShop(){

    document.getElementById("shop").style.display = "none";

    playing = false;
    paused  = false;

    document.getElementById("mainMenu").style.display = "block";

    updateUI();

}


const RARITIES = [
    {name:"COMMUN",      col:"#8fa0c0"},
    {name:"RARE",        col:"#4fa8ff"},
    {name:"ÉPIQUE",      col:"#b06cff"},
    {name:"LÉGENDAIRE",  col:"#ffb01f"}
];


function skinCard(skin, inShop){

    const owned    = ownedSkins.includes(skin.id);
    const equipped = currentSkin === skin.id;
    const broke    = !owned && totalCoins < skin.price;

    const rar = RARITIES[skin.rarity || 0];

    const card = document.createElement("div");

    card.className =
        "skinCard" +
        (equipped ? " equipped" : "") +
        (owned ? "" : " locked") +
        (broke ? " broke" : "");

    /* la teinte de la carte vient du slime lui-même */
    card.style.setProperty("--tint", skin.color + "33");
    card.style.setProperty("--accent", rar.col);

    const rarity = document.createElement("div");

    rarity.className   = "rarity";
    rarity.textContent = T("rar." + (skin.rarity || 0));

    card.appendChild(rarity);

    /* la scène : halo au sol et slime animé */
    const stage = document.createElement("div");

    stage.className = "slimeStage";

    const cv = document.createElement("canvas");

    const dp   = Math.min(window.devicePixelRatio || 1, 3);
    const size = 112;

    cv.width  = size * dp;
    cv.height = size * dp;

    const c = cv.getContext("2d");

    c.setTransform(dp, 0, 0, dp, 0, 0);
    c.save();
    c.translate(size / 2, size / 2 + size * .06);
    paintSkinSlime(c, skin, size * .30, performance.now() / 1000, true);
    c.restore();

    cv.dataset.skin = skin.id;

    stage.appendChild(cv);
    card.appendChild(stage);

    const name = document.createElement("div");

    name.className   = "skinName";
    name.style.color = skin.color;
    name.textContent = skin.name;

    card.appendChild(name);

    const state = document.createElement("div");

    if(equipped){
        state.className   = "skinState eq";
        state.textContent = "🟢 " + T("shop.equipped");
    }else if(owned){
        state.className   = "skinState own";
        state.textContent = "✅ " + T("shop.owned");
    }else{
        state.className = "skinPrice";
        state.innerHTML =
            '<i class="coinDot"></i> ' + skin.price.toLocaleString("fr-FR");
    }

    card.appendChild(state);

    const btn = document.createElement("button");

    btn.className =
        "cardButton " +
        (equipped ? "done" : owned ? "equip" : "buy");

    btn.textContent = equipped ? T("shop.equipped") : owned ? T("shop.equip") : T("shop.buy");

    if(equipped){
        btn.disabled = true;
    }

    btn.onclick = () => {

        if(owned){

            currentSkin = skin.id;
            saveGame();
            sound(800, .09, "sine", .04);

        }else if(totalCoins < skin.price){

            pickupMessage("❌ " + T("shop.notEnough"), "#ff466e");
            sound(120, .18, "sawtooth", .05);
            return;

        }else{

            totalCoins -= skin.price;
            ownedSkins.push(skin.id);
            currentSkin = skin.id;
            saveGame();
            coinChime();

        }

        renderShop();

    };

    card.appendChild(btn);

    return card;

}


/* les vignettes de la boutique s'animent tant qu'elle est ouverte */
function animateShopIcons(){

    if(document.getElementById("shop").style.display !== "block"){
        return;
    }

    const t = performance.now() / 1000;

    document.querySelectorAll("#shopContent canvas").forEach(cv => {

        const skin = SKINS.find(sk => sk.id === cv.dataset.skin);

        if(!skin){
            return;
        }

        const dp   = Math.min(window.devicePixelRatio || 1, 3);
        const size = cv.width / dp;

        const c = cv.getContext("2d");

        c.setTransform(dp, 0, 0, dp, 0, 0);
        c.clearRect(0, 0, size, size);

        c.save();
        c.translate(size / 2, size / 2 + size * .06);

        paintSkinSlime(c, skin, size * .30, t, true);

        c.restore();

    });

}


/* =========================================================
   CARTE DE CAPACITE

   Meme boite que les skins, mais avec un glyphe au lieu
   du slime : on achete ici, on ne "s'equipe" pas.
========================================================= */

function abilityCard(ab, inShop){

    const owned = hasAbility(ab.id);
    const broke = !owned && totalCoins < ab.price;

    const rar = RARITIES[ab.rarity || 0];

    const card = document.createElement("div");

    card.className =
        "skinCard" +
        (owned ? " equipped" : " locked") +
        (broke ? " broke" : "");

    card.style.setProperty("--tint", ab.color + "33");
    card.style.setProperty("--accent", rar.col);

    const rarity = document.createElement("div");

    rarity.className   = "rarity";
    rarity.textContent = T("rar." + (ab.rarity || 0));

    card.appendChild(rarity);

    const stage = document.createElement("div");

    stage.className = "slimeStage";

    const glyph = document.createElement("div");

    glyph.className   = "abilityGlyph";
    glyph.textContent = ab.icon;

    stage.appendChild(glyph);
    card.appendChild(stage);

    const name = document.createElement("div");

    name.className   = "skinName";
    name.style.color = ab.color;
    name.textContent = ab.name;

    card.appendChild(name);

    const state = document.createElement("div");

    if(owned){
        state.className   = "skinState own";
        state.textContent = "✅ " + T("shop.owned");
    }else{
        state.className = "skinPrice";
        state.innerHTML =
            '<i class="coinDot"></i> ' + ab.price.toLocaleString("fr-FR");
    }

    card.appendChild(state);

    const desc = document.createElement("div");

    desc.className   = "abilityDesc";
    desc.textContent = T("ab.dashDesc");

    card.appendChild(desc);

    const btn = document.createElement("button");

    btn.className = "cardButton " + (owned ? "done" : "buy");

    btn.textContent = owned ? T("shop.active") : T("shop.buy");

    if(owned){
        btn.disabled = true;
    }

    btn.onclick = () => {

        if(owned){
            return;
        }

        if(totalCoins < ab.price){

            pickupMessage("❌ " + T("shop.notEnough"), "#ff466e");
            sound(120, .18, "sawtooth", .05);
            return;

        }

        totalCoins -= ab.price;
        ownedAbilities.push(ab.id);
        saveGame();
        coinChime();

        renderShop();

    };

    card.appendChild(btn);

    return card;

}


/* =========================================================
   AFFICHAGE DU CASIER / DE LA BOUTIQUE

   Deux niveaux d'onglets :
     CASIER / BOUTIQUE   puis   SKINS / CAPACITES
========================================================= */

let shopInStore  = false;      /* false = casier, true = boutique */
let shopCategory = "skins";    /* "skins" ou "abilities"          */
let shopOnlyMissing = false;   /* n'afficher que ce qu'on n'a pas */
let shopSort     = "rarity";   /* "rarity" | "cheap" | "rich"     */


function setTab(shop){

    document.getElementById("shopSkinsButton").classList.toggle("active", shop);
    document.getElementById("lockerButton").classList.toggle("active", !shop);

    document.getElementById("catSkinsButton")
        .classList.toggle("active", shopCategory === "skins");

    document.getElementById("catAbilityButton")
        .classList.toggle("active", shopCategory === "abilities");

}


function renderShop(){

    document.getElementById("shopTitle").textContent =
        shopInStore ? "🛒 BOUTIQUE" : "🎒 CASIER";

    setTab(shopInStore);

    const container = document.getElementById("shopContent");

    container.innerHTML = "";

    /* l'ordre choisi dans la barre de filtres */
    const order =
        shopSort === "cheap"
            ? (a, b) => (a.price || 0) - (b.price || 0)
        : shopSort === "rich"
            ? (a, b) => (b.price || 0) - (a.price || 0)
            : (a, b) => (a.rarity || 0) - (b.rarity || 0) ||
                        (a.price || 0) - (b.price || 0);

    /* la barre n'a de sens qu'en boutique : au casier, tout est a nous */
    const filters = document.getElementById("shopFilters");

    if(filters){
        filters.style.display = "flex";
    }

    const ownedBtn = document.getElementById("filtOwned");

    if(ownedBtn){
        ownedBtn.style.display = shopInStore ? "block" : "none";
        ownedBtn.classList.toggle("on", shopOnlyMissing);
    }

    document.getElementById("sortRarity").classList.toggle("on", shopSort === "rarity");
    document.getElementById("sortCheap").classList.toggle("on",  shopSort === "cheap");
    document.getElementById("sortRich").classList.toggle("on",   shopSort === "rich");

    if(shopCategory === "abilities"){

        let list = shopInStore
            ? ABILITIES.slice()
            : ABILITIES.filter(ab => hasAbility(ab.id));

        if(shopInStore && shopOnlyMissing){
            list = list.filter(ab => !hasAbility(ab.id));
        }

        list = list.sort(order);

        lasShopCount(list.length, shopInStore ? ABILITIES.length : list.length);

        if(!list.length){
            container.appendChild(emptyNote(
                shopOnlyMissing ? T("shop.allOwned") : T("shop.noAbility")
            ));
            return;
        }

        list.forEach(ab => container.appendChild(abilityCard(ab, shopInStore)));

        return;

    }

    let list = shopInStore
        ? SKINS.slice()
        : SKINS.filter(skin => ownedSkins.includes(skin.id));

    if(shopInStore && shopOnlyMissing){
        list = list.filter(skin => !ownedSkins.includes(skin.id));
    }

    list = list.sort(order);

    lasShopCount(list.length, shopInStore ? SKINS.length : list.length);

    if(!list.length){
        container.appendChild(emptyNote(T("shop.allOwned")));
        return;
    }

    list.forEach(skin => container.appendChild(skinCard(skin, shopInStore)));

}


/* le petit compteur au-dessus de la grille */
function lasShopCount(shown, total){

    const el = document.getElementById("shopCount");

    if(!el){
        return;
    }

    if(shopInStore && shopCategory === "skins"){

        const owned = SKINS.filter(sk => ownedSkins.includes(sk.id)).length;

        el.textContent =
            shown + " / " + total + "  •  " +
            owned + " " + T("shop.ownedCount") + " " + SKINS.length;

    }else{
        el.textContent = shown + " / " + total;
    }

}


function emptyNote(text){

    const d = document.createElement("div");

    d.style.gridColumn = "1 / -1";
    d.style.textAlign  = "center";
    d.style.color      = "#8b9ac0";
    d.style.fontSize   = "13px";
    d.style.padding    = "26px 10px";

    d.textContent = text;

    return d;

}


function showShop(){
    shopInStore = true;
    renderShop();
}


function showLocker(){
    shopInStore = false;
    renderShop();
}


function setShopCategory(cat){
    shopCategory = cat;
    renderShop();
}


/* =========================================================
   GÉNÉRATEUR DE QR CODE (autonome, aucune librairie externe)

   Mode octet, niveau de correction M, versions 1 à 6.
   Suffisant pour une adresse web courte ou un code de duel.
========================================================= */

const QR_SPECS = [
    /* version, codewords totaux, blocs, données par bloc, correction par bloc */
    {v:1, blocks:1, dataPerBlock:16, ecPerBlock:10},
    {v:2, blocks:1, dataPerBlock:28, ecPerBlock:16},
    {v:3, blocks:1, dataPerBlock:44, ecPerBlock:26},
    {v:4, blocks:2, dataPerBlock:32, ecPerBlock:18},
    {v:5, blocks:2, dataPerBlock:43, ecPerBlock:24},
    {v:6, blocks:4, dataPerBlock:27, ecPerBlock:16}
];

const QR_ALIGN = {1:null, 2:18, 3:22, 4:26, 5:30, 6:34};

/* ---- arithmétique de Galois, pour la correction d'erreurs ---- */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function(){

    let x = 1;

    for(let i = 0; i < 255; i++){

        GF_EXP[i] = x;
        GF_LOG[x] = i;

        x <<= 1;

        if(x & 0x100){
            x ^= 0x11D;
        }

    }

    for(let i = 255; i < 512; i++){
        GF_EXP[i] = GF_EXP[i - 255];
    }

})();

function gfMul(a, b){

    if(a === 0 || b === 0){
        return 0;
    }

    return GF_EXP[GF_LOG[a] + GF_LOG[b]];

}

function rsGenerator(degree){

    let poly = [1];

    for(let i = 0; i < degree; i++){

        const next = new Array(poly.length + 1).fill(0);

        for(let j = 0; j < poly.length; j++){
            next[j]     ^= gfMul(poly[j], GF_EXP[i]);
            next[j + 1] ^= poly[j];
        }

        poly = next;

    }

    /*
    poly est construit en degrés croissants ; l'encodeur ci-dessous
    attend le coefficient dominant en premier. On le retourne.
    */
    return poly.reverse();

}

function rsEncode(data, ecLength){

    const gen = rsGenerator(ecLength);

    const res = new Array(ecLength).fill(0);

    for(const byte of data){

        const factor = byte ^ res[0];

        res.shift();
        res.push(0);

        for(let i = 0; i < gen.length - 1; i++){
            res[i] ^= gfMul(gen[i + 1], factor);
        }

    }

    return res;

}


/* ---- masques ---- */

const QR_MASKS = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0
];


function qrEncode(text){

    const bytes = [];

    for(const ch of unescape(encodeURIComponent(text))){
        bytes.push(ch.charCodeAt(0) & 0xFF);
    }

    /* plus petite version qui contient le message */
    const spec = QR_SPECS.find(sp => {

        const capacityBits = sp.blocks * sp.dataPerBlock * 8 - 4 - 8;

        return bytes.length * 8 <= capacityBits;

    });

    if(!spec){
        return null;
    }

    const version = spec.v;
    const size    = 17 + version * 4;

    const totalData = spec.blocks * spec.dataPerBlock;


    /* ---- flux binaire ---- */

    const bits = [];

    const push = (value, length) => {
        for(let i = length - 1; i >= 0; i--){
            bits.push((value >> i) & 1);
        }
    };

    push(0b0100, 4);          /* mode octet */
    push(bytes.length, 8);    /* longueur (versions 1 à 9) */

    for(const b of bytes){
        push(b, 8);
    }

    /* terminateur */
    for(let i = 0; i < 4 && bits.length < totalData * 8; i++){
        bits.push(0);
    }

    while(bits.length % 8 !== 0){
        bits.push(0);
    }

    const codewords = [];

    for(let i = 0; i < bits.length; i += 8){

        let byte = 0;

        for(let j = 0; j < 8; j++){
            byte = (byte << 1) | bits[i + j];
        }

        codewords.push(byte);

    }

    const PAD = [0xEC, 0x11];

    let padIndex = 0;

    while(codewords.length < totalData){
        codewords.push(PAD[padIndex++ % 2]);
    }


    /* ---- blocs et correction d'erreurs ---- */

    const dataBlocks = [];
    const ecBlocks   = [];

    for(let b = 0; b < spec.blocks; b++){

        const chunk = codewords.slice(
            b * spec.dataPerBlock,
            (b + 1) * spec.dataPerBlock
        );

        dataBlocks.push(chunk);
        ecBlocks.push(rsEncode(chunk, spec.ecPerBlock));

    }

    /* entrelacement */
    const finalBytes = [];

    for(let i = 0; i < spec.dataPerBlock; i++){
        for(const blk of dataBlocks){
            finalBytes.push(blk[i]);
        }
    }

    for(let i = 0; i < spec.ecPerBlock; i++){
        for(const blk of ecBlocks){
            finalBytes.push(blk[i]);
        }
    }


    /* ---- matrice ---- */

    const modules  = [];
    const reserved = [];

    for(let r = 0; r < size; r++){
        modules.push(new Array(size).fill(false));
        reserved.push(new Array(size).fill(false));
    }

    const setFn = (r, c, val) => {
        modules[r][c]  = val;
        reserved[r][c] = true;
    };

    /* motifs de détection */
    const finder = (row, col) => {

        for(let r = -1; r <= 7; r++){
            for(let c = -1; c <= 7; c++){

                const rr = row + r;
                const cc = col + c;

                if(rr < 0 || rr >= size || cc < 0 || cc >= size){
                    continue;
                }

                const inRing =
                    (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                    (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4);

                setFn(rr, cc, inRing);

            }
        }

    };

    finder(0, 0);
    finder(0, size - 7);
    finder(size - 7, 0);

    /* motifs de synchronisation */
    for(let i = 8; i < size - 8; i++){
        setFn(6, i, i % 2 === 0);
        setFn(i, 6, i % 2 === 0);
    }

    /* motifs d'alignement */
    const alignPos = QR_ALIGN[version];

    if(alignPos){

        const centers = [6, alignPos];

        for(const r of centers){
            for(const c of centers){

                /* on saute ceux qui tomberaient sur un motif de détection */
                if(
                    (r === 6 && c === 6) ||
                    (r === 6 && c === size - 7) ||
                    (r === size - 7 && c === 6)
                ){
                    continue;
                }

                for(let dr = -2; dr <= 2; dr++){
                    for(let dc = -2; dc <= 2; dc++){

                        const on =
                            Math.max(Math.abs(dr), Math.abs(dc)) !== 1;

                        setFn(r + dr, c + dc, on);

                    }
                }

            }
        }

    }

    /* module toujours noir */
    setFn(size - 8, 8, true);

    /* emplacements réservés au format */
    for(let i = 0; i < 9; i++){

        if(!reserved[8][i])              reserved[8][i] = true;
        if(!reserved[i][8])              reserved[i][8] = true;

    }

    for(let i = 0; i < 8; i++){
        reserved[8][size - 1 - i]  = true;
        reserved[size - 1 - i][8]  = true;
    }


    /* ---- placement des données en zigzag ---- */

    let bitIndex = 0;
    let upward   = true;

    const dataBits = [];

    for(const byte of finalBytes){
        for(let i = 7; i >= 0; i--){
            dataBits.push((byte >> i) & 1);
        }
    }

    for(let col = size - 1; col > 0; col -= 2){

        if(col === 6){
            col--;   /* la colonne de synchronisation est sautée */
        }

        for(let i = 0; i < size; i++){

            const row = upward ? size - 1 - i : i;

            for(let c = 0; c < 2; c++){

                const cc = col - c;

                if(reserved[row][cc]){
                    continue;
                }

                modules[row][cc] =
                    bitIndex < dataBits.length
                    ? dataBits[bitIndex++] === 1
                    : false;

            }

        }

        upward = !upward;

    }


    /* ---- choix du masque ---- */

    function penalty(grid){

        let score = 0;

        /* règle 1 : suites de même couleur */
        for(let i = 0; i < size; i++){

            let runR = 1, runC = 1;

            for(let j = 1; j < size; j++){

                runR = grid[i][j] === grid[i][j - 1] ? runR + 1 : 1;
                if(runR === 5) score += 3; else if(runR > 5) score += 1;

                runC = grid[j][i] === grid[j - 1][i] ? runC + 1 : 1;
                if(runC === 5) score += 3; else if(runC > 5) score += 1;

            }

        }

        /* règle 2 : blocs 2x2 */
        for(let r = 0; r < size - 1; r++){
            for(let c = 0; c < size - 1; c++){

                const v = grid[r][c];

                if(
                    v === grid[r][c + 1] &&
                    v === grid[r + 1][c] &&
                    v === grid[r + 1][c + 1]
                ){
                    score += 3;
                }

            }
        }

        /* règle 3 : motif ressemblant au repère */
        const pat1 = [true,false,true,true,true,false,true,false,false,false,false];
        const pat2 = [false,false,false,false,true,false,true,true,true,false,true];

        const match = (get) => {

            for(let i = 0; i + 11 <= size; i++){

                let ok1 = true, ok2 = true;

                for(let k = 0; k < 11; k++){
                    if(get(i + k) !== pat1[k]) ok1 = false;
                    if(get(i + k) !== pat2[k]) ok2 = false;
                }

                if(ok1) score += 40;
                if(ok2) score += 40;

            }

        };

        for(let r = 0; r < size; r++) match(i => grid[r][i]);
        for(let c = 0; c < size; c++) match(i => grid[i][c]);

        /* règle 4 : proportion de noir */
        let dark = 0;

        for(let r = 0; r < size; r++){
            for(let c = 0; c < size; c++){
                if(grid[r][c]) dark++;
            }
        }

        const ratio = dark * 100 / (size * size);

        score += Math.floor(Math.abs(ratio - 50) / 5) * 10;

        return score;

    }

    function formatBits(mask){

        /* niveau M = 00 */
        const data = (0b00 << 3) | mask;

        let rem = data;

        for(let i = 0; i < 10; i++){
            rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
        }

        return ((data << 10) | rem) ^ 0x5412;

    }

    function applyFormat(grid, mask){

        const fmt = formatBits(mask);

        for(let i = 0; i < 15; i++){

            const bit = ((fmt >> i) & 1) === 1;

            /* bande verticale, le long du repère haut-gauche */
            if(i < 6){
                grid[i][8] = bit;
            }else if(i < 8){
                grid[i + 1][8] = bit;
            }else{
                grid[size - 15 + i][8] = bit;
            }

            /* bande horizontale */
            if(i < 8){
                grid[8][size - 1 - i] = bit;
            }else if(i < 9){
                grid[8][15 - i] = bit;
            }else{
                grid[8][14 - i] = bit;
            }

        }

        grid[size - 8][8] = true;

    }

    let best = null;

    for(let mask = 0; mask < 8; mask++){

        const grid = modules.map(row => row.slice());

        for(let r = 0; r < size; r++){
            for(let c = 0; c < size; c++){
                if(!reserved[r][c] && QR_MASKS[mask](r, c)){
                    grid[r][c] = !grid[r][c];
                }
            }
        }

        applyFormat(grid, mask);

        const score = penalty(grid);

        if(!best || score < best.score){
            best = {score:score, grid:grid};
        }

    }

    return {size:size, modules:best.grid};

}
