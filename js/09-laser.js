/* =========================================================
   MODE LASER — de 2 a 5 joueurs

   Une arene vide, et des rayons qui la balaient. Chaque
   rayon s'annonce d'abord par un trait fin, puis tire.
   Touche = elimine. Le dernier debout gagne.

   Reseau en etoile : l'hote accepte jusqu'a quatre
   connexions et relaie les positions. Les rayons, eux, ne
   transitent pas : ils sont tires d'une graine commune,
   donc identiques sur tous les ecrans.

   Ce mode ne rapporte aucune piece et ne touche ni au
   score, ni au meilleur score.
========================================================= */

const LAS_PREFIX  = "mimiclaser-";
const LAS_MAX     = 5;

/* couleur de chaque joueur, dans l'ordre d'arrivee */
const LAS_COLORS = ["#4fd8ff", "#ffd24d", "#8dff6a", "#ff7ba8", "#c78cff"];

const laser = {
    active:false,     /* une partie laser est en cours   */
    open:false,       /* l'ecran du salon est ouvert     */
    peer:null,
    host:false,
    code:"",
    seed:1,
    me:0,             /* mon index de joueur             */
    conns:[],         /* hote : une entree par invite    */
    conn:null,        /* invite : le lien vers l'hote    */
    players:[],       /* {id,name,skin,color,x,y,alive,time} */
    beams:[],
    wave:0,
    nextWave:0,
    time:0,
    send:0,
    ended:false
};


function lasStatus(txt){

    const el = document.getElementById("lasStatus");

    if(el){
        el.textContent = txt || "";
    }

}


/* --- le hasard des rayons, tire de la graine partagee --- */
let lasRng = 1;

function lasSeed(n){
    lasRng = n >>> 0 || 1;
}

function lrnd(){
    lasRng = (lasRng * 1664525 + 1013904223) >>> 0;
    return lasRng / 4294967296;
}


/* =========================================================
   LES RAYONS
========================================================= */

/*
La montee en puissance est reglee sur le TEMPS, pas sur le
nombre de salves : une salve compte 1 rayon au depart et
25 au bout de cinq minutes. Comme ils partent en cascade
et s'affinent au fur et a mesure, il reste toujours un
passage — mais il faut le trouver de plus en plus vite.
*/
const LAS_MAX_BEAMS = 25;
const LAS_RAMP      = 300;   /* cinq minutes, en secondes */


/* 0 au debut, 1 une fois la montee terminee */
function lasRamp(){
    return Math.min(1, laser.time / LAS_RAMP);
}


/* combien de rayons doivent etre a l'ecran a cet instant */
function lasTarget(){
    return Math.max(1, Math.round(1 + (LAS_MAX_BEAMS - 1) * lasRamp()));
}


/* duree de vie d'un rayon, du preavis a la braise */
function lasLife(){
    return (1.15 - .6 * lasRamp()) + .30 + .35;
}


/*
Le rythme d'apparition decoule des deux precedents : pour
tenir N rayons a l'ecran alors que chacun vit L secondes,
il en faut un nouveau toutes les L/N secondes. La
population converge vers N toute seule, sans a-coup.
*/
function lasGap(){
    return lasLife() / lasTarget();
}


function lasSpawnWave(){

    laser.wave++;

    const k = lasRamp();

    /* le preavis se raccourcit : 1,15 s au depart, 0,55 s a la fin */
    const warn = 1.15 - .6 * k;

    for(let i = 0; i < 1; i++){

        const kind = lrnd();

        let beam;

        /*
        Tout est range en 0..1 dans l'arene, jamais en pixels :
        un telephone et un ordinateur n'ont ni la meme taille
        ni le meme rapport d'ecran. En pixels, les rayons ne
        tomberaient pas au meme endroit chez chacun.
        */
        if(kind < .42){

            beam = {dir:"h", pos:lrnd(), thick:.022 + lrnd() * .026};

        }else if(kind < .84){

            beam = {dir:"v", pos:lrnd(), thick:.022 + lrnd() * .026};

        }else{

            beam = {
                dir:"d",
                ang:(lrnd() * .8 + .2) * (lrnd() < .5 ? 1 : -1),
                cx:lrnd(),
                cy:lrnd(),
                thick:.026 + lrnd() * .022
            };

        }

        /* plus il y en a, plus ils sont fins : le passage existe toujours */
        beam.thick *= 1 - .42 * k;

        beam.warn  = warn;
        beam.fire  = .30;
        beam.t     = 0;
        beam.dead  = false;

        laser.beams.push(beam);

    }

}


