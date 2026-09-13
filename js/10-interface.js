/* =========================================================
   LE SALON

   Le slime equipe tourne sur son socle, la carte de nom
   suit le skin, et le selecteur bascule SOLO / DUEL.
========================================================= */

let lobbyMode = "solo";


function lobbyVisible(){

    const el = document.getElementById("mainMenu");

    /*
    offsetParent ne sert a rien ici : le salon est en
    position fixed, donc toujours nul. On lit le style
    en ligne, que le code met a "block" ou "none".
    Au tout premier affichage il est vide : c'est le
    CSS qui montre le salon, donc vide = visible.
    */
    return !!el && el.style.display !== "none";

}


function paintLobby(t){

    const cv = document.getElementById("lobbyCanvas");

    if(!cv || !lobbyVisible()){
        return;
    }

    const dp = Math.min(window.devicePixelRatio || 1, 3);

    const cw = cv.clientWidth;
    const chh = cv.clientHeight;

    if(!cw || !chh){
        return;
    }

    if(cv.width !== cw * dp || cv.height !== chh * dp){
        cv.width  = cw * dp;
        cv.height = chh * dp;
    }

    const c = cv.getContext("2d");

    c.setTransform(dp, 0, 0, dp, 0, 0);
    c.clearRect(0, 0, cw, chh);

    const size = cw;

    const cx = cw / 2;
    const cy = chh * .44;
    const R  = Math.min(cw, chh) * .25;

    /* le halo du sol */
    const halo = c.createRadialGradient(cx, cy + R * 1.05, 0, cx, cy + R * 1.05, R * 2.1);

    halo.addColorStop(0,  "rgba(120,190,255,.42)");
    halo.addColorStop(.4, "rgba(90,130,255,.16)");
    halo.addColorStop(1,  "rgba(90,130,255,0)");

    c.fillStyle = halo;
    c.fillRect(0, 0, cw, chh);

    /* le disque */
    c.save();
    c.translate(cx, cy + R * 1.05);
    c.scale(1, .30);

    const disc = c.createRadialGradient(0, 0, R * .1, 0, 0, R * 1.5);

    disc.addColorStop(0,  "rgba(210,240,255,.85)");
    disc.addColorStop(.6, "rgba(90,150,255,.35)");
    disc.addColorStop(1,  "rgba(90,150,255,0)");

    c.fillStyle = disc;
    c.beginPath();
    c.arc(0, 0, R * 1.5, 0, Math.PI * 2);
    c.fill();

    c.restore();

    /* un anneau qui tourne autour du socle */
    c.save();
    c.translate(cx, cy + R * 1.05);
    c.scale(1, .30);
    c.strokeStyle = "rgba(150,210,255,.5)";
    c.lineWidth   = R * .07;
    c.beginPath();
    c.arc(0, 0, R * 1.62, t * .8, t * .8 + Math.PI * 1.25);
    c.stroke();
    c.restore();

    /* le slime, qui respire doucement */
    const skin = SKINS.find(sk => sk.id === currentSkin) || SKINS[0];

    c.save();
    c.translate(cx, cy + Math.sin(t * 1.1) * R * .04);
    paintSkinSlime(c, skin, R, t, true, {blink:Math.sin(t * .7) > .985 ? -1 : 1});
    c.restore();

}


function lobbySyncSkin(){

    const skin = SKINS.find(sk => sk.id === currentSkin) || SKINS[0];
    const rar  = RARITIES[skin.rarity || 0];

    const n = document.getElementById("lobbySkinName");
    const r = document.getElementById("lobbyRarity");

    if(n){
        n.textContent = skin.name;
        n.style.color = skin.color;
    }

    if(r){
        r.textContent = T("rar." + (skin.rarity || 0));
        r.style.color = rar.col;
    }

}


function lobbySetMode(mode){

    lobbyMode = mode;

    const txt  = document.getElementById("lobbyPickText");
    const name = document.getElementById("lobbyModeName");

    if(txt){
        txt.textContent =
            mode === "duel"  ? T("lobby.duel") :
            mode === "laser" ? T("las.pick") :
            T("lobby.solo");
    }

    if(name){

        name.innerHTML =
            mode === "duel"
                ? T("lobby.modeDuel") + "<br><span>" + T("lobby.modeDuelSub") + "</span>"
            : mode === "laser"
                ? T("las.modeName") + "<br><span>" + T("las.modeSub") + "</span>"
                : T("lobby.modeSolo") + "<br><span>" + T("lobby.modeSoloSub") + "</span>";

    }

}


/* =========================================================
   DÉCOR ANIMÉ DERRIÈRE LE MENU
========================================================= */

ambient = [];

function buildAmbient(){

    const kinds = ["hunter", "predictor", "traqueur", "noir", "slime", "slime"];

    ambient = kinds.map((k, i) => ({
        kind:k,
        x:Math.random() * W,
        y:Math.random() * H,
        a:Math.random() * Math.PI * 2,
        speed:14 + Math.random() * 22,
        r:(15 + Math.random() * 13),
        turn:(Math.random() - .5) * .25,
        t:Math.random() * 10
    }));

}

