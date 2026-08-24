/* =========================================================
   DUEL 1 CONTRE 1

   Pas de serveur à héberger : les deux téléphones se parlent
   directement (WebRTC). Comme le terrain est généré à partir
   d'une graine commune, chacun joue EXACTEMENT la même partie
   de son côté ; on n'échange que le temps de survie et les vies.
========================================================= */

const DUEL_PREFIX = "mimicduel-";

/*
Serveurs de rendez-vous. Ils ne servent qu'à mettre les deux
téléphones en relation : ensuite ils se parlent directement.
Si le premier ne répond pas, on bascule sur le suivant.
*/
const DUEL_SERVERS = [
    null,                                                   /* serveur PeerJS par défaut */
    {host:"peerjs.92k.de",  port:443, secure:true, path:"/"},
    {host:"0.peerjs.com",   port:443, secure:true, path:"/"}
];

const DUEL_TIMEOUT = 6000;   /* ms avant de considérer un serveur muet */

let duelServer  = 0;
let duelTimer   = null;
let duelRetries = 0;

const duel = {
    active:false,
    peer:null,
    conn:null,
    host:false,
    code:"",
    seed:0,
    myTime:0,
    foeTime:0,
    foeLives:MAX_LIVES,
    foeAlive:true,
    meAlive:true,
    ended:false,
    sendTimer:0,
    myRematch:false,
    foeRematch:false
};


/*
QR code de la partie. Si le jeu est servi par une adresse web,
on encode le lien direct : scanner avec l'appareil photo ouvre
le jeu et rejoint tout seul. Si le jeu est ouvert depuis un
fichier local, ce lien n'aurait aucun sens sur l'autre téléphone :
on encode alors simplement le code à recopier.
*/
function duelPayload(code){

    const web = location.protocol === "http:" || location.protocol === "https:";

    if(!web){
        return {text:code, link:false};
    }

    const url =
        location.origin + location.pathname + "?duel=" + code;

    return {text:url, link:true};

}


function drawQR(code){

    const wrap   = document.getElementById("qrWrap");
    const canvas = document.getElementById("qrCanvas");
    const hint   = document.getElementById("qrHint");

    const payload = duelPayload(code);

    let qr = null;

    try{
        qr = qrEncode(payload.text);
    }catch(e){
        qr = null;
    }

    /* si l'adresse est trop longue, on se rabat sur le code seul */
    if(!qr && payload.link){
        try{ qr = qrEncode(code); }catch(e){ qr = null; }
        payload.link = false;
    }

    if(!qr){
        wrap.style.display = "none";
        hint.textContent   = "";
        return;
    }

    const quiet = 3;
    const dim   = qr.size + quiet * 2;
    const scale = 6;

    canvas.width  = dim * scale;
    canvas.height = dim * scale;

    const c = canvas.getContext("2d");

    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = "#000000";

    for(let r = 0; r < qr.size; r++){
        for(let col = 0; col < qr.size; col++){

            if(qr.modules[r][col]){

                c.fillRect(
                    (col + quiet) * scale,
                    (r + quiet) * scale,
                    scale,
                    scale
                );

            }

        }
    }

    wrap.style.display = "block";

    hint.textContent =
        payload.link
        ? "Ton adversaire scanne avec l'appareil photo : le jeu s'ouvre et rejoint tout seul."
        : "Scanne pour lire le code (le jeu est ouvert depuis un fichier, pas un lien).";

}


/* quand on arrive par un lien scanné, on affiche un écran dédié */
let joiningByLink = false;

function duelStatus(text){

    document.getElementById("duelStatus").textContent = text || "";

    if(joiningByLink){
        document.getElementById("joiningStatus").textContent = text || "";
    }

}