/*
Passage du repere relatif (0..1) au repere de CET ecran.
C'est le seul endroit qui connait les pixels.
*/
function lasGeom(b){

    const a = playArea();

    const aw = a.x1 - a.x0;
    const ah = a.y1 - a.y0;

    const thick = b.thick * Math.min(W, H);

    if(b.dir === "h"){
        return {pos:a.y0 + b.pos * ah, thick:thick};
    }

    if(b.dir === "v"){
        return {pos:a.x0 + b.pos * aw, thick:thick};
    }

    return {
        cx:a.x0 + b.cx * aw,
        cy:a.y0 + b.cy * ah,
        thick:thick
    };

}


/* distance d'un point au rayon, pour savoir si on est dedans */
function lasHit(b, x, y, r){

    const g = lasGeom(b);

    if(b.dir === "h"){
        return Math.abs(y - g.pos) < g.thick / 2 + r;
    }

    if(b.dir === "v"){
        return Math.abs(x - g.pos) < g.thick / 2 + r;
    }

    /* diagonale : distance point-droite */
    const dx = Math.cos(b.ang);
    const dy = Math.sin(b.ang);

    const d = Math.abs((x - g.cx) * dy - (y - g.cy) * dx);

    return d < g.thick / 2 + r;

}


function lasUpdateBeams(dt){

    laser.nextWave -= dt;

    if(laser.nextWave <= 0){

        /* on ne depasse jamais le plafond, meme si une image traine */
        if(laser.beams.length < LAS_MAX_BEAMS){
            lasSpawnWave();
        }

        laser.nextWave = lasGap();

    }

    for(const b of laser.beams){

        b.t += dt;

        if(b.t > b.warn + b.fire + .35){
            b.dead = true;
        }

    }

    laser.beams = laser.beams.filter(b => !b.dead);

}


function lasBeamLethal(b){
    return b.t >= b.warn && b.t < b.warn + b.fire;
}


function drawLaserBeams(){

    const a = playArea();

    for(const b of laser.beams){

        if(b.t < 0){
            continue;
        }

        const lethal = lasBeamLethal(b);
        const after  = b.t >= b.warn + b.fire;

        const g = lasGeom(b);

        ctx.save();

        /* on se place dans le repere du rayon */
        if(b.dir === "h"){
            ctx.translate(W / 2, g.pos);
        }else if(b.dir === "v"){
            ctx.translate(g.pos, H / 2);
            ctx.rotate(Math.PI / 2);
        }else{
            ctx.translate(g.cx, g.cy);
            ctx.rotate(b.ang);
        }

        const len = Math.max(W, H) * 1.6;

        if(!lethal && !after){

            /* le preavis : un trait fin qui bat de plus en plus vite */
            const k = b.t / b.warn;
            const puls = .35 + .45 * Math.abs(Math.sin(k * Math.PI * (3 + k * 6)));

            ctx.globalAlpha = puls;
            ctx.fillStyle   = "#ff4f6e";
            ctx.fillRect(-len / 2, -1.5 * unit, len, 3 * unit);

            /* l'emprise du rayon, en transparence */
            ctx.globalAlpha = .10 + k * .12;
            ctx.fillRect(-len / 2, -g.thick / 2, len, g.thick);

        }else if(lethal){

            const k = (b.t - b.warn) / b.fire;

            /* le coeur */
            const grad = ctx.createLinearGradient(0, -g.thick / 2, 0, g.thick / 2);

            grad.addColorStop(0,   "rgba(255,90,120,0)");
            grad.addColorStop(.28, "rgba(255,120,150,.85)");
            grad.addColorStop(.5,  "rgba(255,255,255,1)");
            grad.addColorStop(.72, "rgba(255,120,150,.85)");
            grad.addColorStop(1,   "rgba(255,90,120,0)");

            ctx.globalAlpha = 1 - k * .25;
            ctx.fillStyle   = grad;
            ctx.fillRect(-len / 2, -g.thick / 2, len, g.thick);

            /* le halo */
            ctx.globalAlpha = (1 - k) * .45;
            ctx.fillStyle   = "#ff4f6e";
            ctx.fillRect(-len / 2, -g.thick * 1.4, len, g.thick * 2.8);

        }else{

            /* la braise qui reste juste apres le tir */
            const k = (b.t - b.warn - b.fire) / .35;

            ctx.globalAlpha = (1 - k) * .5;
            ctx.fillStyle   = "#ff8a6a";
            ctx.fillRect(-len / 2, -g.thick / 4, len, g.thick / 2);

        }

        ctx.restore();

    }

}