function updateAmbient(dt){

    if(!ambient.length){
        buildAmbient();
    }

    for(const a of ambient){

        a.t += dt;
        a.a += a.turn * dt;

        a.x += Math.cos(a.a) * a.speed * dt;
        a.y += Math.sin(a.a) * a.speed * dt;

        const m = 80;

        if(a.x < -m) a.x = W + m;
        if(a.x > W + m) a.x = -m;
        if(a.y < -m) a.y = H + m;
        if(a.y > H + m) a.y = -m;

    }

}


/* =========================================================
   LE DECOR DE L'ACCUEIL

   Une vraie scene du jeu derriere le salon : nebuleuse,
   etoiles en parallaxe, planetes lointaines, et surtout
   une poursuite qui tourne en boucle — un slime devant,
   ses trois poursuivants derriere, chacun avec sa trainee.
   Au premier plan, quelques blocs en ombre chinoise pour
   donner de la profondeur.
========================================================= */

/*
Le fond du salon est une IMAGE FIXE : la foret du monde 1
au premier plan, les ruines suspendues du monde 2 au fond,
sous la lune. Rien ne bouge — on la peint une seule fois
dans un calque a part, et ensuite on ne fait que la coller.
Elle n'est repeinte que si la fenetre change de taille.
*/

lobbyArt = null;


