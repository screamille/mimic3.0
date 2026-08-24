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

let ambient = [];

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

let lobbyArt = null;


function buildLobbyArt(){

    /* un hasard a part : le decor ne doit pas toucher au jeu */
    let seed = 20240824;

    const rr = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };

    const stars = [];

    for(let i = 0; i < 180; i++){

        const far = i < 120;

        stars.push({
            x:rr() * W,
            y:rr() * H,
            r:(far ? .5 + rr() * .8 : 1 + rr() * 1.4) * unit,
            a:far ? .18 + rr() * .3 : .4 + rr() * .5,
            sp:.3 + rr() * 1.4,
            ph:rr() * 9,
            par:far ? .12 : .3
        });

    }

    const palettes = [
        ["#7fa8e0","#2b4d8a","#16203f"],
        ["#e0a87f","#8a4d2b","#3f2016"],
        ["#8fe0c0","#2b8a6a","#163f30"],
        ["#c9a8f0","#5a3a9c","#251640"]
    ];

    const planets = [];

    for(let i = 0; i < 4; i++){

        const pal = palettes[i % palettes.length];

        planets.push({
            x:(.10 + i * .27 + rr() * .06) * W,
            y:(.18 + (i % 2) * .34 + rr() * .1) * H,
            r:(46 + rr() * 70) * unit,
            pal:pal,
            ring:rr() < .5,
            tilt:(rr() - .5) * .9,
            depth:.36 + rr() * .34
        });

    }

    const blocks = [];

    for(let i = 0; i < 7; i++){

        blocks.push({
            x:rr() * W,
            y:H - (10 + rr() * 46) * unit,
            w:(50 + rr() * 130) * unit,
            h:(26 + rr() * 60) * unit
        });

    }

    lobbyArt = {stars:stars, planets:planets, blocks:blocks, w:W, h:H};

}


function paintLobbyPlanet(pl, t){

    ctx.save();
    ctx.translate(pl.x, pl.y);

    ctx.globalAlpha = pl.depth;

    /* atmosphere */
    const halo = ctx.createRadialGradient(0, 0, pl.r * .9, 0, 0, pl.r * 1.6);
    halo.addColorStop(0, "rgba(150,190,255,.22)");
    halo.addColorStop(1, "rgba(150,190,255,0)");

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, pl.r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    /* le globe */
    const g = ctx.createRadialGradient(
        -pl.r * .35, -pl.r * .38, pl.r * .08,
        0, 0, pl.r
    );

    g.addColorStop(0,   pl.pal[0]);
    g.addColorStop(.55, pl.pal[1]);
    g.addColorStop(1,   pl.pal[2]);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, pl.r, 0, Math.PI * 2);
    ctx.fill();

    /* bandes qui defilent tres lentement */
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, pl.r, 0, Math.PI * 2);
    ctx.clip();

    ctx.globalAlpha = pl.depth * .35;
    ctx.fillStyle   = pl.pal[2];

    for(let i = -3; i <= 3; i++){

        const y = i * pl.r * .30 + Math.sin(t * .12 + i) * pl.r * .04;

        ctx.beginPath();
        ctx.ellipse(0, y, pl.r * 1.1, pl.r * .09, 0, 0, Math.PI * 2);
        ctx.fill();

    }

    ctx.restore();

    /* le terminateur : le cote nuit */
    ctx.globalAlpha = pl.depth * .55;

    const night = ctx.createLinearGradient(-pl.r, -pl.r, pl.r, pl.r);
    night.addColorStop(0,  "rgba(0,0,0,0)");
    night.addColorStop(.55, "rgba(0,0,0,0)");
    night.addColorStop(1,  "rgba(2,3,10,.9)");

    ctx.fillStyle = night;
    ctx.beginPath();
    ctx.arc(0, 0, pl.r, 0, Math.PI * 2);
    ctx.fill();

    /* l'anneau */
    if(pl.ring){

        ctx.globalAlpha = pl.depth * .8;
        ctx.rotate(pl.tilt);
        ctx.scale(1, .26);

        ctx.strokeStyle = pl.pal[0];
        ctx.lineWidth   = pl.r * .10;

        ctx.beginPath();
        ctx.arc(0, 0, pl.r * 1.45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = pl.depth * .4;
        ctx.lineWidth   = pl.r * .05;

        ctx.beginPath();
        ctx.arc(0, 0, pl.r * 1.72, 0, Math.PI * 2);
        ctx.stroke();

    }

    ctx.restore();

}