/* =========================================================
   LES JOUEURS
========================================================= */

function drawLaserPlayers(){

    laser.players.forEach((pl, i) => {

        if(i === laser.me || !pl.alive){
            return;
        }

        /* les positions arrivent en 0..1 : on les ramene ici */
        const q = lasPix(pl.x, pl.y);

        ctx.save();
        ctx.globalAlpha = .85;
        ctx.translate(q.x, q.y);

        const skin = SKINS.find(sk => sk.id === pl.skin) || SKINS[0];

        paintSkinSlime(ctx, skin, 15 * unit, gameTime, false, {blink:1});

        ctx.restore();

        /* l'etiquette du joueur */
        ctx.save();
        ctx.globalAlpha = .9;
        ctx.fillStyle   = pl.color;
        ctx.font        = "bold " + Math.round(10 * unit) + "px Arial";
        ctx.textAlign   = "center";
        ctx.fillText(pl.name, q.x, q.y - 26 * unit);
        ctx.restore();

    });

}


/* =========================================================
   LE RESEAU
========================================================= */

/* ma position, exprimee en 0..1 dans l'arene */
function lasNorm(x, y){

    const a = playArea();

    return {
        x:(x - a.x0) / Math.max(1, a.x1 - a.x0),
        y:(y - a.y0) / Math.max(1, a.y1 - a.y0)
    };

}


/* et le chemin inverse, pour dessiner les autres chez moi */
function lasPix(nx, ny){

    const a = playArea();

    return {
        x:a.x0 + nx * (a.x1 - a.x0),
        y:a.y0 + ny * (a.y1 - a.y0)
    };

}


function lasSend(msg){

    if(laser.host){

        laser.conns.forEach(c => {
            if(c && c.open){
                try{ c.send(msg); }catch(e){}
            }
        });

    }else if(laser.conn && laser.conn.open){

        try{ laser.conn.send(msg); }catch(e){}

    }

}


function lasRoster(){

    return laser.players.map(p => ({
        name:p.name, skin:p.skin, color:p.color, alive:p.alive, time:p.time
    }));

}


function lasPaintList(box, rows){

    const el = document.getElementById(box);

    if(!el){
        return;
    }

    el.innerHTML = "";

    rows.forEach((p, i) => {

        const row = document.createElement("div");

        row.className = "lasRow" + (p.alive ? "" : " out");

        const dot = document.createElement("span");
        dot.className = "lasDot";
        dot.style.background = p.color;
        dot.style.color      = p.color;

        const nm = document.createElement("b");
        nm.textContent = p.name + (i === laser.me ? " (" + T("las.you") + ")" : "");

        const tm = document.createElement("small");
        tm.textContent = p.time ? p.time.toFixed(1) + " s" : "";

        row.appendChild(dot);
        row.appendChild(nm);
        row.appendChild(tm);

        el.appendChild(row);

    });

}


