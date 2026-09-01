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
    {host:"peerjs.92k.de", port:443, secure:true, path:"/"}
];

/*
6 s ne suffisaient pas : sur un reseau mobile la poignee de
main PeerJS depasse souvent ce delai, et le jeu abandonnait
un serveur qui allait repondre. Le mode laser, lui, n'avait
aucun delai — c'est pour ca qu'il marchait et pas le duel.
*/
/*
Le delai ne CHANGE plus de serveur : il ne fait que prevenir.
C'etait la cause du duel qui ne marchait pas — le mode laser,
lui, n'a aucun delai et attend simplement, et c'est pour ca
qu'il fonctionnait. On ne bascule desormais que sur une vraie
erreur reseau annoncee par PeerJS.
*/
const DUEL_TIMEOUT = 12000;  /* ms avant de simplement prevenir */

let duelServer  = 0;
let duelTimer   = null;
let duelRetries = 0;

/*
Le duel 1 contre 1 a ete retire du jeu. On garde uniquement
ce petit temoin : d'autres endroits demandent encore "est-ce
qu'une partie en duel tourne ?", et la reponse est non.
*/
const duel = {active:false};


function makeCode(){

    /* pas de O/0/I/1 : illisibles quand on dicte le code */
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let out = "";

    for(let i = 0; i < 4; i++){
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return out;

}


function clearDuelTimer(){

    if(duelTimer){
        clearTimeout(duelTimer);
        duelTimer = null;
    }

}


/*
Si un serveur de rendez-vous reste muet, on passe au suivant.
Seul le mode rayon s'en sert desormais.
*/
function duelServerFailed(reason){

    clearDuelTimer();

    duelServer++;

    if(duelServer >= DUEL_SERVERS.length){
        duelServer = 0;
    }

    if(typeof lasStatus === "function"){

        lasStatus(
            "❌ Serveur de connexion injoignable" +
            (reason ? " (" + reason + ")" : "") +
            ". Ouvre le jeu dans Chrome ou Safari — l'aperçu intégré bloque le multijoueur."
        );

    }

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

    }else if(kind === "oeil"){

        c.fillStyle = "#c86aff";
        c.globalAlpha = .25;
        c.beginPath();
        c.arc(0, 0, r * 1.35, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;

        c.strokeStyle = "#c86aff";
        c.lineWidth   = r * .09;

        c.save();
        c.scale(1, .42);
        c.beginPath();
        c.arc(0, 0, r * 1.25, 0, Math.PI * 2);
        c.stroke();
        c.restore();

        c.save();
        c.rotate(1.1);
        c.scale(1, .42);
        c.strokeStyle = "#ffc65a";
        c.beginPath();
        c.arc(0, 0, r * 1.1, 0, Math.PI * 2);
        c.stroke();
        c.restore();

        const gl = c.createRadialGradient(-r * .2, -r * .2, r * .05, 0, 0, r * .85);
        gl.addColorStop(0,  "#3a1a60");
        gl.addColorStop(.7, "#180a2c");
        gl.addColorStop(1,  "#050208");

        c.fillStyle = gl;
        c.beginPath();
        c.arc(0, 0, r * .85, 0, Math.PI * 2);
        c.fill();

        const ir = c.createRadialGradient(0, 0, r * .04, 0, 0, r * .46);
        ir.addColorStop(0,   "#fff4c2");
        ir.addColorStop(.35, "#ffc65a");
        ir.addColorStop(.75, "#c86aff");
        ir.addColorStop(1,   "#180630");

        c.fillStyle = ir;
        c.beginPath();
        c.arc(0, 0, r * .46, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#08010f";
        c.beginPath();
        c.ellipse(0, 0, r * .12, r * .38, 0, 0, Math.PI * 2);
        c.fill();

    }else if(kind === "guimauve"){

        const w = r * .85, h = r * .8;

        c.beginPath();

        if(c.roundRect){
            c.roundRect(-w, -h, w * 2, h * 2, r * .32);
        }else{
            c.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
        }

        const g = c.createLinearGradient(0, -h, 0, h);
        g.addColorStop(0,   "#fff2f7");
        g.addColorStop(.55, "#ffb3d4");
        g.addColorStop(1,   "#ff6fae");

        c.fillStyle = g;
        c.fill();

        c.lineWidth   = Math.max(1.6, r * .09);
        c.strokeStyle = "#ff6fae";
        c.stroke();

        c.fillStyle = "#4a1030";

        [-1, 1].forEach(sg => {
            c.beginPath();
            c.arc(sg * w * .36, -h * .06, r * .13, 0, Math.PI * 2);
            c.fill();
        });

        c.strokeStyle = "#4a1030";
        c.lineWidth   = Math.max(1.3, r * .07);
        c.lineCap     = "round";
        c.beginPath();
        c.arc(0, h * .18, r * .2, .25, Math.PI - .25);
        c.stroke();

    }else if(kind === "anguille"){

        /* un ruban qui ondule, la tete a droite */
        c.strokeStyle = "#1a6f96";
        c.lineWidth   = r * .52;
        c.lineCap     = "round";
        c.lineJoin    = "round";

        c.beginPath();

        for(let i = 0; i <= 10; i++){
            const kk = i / 10;
            c.lineTo(-r * 1.25 + kk * r * 2.3, Math.sin(kk * 6.2) * r * .42);
        }

        c.stroke();

        c.strokeStyle = "#3fe0ff";
        c.lineWidth   = r * .13;

        c.beginPath();

        for(let i = 0; i <= 10; i++){
            const kk = i / 10;
            c.lineTo(-r * 1.25 + kk * r * 2.3, Math.sin(kk * 6.2) * r * .42);
        }

        c.stroke();

        c.fillStyle = "#134f6c";
        c.beginPath();
        c.ellipse(r * 1.0, 0, r * .5, r * .34, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#ffe680";
        [-1, 1].forEach(sg => {
            c.beginPath();
            c.arc(r * .95, sg * r * .15, r * .09, 0, Math.PI * 2);
            c.fill();
        });

    }else if(kind === "lanterne"){

        c.fillStyle = "#0d3d55";
        c.beginPath();
        c.moveTo(-r * .7, 0);
        c.lineTo(-r * 1.3, -r * .55);
        c.lineTo(-r * 1.05, 0);
        c.lineTo(-r * 1.3,  r * .55);
        c.closePath();
        c.fill();

        c.fillStyle = "#2f7a9c";
        c.beginPath();
        c.ellipse(0, 0, r * .85, r * .74, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#02101a";
        c.beginPath();
        c.moveTo(r * .1, 0);
        c.lineTo(r * 1.15, -r * .42);
        c.lineTo(r * 1.1, 0);
        c.lineTo(r * 1.15,  r * .42);
        c.closePath();
        c.fill();

        c.fillStyle = "#eaf7ff";
        for(let i = 0; i < 4; i++){
            const kk = .2 + i * .25;
            const x  = r * .1 + (r * 1.15 - r * .1) * kk;
            const d  = r * .14;
            c.beginPath();
            c.moveTo(x - d * .5, -r * .42 * kk);
            c.lineTo(x + d * .5, -r * .42 * kk);
            c.lineTo(x,          -r * .42 * kk + d);
            c.closePath();
            c.fill();
            c.beginPath();
            c.moveTo(x - d * .5, r * .42 * kk);
            c.lineTo(x + d * .5, r * .42 * kk);
            c.lineTo(x,          r * .42 * kk - d);
            c.closePath();
            c.fill();
        }

        c.fillStyle = "#031722";
        c.beginPath();
        c.arc(0, -r * .3, r * .22, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#d8f8ff";
        c.beginPath();
        c.arc(r * .05, -r * .32, r * .11, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#0d3145";
        c.lineWidth   = r * .09;
        c.beginPath();
        c.moveTo(-r * .2, -r * .62);
        c.quadraticCurveTo(r * .2, -r * 1.25, r * .8, -r * 1.1);
        c.stroke();

        c.fillStyle = "#9ff0ff";
        c.beginPath();
        c.arc(r * .8, -r * 1.1, r * .2, 0, Math.PI * 2);
        c.fill();

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
            (kind === "slime" || kind === "crawler" || kind === "glouton" ||
             kind === "guimauve" || kind === "anguille" ||
             kind === "lanterne" || kind === "oeil") ? 0 : -.35,
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

    const vb = document.getElementById("vibToggle");

    if(vb){
        vb.classList.toggle("on", vibrateOn);
    }

}