function makeCode(){

    /* pas de O/0/I/1 : illisibles quand on dicte le code */
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let out = "";

    for(let i = 0; i < 4; i++){
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return out;

}


function duelSend(msg){

    if(duel.conn && duel.conn.open){
        try{ duel.conn.send(msg); }catch(e){}
    }

}


function openDuel(){

    playing = false;
    paused  = false;

    document.getElementById("mainMenu").style.display   = "none";
    document.getElementById("gameOver").style.display   = "none";
    document.getElementById("duelResult").style.display = "none";
    document.getElementById("duelScreen").style.display = "flex";

    document.getElementById("hostBox").style.display = "none";
    document.getElementById("joinBox").style.display = "block";
    document.getElementById("qrWrap").style.display  = "none";

    document.getElementById("fileWarning").style.display =
        location.protocol === "file:" ? "block" : "none";

    duelStatus(
        typeof Peer === "undefined"
        ? "⚠️ Connexion indisponible — il faut internet pour jouer en duel."
        : ""
    );

}


function closeDuel(){

    duelCleanup();

    joiningByLink = false;

    document.getElementById("duelScreen").style.display  = "none";
    document.getElementById("duelResult").style.display  = "none";
    document.getElementById("duelJoining").style.display = "none";
    document.getElementById("mainMenu").style.display    = "block";

}


function duelCleanup(){

    clearDuelTimer();

    duelRetries = 0;

    duel.active = false;
    duel.ended  = false;

    if(duel.conn){
        try{ duel.conn.close(); }catch(e){}
    }

    if(duel.peer){
        try{ duel.peer.destroy(); }catch(e){}
    }

    duel.conn = null;
    duel.peer = null;

    document.getElementById("duelBar").style.display = "none";

}


function bindConnection(conn){

    duel.conn = conn;

    conn.on("open", () => {

        clearDuelTimer();

        duelStatus("✅ Adversaire connecté !");

        document.getElementById("joinBox").style.display = "none";

        /* c'est l'hôte qui décide de la graine, donc du terrain */
        if(duel.host){

            duel.seed = (Math.random() * 0xFFFFFFFF) >>> 0;

            duelSend({t:"start", seed:duel.seed});

            setTimeout(() => duelCountdown(), 400);

        }

    });

    conn.on("data", data => duelMessage(data));

    conn.on("close", () => duelLostPeer());

    conn.on("error", () => duelLostPeer());

}


function duelLostPeer(){

    if(!duel.active){
        duelStatus("❌ Connexion perdue.");
        return;
    }

    if(duel.ended){
        return;
    }

    /* l'adversaire a quitté : victoire par forfait */
    duel.foeAlive = false;
    duel.foeTime  = duel.foeTime || 0;

    if(!duel.meAlive){
        duelFinish("forfait");
    }else{
        pickupMessage("📴 ADVERSAIRE DÉCONNECTÉ", "#ffd84d");
    }

}


function clearDuelTimer(){

    if(duelTimer){
        clearTimeout(duelTimer);
        duelTimer = null;
    }

}


/*
Si un serveur reste muet, on ne laisse pas le joueur devant un
message figé : on essaie le suivant, puis on explique quoi faire.
*/
function duelServerFailed(reason){

    clearDuelTimer();

    if(duel.peer){
        try{ duel.peer.destroy(); }catch(e){}
        duel.peer = null;
    }

    duelServer++;

    if(duelServer < DUEL_SERVERS.length){

        duelStatus("Serveur " + duelServer + " muet, essai suivant…");

        setTimeout(() => {
            if(duel.host){ hostDuel(true); } else { joinDuel(true); }
        }, 300);

        return;

    }

    duelServer = 0;

    duelStatus(
        "❌ Aucun serveur de connexion joignable" +
        (reason ? " (" + reason + ")" : "") +
        ". Ouvre le jeu directement dans Chrome ou Safari — " +
        "l'aperçu intégré bloque le multijoueur."
    );

}


function newPeer(id){

    const cfg = DUEL_SERVERS[duelServer];

    try{
        return cfg ? new Peer(id, cfg) : new Peer(id);
    }catch(e){
        duelServerFailed("erreur locale");
        return null;
    }

}


function hostDuel(retry){

    if(typeof Peer === "undefined"){
        duelStatus("⚠️ La librairie multijoueur n'a pas pu être chargée. Vérifie ta connexion internet, puis recharge la page.");
        return;
    }

    if(!retry){
        duelServer = 0;
        duelCleanup();
    }

    duel.host = true;

    if(!retry || !duel.code){
        duel.code = makeCode();
    }

    duelStatus(
        "Création de la partie… (serveur " + (duelServer + 1) +
        "/" + DUEL_SERVERS.length + ")"
    );

    duel.peer = newPeer(DUEL_PREFIX + duel.code);

    if(!duel.peer){
        return;
    }

    clearDuelTimer();

    duelTimer = setTimeout(() => duelServerFailed("délai dépassé"), DUEL_TIMEOUT);

    duel.peer.on("open", () => {

        clearDuelTimer();

        document.getElementById("myCode").textContent     = duel.code;
        document.getElementById("hostBox").style.display  = "block";
        document.getElementById("joinBox").style.display  = "none";

        drawQR(duel.code);

        duelStatus("✅ Partie créée. En attente de ton adversaire…");

        sound(700, .15, "triangle", .05);

    });

    duel.peer.on("connection", conn => {
        clearDuelTimer();
        bindConnection(conn);
    });

    duel.peer.on("error", err => {

        const type = (err && err.type) || "inconnu";

        if(type === "unavailable-id"){

            /* code déjà pris : on en tire un autre, jusqu'à 5 fois */
            if(duelRetries++ < 5){
                duel.code = makeCode();
                hostDuel(true);
            }else{
                duelStatus("❌ Impossible de réserver un code. Réessaie dans un instant.");
            }

            return;
        }

        if(type === "network" || type === "server-error" || type === "socket-error" || type === "socket-closed"){
            duelServerFailed(type);
            return;
        }

        duelStatus("❌ Erreur de connexion : " + type);

    });

}


function joinDuel(retry){

    if(typeof Peer === "undefined"){
        duelStatus("⚠️ La librairie multijoueur n'a pas pu être chargée. Vérifie ta connexion internet, puis recharge la page.");
        return;
    }

    if(!retry){

        const typed =
            document.getElementById("codeInput").value
                .trim()
                .toUpperCase();

        if(typed.length !== 4){
            duelStatus("Entre le code à 4 caractères de ton adversaire.");
            return;
        }

        duelServer = 0;
        duelCleanup();
        duel.code  = typed;

    }

    duel.host = false;

    duelStatus(
        "Connexion à " + duel.code + "… (serveur " + (duelServer + 1) +
        "/" + DUEL_SERVERS.length + ")"
    );

    duel.peer = newPeer();

    if(!duel.peer){
        return;
    }

    clearDuelTimer();

    duelTimer = setTimeout(() => duelServerFailed("délai dépassé"), DUEL_TIMEOUT);

    duel.peer.on("open", () => {

        clearDuelTimer();

        duelStatus("Recherche de la partie " + duel.code + "…");

        bindConnection(
            duel.peer.connect(DUEL_PREFIX + duel.code, {reliable:true})
        );

    });

    duel.peer.on("error", err => {

        const type = (err && err.type) || "inconnu";

        if(type === "peer-unavailable"){

            clearDuelTimer();

            duelStatus(
                "❌ Aucune partie avec le code " + duel.code +
                ". Vérifie le code, et que ton adversaire est bien sur l'écran d'attente."
            );

            return;
        }

        if(type === "network" || type === "server-error" || type === "socket-error" || type === "socket-closed"){
            duelServerFailed(type);
            return;
        }

        duelStatus("❌ Erreur de connexion : " + type);

    });

}


function duelMessage(msg){

    if(!msg || !msg.t){
        return;
    }

    if(msg.t === "start"){
        duel.seed = msg.seed;
        duelCountdown();
        return;
    }

    if(msg.t === "state"){
        duel.foeTime  = msg.time;
        duel.foeLives = msg.lives;
        return;
    }

    if(msg.t === "dead"){

        duel.foeTime  = msg.time;
        duel.foeLives = 0;
        duel.foeAlive = false;

        if(!duel.meAlive){
            duelFinish();
        }else{
            pickupMessage("☠️ ADVERSAIRE ÉLIMINÉ — " + msg.time.toFixed(1) + " s", "#ffd84d");
        }

        return;
    }

    if(msg.t === "rematch"){

        duel.foeRematch = true;

        if(duel.myRematch && duel.host){
            duelStartMatch();
        }else if(!duel.myRematch){
            document.getElementById("duelDetail").textContent =
                "Ton adversaire veut la revanche.";
        }

        return;
    }

}


function duelCountdown(){

    document.getElementById("duelScreen").style.display  = "none";
    document.getElementById("duelResult").style.display  = "none";
    document.getElementById("duelJoining").style.display = "none";
    document.getElementById("mainMenu").style.display    = "none";

    joiningByLink = false;

    const el = document.getElementById("countdown");

    el.style.display = "flex";

    let n = 3;

    el.textContent = n;

    sound(500, .15, "triangle", .05);

    const tick = setInterval(() => {

        n--;

        if(n > 0){

            el.textContent = n;
            sound(500, .15, "triangle", .05);

        }else{

            clearInterval(tick);

            el.textContent = "GO";
            sound(900, .3, "triangle", .06);

            setTimeout(() => {
                el.style.display = "none";
                startGame(duel.seed);
            }, 500);

        }

    }, 800);

}


function duelStartMatch(){

    duel.seed = (Math.random() * 0xFFFFFFFF) >>> 0;

    duelSend({t:"start", seed:duel.seed});

    setTimeout(() => duelCountdown(), 300);

}


function duelBegin(){

    duel.active     = true;
    duel.ended      = false;
    duel.myTime     = 0;
    duel.foeTime    = 0;
    duel.foeLives   = MAX_LIVES;
    duel.foeAlive   = true;
    duel.meAlive    = true;
    duel.sendTimer  = 0;
    duel.myRematch  = false;
    duel.foeRematch = false;

    document.getElementById("duelBar").style.display = "block";
    document.getElementById("foeName").textContent   = "ADVERSAIRE";

}


function duelUpdate(dt){

    duel.myTime = gameTime;

    duel.sendTimer -= dt;

    if(duel.sendTimer <= 0){

        duelSend({t:"state", time:gameTime, lives:lives});

        duel.sendTimer = .25;

    }

    const hearts = n =>
        "♥".repeat(Math.max(0, n)) + "♡".repeat(Math.max(0, MAX_LIVES - n));

    document.getElementById("myTime").textContent  = gameTime.toFixed(1) + " s";
    document.getElementById("myLives").textContent = hearts(lives);

    const foe = document.getElementById("foeTime");

    foe.textContent = duel.foeTime.toFixed(1) + " s";
    foe.className   = duel.foeAlive ? "alive" : "dead";

    document.getElementById("foeLives").textContent =
        duel.foeAlive ? hearts(duel.foeLives) : "☠️";

}


function duelDeath(){

    duel.meAlive = false;
    duel.myTime  = gameTime;

    duelSend({t:"dead", time:gameTime});

    if(!duel.foeAlive){
        duelFinish();
    }else{
        duelFinish("attente");
    }

}


function duelFinish(mode){

    const screen = document.getElementById("duelResult");

    document.getElementById("duelMine").textContent   = duel.myTime.toFixed(1) + " s";
    document.getElementById("duelTheirs").textContent = duel.foeTime.toFixed(1) + " s";
    document.getElementById("duelLevel").textContent  = level;

    const verdict = document.getElementById("duelVerdict");
    const detail  = document.getElementById("duelDetail");
    const rematch = document.getElementById("duelRematch");

    if(mode === "attente"){

        verdict.textContent = "⏳ EN ATTENTE";
        verdict.style.color = "#ffd84d";

        detail.textContent =
            "Tu as tenu " + duel.myTime.toFixed(1) +
            " s. Ton adversaire court encore…";

        rematch.style.display = "none";

    }else{

        duel.ended = true;

        rematch.style.display = "block";

        if(mode === "forfait"){

            verdict.textContent = "🏆 VICTOIRE";
            verdict.style.color = "#61ff83";
            detail.textContent  = "Ton adversaire s'est déconnecté.";

        }else if(duel.myTime > duel.foeTime){

            verdict.textContent = "🏆 VICTOIRE";
            verdict.style.color = "#61ff83";

            detail.textContent =
                "Tu as survécu " +
                (duel.myTime - duel.foeTime).toFixed(1) +
                " s de plus que lui.";

            sound(880, .4, "triangle", .06);

        }else if(duel.myTime < duel.foeTime){

            verdict.textContent = "💀 DÉFAITE";
            verdict.style.color = "#ff466e";

            detail.textContent =
                "Il a tenu " +
                (duel.foeTime - duel.myTime).toFixed(1) +
                " s de plus que toi.";

            sound(150, .4, "sawtooth", .06);

        }else{

            verdict.textContent = "🤝 ÉGALITÉ";
            verdict.style.color = "#55d9ff";
            detail.textContent  = "Exactement le même temps. Revanche ?";

        }

    }

    document.getElementById("duelBar").style.display = "none";

    screen.style.display = "flex";

}


/* =========================================================
   ORIENTATION

   MIMIC se joue à l'horizontale : en portrait sur un écran
   tactile, on met la partie en attente et on demande de
   tourner l'appareil.
========================================================= */

let portraitBlock = false;

function isTouchScreen(){

    return (
        window.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches
    ) || "ontouchstart" in window;

}

function checkOrientation(){

    const portrait = innerHeight > innerWidth;

    const block = portrait && isTouchScreen();

    if(block === portraitBlock){
        return;
    }

    portraitBlock = block;

    document.getElementById("rotate").style.display =
        block ? "flex" : "none";

    if(block){
        stickReset();
    }

}

addEventListener("orientationchange", () => setTimeout(checkOrientation, 120));

/*
Le plein écran permet, sur Android, de verrouiller l'orientation.
Sur iPhone le verrouillage n'existe pas : c'est l'écran
"tourne ton téléphone" qui fait le travail.
*/
function goFullscreenLandscape(){

    if(!isTouchScreen()){
        return;
    }

    const el = document.documentElement;

    const req =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen;

    try{

        if(req && !document.fullscreenElement){

            const r = req.call(el);

            if(r && r.then){
                r.then(lockLandscape).catch(() => {});
            }else{
                lockLandscape();
            }

            return;

        }

        lockLandscape();

    }catch(e){}

}

function lockLandscape(){

    try{

        if(screen.orientation && screen.orientation.lock){
            screen.orientation.lock("landscape").catch(() => {});
        }

    }catch(e){}

}


/* =========================================================
   VIGNETTES DES CRÉATURES

   Un seul peintre pour les icônes du guide et pour les
   silhouettes qui dérivent derrière le menu.
========================================================= */

function paintCreature(c, kind, x, y, r, ang, t){

    /* en mode daltonien, un symbole double la couleur */
    if(daltonien && CB_MARKS[kind]){

        c.save();
        c.translate(x, y - r * 1.45);

        c.font         = "bold " + (r * .95).toFixed(1) + "px sans-serif";
        c.textAlign    = "center";
        c.textBaseline = "middle";

        c.lineWidth   = Math.max(2, r * .22);
        c.strokeStyle = "#05070f";
        c.strokeText(CB_MARKS[kind], 0, 0);

        c.fillStyle = "#ffffff";
        c.fillText(CB_MARKS[kind], 0, 0);

        c.restore();

    }

    c.save();
    c.translate(x, y);
    c.rotate(ang);

    const k = r / 20;

    c.lineJoin = "round";
    c.lineCap  = "round";

    if(kind === "hunter"){

        c.scale(k, k);

        c.fillStyle = "#ff713d";
        c.beginPath();
        c.moveTo(21, 0);
        c.lineTo(-11, -14);
        c.lineTo(-6, 0);
        c.lineTo(-11, 14);
        c.closePath();
        c.fill();

        c.fillStyle = "#32151a";
        c.beginPath();
        c.arc(0, 0, 7, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(4, -2, 3, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#ffb08c";
        c.beginPath();
        c.moveTo(-8, -8); c.lineTo(-16, -18); c.lineTo(-3, -11);
        c.fill();
        c.beginPath();
        c.moveTo(-8, 8); c.lineTo(-16, 18); c.lineTo(-3, 11);
        c.fill();

    }else if(kind === "predictor"){

        c.scale(k, k);

        c.strokeStyle = "#a855ff";
        c.lineWidth   = 4;
        c.beginPath();
        c.arc(0, 0, 18, 0, Math.PI * 2);
        c.stroke();

        c.fillStyle = "#a855ff";
        c.beginPath();
        c.moveTo(19, 0); c.lineTo(0, -15); c.lineTo(-19, 0); c.lineTo(0, 15);
        c.closePath();
        c.fill();

        c.fillStyle = "#160b29";
        c.beginPath();
        c.arc(0, 0, 7, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(3, 0, 3, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#d7a8ff";
        c.lineWidth   = 2;
        c.beginPath();
        c.arc(0, 0, 25, t, t + Math.PI);
        c.stroke();

    }else if(kind === "traqueur" || kind === "noir"){

        const elite = kind === "noir";

        c.scale(k, k);

        c.fillStyle = elite ? "#39404f" : "#ff2f4d";

        c.beginPath();
        c.moveTo(24, 0);
        c.lineTo(2, -11);
        c.lineTo(-14, -16);
        c.lineTo(-8, 0);
        c.lineTo(-14, 16);
        c.lineTo(2, 11);
        c.closePath();
        c.fill();

        if(elite){
            c.strokeStyle = "#c8d4ec";
            c.lineWidth   = 2;
            c.stroke();
        }

        c.strokeStyle = elite ? "#c8d4ec" : "#ff2f4d";
        c.lineWidth   = 2.5;
        c.beginPath();
        c.moveTo(-10, -9); c.lineTo(-25, -21);
        c.moveTo(-10, 9);  c.lineTo(-25, 21);
        c.moveTo(-12, 0);  c.lineTo(-28, 0);
        c.stroke();

        c.fillStyle = elite ? "#0d1019" : "#2a0710";
        c.beginPath();
        c.arc(4, 0, 7, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = elite ? "#dce6ff" : "#fff";
        c.beginPath();
        c.arc(6, 0, 3.2, 0, Math.PI * 2);
        c.fill();

    }else if(kind === "crawler"){

        c.scale(k, k);

        /* quelques anneaux et des pattes */
        for(let i = 4; i >= 0; i--){

            const px = -i * 8.5;
            const rr = 9 - i * 1.1;

            c.strokeStyle = "#f0c04a";
            c.lineWidth   = 2;

            c.beginPath();
            c.moveTo(px, -rr); c.lineTo(px - 2, -rr - 6);
            c.moveTo(px,  rr); c.lineTo(px - 2,  rr + 6);
            c.stroke();

            c.beginPath();
            c.arc(px, 0, rr, 0, Math.PI * 2);
            c.fillStyle = i % 2 === 0 ? "#a8451c" : "#8d3714";
            c.fill();

            c.lineWidth   = 2;
            c.strokeStyle = "#3d1607";
            c.stroke();

        }

        c.beginPath();
        c.ellipse(9, 0, 12, 9.5, 0, 0, Math.PI * 2);
        c.fillStyle = "#c1521f";
        c.fill();
        c.lineWidth   = 2.2;
        c.strokeStyle = "#3d1607";
        c.stroke();

        c.beginPath();
        c.moveTo(17, -4.5); c.lineTo(25, -1.5);
        c.moveTo(17,  4.5); c.lineTo(25,  1.5);
        c.stroke();

        c.fillStyle = "#ffd24a";
        c.beginPath();
        c.arc(12, -3.8, 2, 0, Math.PI * 2);
        c.arc(12,  3.8, 2, 0, Math.PI * 2);
        c.fill();

    }else if(kind === "glouton"){

        const w = r * 1.35, h = r * .95;

        c.beginPath();
        c.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
        c.fillStyle = "#ff5fa2";
        c.fill();

        c.save();
        c.clip();

        const bands = ["#7bd44f", "#ffd93d", "#ff5fa2", "#5fb8ff"];

        bands.forEach((col, i) => {
            c.fillStyle = col;
            c.fillRect(-w, -h + (i / bands.length) * h * 2, w * 2, (h * 2) / bands.length);
        });

        c.restore();

        c.lineWidth   = Math.max(2, r * .13);
        c.strokeStyle = "#2a0a1c";
        c.stroke();

        /* la gueule */
        c.beginPath();
        c.moveTo(-w * .7, h * .1);
        c.quadraticCurveTo(0, -h * .45, w * .7, h * .1);
        c.quadraticCurveTo(0, h * .65, -w * .7, h * .1);
        c.closePath();
        c.fillStyle = "#5c0d2e";
        c.fill();
        c.lineWidth = Math.max(1.5, r * .08);
        c.stroke();

        c.save();
        c.clip();
        c.fillStyle = "#fff";

        for(let i = 0; i < 6; i++){
            const x0 = -w * .7 + (i / 6) * w * 1.4;
            const x1 = -w * .7 + ((i + 1) / 6) * w * 1.4;
            c.beginPath();
            c.moveTo(x0, -h * .5);
            c.lineTo((x0 + x1) / 2, h * .05);
            c.lineTo(x1, -h * .5);
            c.closePath();
            c.fill();
        }

        c.restore();

        [-1, 1].forEach(sg => {
            c.fillStyle = "#fff";
            c.beginPath();
            c.ellipse(sg * w * .34, -h * .5, r * .19, r * .21, 0, 0, Math.PI * 2);
            c.fill();
            c.lineWidth = Math.max(1, r * .06);
            c.stroke();
            c.fillStyle = "#231018";
            c.beginPath();
            c.arc(sg * w * .34 + r * .05, -h * .5, r * .1, 0, Math.PI * 2);
            c.fill();
        });

    }else{

        /* le slime : dôme large, contour noir, yeux en fentes */
        const w = r * 1.30;
        const h = r * 0.88;

        c.beginPath();
        c.moveTo(-w, h * .52);
        c.bezierCurveTo(-w * 1.06, -h * .30, -w * .58, -h * 1.02, 0, -h * .98);
        c.bezierCurveTo(w * .62, -h * .95, w * 1.06, -h * .22, w, h * .50);
        c.bezierCurveTo(w * .62, h * .92, -w * .62, h * .92, -w, h * .52);
        c.closePath();

        const g = c.createLinearGradient(0, -h, 0, h);
        g.addColorStop(0,   "#5aa838");
        g.addColorStop(.55, "#367a22");
        g.addColorStop(1,   "#1f5014");

        c.fillStyle = g;
        c.fill();

        c.lineWidth   = Math.max(2, r * .22);
        c.strokeStyle = "#0b1607";
        c.stroke();

        const eye = (ex, tilt, glint) => {

            c.save();
            c.translate(ex, -h * .12);
            c.rotate(tilt);

            c.beginPath();
            c.moveTo(-r * .42, -r * .05);
            c.lineTo( r * .33, -r * .21);
            c.lineTo( r * .40,  r * .11);
            c.lineTo(-r * .34,  r * .17);
            c.closePath();

            c.fillStyle = "#0b1607";
            c.fill();

            if(glint){
                c.beginPath();
                c.moveTo(r * .05, -r * .07);
                c.lineTo(r * .32, -r * .14);
                c.lineTo(r * .30,  r * .07);
                c.closePath();
                c.fillStyle = "#7fdc3f";
                c.fill();
            }

            c.restore();

        };

        eye(-r * .48, -.20, false);
        eye( r * .46, -.13, true);

    }

    c.restore();

}


function renderGuideIcons(){

    document.querySelectorAll(".foeIcon").forEach(cv => {

        const size = 52;
        const dp   = Math.min(window.devicePixelRatio || 1, 3);

        cv.width  = size * dp;
        cv.height = size * dp;

        const c = cv.getContext("2d");

        c.setTransform(dp, 0, 0, dp, 0, 0);
        c.clearRect(0, 0, size, size);

        const kind = cv.dataset.kind;

        paintCreature(
            c,
            kind,
            size / 2,
            size / 2 + (kind === "slime" ? 3 : 0),
            kind === "slime" ? 17 : 15,
            (kind === "slime" || kind === "crawler" || kind === "glouton") ? 0 : -.35,
            1.1
        );

    });

}





/* =========================================================
   MODE DALTONIEN

   Les trois poursuivants etaient orange, violet et rouge :
   pour une vision deuteranope ou protanope, ces trois-la se
   ressemblent. En mode daltonien on repasse sur une palette
   sure (bleu ciel, ambre, blanc, noir), on epaissit le
   contour sombre, et chaque creature porte un symbole :
   la forme reste lisible meme si la couleur ne l'est pas.
========================================================= */

let daltonien = localStorage.getItem("mimicCB") === "1";

const CB_COLORS = {
    "#ff713d":"#f0a02a",   /* HUNTER    -> ambre    */
    "#a855ff":"#4fa8ff",   /* PREDICTOR -> bleu ciel */
    "#ff2f4d":"#f2f2f2",   /* TRAQUEUR  -> blanc    */
    "#7fdc3f":"#5fc8d8",   /* SLIME     -> cyan     */
    "#e0742f":"#c8871f",   /* MILLE-PATTES         */
    "#ff5fa2":"#b98cff",   /* GLOUTON   -> mauve    */
    "#ff466e":"#f0a02a",
    "#69ff88":"#8fd8ff",   /* coeur                 */
    "#b66cff":"#4fa8ff",   /* orbe                  */
    "#a8e52a":"#7fd4e0"    /* flaque                */
};

/* symbole propre a chaque poursuivant */
const CB_MARKS = {
    hunter:"▲",
    predictor:"●",
    traqueur:"✚",
    noir:"◆",
    slime:"■",
    crawler:"~",
    glouton:"★"
};


function cbCol(hex){

    if(!daltonien || typeof hex !== "string"){
        return hex;
    }

    return CB_COLORS[hex.toLowerCase()] || hex;

}


function setDaltonien(on){

    daltonien = on;

    try{ localStorage.setItem("mimicCB", on ? "1" : "0"); }catch(e){}

    document.body.classList.toggle("cb", on);

    /* le sol est mis en cache : il faut le refaire */
    if(typeof floorCache !== "undefined"){
        floorCache = null;
    }

    if(typeof renderShop === "function" &&
       document.getElementById("shop").style.display === "block"){
        renderShop();
    }

    syncSettings();

}


function syncSettings(){

    const cb = document.getElementById("cbToggle");
    const mu = document.getElementById("musicToggle");

    if(cb){
        cb.classList.toggle("on", daltonien);
    }

    if(mu){
        mu.classList.toggle("on", musicOn);
    }

}