function drawLobbyScene(t){

    if(!lobbyArt || lobbyArt.w !== W || lobbyArt.h !== H){
        buildLobbyArt();
    }

    /* ---- la nebuleuse ---- */

    ctx.save();

    [[.24, .32, "#5a3aa8"], [.74, .26, "#1f6a8a"], [.5, .82, "#8a2a6a"]]
        .forEach((n, i) => {

            const cx = n[0] * W + Math.sin(t * .05 + i * 2) * W * .03;
            const cy = n[1] * H + Math.cos(t * .04 + i * 1.7) * H * .04;
            const rr = Math.max(W, H) * (.42 + i * .07);

            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);

            g.addColorStop(0,  hexA(n[2], .20));
            g.addColorStop(.5, hexA(n[2], .07));
            g.addColorStop(1,  hexA(n[2], 0));

            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);

        });

    ctx.restore();

    /* ---- les etoiles, en parallaxe lente ---- */

    ctx.save();

    for(const st of lobbyArt.stars){

        const dx = Math.sin(t * .08) * 26 * st.par * unit;
        const dy = Math.cos(t * .06) * 14 * st.par * unit;

        ctx.globalAlpha = st.a * (.55 + .45 * Math.sin(t * st.sp + st.ph));
        ctx.fillStyle   = "#ffffff";

        ctx.beginPath();
        ctx.arc(st.x + dx, st.y + dy, st.r, 0, Math.PI * 2);
        ctx.fill();

    }

    ctx.restore();

    /* ---- les planetes ---- */

    for(const pl of lobbyArt.planets){
        paintLobbyPlanet(pl, t);
    }

    /* ---- la poursuite ---- */

    const laneY = H * .73;
    const loop  = 13;                       /* secondes par tour */
    const k     = (t % loop) / loop;

    /* le fuyard et ses trois poursuivants, en file */
    const cast = [
        {kind:"slime",     lag:0,    r:20, a:.95},
        {kind:"hunter",    lag:.05,  r:19, a:.85},
        {kind:"predictor", lag:.095, r:18, a:.78},
        {kind:"traqueur",  lag:.14,  r:20, a:.72}
    ];

    /* la trajectoire ondule : on la lit deux fois, position et cap */
    const path = u => ({
        x:(-.2 + u * 1.4) * W,
        y:laneY + Math.sin(u * Math.PI * 3.1) * H * .085
    });

    ctx.save();

    cast.forEach((c, idx) => {

        const u = k - c.lag;

        if(u < -.05 || u > 1.05){
            return;
        }

        const here = path(u);
        const next = path(u + .004);

        const ang = Math.atan2(next.y - here.y, next.x - here.x);

        /* la trainee */
        ctx.globalAlpha = c.a * .16;
        ctx.fillStyle   = idx ? "#8fa8d8" : "#7fe0ff";

        for(let s2 = 1; s2 <= 9; s2++){

            const q = path(u - s2 * .006);

            ctx.beginPath();
            ctx.arc(q.x, q.y, c.r * unit * (1 - s2 * .09), 0, Math.PI * 2);
            ctx.fill();

        }

        ctx.globalAlpha = c.a;

        if(c.kind === "slime"){

            ctx.save();
            ctx.translate(here.x, here.y);
            paintSkinSlime(
                ctx,
                SKINS.find(sk => sk.id === currentSkin) || SKINS[0],
                c.r * unit, t, false,
                {speed:.7, angle:ang, wave:t * 3, blink:1}
            );
            ctx.restore();

        }else{

            paintCreature(ctx, c.kind, here.x, here.y, c.r * unit, ang, t);

        }

    });

    ctx.restore();

    /* ---- premier plan : blocs en ombre chinoise ---- */

    ctx.save();
    ctx.globalAlpha = .85;
    ctx.fillStyle   = "#04060e";

    for(const b of lobbyArt.blocks){

        ctx.beginPath();

        if(ctx.roundRect){
            ctx.roundRect(b.x - b.w / 2, b.y, b.w, b.h + 40 * unit, 14 * unit);
        }else{
            ctx.rect(b.x - b.w / 2, b.y, b.w, b.h + 40 * unit);
        }

        ctx.fill();

    }

    ctx.restore();

    /* ---- vignette ---- */

    const vg = ctx.createRadialGradient(
        W / 2, H * .45, Math.min(W, H) * .28,
        W / 2, H * .45, Math.max(W, H) * .78
    );

    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,3,10,.82)");

    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

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