function lasRefreshRoom(){

    document.getElementById("lasRoom").style.display = "block";

    lasPaintList("lasList", laser.players);

    const start = document.getElementById("lasStart");

    start.style.display = laser.host ? "block" : "none";
    start.disabled      = laser.players.length < 2;

    if(!laser.host){
        lasStatus(T("las.waitHost"));
    }else if(laser.players.length < 2){
        lasStatus(T("las.waitPlayers"));
    }else{
        lasStatus(laser.players.length + "/" + LAS_MAX);
    }

}


function lasBind(conn, isHost){

    conn.on("open", () => {

        if(isHost){

            if(laser.players.length >= LAS_MAX){
                try{ conn.send({t:"full"}); conn.close(); }catch(e){}
                return;
            }

            laser.conns.push(conn);

            conn.__idx = laser.players.length;

            laser.players.push({
                name:T("las.player") + " " + (laser.players.length + 1),
                skin:"cyber",
                color:LAS_COLORS[laser.players.length % LAS_COLORS.length],
                x:0, y:0, alive:true, time:0
            });

            lasSend({t:"room", players:lasRoster()});
            conn.send({t:"you", idx:conn.__idx});

            lasRefreshRoom();

            sound(700, .12, "triangle", .05);

        }else{

            conn.send({t:"hello", skin:currentSkin});
            lasStatus(T("las.joined"));

        }

    });

    conn.on("data", d => lasMessage(d, conn, isHost));

    conn.on("close", () => lasPeerGone(conn, isHost));
    conn.on("error", () => lasPeerGone(conn, isHost));

}


function lasPeerGone(conn, isHost){

    if(isHost){

        const i = laser.conns.indexOf(conn);

        if(i >= 0){
            laser.conns.splice(i, 1);
        }

        if(conn.__idx != null && laser.players[conn.__idx]){
            laser.players[conn.__idx].alive = false;
        }

        lasSend({t:"room", players:lasRoster()});
        lasRefreshRoom();

    }else{

        lasStatus(T("las.hostGone"));

        if(laser.active){
            lasFinish();
        }

    }

}


function lasMessage(d, conn, isHost){

    if(!d || !d.t){
        return;
    }

    if(isHost){

        if(d.t === "hello"){

            if(laser.players[conn.__idx]){
                laser.players[conn.__idx].skin = d.skin || "cyber";
            }

            lasSend({t:"room", players:lasRoster()});
            lasRefreshRoom();

            return;
        }

        if(d.t === "p"){

            const p = laser.players[conn.__idx];

            if(p){
                p.x = d.x; p.y = d.y;
                p.alive = d.a;
                p.time  = d.tm;
            }

            return;
        }

        if(d.t === "out"){

            const p = laser.players[conn.__idx];

            if(p){
                p.alive = false;
                p.time  = d.tm;
            }

            lasSend({t:"all", players:lasRoster()});
            lasCheckEnd();

            return;
        }

        return;

    }

    /* --- cote invite --- */

    if(d.t === "you"){
        laser.me = d.idx;
        return;
    }

    if(d.t === "full"){
        lasStatus(T("las.full"));
        return;
    }

    if(d.t === "room"){
        laser.players = d.players;
        lasRefreshRoom();
        return;
    }

    if(d.t === "go"){
        laser.seed = d.seed;
        lasBegin();
        return;
    }

    if(d.t === "all"){

        d.players.forEach((p, i) => {

            if(i === laser.me){
                return;
            }

            if(!laser.players[i]){
                laser.players[i] = p;
                return;
            }

            laser.players[i].x     = p.x;
            laser.players[i].y     = p.y;
            laser.players[i].alive = p.alive;
            laser.players[i].time  = p.time;

        });

        return;
    }

    if(d.t === "end"){
        laser.players = d.players;
        lasFinish(d.winner);
        return;
    }

}


/* =========================================================
   DEROULEMENT DE LA PARTIE
========================================================= */

function lasHudLabels(on){

    const lives = document.getElementById("livesStat");

    /* une seule vie en mode laser : la jauge n'a plus de sens */
    if(lives){
        lives.style.visibility = on ? "hidden" : "visible";
    }


    const sc = document.querySelector('[data-i18n="hud.score"]');
    const lv = document.querySelector('[data-i18n="hud.level"]');

    if(sc){
        sc.textContent = on ? T("las.time") : T("hud.score");
    }

    if(lv){
        lv.textContent = on ? T("las.alive") : T("hud.level");
    }

}


