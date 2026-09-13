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

/*
Chacun a trois vies : on ne voit pas les autres joueurs sur
le terrain, on suit seulement leurs vies dans le bandeau du
haut. Trois vies laissent le temps de lire l'adversaire.
*/
const LAS_LIVES   = 3;

/* couleur de chaque joueur, dans l'ordre d'arrivee */
const LAS_COLORS = ["#4fd8ff", "#ffd24d", "#8dff6a", "#ff7ba8", "#c78cff"];

const laser = {
    ranked:false,
    queue:false,       /* on cherche des adversaires au hasard */      /* partie classee : des trophees sont en jeu */
    again:[],          /* qui a demande la revanche */
    againReady:0,      /* ce que l'hote annonce aux invites */
    againTotal:0,
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


/* =========================================================
   LES MEGA-RAYONS

   Trois barres enormes, chacune un tiers de l'arene, qui
   partent de la gauche ET de la droite en meme temps. Elles
   ne laissent que deux coutures : c'est la, et nulle part
   ailleurs, qu'il faut etre. Le preavis est long — c'est un
   moment qui se voit venir, pas un piege.
========================================================= */

const MEGA_BANDE = .26;   /* hauteur d'une barre couchee, en part d'arene */
const MEGA_JOINT = .11;   /* la couture entre deux barres couchees        */

/* les centres des trois barres couchees, et ceux des deux coutures */
const MEGA_POS   = [
    MEGA_BANDE * .5,
    .5,
    1 - MEGA_BANDE * .5
];

const MEGA_SAFE  = [
    MEGA_BANDE + MEGA_JOINT * .5,
    1 - MEGA_BANDE - MEGA_JOINT * .5
];

/*
La meme chose debout : QUATRE barres qui tombent du haut
vers le bas, et trois coutures. L'arene est plus large que
haute, donc quatre barres y tiennent sans etouffer le
passage.

   4 barres + 3 coutures = 1 :  4 x .205 + 3 x .06 = 1
*/
const MEGA_V_BANDE = .205;
const MEGA_V_JOINT = .06;

const MEGA_V_POS = [
    MEGA_V_BANDE * .5,
    MEGA_V_BANDE * 1.5 + MEGA_V_JOINT,
    MEGA_V_BANDE * 2.5 + MEGA_V_JOINT * 2,
    MEGA_V_BANDE * 3.5 + MEGA_V_JOINT * 3
];

const MEGA_V_SAFE = [
    MEGA_V_BANDE + MEGA_V_JOINT * .5,
    MEGA_V_BANDE * 2 + MEGA_V_JOINT * 1.5,
    MEGA_V_BANDE * 3 + MEGA_V_JOINT * 2.5
];


/* les reglages de la salve en cours, selon son sens */
function megaPlan(debout){

    return debout
        ? {pos:MEGA_V_POS, safe:MEGA_V_SAFE, bande:MEGA_V_BANDE, joint:MEGA_V_JOINT, dir:"v"}
        : {pos:MEGA_POS,   safe:MEGA_SAFE,   bande:MEGA_BANDE,   joint:MEGA_JOINT,   dir:"h"};

}


function lasMegaVivant(){
    return laser.beams.some(b => b.mega);
}


function lasSpawnMega(){

    /* le preavis reste long meme tard dans la partie */
    const warn = 1.7 - .45 * lasRamp();

    /* une fois couchees, une fois debout : jamais deux fois pareil */
    laser.megaV = !laser.megaV;

    const plan = megaPlan(laser.megaV);

    plan.pos.forEach((p, i) => {

        laser.beams.push({
            dir:plan.dir,
            mega:true,
            debout:laser.megaV,
            rang:i,
            pos:p,
            thick:plan.bande,
            warn:warn,
            fire:.45,
            t:0,
            dead:false
        });

    });

    /* la sirene : elle monte pendant tout le preavis */
    if(typeof sweep === "function"){
        sweep(260, 880, warn * .9, "sawtooth", .045);
        sweep(130, 440, warn * .9, "triangle", .02);
    }

    sound(440, .12, "square", .05);
    setTimeout(() => sound(440, .12, "square", .05), 300);
    setTimeout(() => sound(560, .16, "square", .05), 600);

    buzz([40, 60, 40, 60, 40]);

}


/*
Passage du repere relatif (0..1) au repere de CET ecran.
C'est le seul endroit qui connait les pixels.
*/
function lasGeom(b){

    const a = playArea();

    const aw = a.x1 - a.x0;
    const ah = a.y1 - a.y0;

    /*
    Un mega-rayon se mesure sur la HAUTEUR DE L'ARENE : c'est
    ce qui garantit que trois barres plus deux coutures font
    exactement l'ecran, sur n'importe quel telephone.
    */
    const thick = b.mega
        ? b.thick * (b.debout ? aw : ah)
        : b.thick * Math.min(W, H);

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

    /* ---- le mega-rayon, de temps en temps ---- */
    if(laser.megaIn === undefined){ laser.megaIn = 12; }

    laser.megaIn -= dt;

    if(laser.megaIn <= 0 && !lasMegaVivant()){

        lasSpawnMega();

        /* il revient un peu plus souvent au fil de la partie */
        laser.megaIn = 15 - 5 * lasRamp();

    }

    laser.nextWave -= dt;

    if(laser.nextWave <= 0){

        /*
        Pendant un mega-rayon, on ne fabrique plus de petits
        rayons : la couture doit rester libre, sinon il n'y a
        plus de solution.
        */
        if(laser.beams.length < LAS_MAX_BEAMS && !lasMegaVivant()){
            lasSpawnWave();
        }

        laser.nextWave = lasGap();

    }

    for(const b of laser.beams){

        const avant = b.t;

        b.t += dt;

        /* le mega part : un souffle, un grave, et l'ecran encaisse */
        if(b.mega && b.rang === 0 && avant < b.warn && b.t >= b.warn){

            if(typeof souffle === "function"){
                souffle(.55, .14, 90, 7000);
            }

            sound(58, .7, "sine", .10);

            if(typeof sweep === "function"){
                sweep(1800, 300, .55, "sawtooth", .05);
            }

            if(typeof foretShake !== "undefined"){
                foretShake = Math.max(foretShake, .7);
            }

            buzz([90, 50, 140]);

        }

        if(b.t > b.warn + b.fire + .35){
            b.dead = true;
        }

    }

    laser.beams = laser.beams.filter(b => !b.dead);

}


function lasBeamLethal(b){
    return b.t >= b.warn && b.t < b.warn + b.fire;
}


/*
Un mega-rayon se dessine en trois temps : l'annonce (la
bande s'assombrit, les canons chauffent sur les deux bords,
les coutures s'allument en vert), le tir (deux faisceaux qui
se rejoignent au centre), puis la braise.
*/
function drawMegaBeam(b, g, lethal, after){

    const a = playArea();

    const aw = a.x1 - a.x0;
    const ah = a.y1 - a.y0;

    const ep = g.thick;

    /*
    On travaille toujours dans le meme repere : x le long de
    la barre, y en travers. Pour les barres debout, il suffit
    de faire pivoter le repere d'un quart de tour — le reste
    du dessin ne change pas une ligne.
    */
    const lg = b.debout ? ah : aw;

    ctx.save();

    if(b.debout){
        ctx.translate(g.pos, a.y0);
        ctx.rotate(Math.PI / 2);
    }else{
        ctx.translate(a.x0, g.pos);
    }

    const plan = megaPlan(b.debout);

    if(!lethal && !after){

        const k = b.t / b.warn;

        /* la bande condamnee */
        ctx.globalAlpha = .12 + k * .22;
        ctx.fillStyle   = "#ff4f6e";
        ctx.fillRect(0, -ep / 2, lg, ep);

        /* ses deux bords, qui battent de plus en plus vite */
        const puls = .4 + .6 * Math.abs(Math.sin(k * Math.PI * (3 + k * 7)));

        ctx.globalAlpha = puls;
        ctx.fillStyle   = "#ff4f6e";
        ctx.fillRect(0, -ep / 2 - 2 * unit, lg, 3 * unit);
        ctx.fillRect(0, ep / 2 - unit,      lg, 3 * unit);

        /* les canons, aux deux extremites */
        [0, 1].forEach(bout => {

            const cx = bout * lg;
            const sg = bout ? -1 : 1;

            ctx.globalAlpha = 1;

            const cg = ctx.createLinearGradient(cx, 0, cx + sg * 26 * unit, 0);
            cg.addColorStop(0, "#ff4f6e");
            cg.addColorStop(1, "rgba(255,79,110,0)");

            ctx.fillStyle = cg;
            ctx.fillRect(bout ? cx - 26 * unit : cx, -ep / 2, 26 * unit, ep);

            /* le coeur du canon chauffe */
            ctx.globalAlpha = .35 + k * .65;
            ctx.fillStyle   = "#fff0c0";
            ctx.shadowBlur  = 26 * unit * k;
            ctx.shadowColor = "#ffb347";

            ctx.beginPath();
            ctx.ellipse(cx, 0, 9 * unit * (.4 + k), ep * .30 * (.4 + k), 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

        });

        /* les coutures : les seuls endroits ou se mettre */
        if(b.rang === 0){

            const plein = b.debout ? aw : ah;
            const dep   = b.debout ? a.x0 : a.y0;

            plan.safe.forEach(p => {

                /* position de la couture, ramenee dans notre repere */
                const abs = dep + p * plein;
                const sy  = b.debout ? (g.pos - abs) : (abs - g.pos);
                const se  = plan.joint * plein;

                ctx.globalAlpha = .16 + Math.abs(Math.sin(b.t * 6)) * .16;
                ctx.fillStyle   = "#61ff83";
                ctx.fillRect(0, sy - se / 2, lg, se);

                ctx.globalAlpha = .55;
                ctx.strokeStyle = "#61ff83";
                ctx.lineWidth   = 2 * unit;
                ctx.setLineDash([10 * unit, 8 * unit]);

                ctx.beginPath();
                ctx.moveTo(0,  sy - se / 2);
                ctx.lineTo(lg, sy - se / 2);
                ctx.moveTo(0,  sy + se / 2);
                ctx.lineTo(lg, sy + se / 2);
                ctx.stroke();

                ctx.setLineDash([]);

            });

        }

    }else if(lethal){

        const k = (b.t - b.warn) / b.fire;

        /*
        Les deux faisceaux partent des extremites et se
        rejoignent : en 90 ms l'arene est barree.
        */
        const av = Math.min(1, k / .2);

        const grad = ctx.createLinearGradient(0, -ep / 2, 0, ep / 2);
        grad.addColorStop(0,   "rgba(255,90,120,0)");
        grad.addColorStop(.18, "rgba(255,120,150,.9)");
        grad.addColorStop(.5,  "rgba(255,255,255,1)");
        grad.addColorStop(.82, "rgba(255,120,150,.9)");
        grad.addColorStop(1,   "rgba(255,90,120,0)");

        ctx.globalAlpha = 1 - k * .2;
        ctx.fillStyle   = grad;

        ctx.fillRect(0, -ep / 2, lg * .5 * av, ep);
        ctx.fillRect(lg - lg * .5 * av, -ep / 2, lg * .5 * av, ep);

        /* le halo reste dans la bande : la couture doit rester noire */
        ctx.globalAlpha = (1 - k) * .34;
        ctx.fillStyle   = "#ff4f6e";
        ctx.fillRect(0, -ep * .60, lg, ep * 1.20);

        /* la ligne blanche au coeur */
        ctx.globalAlpha = (1 - k) * .9;
        ctx.fillStyle   = "#ffffff";
        ctx.fillRect(0, -ep * .06, lg, ep * .12);

    }else{

        const k = (b.t - b.warn - b.fire) / .35;

        ctx.globalAlpha = (1 - k) * .45;
        ctx.fillStyle   = "#ff8a6a";
        ctx.fillRect(0, -ep / 5, lg, ep * .4);

    }

    ctx.restore();

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

        /* --- les mega-rayons ont leur propre mise en scene --- */
        if(b.mega){
            drawMegaBeam(b, g, lethal, after);
            continue;
        }

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

/* =========================================================
   LES AUTRES JOUEURS SUR LA MEME ARENE

   Tout le monde joue le meme terrain : on dessine donc les
   adversaires avec LEUR skin, a leur vraie place.

   Les positions n'arrivent que 15 fois par seconde. Si on
   les dessinait telles quelles, les autres avanceraient par
   petits sauts. On garde donc une position AFFICHEE qui
   court derriere la position RECUE : le mouvement redevient
   lisse sans rien changer au reseau.
========================================================= */

/*
Les positions n'arrivent que 20 fois par seconde. Dessinees
telles quelles, les autres avanceraient par a-coups.

On garde donc les DEUX dernieres positions recues avec leur
heure d'arrivee, et on dessine le joueur a un instant place
volontairement 120 ms dans le passe : cet instant tombe
toujours ENTRE deux positions connues, et on peut glisser de
l'une a l'autre. C'est la meme methode que les vrais jeux en
ligne — on echange un retard imperceptible contre un
mouvement parfaitement continu.
*/

const LAS_LAG = 150;   /* ms de retard : le prix de la fluidite */
const LAS_BUF = 8;
const LAS_FILTER = 1e-5;   /* plus petit = plus reactif */     /* positions gardees : elles doivent couvrir LAS_LAG */


/*
Une position vient d'arriver.

Les paquets partent a intervalle regulier, mais ils
n'ARRIVENT pas regulierement : le reseau les groupe puis
fait une pause. Si on datait chaque position a son heure
d'arrivee, on rejouerait ces irregularites — le slime
avancerait vite, puis lentement, au rythme du reseau.

On leur donne donc une horloge REGULIERE, calee sur
l'intervalle moyen d'envoi, et qu'on ramene tout doucement
vers l'heure reelle pour ne jamais deriver. C'est ce que
font les lecteurs video avec le son.
*/
function lasNote(pl, x, y){

    if(!pl || typeof x !== "number" || typeof y !== "number"){
        return;
    }

    const now = (typeof performance !== "undefined" && performance.now)
        ? performance.now()
        : Date.now();

    pl.x = x;
    pl.y = y;

    if(!pl.buf){
        pl.buf = [];
    }

    /* deux fois la meme position : inutile de l'empiler */
    const last = pl.buf[pl.buf.length - 1];

    if(last && last.x === x && last.y === y){
        return;
    }

    /* l'intervalle moyen entre deux arrivees */
    if(pl.seen){

        const gap = now - pl.seen;

        pl.step = pl.step
            ? pl.step * .88 + Math.max(8, Math.min(400, gap)) * .12
            : Math.max(8, Math.min(400, gap));

    }

    pl.seen = now;

pl.buf.push({x:x, y:y, t:now});

    while(pl.buf.length > LAS_BUF){
        pl.buf.shift();
    }

}


/*
Catmull-Rom : la courbe passe EXACTEMENT par les points
recus, mais elle arrive et repart dans la meme direction de
chaque cote. C'est ce qui enleve les petits angles qu'une
ligne droite laisse a chaque position recue — le slime ne
"tourne" plus par a-coups, il decrit une vraie trajectoire.
*/
function lasSpline(p0, p1, p2, p3, u, key){

    const a = p0[key];
    const b = p1[key];
    const c = p2[key];
    const d = p3[key];

    const u2 = u * u;
    const u3 = u2 * u;

    return .5 * (
        (2 * b) +
        (-a + c) * u +
        (2 * a - 5 * b + 4 * c - d) * u2 +
        (-a + 3 * b - 3 * c + d) * u3
    );

}


function lasSmooth(dt){

    const now = (typeof performance !== "undefined" && performance.now)
        ? performance.now()
        : Date.now();

    laser.players.forEach((pl, i) => {

        if(i === laser.me || !pl){
            return;
        }

        if(typeof pl.dx !== "number"){
            pl.dx = pl.x || 0;
            pl.dy = pl.y || 0;
        }

        const px = pl.dx;
        const py = pl.dy;

        const buf = pl.buf;

        /* pas encore assez de points : on rattrape doucement */
        if(!buf || buf.length < 2){

            const k = 1 - Math.pow(.0008, dt);

            pl.dx += ((pl.x || 0) - pl.dx) * k;
            pl.dy += ((pl.y || 0) - pl.dy) * k;

            pl.play = 0;

        }else{

            /*
            La tete de lecture. Elle avance a la vitesse du
            temps qui passe — c'est ce qui donne un mouvement
            regulier — et elle se recale en douceur pour
            rester LAS_LAG derriere la derniere position
            connue. Aucun a-coup, aucune derive.
            */
            const newest = buf[buf.length - 1].t;
            const target = newest - LAS_LAG;

            pl.play = (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) - LAS_LAG;

            const when = pl.play;

            /* les deux positions qui encadrent l'instant vise */
            let n = 1;

            for(let k = 1; k < buf.length; k++){
                n = k;
                if(buf[k].t >= when){ break; }
            }

            const p1 = buf[n - 1];
            const p2 = buf[n];

            /* les voisins, pour donner sa courbure a la trajectoire */
            const p0 = buf[n - 2] || p1;
            const p3 = buf[n + 1] || p2;

            const span = Math.max(1, p2.t - p1.t);

            const u = Math.max(0, Math.min(1.4, (when - p1.t) / span));

            let tx, ty;

            if(u <= 1){

                tx = lasSpline(p0, p1, p2, p3, u, "x");
                ty = lasSpline(p0, p1, p2, p3, u, "y");

            }else{

                /* le reseau a hoquete : on prolonge tout droit, sans exces */
                tx = p2.x + (p2.x - p1.x) * (u - 1);
                ty = p2.y + (p2.y - p1.y) * (u - 1);

            }

            /*
            Dernier filtre. Les positions n'arrivent pas a
            intervalle parfaitement regulier, et la courbe en
            garde un reste de tremblement. On glisse donc vers
            elle au lieu de s'y coller : quelques millisecondes
            de plus, et le mouvement devient net.
            */
            const k = 1 - Math.pow(LAS_FILTER, dt);

            pl.dx += (tx - pl.dx) * k;
            pl.dy += (ty - pl.dy) * k;

            /* ecart enorme : on se teleporte plutot que de traverser l'arene */
            if(Math.abs(pl.x - pl.dx) > .35 || Math.abs(pl.y - pl.dy) > .35){
                pl.dx = pl.x;
                pl.dy = pl.y;
                pl.buf = [{x:pl.x, y:pl.y, t:now}];
            }

        }

        /*
        Sa vitesse a l'ecran : elle sert a le faire pencher et
        s'etirer comme le fait ton propre slime. Un corps qui
        reagit a son mouvement parait bien plus fluide qu'un
        corps qui glisse tout raide.
        */
        if(dt > 0){

            const vx = (pl.dx - px) / dt;
            const vy = (pl.dy - py) / dt;

            const v = Math.sqrt(vx * vx + vy * vy);

            if(v > .0001){
                pl.ang = Math.atan2(vy, vx);
            }

            const want = Math.max(0, Math.min(1, v / .55));

            /* on lisse la vitesse elle-meme : pas de sursaut d'etirement */
            pl.spd = (typeof pl.spd === "number" ? pl.spd : 0) +
                     (want - (typeof pl.spd === "number" ? pl.spd : 0)) * Math.min(1, dt * 9);

            pl.wave = (pl.wave || 0) + dt * (2.2 + pl.spd * 7);

        }

    });

}


function drawLaserPlayers(){

    laser.players.forEach((pl, i) => {

        if(i === laser.me || !pl){
            return;
        }

        /* les positions arrivent en 0..1 : on les ramene en pixels */
        const q = lasPix(
            typeof pl.dx === "number" ? pl.dx : pl.x,
            typeof pl.dy === "number" ? pl.dy : pl.y
        );

        if(!isFinite(q.x) || !isFinite(q.y)){
            return;
        }

        const r = 15 * unit;

        /* un joueur elimine reste visible, en fantome */
        const gone = !pl.alive;

        ctx.save();
        ctx.globalAlpha = gone ? .22 : 1;

        /* l'ombre au sol : elle ancre le slime sur l'arene */
        ctx.globalAlpha *= .5;
        ctx.fillStyle = "#000000";

        ctx.beginPath();
        ctx.ellipse(
            q.x - Math.cos(pl.ang || 0) * r * (pl.spd || 0) * .18,
            q.y + r * .92,
            r * (.78 + (pl.spd || 0) * .2),
            r * (.26 - (pl.spd || 0) * .05),
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.globalAlpha = gone ? .22 : 1;

        /* le cerceau de couleur : c'est ce qui dit QUI c'est */
        ctx.strokeStyle = pl.color || "#ffffff";
        ctx.lineWidth   = 2.4 * unit;
        ctx.shadowColor = pl.color || "#ffffff";
        ctx.shadowBlur  = 12;

        ctx.beginPath();
        ctx.ellipse(q.x, q.y + r * .9, r * .82, r * .3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        /* son skin a lui, avec le petit balancement de la course */
        const skin = SKINS.find(sk => sk.id === pl.skin) || SKINS[0];

        ctx.translate(q.x, q.y);

        paintSkinSlime(ctx, skin, r, gameTime + i * .7, false, {
            blink:1,
            speed:pl.spd  || 0,
            angle:pl.ang  || 0,
            wave: pl.wave || 0,
            shear:Math.cos(pl.ang || 0) * (pl.spd || 0) * .16
        });

        ctx.restore();

        /* son pseudo, au-dessus */
        ctx.save();

        ctx.globalAlpha = gone ? .3 : .95;
        ctx.font        = "bold " + Math.round(10 * unit) + "px Arial";
        ctx.textAlign   = "center";

        const label = (pl.name || "?") + (gone ? " ✕" : "");

        /* un liseré noir : lisible sur n'importe quel fond */
        ctx.lineWidth   = 3 * unit;
        ctx.strokeStyle = "rgba(0,0,0,.75)";
        ctx.strokeText(label, q.x, q.y - r * 2.05);

        ctx.fillStyle = pl.color || "#ffffff";
        ctx.fillText(label, q.x, q.y - r * 2.05);

        /* ses coeurs, juste sous le pseudo */
        if(!gone && pl.lives > 0){

            ctx.font      = Math.round(8 * unit) + "px Arial";
            ctx.fillStyle = "#ff6b8a";
            ctx.fillText("♥".repeat(Math.min(5, pl.lives)), q.x, q.y - r * 2.05 + 9 * unit);

        }

        ctx.restore();

    });

}


/* =========================================================
   LE TABLEAU DES VIES

   Un bandeau de pastilles en haut : une par joueur, avec sa
   couleur et ses coeurs restants. C'est la seule chose que
   l'on sait des autres pendant la partie.
========================================================= */

function lasBoard(){

    const box = document.getElementById("lasBoard");

    if(!box){
        return;
    }

    if(!laser.active){
        box.style.display = "none";
        return;
    }

    box.style.display = "flex";

    /* on ne reconstruit qu'au besoin : c'est appele a chaque image */
    const sig = laser.players.map(p => p.lives + (p.alive ? "v" : "m")).join("|");

    if(box.dataset.sig === sig){
        return;
    }

    box.dataset.sig = sig;
    box.innerHTML   = "";

    laser.players.forEach((pl, i) => {

        const tag = document.createElement("div");

        tag.className = "lasTag" + (pl.alive ? "" : " out");

        const dot = document.createElement("span");
        dot.className = "lasDot";
        dot.style.background = pl.color;
        dot.style.color      = pl.color;

        const nm = document.createElement("b");
        nm.textContent = i === laser.me ? T("las.you") : pl.name;

        const hp = document.createElement("span");
        hp.className = "lasHp";

        hp.textContent = pl.alive
            ? "♥".repeat(Math.max(0, pl.lives))
            : "✕";

        tag.appendChild(dot);
        tag.appendChild(nm);
        tag.appendChild(hp);

        box.appendChild(tag);

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


/*
La liste partagee doit porter la POSITION, sinon les autres
joueurs restent cloues en haut a gauche de l'arene : c'est
exactement ce qui les rendait invisibles.
*/
function lasRoster(){

    return laser.players.map(p => ({
        name:p.name, skin:p.skin, color:p.color,
        x:p.x || 0, y:p.y || 0,
        alive:p.alive, lives:p.lives, time:p.time
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

    lasPaintModes();

    /* en mode classe on ne montre ni code, ni bouton LANCER */
    if(laser.queue){

        document.getElementById("lasStart").style.display = "none";

        if(laser.host && laser.players.length >= 2){
            queueCountdown();
        }

        queuePaint();

        return;

    }

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
                /* remplace des que l'invite annonce son pseudo */
                skin:"cyber",
                color:LAS_COLORS[laser.players.length % LAS_COLORS.length],
                x:0, y:0, alive:true, lives:LAS_LIVES, time:0
            });

            lasSend({t:"room", players:lasRoster(), ranked:laser.ranked});
            conn.send({t:"you", idx:conn.__idx});

            lasRefreshRoom();

            sound(700, .12, "triangle", .05);

        }else{

            conn.send({t:"hello", skin:currentSkin, name:playerName()});
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

        /*
        Dans la file d'attente, un joueur qui s'en va doit
        vraiment disparaitre de la liste : sinon le compte a
        rebours continuerait tout seul, sans adversaire.
        */
        if(laser.queue && !laser.active){

            const kept = [laser.players[0]];

            laser.conns.forEach(c => {

                if(c && c.__idx != null && laser.players[c.__idx]){
                    kept.push(laser.players[c.__idx]);
                    c.__idx = kept.length - 1;
                }

            });

            laser.players = kept;

            if(laser.players.length < 2){
                clearQueueTimer();
                lasSend({t:"tick", n:-1});
            }

        }

        lasSend({t:"room", players:lasRoster(), ranked:laser.ranked});
        lasRefreshRoom();

        /*
        Sans ca, un joueur qui quitte apres la partie bloquait
        la revanche : on attendait un vote qui ne viendrait
        jamais. On recompte des qu'il s'en va.
        */
        if(!laser.active && document.getElementById("lasResult").style.display === "flex"){
            lasAgainCheck();
        }

    }else{

        lasStatus(T("las.hostGone"));

        if(laser.active){
            lasFinish();
            return;
        }

        /* toujours dans la file : on repart chercher quelqu'un */
        if(laser.queue){
            queueSay("ON CHERCHE ENCORE…", "Ton adversaire est parti.", true);
            setTimeout(function(){ if(laser.queue){ lasFindMatch(); } }, 900);
        }

    }

}


function lasMessage(d, conn, isHost){

    if(!d || !d.t){
        return;
    }

    if(isHost){

        if(d.t === "again"){

            if(conn.__idx != null){
                laser.again[conn.__idx] = true;
            }

            lasAgainCheck();

            return;
        }

        if(d.t === "hello"){

            if(laser.players[conn.__idx]){

                laser.players[conn.__idx].skin = d.skin || "cyber";

                if(d.name){
                    laser.players[conn.__idx].name = String(d.name).slice(0, 12);
                }

            }

            lasSend({t:"room", players:lasRoster()});
            lasRefreshRoom();

            return;
        }

        if(d.t === "p"){

            const p = laser.players[conn.__idx];

            if(p){
                lasNote(p, d.x, d.y);
                p.alive = d.a;
                p.lives = d.hp;
                p.time  = d.tm;
            }

            return;
        }

        if(d.t === "out"){

            const p = laser.players[conn.__idx];

            if(p){
                p.lives = d.hp;
                p.alive = d.hp > 0;
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

        /*
        On redit qui on est maintenant que l'hote nous a donne
        une place : son premier "bonjour" a pu arriver avant
        qu'il ait fini de nous inscrire.
        */
        lasSend({t:"hello", skin:currentSkin, name:playerName()});

        return;
    }

    if(d.t === "full"){
        lasStatus(T("las.full"));
        return;
    }

    if(d.t === "room"){

        laser.players = d.players;

        if(typeof d.ranked === "boolean"){
            laser.ranked = d.ranked;
        }

        lasRefreshRoom();

        return;
    }

    if(d.t === "tick"){

        queueLeft = d.n;

        if(d.n < 0){
            queueLeft = 0;
        }

        queuePaint();

        return;
    }

    if(d.t === "againState"){

        laser.againReady = d.n     || 0;
        laser.againTotal = d.total || laser.players.length;

        lasAgainPaint();

        return;
    }

    if(d.t === "go"){

        laser.seed = d.seed;

        if(typeof d.ranked === "boolean"){
            laser.ranked = d.ranked;
        }

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

            lasNote(laser.players[i], p.x, p.y);

            laser.players[i].alive = p.alive;
            laser.players[i].lives = p.lives;
            laser.players[i].time  = p.time;

            /* le skin et le pseudo peuvent arriver en cours de route */
            if(p.skin){  laser.players[i].skin  = p.skin;  }
            if(p.name){  laser.players[i].name  = p.name;  }
            if(p.color){ laser.players[i].color = p.color; }

        });

        return;
    }

    if(d.t === "end"){

        /*
        La liste de l'hote ecrasait la notre — y compris NOTRE
        temps, qui vaut 0 chez lui tant qu'on n'a pas ete
        touche. On garde le plus grand des deux.
        */
        const mien = laser.players[laser.me] ? (laser.players[laser.me].time || 0) : 0;

        laser.players = d.players;

        if(laser.players[laser.me]){
            laser.players[laser.me].time =
                Math.max(laser.players[laser.me].time || 0, mien);
        }

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
    laser.queue  = false;
    laser.again  = [];

    clearQueueTimer();
    laser.againReady = 0;
    laser.beams  = [];
    laser.wave   = 0;
    laser.time   = 0;
    laser.send   = 0;
    laser.nextWave = 1.6;
    laser.megaIn   = 12;
    laser.megaV    = true;   /* la premiere salve sera couchee */

    lasSeed(laser.seed);

    /*
    La competition ne se joue dans AUCUN monde : ni foret, ni
    ruines, donc ni guepes ni sentinelles. On bascule sur la
    zone "arene" AVANT de lancer la partie, sinon reset()
    repeuplerait la foret.
    */
    zone = "arene";

    startGame();

    zone = "arene";

    mimics   = [];
    coins    = [];
    orbs     = [];
    hearts   = [];
    solids   = [];
    archers  = [];
    trace    = [];

    /* rien de la foret ni des ruines ne doit trainer */
    if(typeof clearForet  === "function"){ clearForet();  }
    if(typeof clearRuines === "function"){ clearRuines(); }

    guepes    = [];
    lucioles  = [];
    blobs     = [];
    slimes    = [];
    balls     = [];
    crawlers  = [];
    gloutons  = [];
    guimauves = [];
    anguilles = [];
    lanternes = [];
    bulles    = [];
    puddles   = [];
    logs      = [];
    candies   = [];
    portal    = null;

    level      = 1;
    levelTimer = 0;

    lives = 1;

    /* chacun demarre a une place fixe, la meme sur tous les ecrans */
    laser.players.forEach((p, i) => {
        p.alive = true;
        p.lives = LAS_LIVES;
        p.time  = 0;
        p.x = .18 + i * .16;
        p.y = .5;

        /* la position affichee part au meme endroit : pas de glissade au depart */
        p.dx   = p.x;
        p.dy   = p.y;
        p.buf   = null;
        p.seen  = 0;
        p.step  = 0;
        p.clock = 0;
        p.play  = 0;
        p.spd   = 0;
        p.ang  = 0;
        p.wave = 0;
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


/*
Les trophees ne bougent qu'en partie CLASSEE. La place au
classement decide de tout : le premier monte, le dernier
descend, et au milieu on bouge peu.
*/
function lasTrophies(order, won){

    const box = document.getElementById("lasTrophy");

    if(!box){
        return;
    }

    if(!laser.ranked){
        box.style.display = "none";
        return;
    }

    const total = order.length;

    let place = order.findIndex(x => x.i === laser.me) + 1;

    if(place < 1){
        box.style.display = "none";
        return;
    }

    /* on a gagne : on est premier, quoi qu'en dise le tri */
    if(won){ place = 1; }

    const d = trophyDelta(place, total);

    rank.tr    = Math.max(0, rank.tr + d);
    rank.best  = Math.max(rank.best, rank.tr);
    rank.games = rank.games + 1;

    if(won){
        rank.wins = rank.wins + 1;
    }

    saveRank();
    paintRankPill();

    const r = rankOf(rank.tr);

    box.style.display = "block";
    box.className     = "troDelta " + (d >= 0 ? "up" : "down");

    box.textContent = TF("rank.delta", {
        d: (d >= 0 ? "+" : "") + d,
        p: place,
        t: total,
        tr: rank.tr,
        r: T(r.k)
    });

}


/* le salon : amical ou classe */
function lasPaintModes(){

    const fun = document.getElementById("lasModeFun");
    const rkd = document.getElementById("lasModeRanked");

    if(!fun || !rkd){
        return;
    }

    fun.classList.toggle("on", !laser.ranked);
    rkd.classList.toggle("on",  laser.ranked);

    /* une fois dans un salon ou dans la file, on ne change plus */
    const locked = laser.queue || laser.players.length > 0;

    fun.disabled = locked;
    rkd.disabled = locked;

    fun.style.opacity = locked && laser.ranked  ? ".45" : "1";
    rkd.style.opacity = locked && !laser.ranked ? ".45" : "1";

    /* les deux moities de l'ecran : le code d'un cote, la file de l'autre */
    const funBox = document.getElementById("lasFunBox");
    const rkdBox = document.getElementById("lasRankBox");
    const joinBox = document.getElementById("lasJoinBox");

    if(funBox){  funBox.style.display  = laser.ranked ? "none"  : "block"; }
    if(rkdBox){  rkdBox.style.display  = laser.ranked ? "block" : "none";  }

    if(joinBox && !laser.host && !laser.queue){
        joinBox.style.display = laser.ranked ? "none" : "block";
    }

    if(laser.ranked){
        document.getElementById("lasHostBox").style.display = "none";
        if(joinBox){ joinBox.style.display = "none"; }
    }

}


function lasFinish(winner){

    laser.active = false;

    lasHudLabels(false);
    lasBoard();
    playing      = false;

    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("skillBar").style.display = "none";
    document.getElementById("gameUI").style.display   = "none";

    const won = winner === laser.me;

    const v = document.getElementById("lasVerdict");

    v.textContent = won ? T("duel.victory") : T("duel.defeat");
    v.style.color = won ? "#61ff83" : "#ff6b8a";

    /*
    Classement. Le tri se faisait sur le seul "temps tenu" —
    or le temps du vainqueur peut valoir 0 : il n'a jamais
    ete touche, donc personne n'a jamais envoye son temps.
    Il se retrouvait DERNIER et perdait des trophees alors
    qu'il venait de gagner. Le vainqueur passe maintenant
    devant, puis les survivants, et le temps ne sert plus
    qu'a departager.
    */
    const order = laser.players
        .map((p, i) => ({p:p, i:i}))
        .sort((a, b) =>
            (b.i === winner ? 1 : 0) - (a.i === winner ? 1 : 0) ||
            (b.p.alive ? 1 : 0) - (a.p.alive ? 1 : 0) ||
            (b.p.time || 0) - (a.p.time || 0)
        );

    lasPaintList("lasRank", order.map(x => x.p));

    /* en partie CLASSEE, la place decide des trophees */
    lasTrophies(order, won);

    document.getElementById("lasResult").style.display = "flex";

    /*
    En AMICAL on peut se relancer entre soi. En CLASSÉ, non :
    chaque partie se joue contre des adversaires tires au
    sort, donc on repasse par la recherche.
    */
    laser.again = [];

    const again  = document.getElementById("lasAgain");
    const search = document.getElementById("lasSearchAgain");
    const state  = document.getElementById("lasAgainState");

    if(laser.ranked){

        again.style.display  = "none";
        search.style.display = "block";

        if(state){
            state.textContent = "En classé, on ne rejoue pas la même partie : relance une recherche.";
        }

    }else{

        again.style.display  = "block";
        search.style.display = "none";

        lasAgainPaint();

    }

    sound(won ? 720 : 220, .2, "sine", .05);

}


/* appele depuis la boucle de jeu */
function lasUpdate(dt){

    if(!laser.active){
        return;
    }

    laser.time += dt;

    lasSmooth(dt);
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

                    me.lives = Math.max(0, me.lives - 1);
                    me.time  = laser.time;

                    burst(player.x, player.y, 26, "#ff4f6e");
                    sound(160, .3, "sawtooth", .06);

                    if(me.lives <= 0){

                        me.alive = false;

                        pickupMessage("💥 " + T("las.eliminated"), "#ff466e");

                    }else{

                        /* on repart avec un court repit */
                        player.invincible = 1.6;

                        pickupMessage("💔 " + me.lives, "#ff466e");

                    }

                    if(laser.host){
                        lasSend({t:"all", players:lasRoster()});
                        lasCheckEnd();
                    }else{
                        lasSend({t:"out", hp:me.lives, tm:laser.time});
                    }

                    break;

                }

            }

        }

    }

    /* on partage sa position 30 fois par seconde */
    laser.send -= dt;

    if(laser.send <= 0){

        laser.send = .033;

        const n = lasNorm(player.x, player.y);

        if(laser.host){
            laser.players[laser.me].x = n.x;
            laser.players[laser.me].y = n.y;
            lasSend({t:"all", players:lasRoster()});
        }else if(me){
            lasSend({t:"p", x:n.x, y:n.y, a:me.alive, hp:me.lives, tm:laser.time});
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

    laser.queue   = false;
    laser.host    = false;
    laser.players = [];

    clearQueueTimer();

    document.getElementById("lasHostBox").style.display = "none";
    document.getElementById("lasRoom").style.display    = "none";
    document.getElementById("lasJoinBox").style.display = "block";
    document.getElementById("lasHost").style.display    = "block";

    queueButtons(false);
    queueSay("RECHERCHE D'ADVERSAIRES", "La partie démarre dès qu'il y a 2 joueurs.", false);

    lasPaintModes();

    lasStatus("");

}


function closeLaser(){

    laser.queue = false;

    clearQueueTimer();
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
        name:playerName(),
        skin:currentSkin,
        color:LAS_COLORS[0],
        x:0, y:0, alive:true, lives:LAS_LIVES, time:0
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


/* =========================================================
   LE MODE CLASSE : PAS DE CODE, UNE FILE D'ATTENTE

   Il n'y a pas de serveur : le salon public EST un joueur.
   Le premier arrive prend l'adresse publique et devient
   l'hote ; les suivants tombent sur "adresse deja prise"
   et se branchent sur lui. Des qu'on est deux, un compte a
   rebours part, et les retardataires peuvent encore entrer.
========================================================= */

const RANK_ROOM  = "mimicrank-a1";   /* l'adresse du salon public */
const QUEUE_GO   = 30;               /* secondes avant le depart  */

let queueTimer = null;
let queueLeft  = 0;


function queueSay(title, sub, dots){

    const t = document.getElementById("queueTitle");
    const u = document.getElementById("queueSub");
    const d = document.getElementById("queueDots");

    if(t){ t.textContent = title; }
    if(u){ u.textContent = sub;   }

    if(d){
        d.className   = "queueDots" + (dots ? " on" : "");
        d.innerHTML   = dots ? "<span>●</span><span>●</span><span>●</span>" : "🏆";
    }

}


function queueButtons(searching){

    const find  = document.getElementById("lasFind");
    const leave = document.getElementById("lasLeave");

    if(find){  find.style.display  = searching ? "none"  : "block"; }
    if(leave){ leave.style.display = searching ? "block" : "none";  }

}


function clearQueueTimer(){

    if(queueTimer){
        clearInterval(queueTimer);
        queueTimer = null;
    }

    queueLeft = 0;

}


/* le compte a rebours, tenu par l'hote */
function queueCountdown(){

    if(!laser.host || queueTimer){
        return;
    }

    queueLeft = QUEUE_GO;

    lasSend({t:"tick", n:queueLeft});

    queueTimer = setInterval(function(){

        queueLeft--;

        /* quelqu'un est parti : on n'est plus assez, on annule */
        if(laser.players.length < 2){
            clearQueueTimer();
            lasSend({t:"tick", n:-1});
            lasRefreshRoom();
            return;
        }

        lasSend({t:"tick", n:queueLeft});
        lasRefreshRoom();

        if(queueLeft <= 0){

            clearQueueTimer();

            laser.seed = Math.floor(Math.random() * 1e9) + 1;

            lasSend({t:"go", seed:laser.seed, ranked:true});

            lasBegin();

        }

    }, 1000);

}


/* l'affichage de la file, chez l'hote comme chez les invites */
function queuePaint(){

    const n = laser.players.length;

    if(queueLeft > 0){

        queueSay(
            "ÇA COMMENCE DANS " + queueLeft + "…",
            n + " joueur" + (n > 1 ? "s" : "") + " dans l'arène",
            false
        );

        return;

    }

    if(n < 2){

        queueSay(
            "RECHERCHE D'ADVERSAIRES",
            "La partie démarre dès qu'un autre joueur arrive.",
            true
        );

        return;

    }

    queueSay("ADVERSAIRE TROUVÉ", n + " joueurs prêts", false);

}


function lasFindMatch(){

    if(typeof Peer === "undefined"){
        lasStatus(T("las.noLib"));
        return;
    }

    lasCleanup();
    clearQueueTimer();

    /* le salon public doit etre sur le meme serveur pour tous */
    duelServer = 0;

    laser.ranked = true;
    laser.queue  = true;
    laser.host   = false;
    laser.me     = 0;

    queueButtons(true);
    queueSay("RECHERCHE D'ADVERSAIRES", "Connexion…", true);
    lasStatus("");

    /* 1) on tente de prendre l'adresse publique : on serait l'hote */
    laser.peer = newPeer(RANK_ROOM);

    if(!laser.peer){
        return;
    }

    laser.peer.on("open", () => {

        laser.host = true;
        laser.me   = 0;

        laser.players = [{
            name:playerName(),
            skin:currentSkin,
            color:LAS_COLORS[0],
            x:0, y:0, alive:true, lives:LAS_LIVES, time:0
        }];

        lasRefreshRoom();

    });

    laser.peer.on("connection", conn => lasBind(conn, true));

    laser.peer.on("error", err => {

        const type = (err && err.type) || "?";

        /* l'adresse est prise : quelqu'un attend deja, on le rejoint */
        if(type === "unavailable-id"){
            queueJoinHost();
            return;
        }

        if(!laser.queue){
            return;
        }

        lasStatus("❌ " + type);
        queueSay("CONNEXION IMPOSSIBLE", "Vérifie ta connexion, puis réessaie.", false);
        queueButtons(false);

    });

}


/* on se branche sur le joueur qui tient deja le salon public */
function queueJoinHost(){

    if(laser.peer){
        try{ laser.peer.destroy(); }catch(e){}
        laser.peer = null;
    }

    laser.host = false;

    queueSay("ADVERSAIRE TROUVÉ", "On te place dans l'arène…", true);

    laser.peer = newPeer(null);

    if(!laser.peer){
        return;
    }

    laser.peer.on("open", () => {

        const conn = laser.peer.connect(RANK_ROOM, {reliable:true});

        laser.conn = conn;

        lasBind(conn, false);

    });

    laser.peer.on("error", err => {

        const type = (err && err.type) || "?";

        if(!laser.queue){
            return;
        }

        /*
        L'hote s'est envole entre-temps : on repart au debut,
        et cette fois c'est nous qui tiendrons le salon.
        */
        if(type === "peer-unavailable"){
            setTimeout(function(){ if(laser.queue){ lasFindMatch(); } }, 900);
            return;
        }

        lasStatus("❌ " + type);
        queueSay("CONNEXION IMPOSSIBLE", "Vérifie ta connexion, puis réessaie.", false);
        queueButtons(false);

    });

}


function lasLeaveQueue(){

    laser.queue = false;

    clearQueueTimer();
    lasCleanup();

    queueButtons(false);
    queueSay("RECHERCHE D'ADVERSAIRES", "La partie démarre dès qu'il y a 2 joueurs.", false);

    document.getElementById("lasRoom").style.display = "none";

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