const SECRET_CODES = {

    "1111":{
        label:"LE MARAIS",
        run:function(){
            startInMarais();
        }
    },

    "3333":{
        label:"LE PAYS DES BONBONS",
        run:function(){

            startGame();

            level = CANDY_LEVEL;

            enterCandy();

        }
    },

    "0000":{
        label:"0 PIÈCE",
        run:function(){

            totalCoins = 0;

            saveGame();

            closeCode();

            pickupMessage("0 " + T("hud.coins"), "#8fa0c8");

            /* deux notes qui descendent : on a tout remis a zero */
            sound(520, .10, "sine", .04);
            setTimeout(function(){ sound(330, .16, "sine", .04); }, 110);

        }
    },

    "2222":{
        label:"9 999 999 PIÈCES",
        run:function(){

            totalCoins = 9999999;

            saveGame();

            closeCode();

            pickupMessage("9 999 999 " + T("hud.coins"), "#ffd84d");

            coinChime();

        }
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


function openCode(){

    playing = false;
    paused  = false;

    codeEntry = "";

    refreshCode();
    codeMessage("");

    document.getElementById("mainMenu").style.display   = "none";
    document.getElementById("codeScreen").style.display = "flex";

}


function closeCode(){

    document.getElementById("codeScreen").style.display = "none";
    document.getElementById("mainMenu").style.display   = "block";

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

    pickupMessage("🐸 LE MARAIS", "#8fe04a");

}


/* =========================================================
   BOUTONS
========================================================= */

document.getElementById("startButton").onclick = () => {

    if(lobbyMode === "duel"){
        openDuel();
    }else if(lobbyMode === "laser"){
        openLaser();
    }else{
        startGame();
    }

};

/* le selecteur tourne : SOLO -> DUEL -> LASER */
const LOBBY_MODES = ["solo", "duel", "laser"];

document.getElementById("lobbyModePick").onclick = () => {

    const i = LOBBY_MODES.indexOf(lobbyMode);

    lobbySetMode(LOBBY_MODES[(i + 1) % LOBBY_MODES.length]);

    sound(620, .07, "sine", .035);

};

/* --- les boutons du mode laser --- */

document.getElementById("lasHost").onclick  = lasHostRoom;
document.getElementById("lasJoin").onclick  = lasJoinRoom;
document.getElementById("lasClose").onclick = closeLaser;

document.getElementById("lasStart").onclick = () => {

    if(!laser.host || laser.players.length < 2){
        return;
    }

    laser.seed = Math.floor(Math.random() * 1e9) + 1;

    lasSend({t:"go", seed:laser.seed});

    lasBegin();

};

document.getElementById("lasAgain").onclick = () => {

    if(!laser.host){
        return;
    }

    laser.players.forEach(p => { p.alive = true; p.time = 0; });

    laser.seed = Math.floor(Math.random() * 1e9) + 1;

    lasSend({t:"go", seed:laser.seed});

    lasBegin();

};

document.getElementById("lasQuit").onclick = () => {
    document.getElementById("lasResult").style.display = "none";
    closeLaser();
};

/* l'onglet BOUTIQUE ouvre directement le rayon */
document.getElementById("openShopStore").onclick = () => {
    openShop();
    showShop();
};

lobbySetMode("solo");
document.getElementById("retryButton").onclick     = () => startGame();
document.getElementById("duelButton").onclick      = openDuel;
document.getElementById("hostButton").onclick      = hostDuel;
document.getElementById("joinButton").onclick      = joinDuel;
document.getElementById("duelBack").onclick        = closeDuel;

document.getElementById("codeButton").onclick = openCode;
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

document.getElementById("guideButton").onclick = () => {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("guide").style.display    = "flex";
    renderGuideIcons();
};

document.getElementById("guideClose").onclick = () => {
    document.getElementById("guide").style.display     = "none";
    document.getElementById("mainMenu").style.display  = "block";
};
document.getElementById("joiningCancel").onclick   = closeDuel;

document.getElementById("duelRetryButton").onclick = () => {
    duelServer = 0;
    if(duel.host && duel.code){ hostDuel(); } else { openDuel(); }
};
document.getElementById("duelQuit").onclick        = closeDuel;

document.getElementById("codeInput").oninput = e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

document.getElementById("duelRematch").onclick = () => {

    duel.myRematch = true;

    duelSend({t:"rematch"});

    if(duel.foeRematch && duel.host){

        duelStartMatch();

    }else if(duel.foeRematch && !duel.host){

        document.getElementById("duelDetail").textContent =
            "Revanche acceptée, ça démarre…";

    }else{

        document.getElementById("duelDetail").textContent =
            "En attente de ton adversaire…";

        document.getElementById("duelRematch").style.display = "none";

    }

};
document.getElementById("openShop").onclick        = openShop;
document.getElementById("gameOverShop").onclick    = openShop;
document.getElementById("closeShop").onclick       = closeShop;
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

/*
Le dash part au pointerdown : sur telephone c'est
immediat, on ne perd pas les ~120 ms du "click".
*/
const dashButton = document.getElementById("dashBtn");

dashButton.addEventListener("pointerdown", e => {
    e.preventDefault();
    ensureAudio();
    tryDash();
});

dashButton.addEventListener("contextmenu", e => e.preventDefault());
document.getElementById("resumeButton").onclick    = () => setPaused(false);
document.getElementById("quitButton").onclick      = quitToMenu;

document.getElementById("menuButton").onclick = () => {

    duelCleanup();

    document.getElementById("gameOver").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";

};


/* =========================================================
   LIEN D'INVITATION

   Quand on arrive par un QR code scanné, l'adresse contient
   le code de la partie : on rejoint sans rien taper.
========================================================= */

(function(){

    const match =
        (location.search + location.hash).match(/duel=([A-Za-z0-9]{4})/);

    if(!match){
        return;
    }

    const code = match[1].toUpperCase();

    /* on attend que la librairie multijoueur soit prête */
    let waited = 0;

    const tryJoin = setInterval(() => {

        waited += 250;

        if(typeof Peer !== "undefined"){

            clearInterval(tryJoin);

            /* écran dédié : aucun bouton à toucher, ça se connecte tout seul */
            joiningByLink = true;

            document.getElementById("mainMenu").style.display     = "none";
            document.getElementById("duelScreen").style.display   = "none";
            document.getElementById("duelJoining").style.display  = "flex";
            document.getElementById("joiningCode").textContent    = code;

            document.getElementById("codeInput").value = code;

            duelStatus("Connexion à ton adversaire…");

            joinDuel();

            return;
        }

        if(waited > 8000){

            clearInterval(tryJoin);

            joiningByLink = false;

            openDuel();

            document.getElementById("codeInput").value = code;

            duelStatus("⚠️ Librairie multijoueur indisponible. Vérifie ta connexion puis appuie sur REJOINDRE.");

        }

    }, 250);

})();


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

    }

    updateMusic();
    animateShopIcons();
    paintLobby(t / 1000);

    if(playing && !paused && !portraitBlock){
        update(dt);
        lasUpdate(dt);
    }else if(!playing){
        updateAmbient(dt);
    }

    draw();

    requestAnimationFrame(loop);

}

i18nCollect();
applyLang();

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

document.body.classList.toggle("cb", daltonien);
syncSettings();

checkOrientation();
setMusic(musicOn);

requestAnimationFrame(loop);