function buildLobbyArt(){

    const cv = document.createElement("canvas");

    cv.width  = Math.max(2, Math.round(W));
    cv.height = Math.max(2, Math.round(H));

    const c = cv.getContext("2d");

    const w = cv.width;
    const h = cv.height;

    /* un hasard a part, toujours le meme : le decor ne bouge pas */
    let seed = 20260911;

    const rr = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };

    /* ---------- LE CIEL ---------- */

    const ciel = c.createLinearGradient(0, 0, 0, h);
    ciel.addColorStop(0,   "#0a1622");
    ciel.addColorStop(.38, "#12242e");
    ciel.addColorStop(.68, "#0d1d1c");
    ciel.addColorStop(1,   "#050c0c");

    c.fillStyle = ciel;
    c.fillRect(0, 0, w, h);

    /* ---------- LES ETOILES ---------- */

    for(let i = 0; i < 90; i++){

        const x = rr() * w;
        const y = rr() * h * .55;

        c.globalAlpha = .12 + rr() * .45;
        c.fillStyle   = "#dff0ff";

        c.beginPath();
        c.arc(x, y, (.5 + rr() * 1.3) * (w / 900), 0, Math.PI * 2);
        c.fill();

    }

    c.globalAlpha = 1;

    /* ---------- LA LUNE ---------- */

    const lx = w * .69, ly = h * .23, lr = Math.min(w, h) * .062;

    const halo = c.createRadialGradient(lx, ly, 0, lx, ly, lr * 9);
    halo.addColorStop(0,   "rgba(190,225,255,.26)");
    halo.addColorStop(.25, "rgba(150,195,240,.10)");
    halo.addColorStop(1,   "rgba(130,180,230,0)");

    c.fillStyle = halo;
    c.fillRect(0, 0, w, h);

    c.fillStyle = "#dce9f7";
    c.beginPath();
    c.arc(lx, ly, lr, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#c2d3e6";

    [[-.3, -.2, .26], [.25, .15, .20], [-.05, .45, .15]].forEach(m => {
        c.beginPath();
        c.arc(lx + m[0] * lr, ly + m[1] * lr, lr * m[2], 0, Math.PI * 2);
        c.fill();
    });

    /* ---------- LES RUINES SUSPENDUES ---------- */

    const iles = [
        [.17, .40, 1.05],
        [.56, .30, .76],
        [.88, .47, .60],
        [.37, .24, .48]
    ];

    iles.forEach(il => {

        const x  = il[0] * w;
        const y  = il[1] * h;
        const sc = il[2] * Math.min(w, h) * .13;

        c.save();
        c.translate(x, y);

        /* la brume autour */
        c.globalAlpha = .30;
        const br = c.createRadialGradient(0, 0, 0, 0, 0, sc * 3);
        br.addColorStop(0,  "rgba(120,170,210,.28)");
        br.addColorStop(1,  "rgba(110,160,200,0)");
        c.fillStyle = br;
        c.fillRect(-sc * 3, -sc * 3, sc * 6, sc * 6);
        c.globalAlpha = 1;

        /* la dalle, vue de trois quarts */
        const pg = c.createLinearGradient(0, -sc * .3, 0, sc * 1.4);
        pg.addColorStop(0,   "#6d7f95");
        pg.addColorStop(.35, "#3c4757");
        pg.addColorStop(1,   "#10161f");

        c.fillStyle = pg;

        c.beginPath();
        c.moveTo(-sc * 1.5, 0);
        c.lineTo(sc * 1.5, 0);
        c.lineTo(sc * 1.0, sc * .30);
        c.lineTo(-sc * 1.1, sc * .30);
        c.closePath();
        c.fill();

        /* la roche arrachee, dessous */
        c.fillStyle = "#151d27";
        c.beginPath();
        c.moveTo(-sc * 1.1, sc * .30);
        c.lineTo(sc * 1.0, sc * .30);
        c.lineTo(sc * .45, sc * 1.15);
        c.lineTo(-sc * .10, sc * .72);
        c.lineTo(-sc * .55, sc * 1.30);
        c.closePath();
        c.fill();

        /* deux colonnes et une arche brisee */
        c.fillStyle = "#4b5768";

        [-.85, -.15, .75].forEach((cxp, n) => {

            const ht = sc * (n === 1 ? .95 : .68);

            c.fillRect(cxp * sc - sc * .10, -ht, sc * .20, ht);

            /* le chapiteau */
            c.fillStyle = "#5c6a7d";
            c.fillRect(cxp * sc - sc * .16, -ht - sc * .08, sc * .32, sc * .09);
            c.fillStyle = "#4b5768";

        });

        /* l'arche entre les deux premieres colonnes */
        c.strokeStyle = "#556375";
        c.lineWidth   = sc * .12;
        c.beginPath();
        c.arc(-sc * .50, -sc * .66, sc * .36, Math.PI, 0);
        c.stroke();

        /* le liseré de lune sur les aretes */
        c.strokeStyle = "rgba(200,230,255,.35)";
        c.lineWidth   = Math.max(1, sc * .03);
        c.beginPath();
        c.moveTo(-sc * 1.5, 0);
        c.lineTo(sc * 1.5, 0);
        c.stroke();

        c.restore();

    });

    /* ---------- LA BRUME QUI SEPARE LES DEUX MONDES ---------- */

    const brume = c.createLinearGradient(0, h * .38, 0, h * .68);
    brume.addColorStop(0,  "rgba(120,165,200,0)");
    brume.addColorStop(.5, "rgba(120,165,200,.16)");
    brume.addColorStop(1,  "rgba(90,130,160,0)");

    c.fillStyle = brume;
    c.fillRect(0, h * .38, w, h * .30);

    /* ---------- LA FORET ---------- */

    /* les troncs lointains, presque noyes */
    for(let i = 0; i < 9; i++){

        const x  = (i / 8) * w + (rr() - .5) * w * .05;
        const lw = (18 + rr() * 22) * (w / 900);

        c.globalAlpha = .30;
        c.fillStyle   = "#16281f";
        c.fillRect(x - lw / 2, h * .40, lw, h * .60);

    }

    c.globalAlpha = 1;

    /* les rais de lumiere entre les arbres */
    for(let i = 0; i < 5; i++){

        const x = (.08 + i * .21) * w;

        const rg = c.createLinearGradient(x, h * .30, x + w * .10, h);
        rg.addColorStop(0, "rgba(180,255,190,.10)");
        rg.addColorStop(1, "rgba(140,220,150,0)");

        c.fillStyle = rg;

        c.beginPath();
        c.moveTo(x - w * .028, h * .30);
        c.lineTo(x + w * .028, h * .30);
        c.lineTo(x + w * .105, h);
        c.lineTo(x - w * .030, h);
        c.closePath();
        c.fill();

    }

    /* les gros troncs du premier plan, sur les cotes */
    const troncs = [
        [.03, 1.35], [.14, .95], [.885, 1.05], [.975, 1.45], [.80, .70], [.28, .62]
    ];

    troncs.forEach(tr => {

        const x  = tr[0] * w;
        const lw = tr[1] * 52 * (w / 900);

        const tg = c.createLinearGradient(x - lw, 0, x + lw, 0);
        tg.addColorStop(0,   "#030705");
        tg.addColorStop(.32, "#1b3123");
        tg.addColorStop(.55, "#2c4b33");
        tg.addColorStop(.78, "#13251a");
        tg.addColorStop(1,   "#030705");

        c.fillStyle = tg;

        c.beginPath();
        c.moveTo(x - lw * .5, h * .22);
        c.quadraticCurveTo(x - lw * .72, h * .62, x - lw * .60, h);
        c.lineTo(x + lw * .60, h);
        c.quadraticCurveTo(x + lw * .70, h * .62, x + lw * .5, h * .22);
        c.closePath();
        c.fill();

        /* l'ecorce */
        c.globalAlpha = .35;
        c.strokeStyle = "#0a120d";
        c.lineWidth   = Math.max(1, lw * .05);

        for(let k = -1; k <= 1; k++){
            c.beginPath();
            c.moveTo(x + k * lw * .22, h * .24);
            c.quadraticCurveTo(x + k * lw * .30, h * .60, x + k * lw * .20, h);
            c.stroke();
        }

        c.globalAlpha = 1;

    });

    /* la voute de feuilles, en haut */
    c.fillStyle = "#08150e";

    for(let i = 0; i < 34; i++){

        const x = rr() * w;
        const y = rr() * h * .16;
        const s2 = (30 + rr() * 90) * (w / 900);

        c.beginPath();
        c.ellipse(x, y, s2, s2 * .58, rr() * 3, 0, Math.PI * 2);
        c.fill();

    }

    /* le sol de la foret */
    const sol = c.createLinearGradient(0, h * .80, 0, h);
    sol.addColorStop(0, "rgba(6,14,10,0)");
    sol.addColorStop(1, "rgba(3,8,6,.95)");

    c.fillStyle = sol;
    c.fillRect(0, h * .80, w, h * .20);

    /* ---------- LES LUCIOLES ---------- */

    for(let i = 0; i < 20; i++){

        const x  = rr() * w;
        const y  = h * (.46 + rr() * .50);
        const sz = (1.2 + rr() * 2.2) * (w / 900);

        const g = c.createRadialGradient(x, y, 0, x, y, sz * 6);
        g.addColorStop(0,  "rgba(214,255,170,.62)");
        g.addColorStop(.3, "rgba(160,230,120,.30)");
        g.addColorStop(1,  "rgba(120,200,90,0)");

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, sz * 6, 0, Math.PI * 2);
        c.fill();

    }

    /* ---------- LA VIGNETTE ---------- */

    const vg = c.createRadialGradient(
        w / 2, h * .45, Math.min(w, h) * .26,
        w / 2, h * .45, Math.max(w, h) * .76
    );

    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,5,8,.70)");

    c.fillStyle = vg;
    c.fillRect(0, 0, w, h);

    /* on assombrit le centre : le slime et les boutons doivent ressortir */
    const mid = c.createRadialGradient(
        w / 2, h * .48, 0,
        w / 2, h * .48, Math.min(w, h) * .55
    );

    mid.addColorStop(0,  "rgba(2,6,10,.34)");
    mid.addColorStop(.6, "rgba(2,6,10,.14)");
    mid.addColorStop(1,  "rgba(2,6,10,0)");

    c.fillStyle = mid;
    c.fillRect(0, 0, w, h);

    lobbyArt = {img:cv, w:W, h:H};

}