function lasBegin(){

    document.getElementById("laserScreen").style.display = "none";
    document.getElementById("mainMenu").style.display    = "none";
    document.getElementById("lasResult").style.display   = "none";

    laser.active = true;
    laser.ended  = false;
    laser.beams  = [];
    laser.wave   = 0;
    laser.time   = 0;
    laser.send   = 0;
    laser.nextWave = 1.6;

    lasSeed(laser.seed);

    /* on repart d'une arene propre : ni ennemis, ni objets */
    startGame();

    mimics   = [];
    coins    = [];
    orbs     = [];
    hearts   = [];
    solids   = [];
    archers  = [];
    trace    = [];

    lives = 1;

    /* chacun demarre a une place fixe, la meme sur tous les ecrans */
    laser.players.forEach((p, i) => {
        p.alive = true;
        p.time  = 0;
        p.x = .18 + i * .16;
        p.y = .5;
    });

    if(laser.players[laser.me]){

        const q = lasPix(laser.players[laser.me].x, laser.players[laser.me].y);

        player.x = q.x;
        player.y = q.y;

    }

    player.invincible = 1.5;

    lasHudLabels(true);

    sound(520, .12, "triangle", .05);
    setTimeout(function(){ sound(780, .18, "triangle", .05); }, 130);

}


function lasCheckEnd(){

    if(!laser.host || laser.ended){
        return;
    }

    const alive = laser.players.filter(p => p.alive);

    if(alive.length <= 1 && laser.players.length > 1){

        laser.ended = true;

        const winner = laser.players.indexOf(alive[0]);

        lasSend({t:"end", players:lasRoster(), winner:winner});

        lasFinish(winner);

    }

}


function lasFinish(winner){

    laser.active = false;

    lasHudLabels(false);
    playing      = false;

    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("skillBar").style.display = "none";
    document.getElementById("gameUI").style.display   = "none";

    const won = winner === laser.me;

    const v = document.getElementById("lasVerdict");

    v.textContent = won ? T("duel.victory") : T("duel.defeat");
    v.style.color = won ? "#61ff83" : "#ff6b8a";

    /* classement : le plus longtemps debout en premier */
    const rank = laser.players
        .map((p, i) => ({p:p, i:i}))
        .sort((a, b) => (b.p.time || 0) - (a.p.time || 0))
        .map(x => x.p);

    lasPaintList("lasRank", rank);

    document.getElementById("lasResult").style.display = "flex";

    document.getElementById("lasAgain").style.display = laser.host ? "block" : "none";

    sound(won ? 720 : 220, .2, "sine", .05);

}


/* appele depuis la boucle de jeu */
function lasUpdate(dt){

    if(!laser.active){
        return;
    }

    laser.time += dt;

    lasUpdateBeams(dt);

    const me = laser.players[laser.me];

    if(me && me.alive){

        const n = lasNorm(player.x, player.y);

        me.x = n.x;
        me.y = n.y;
        me.time = laser.time;

        /* touche par un rayon ? */
        if(player.invincible <= 0){

            for(const b of laser.beams){

                if(lasBeamLethal(b) && lasHit(b, player.x, player.y, player.r * .7)){

                    me.alive = false;
                    me.time  = laser.time;

                    burst(player.x, player.y, 26, "#ff4f6e");
                    sound(160, .3, "sawtooth", .06);

                    if(laser.host){
                        lasSend({t:"all", players:lasRoster()});
                        lasCheckEnd();
                    }else{
                        lasSend({t:"out", tm:laser.time});
                    }

                    break;

                }

            }

        }

    }

    /* on partage sa position ~15 fois par seconde */
    laser.send -= dt;

    if(laser.send <= 0){

        laser.send = .066;

        const n = lasNorm(player.x, player.y);

        if(laser.host){
            laser.players[laser.me].x = n.x;
            laser.players[laser.me].y = n.y;
            lasSend({t:"all", players:lasRoster()});
        }else if(me){
            lasSend({t:"p", x:n.x, y:n.y, a:me.alive, tm:laser.time});
        }

    }

}