function drawLobbyScene(){

    if(!lobbyArt || lobbyArt.w !== W || lobbyArt.h !== H){
        buildLobbyArt();
    }

    if(lobbyArt && lobbyArt.img){
        ctx.drawImage(lobbyArt.img, 0, 0, W, H);
    }

}


function drawAmbient(){

    ctx.save();
    ctx.globalAlpha = .34;

    for(const a of ambient){

        paintCreature(
            ctx,
            a.kind,
            a.x,
            a.y,
            a.r * unit,
            a.kind === "slime" ? 0 : a.a,
            a.t
        );

    }

    ctx.restore();

}


/* =========================================================
   CODES SECRETS

   Quatre chiffres au pavé numérique. La table est ouverte :
   il suffit d'y ajouter une ligne pour créer un nouveau code.
========================================================= */

/*
La table est vide pour l'instant : on remettra des codes plus
tard. Tout le mecanisme reste en place, il suffit d'ajouter
une ligne ici pour en recreer un.
*/
function unlockAllSkins(){

    let n = 0;

    for(const sk of SKINS){
        if(!ownedSkins.includes(sk.id)){
            ownedSkins.push(sk.id);
            n++;
        }
    }

    saveGame();

    if(typeof renderShop === "function"){
        try{ renderShop(); }catch(e){}
    }

    backFromCode();

    return n;

}


const SECRET_CODES = {

    "9999":{
        get label(){ return T("code.allSkins"); },
        run:unlockAllSkins
    }

};

let codeEntry = "";


function refreshCode(){

    document.querySelectorAll(".codeDigit").forEach(el => {

        const i = Number(el.dataset.slot);

        el.textContent = codeEntry[i] || "";

        el.classList.toggle("filled", !!codeEntry[i]);

    });

}


function codeMessage(text, color){

    const el = document.getElementById("codeMessage");

    el.textContent = text || "";
    el.style.color = color || "#8b99bd";

}


let codeFrom = "menu";


function openCode(from){

    playing = false;
    paused  = false;

    codeFrom  = from || "menu";
    codeEntry = "";

    refreshCode();
    codeMessage("");

    document.getElementById("mainMenu").style.display   = "none";
    document.getElementById("settings").style.display   = "none";
    document.getElementById("codeScreen").style.display = "flex";

}


/* on revient exactement d'ou on venait : sinon, ecran noir */
function backFromCode(){

    document.getElementById("codeScreen").style.display = "none";

    if(codeFrom === "settings"){
        document.getElementById("settings").style.display = "flex";
    }else{
        document.getElementById("mainMenu").style.display = "block";
    }

}


function closeCode(){
    backFromCode();
}


function codePress(key){

    ensureAudio();

    if(key === "del"){

        codeEntry = codeEntry.slice(0, -1);
        refreshCode();
        codeMessage("");
        return;

    }

    if(key === "ok"){

        validateCode();
        return;

    }

    if(codeEntry.length >= 4){
        return;
    }

    codeEntry += key;

    refreshCode();
    codeMessage("");

    /* à quatre chiffres, on valide tout seul */
    if(codeEntry.length === 4){
        setTimeout(validateCode, 220);
    }

}


function validateCode(){

    if(codeEntry.length < 4){
        codeMessage(T("code.short"));
        return;
    }

    const found = SECRET_CODES[codeEntry];

    if(!found){

        codeMessage("❌ " + T("code.unknown"), "#ff466e");

        sound(120, .25, "sawtooth", .05);

        codeEntry = "";

        setTimeout(refreshCode, 260);

        return;

    }

    codeMessage("✅ " + found.label, "#61ff83");

    sound(660, .12, "sine", .04);
    setTimeout(() => sound(990, .22, "sine", .04), 110);

    setTimeout(() => {

        document.getElementById("codeScreen").style.display = "none";

        found.run();

    }, 620);

}


/* le code 1111 : on démarre directement dans le second monde */
function startInMarais(){

    startGame();

    level = PORTAL_LEVEL;

    enterMarais();

}


/* =========================================================
   BOUTONS
========================================================= */

document.getElementById("startButton").onclick = () => {

    if(lobbyMode === "laser"){

        openLaser();

    }else{

        /* en solo, on choisit d'abord son monde */
        openWorlds();

    }

};

/*
Le selecteur tourne : SOLO, DUEL, LASER, puis un
entrainement par monde deja atteint. Le monde 1 n'y est
pas : c'est deja la partie normale.
*/
function lobbyModeList(){
    return ["solo", "laser"];
}


/* lance une partie directement dans un monde donne */
/*
REJOUER ne renvoie plus au monde 1 : on repart la ou on en
etait, si ce monde est bien ouvert.
*/
/*
REJOUER reprend le niveau exact ou la partie s'est arretee :
mort au niveau 3 de la foret, on repart au niveau 3 ; mort
contre le boss, on repart au boss.
*/
let lastLevel = 1;

try{
    const ll = localStorage.getItem("mimicLastLevel");
    if(ll){ lastLevel = Math.max(1, ll | 0); }
}catch(e){}


function noteSpot(){

    if(laser.active){ return; }

    lastZone  = zone;
    lastLevel = Math.max(1, level);

    try{
        localStorage.setItem("mimicLastZone",  lastZone);
        localStorage.setItem("mimicLastLevel", String(lastLevel));
    }catch(e){}

}


function rejouer(){

    const z = worldUnlocked(lastZone) ? lastZone : "foret";
    const n = Math.max(1, Math.min(worldLevels(z) + 1, lastLevel));

    playWorld(z, n);

}


/* combien de niveaux avant le boss, dans ce monde */
function worldLevels(zoneId){
    if(zoneId === "foret"){  return FORET_LEVELS; }
    if(zoneId === "ruines"){ return RUIN_LEVELS;  }
    return 4;
}


function playWorld(zoneId, lvl){

    const wd = WORLDS.find(w => w.zone === zoneId);

    if(!wd || !worldUnlocked(zoneId)){
        return;
    }

    document.getElementById("worlds").style.display = "none";

    lobbySetMode("solo");

    startGame();

    /*
    On peut viser un niveau precis : 1 a 4 pour la traversee,
    et le dernier (5) lance directement le boss.
    */
    const n = Math.max(1, Math.min(worldLevels(zoneId) + 1, (lvl | 0) || 1));

    if(zoneId === "foret"){

        zone = "foret";

        enterForet();

        level      = n;
        levelTimer = 0;

        foretPeuple();

        return;

    }

    if(zoneId === "ruines"){

        enterRuines();

        level      = n;
        levelTimer = 0;

        ruinesPeuple();

        return;

    }

    level = wd.from;

    if(zoneId === "marais"){ enterMarais(); }
    else if(zoneId === "bonbon"){ enterCandy(); }
    else if(zoneId === "abysse"){ enterAbyss(); }
    else if(zoneId === "neant"){ enterVoid(); }
    else if(zoneId === "desert"){ enterDesert(); }
    else if(zoneId === "forge"){ enterForge(); }
    else if(zoneId === "biblio"){ enterLibrary(); }
    else if(zoneId === "horloge"){ enterClock(); }
    else if(zoneId === "couloir"){ enterCorridor(); }
    else if(zoneId === "coulisses"){ enterBackstage(); }
    else if(zoneId === "scene"){ enterStage(); }
    else if(zoneId === "atelier"){ enterWorkshop(); }
    else if(zoneId === "grenier"){ enterAttic(); }
    else if(zoneId === "ombres"){ enterShadows(); }

}