/* =========================================================
   L'ECRAN DU SALON
========================================================= */

function openLaser(){

    document.getElementById("mainMenu").style.display    = "none";
    document.getElementById("laserScreen").style.display = "flex";

    laser.open = true;

    document.getElementById("lasHostBox").style.display = "none";
    document.getElementById("lasRoom").style.display    = "none";
    document.getElementById("lasJoinBox").style.display = "block";
    document.getElementById("lasHost").style.display    = "block";

    lasStatus("");

}


function closeLaser(){

    lasCleanup();

    document.getElementById("laserScreen").style.display = "none";
    document.getElementById("lasResult").style.display   = "none";
    document.getElementById("mainMenu").style.display    = "block";

}


function lasCleanup(){

    laser.conns.forEach(c => { try{ c.close(); }catch(e){} });
    laser.conns = [];

    if(laser.conn){
        try{ laser.conn.close(); }catch(e){}
    }

    if(laser.peer){
        try{ laser.peer.destroy(); }catch(e){}
    }

    laser.conn   = null;
    laser.peer   = null;
    laser.open   = false;
    laser.active = false;
    laser.players = [];
    laser.beams   = [];

}


function lasHostRoom(){

    if(typeof Peer === "undefined"){
        lasStatus(T("las.noLib"));
        return;
    }

    lasCleanup();

    laser.host = true;
    laser.me   = 0;
    laser.code = makeCode();

    laser.players = [{
        name:T("las.player") + " 1",
        skin:currentSkin,
        color:LAS_COLORS[0],
        x:0, y:0, alive:true, time:0
    }];

    lasStatus(T("las.creating"));

    laser.peer = newPeer(LAS_PREFIX + laser.code);

    if(!laser.peer){
        return;
    }

    laser.peer.on("open", () => {

        document.getElementById("lasCode").textContent      = laser.code;
        document.getElementById("lasHostBox").style.display = "block";
        document.getElementById("lasJoinBox").style.display = "none";
        document.getElementById("lasHost").style.display    = "none";

        lasDrawQR(laser.code);
        lasRefreshRoom();

    });

    laser.peer.on("connection", conn => lasBind(conn, true));

    laser.peer.on("error", err => {
        lasStatus("❌ " + ((err && err.type) || "?"));
    });

}


function lasJoinRoom(){

    if(typeof Peer === "undefined"){
        lasStatus(T("las.noLib"));
        return;
    }

    const code = (document.getElementById("lasInput").value || "")
        .toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

    if(code.length !== 4){
        lasStatus(T("las.badCode"));
        return;
    }

    lasCleanup();

    laser.host = false;
    laser.code = code;

    lasStatus(T("las.connecting"));

    laser.peer = newPeer(null);

    if(!laser.peer){
        return;
    }

    laser.peer.on("open", () => {

        const conn = laser.peer.connect(LAS_PREFIX + code, {reliable:true});

        laser.conn = conn;

        lasBind(conn, false);

    });

    laser.peer.on("error", err => {
        lasStatus("❌ " + ((err && err.type) || "?"));
    });

}


function lasDrawQR(code){

    const canvas = document.getElementById("lasQrCanvas");

    let qr = null;

    try{
        qr = qrEncode(code);
    }catch(e){
        qr = null;
    }

    if(!qr){
        document.getElementById("lasQrWrap").style.display = "none";
        return;
    }

    document.getElementById("lasQrWrap").style.display = "block";

    const n     = qr.size;
    const scale = Math.max(2, Math.floor(150 / n));
    const quiet = 3;
    const side  = (n + quiet * 2) * scale;

    canvas.width  = side;
    canvas.height = side;

    const c = canvas.getContext("2d");

    c.fillStyle = "#fff";
    c.fillRect(0, 0, side, side);

    c.fillStyle = "#000";

    for(let y = 0; y < n; y++){
        for(let x = 0; x < n; x++){
            if(qr.modules[y][x]){
                c.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
            }
        }
    }

}