function renderWorlds(){

    const box = document.getElementById("worldList");

    if(!box){
        return;
    }

    box.innerHTML = "";

    WORLDS.forEach((wd, i) => {

        const open = worldUnlocked(wd.zone);
        const prev = i > 0 ? WORLDS[i - 1] : null;

        const card = document.createElement("button");

        card.className = "worldCard" + (open ? "" : " locked");
        card.style.setProperty("--wc", wd.col);

        const num = document.createElement("i");
        num.className   = "worldNum";
        num.textContent = wd.n;

        const txt = document.createElement("span");
        txt.className = "worldTxt";

        const nm = document.createElement("b");
        nm.textContent = T(wd.k);
        nm.style.color = open ? wd.col : "#5f6f97";

        const sub = document.createElement("small");

        sub.textContent = open
            ? TF("worlds.best", {n:records.best[wd.zone] || 0})
            : TF("worlds.locked", {n:prev ? prev.n : 1});

        txt.appendChild(nm);
        txt.appendChild(sub);

        const mark = document.createElement("em");
        mark.textContent = open ? "▶" : "🔒";

        card.appendChild(num);
        card.appendChild(txt);
        card.appendChild(mark);

        if(!open){
            card.onclick = function(){
                sound(140, .16, "sawtooth", .04);
            };
        }

        box.appendChild(card);

        /*
        Les niveaux du monde. Ils sont replies : on appuie sur
        le monde, ils se deplient — et on choisit ou on commence.
        */
        if(open){

            const row = document.createElement("div");

            row.className = "lvlRow";
            row.style.display = "none";

            card.onclick = function(){

                const ouvert = row.style.display !== "none";

                /* un seul monde deplie a la fois */
                document.querySelectorAll("#worldList .lvlRow").forEach(r => {
                    r.style.display = "none";
                });

                document.querySelectorAll("#worldList .worldCard em").forEach(m => {
                    if(m.textContent !== "\ud83d\udd12"){ m.textContent = "\u25b6"; }
                });

                if(!ouvert){
                    row.style.display = "flex";
                    mark.textContent  = "\u25bc";
                    sound(700, .08, "sine", .04);
                }else{
                    sound(430, .07, "sine", .035);
                }

            };

            const nb = worldLevels(wd.zone) + 1;

            for(let n = 1; n <= nb; n++){

                const chip = document.createElement("button");

                const boss = n === nb;

                chip.className = "lvlChip" + (boss ? " boss" : "");

                if(!boss){
                    chip.style.setProperty("--wc", wd.col);
                }

                const big = document.createElement("span");
                big.textContent = boss ? "\u2620" : n;

                const lab = document.createElement("small");
                lab.textContent = boss ? T("worlds.boss") : T("hud.lvlShort");

                chip.appendChild(big);
                chip.appendChild(lab);

                chip.onclick = function(e){
                    e.stopPropagation();
                    sound(boss ? 260 : 700, .09, boss ? "sawtooth" : "sine", .04);
                    playWorld(wd.zone, n);
                };

                row.appendChild(chip);

            }

            box.appendChild(row);

        }

    });

}

document.getElementById("lobbyModePick").onclick = () => {

    const list = lobbyModeList();

    const i = list.indexOf(lobbyMode);

    lobbySetMode(list[(i + 1) % list.length]);

    sound(620, .07, "sine", .035);

};

/* --- les boutons du mode laser --- */

/* --- le profil et les rangs --- */

document.getElementById("namePill").onclick = () => openHello(true);

document.getElementById("profileButton").onclick = () => {
    document.getElementById("settings").style.display = "none";
    openHello(true, "settings");
};

document.getElementById("rankButton").onclick = () => {
    document.getElementById("settings").style.display = "none";
    openRank("settings");
};
document.getElementById("rankPill").onclick = () => openRank("menu");

document.getElementById("rankClose").onclick = closeRank;

document.getElementById("helloName").oninput = e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ \-_]/g, "");
};

document.getElementById("helloNext").onclick = () => {

    const typed = document.getElementById("helloName").value.trim();

    if(typed.length < 2){
        document.getElementById("helloNameWarn").textContent = T("hello.short");
        return;
    }

    document.getElementById("helloNameWarn").textContent = "";

    document.getElementById("helloStep1").className = "helloStep";
    document.getElementById("helloStep2").className = "helloStep on";

};

document.getElementById("helloBack").onclick = () => {
    document.getElementById("helloStep1").className = "helloStep on";
    document.getElementById("helloStep2").className = "helloStep";
};


/* --- amical ou classe, dans le salon rayon --- */

document.getElementById("lasModeFun").onclick = () => {

    if(laser.queue || laser.players.length){
        return;
    }

    laser.ranked = false;

    lasPaintModes();

    sound(520, .08, "triangle", .05);

};

document.getElementById("lasModeRanked").onclick = () => {

    if(laser.queue || laser.players.length){
        return;
    }

    laser.ranked = true;

    lasPaintModes();

    sound(760, .08, "triangle", .05);

};

document.getElementById("lasFind").onclick  = lasFindMatch;
document.getElementById("lasLeave").onclick = lasLeaveQueue;


document.getElementById("lasHost").onclick  = lasHostRoom;
document.getElementById("lasJoin").onclick  = lasJoinRoom;
document.getElementById("lasClose").onclick = closeLaser;

document.getElementById("lasStart").onclick = () => {

    if(!laser.host || laser.players.length < 2){
        return;
    }

    laser.seed = Math.floor(Math.random() * 1e9) + 1;

    lasSend({t:"go", seed:laser.seed, ranked:laser.ranked});

    lasBegin();

};

document.getElementById("lasAgain").onclick = () => {

    /* deja vote : on attend les autres */
    if(laser.again[laser.me]){
        return;
    }

    laser.again[laser.me] = true;

    sound(660, .1, "triangle", .05);

    if(laser.host){
        lasAgainCheck();
    }else{
        lasSend({t:"again"});
        lasAgainPaint();
    }

};


/*
La revanche ne part que quand TOUT LE MONDE a appuye sur
REJOUER. L'hote tient le compte et previent les autres a
chaque vote.
*/
function lasPresent(){

    const list = [0];

    laser.conns.forEach(c => {
        if(c && c.__idx != null && list.indexOf(c.__idx) < 0){
            list.push(c.__idx);
        }
    });

    return list;

}


function lasAgainPaint(){

    const box = document.getElementById("lasAgainState");
    const txt = document.getElementById("lasAgainTxt");

    if(!box || !txt){
        return;
    }

    const total = laser.host ? lasPresent().length : (laser.againTotal || laser.players.length);
    const n     = laser.host
        ? lasPresent().filter(i => laser.again[i]).length
        : (laser.againReady || (laser.again[laser.me] ? 1 : 0));

    if(laser.again[laser.me]){

        txt.textContent = "⏳ EN ATTENTE…";
        box.textContent = n + " / " + total + " prêts pour la revanche";

    }else{

        txt.textContent = "🔄 REJOUER";
        box.textContent = n > 0
            ? n + " / " + total + " veulent rejouer"
            : "Il faut que tout le monde appuie sur REJOUER.";

    }

}


function lasAgainCheck(){

    if(!laser.host){
        return;
    }

    const here = lasPresent();
    const n    = here.filter(i => laser.again[i]).length;

    lasSend({t:"againState", n:n, total:here.length});

    lasAgainPaint();

    if(n < here.length){
        return;
    }

    /* tout le monde est d'accord : on relance */
    laser.again = [];

    laser.players.forEach(p => { p.alive = true; p.lives = LAS_LIVES; p.time = 0; });

    laser.seed = Math.floor(Math.random() * 1e9) + 1;

    lasSend({t:"go", seed:laser.seed, ranked:laser.ranked});

    lasBegin();

};

document.getElementById("lasSearchAgain").onclick = () => {

    document.getElementById("lasResult").style.display = "none";

    laser.queue = false;

    clearQueueTimer();
    lasCleanup();

    openLaser();

    /* on remet le mode classé en avant : il n'a qu'a relancer */
    laser.ranked = true;

    lasPaintModes();

    sound(660, .1, "triangle", .05);

};

document.getElementById("lasQuit").onclick = () => {
    document.getElementById("lasResult").style.display = "none";
    closeLaser();
};

/* l'onglet BOUTIQUE ouvre directement le rayon */
document.getElementById("openShopStore").onclick = () => openShop(true);

lobbySetMode("solo");

paintRankPill();

/* premier lancement : on demande le pseudo et l'age */
if(!profile.name){
    setTimeout(() => openHello(false), 400);
}

document.getElementById("retryButton").onclick     = () => rejouer();
const codeBtn = document.getElementById("codeButton");

if(codeBtn){
    codeBtn.onclick = () => openCode("menu");
}

document.getElementById("codeSecretButton").onclick = () => openCode("settings");
document.getElementById("codeBack").onclick   = closeCode;

document.querySelectorAll(".keypad button").forEach(btn => {
    btn.onclick = () => codePress(btn.dataset.key);
});

/* on peut aussi taper au clavier quand l'écran est ouvert */
addEventListener("keydown", e => {

    if(getComputedStyle(document.getElementById("codeScreen")).display === "none"){
        return;
    }

    if(e.key >= "0" && e.key <= "9"){
        codePress(e.key);
    }else if(e.key === "Backspace"){
        codePress("del");
    }else if(e.key === "Enter"){
        codePress("ok");
    }

});

/* le bouton son a quitte le salon : il vit dans les parametres */

/* petit retour sonore sur chaque bouton */
document.addEventListener("click", e => {
    if(e.target && e.target.tagName === "BUTTON"){
        sound(520, .06, "sine", .022);
    }
}, true);

function openWorlds(){
    renderWorlds();
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("worlds").style.display   = "flex";
}

document.getElementById("worldsClose").onclick = () => {
    document.getElementById("worlds").style.display   = "none";
    document.getElementById("mainMenu").style.display = "block";
};

document.getElementById("passButton").onclick = () => {
    renderPass();
    document.getElementById("mainMenu").style.display   = "none";
    document.getElementById("passScreen").style.display = "flex";
    updateUI();
};

document.getElementById("passClose").onclick = () => {
    document.getElementById("passScreen").style.display = "none";
    document.getElementById("mainMenu").style.display   = "block";
    updateUI();
};

document.getElementById("missionButton").onclick = () => {
    renderMissions();
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("missions").style.display = "flex";
};

document.getElementById("missionsClose").onclick = () => {
    document.getElementById("missions").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    updateUI();
};

document.getElementById("recordsButton").onclick = () => {
    renderRecords();
    document.getElementById("settings").style.display = "none";
    document.getElementById("records").style.display  = "flex";
};

document.getElementById("recordsClose").onclick = () => {
    document.getElementById("records").style.display  = "none";
    document.getElementById("settings").style.display = "flex";
};

document.getElementById("shareButton").onclick = shareScore;

document.getElementById("vibToggle").onclick = () => {

    vibrateOn = !vibrateOn;

    try{ localStorage.setItem("mimicVibrate", vibrateOn ? "1" : "0"); }catch(e){}

    syncSettings();

    if(vibrateOn){ buzz(40); }

    sound(vibrateOn ? 760 : 460, .08, "sine", .04);

};

document.getElementById("guideButton").onclick = () => {
    document.getElementById("settings").style.display = "none";
    document.getElementById("guide").style.display    = "flex";
    renderGuideIcons();
};

/* on referme sur les parametres : c'est de la qu'on vient */
document.getElementById("guideClose").onclick = () => {
    document.getElementById("guide").style.display     = "none";
    document.getElementById("settings").style.display  = "flex";
};
/*
Le salon a deux portes. CASIER ouvre le casier, BOUTIQUE
ouvre la boutique — et on reste dedans : la rangee qui
permettait de passer de l'un a l'autre est retiree.
*/
document.getElementById("openShop").onclick = () => openShop(false);
document.getElementById("gameOverShop").onclick    = openShop;
document.getElementById("closeShop").onclick       = closeShop;
document.getElementById("shopFloatX").onclick      = closeShop;
document.getElementById("lockerButton").onclick    = showLocker;
document.getElementById("shopSkinsButton").onclick = showShop;

document.getElementById("catSkinsButton").onclick   = () => setShopCategory("skins");

/* --- parametres --- */

function openSettings(){
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("settings").style.display = "flex";
    paintLangGrid();
    syncSettings();
}

function closeSettings(){
    document.getElementById("settings").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
}

document.getElementById("settingsButton").onclick = openSettings;
document.getElementById("settingsClose").onclick  = closeSettings;

document.getElementById("cbToggle").onclick = () => {
    setDaltonien(!daltonien);
    sound(daltonien ? 760 : 460, .08, "sine", .04);
};

document.getElementById("musicToggle").onclick = () => {
    setMusic(!musicOn);
    syncSettings();
};
document.getElementById("catAbilityButton").onclick = () => setShopCategory("abilities");

/* --- la barre de filtres --- */

document.getElementById("filtOwned").onclick = () => {
    shopOnlyMissing = !shopOnlyMissing;
    renderShop();
};

["rarity", "cheap", "rich"].forEach(mode => {

    const id = "sort" + mode.charAt(0).toUpperCase() + mode.slice(1);

    document.getElementById(id).onclick = () => {
        shopSort = mode;
        renderShop();
    };

});
document.getElementById("pauseBtn").onclick        = () => setPaused(true);

/* la barre des competences est construite au demarrage */
buildSkillBar();
document.getElementById("resumeButton").onclick    = () => setPaused(false);
document.getElementById("quitButton").onclick      = quitToMenu;

document.getElementById("menuButton").onclick = () => {

    document.getElementById("gameOver").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";

};


/* =========================================================
   BOUCLE
========================================================= */

updateUI();

function loop(t){

    if(!lastFrame){
        lastFrame = t;
    }

    /* dt borné : un retour d'app ne téléporte pas le joueur */
    const dt = Math.min(.05, Math.max(0, (t - lastFrame) / 1000));

    lastFrame = t;

    /* la barre d'infos n'a rien à faire dans les menus */
    if(playing !== hudShown){

        hudShown = playing;

        document.getElementById("gameUI").style.display =
            playing ? "flex" : "none";

        /* la barre d'infos borne le haut du terrain */
        resize();

    }

    updateMusic();
    /*
    Tout le corps de l'image est protege : une erreur dans un
    seul dessin ne doit jamais arreter le jeu entier. On la
    signale une fois, puis on continue.
    */
    try{

        animateShopIcons();
        paintLobby(t / 1000);

        if(playing && !paused && !portraitBlock){

            update(dt);
            lasUpdate(dt);
        }else if(!playing){
            updateAmbient(dt);
        }

        draw();

    }catch(err){
        mimicReport(err);
    }

    requestAnimationFrame(loop);

}


/* le moteur demarre AVANT tout le reste : plus rien ne peut l'empecher */
startLoop();


/* petit utilitaire : executer une etape de demarrage sans tout casser */
function safeStep(name, fn){
    try{ fn(); }catch(err){ mimicReport(err, name); }
}

safeStep("langues", () => { i18nCollect(); applyLang(); });

/*
Sur iPhone, Safari garde ses barres : le seul vrai plein
ecran passe par "Sur l'ecran d'accueil". On le signale une
fois, et seulement si on n'est pas deja en mode autonome.
*/
(function(){

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const standalone =
        window.navigator.standalone === true ||
        (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

    let hidden = false;

    try{ hidden = localStorage.getItem("mimicIosTip") === "1"; }catch(e){}

    if(ios && !standalone && !hidden){

        const tip = document.getElementById("iosTip");

        if(tip){

            tip.style.display = "flex";

            document.getElementById("iosTipClose").onclick = function(){
                tip.style.display = "none";
                try{ localStorage.setItem("mimicIosTip", "1"); }catch(e){}
            };

        }

    }

})();

safeStep("reglages", () => {
    document.body.classList.toggle("cb", daltonien);
    syncSettings();
});

safeStep("orientation", () => checkOrientation());
safeStep("musique",     () => setMusic(musicOn));
