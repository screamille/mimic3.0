/* =========================================================
   PARTICULES
========================================================= */

function burst(x, y, n = 15, color = "#55d9ff"){

    if(particles.length > 320){
        return;
    }

    for(let i = 0; i < n; i++){

        const a = vrnd() * Math.PI * 2;
        const s = (60 + vrnd() * 240) * unit;

        particles.push({
            x:x,
            y:y,
            vx:Math.cos(a) * s,
            vy:Math.sin(a) * s,
            life:1,
            color:color,
            size:(2 + vrnd() * 3) * unit
        });

    }

}


/* =========================================================
   NUMERO DE VERSION

   Un seul endroit a changer a chaque nouvelle livraison.
   Il s'affiche sous le logo du menu et dans l'onglet
   du navigateur.
========================================================= */

const VERSION = "7.0";

(function(){

    const tag = document.getElementById("versionTag");

    if(tag){
        tag.textContent = "V " + VERSION;
    }

    document.title = "MIMIC v" + VERSION;

})();


/* =========================================================
   VITESSE DU JOUEUR

   Avant, la vitesse montait avec le niveau : le slime
   ramait dans les mondes 1 et 2 et ne devenait vif qu'au
   pays des bonbons. Elle est maintenant constante, calee
   sur celle du monde 3.
========================================================= */

const PLAYER_SPEED = 415;


/* =========================================================
   COMPETENCES

   Boutons en bas a droite. La premiere est le DASH :
   une ruee courte et rapide, avec quelques instants
   d'invincibilite pour passer entre deux ennemis.
========================================================= */

const DASH_TIME = .16;   /* duree de la ruee, en secondes  */
const DASH_CD   = 3.8;   /* temps de recharge              */
const DASH_MULT = 3;     /* multiplicateur de vitesse      */

const dash = {t:0, cd:0, dx:1, dy:0, puff:0};


const SHIELD_TIME = 2.4;   /* duree de la bulle                */
const SHIELD_CD   = 15;    /* recharge de la bulle             */
const WAVE_CD     = 13;    /* recharge de l'onde de choc       */
const WAVE_R      = 215;   /* rayon de l'onde, en unites       */
const WAVE_STUN   = 2.6;   /* temps de sonnage des ennemis     */
const BLINK_CD    = 9;     /* recharge du saut                 */
const BLINK_DIST  = 235;   /* distance du saut, en unites      */
const LURE_TIME   = 5;     /* duree du leurre                  */
const LURE_CD     = 17;    /* recharge du leurre               */

/* recharge en cours de chaque competence */
const skillCd = {};

/* effets visuels */
let shieldFx = 0;
let waveFx   = null;
let blinkFx  = null;


/* catalogue des capacites achetables */
const ABILITIES = [
    {
        id:"dash",
        name:"DASH",
        icon:"»",
        price:150,
        rarity:2,
        cd:DASH_CD,
        color:"#4fd8ff",
        color2:"#1b6fd6",
        desc:"Ruée courte et très rapide, avec un instant d'invincibilité. Recharge 3,8 s."
    },
    {
        id:"bouclier",
        name:"BOUCLIER",
        icon:"◎",
        price:150,
        rarity:2,
        cd:SHIELD_CD,
        color:"#7bffca",
        color2:"#0f7a5a",
        desc:"Une bulle qui te rend intouchable pendant 2,4 s. Recharge 15 s."
    },
    {
        id:"onde",
        name:"ONDE",
        icon:"◉",
        price:150,
        rarity:3,
        cd:WAVE_CD,
        color:"#ffb347",
        color2:"#a8420a",
        desc:"Une onde de choc qui repousse et sonne tout ce qui t'entoure pendant 2,6 s. Recharge 13 s."
    },
    {
        id:"leurre",
        name:"LEURRE",
        icon:"◆",
        price:150,
        rarity:3,
        cd:LURE_CD,
        color:"#7bffca",
        color2:"#0f7a5a",
        desc:"Un faux slime qui attire tout ce qui te poursuit pendant 5 s. Recharge 17 s."
    }
];


function hasAbility(id){
    return abilityCount(id) > 0;
}


/* au moins une competence achetee ? */
function anyAbility(){
    return ABILITIES.some(ab => hasAbility(ab.id));
}


function dashReady(){
    return skillReady("dash") && dash.t <= 0;
}


/* une competence est prete si on la possede et qu'elle est rechargee */
function skillReady(id){
    return playing && !paused && hasAbility(id) && (skillCd[id] || 0) <= 0;
}


/* la recharge s'ecoule, quelle que soit la competence */
function skillTick(dt){

    for(const ab of ABILITIES){
        if(skillCd[ab.id] > 0){
            skillCd[ab.id] = Math.max(0, skillCd[ab.id] - dt);
        }
    }

    if(shieldFx > 0){
        shieldFx = Math.max(0, shieldFx - dt);
    }

    if(waveFx){
        waveFx.t += dt;
        if(waveFx.t > .55){ waveFx = null; }
    }

    if(blinkFx){
        blinkFx.t += dt;
        if(blinkFx.t > .35){ blinkFx = null; }
    }

}


/* toutes les creatures qui savent etre sonnees */
function stunnableCreatures(){
    return [].concat(
        mimics, blobs, gloutons, guimauves, anguilles, lanternes,
        w69Creatures()
    );
}


/* une charge en moins : c'est ce qui pousse a revenir en acheter */
function spendCharge(id){

    abilityStock[id] = abilityCount(id) - 1;

    saveGame();

    if(abilityCount(id) <= 0){

        pickupMessage("⌛ PLUS DE " + (ABILITIES.find(a => a.id === id) || {name:""}).name, "#8fa0c8");

        sound(180, .2, "sine", .035);

    }

}


/*
Le mode rayon se joue sans competences. La variable "laser" vit
dans un fichier charge plus tard : on la lit sous garde pour ne
jamais casser l'ecran d'accueil.
*/
function lasOn(){
    try{ return !!laser.active; }catch(e){ return false; }
}


function useSkill(id){

    if(lasOn()){
        return;
    }

    if(id === "dash"){
        tryDash();
        return;
    }

    if(!skillReady(id)){
        return;
    }

    spendCharge(id);

    if(id === "bouclier"){

        skillCd.bouclier  = SHIELD_CD;
        shieldFx          = SHIELD_TIME;
        player.invincible = Math.max(player.invincible, SHIELD_TIME);

        burst(player.x, player.y, 18, "#7bffca");

        sound(420, .18, "sine",     .05);
        sound(630, .22, "triangle", .04);

        return;

    }

    if(id === "onde"){

        skillCd.onde = WAVE_CD;

        const R = WAVE_R * unit;
        const a = playArea();

        for(const m of stunnableCreatures()){

            const d = Math.hypot(m.x - player.x, m.y - player.y);

            if(d > R){
                continue;
            }

            m.stunned = Math.max(m.stunned || 0, WAVE_STUN);

            const k  = (R - d) / R;
            const an = d < .001 ? rnd() * 6.28 : Math.atan2(m.y - player.y, m.x - player.x);

            m.x = Math.max(a.x0 + m.r, Math.min(a.x1 - m.r, m.x + Math.cos(an) * 150 * unit * k));
            m.y = Math.max(a.y0 + m.r, Math.min(a.y1 - m.r, m.y + Math.sin(an) * 150 * unit * k));

        }

        waveFx = {t:0, r:R, x:player.x, y:player.y};

        burst(player.x, player.y, 26, "#ffb347");

        sound(140, .35, "sawtooth", .05);
        sound(70,  .45, "sine",     .06);

        return;

    }

    if(id === "leurre"){

        skillCd.leurre = LURE_CD;

        decoy = {
            x:player.x,
            y:player.y,
            r:player.r,
            life:LURE_TIME,
            t:0
        };

        burst(player.x, player.y, 20, "#7bffca");

        sound(520, .12, "triangle", .04);
        sound(780, .10, "sine",     .03);

        return;

    }

    if(id === "saut"){

        skillCd.saut = BLINK_CD;

        const v = inputVector();

        let dx, dy;

        if(v.mag > .05){
            dx = v.dx; dy = v.dy;
        }else{
            dx = Math.cos(pfx.angle); dy = Math.sin(pfx.angle);
        }

        const from = {x:player.x, y:player.y};
        const a    = playArea();

        player.x = Math.max(a.x0 + player.r, Math.min(a.x1 - player.r, player.x + dx * BLINK_DIST * unit));
        player.y = Math.max(a.y0 + player.r, Math.min(a.y1 - player.r, player.y + dy * BLINK_DIST * unit));

        resolveSolids(player);

        player.invincible = Math.max(player.invincible, .4);

        blinkFx = {t:0, x0:from.x, y0:from.y, x1:player.x, y1:player.y};

        burst(from.x, from.y, 14, "#c88bff");
        burst(player.x, player.y, 14, "#e2c4ff");

        sound(880, .08, "sine",     .04);
        sound(520, .12, "triangle", .04);

        return;

    }

}


function tryDash(){

    if(!dashReady()){
        return;
    }

    /* direction : le manche s'il est tenu, sinon le regard */
    const v = inputVector();

    if(v.mag > .05){
        dash.dx = v.dx;
        dash.dy = v.dy;
    }else{
        dash.dx = Math.cos(pfx.angle);
        dash.dy = Math.sin(pfx.angle);
    }

    dash.t  = DASH_TIME;
    dash.cd = DASH_CD;

    skillCd.dash = DASH_CD;

    spendCharge("dash");

    /* quelques instants d'invincibilite */
    player.invincible = Math.max(player.invincible, DASH_TIME + .1);

    burst(player.x, player.y, 14, "#7fe6ff");

    sound(660, .09, "triangle", .05);
    sound(990, .07, "sine",     .035);

}


function dashReset(){

    dash.t  = 0;
    dash.cd = 0;
    dash.puff = 0;

    for(const ab of ABILITIES){
        skillCd[ab.id] = 0;
    }

    shieldFx = 0;
    waveFx   = null;
    blinkFx  = null;
    decoy    = null;

}


/*
La barre est reconstruite a chaque fois que la liste des
competences possedees change : un bouton par competence,
du bas vers le haut.
*/
function buildSkillBar(){

    const bar = document.getElementById("skillBar");

    if(!bar){
        return;
    }

    bar.innerHTML = "";

    ABILITIES.filter(ab => abilityCount(ab.id) > 0).forEach(ab => {

        const btn = document.createElement("button");

        btn.className     = "skillBtn";
        btn.dataset.skill = ab.id;
        btn.setAttribute("aria-label", ab.name);

        btn.innerHTML =
            '<span class="skillRing"></span>' +
            '<span class="skillFace">' +
            '<span class="skillIcon"></span>' +
            '<span class="skillName"></span>' +
            '</span>' +
            '<span class="skillCount"></span>';

        btn.querySelector(".skillIcon").textContent = ab.icon;
        btn.querySelector(".skillName").textContent = ab.name;

        btn.style.setProperty("--sk",  ab.color);
        btn.style.setProperty("--sk2", ab.color2);

        /* au pointerdown : sur telephone on ne perd pas les ~120 ms du clic */
        btn.addEventListener("pointerdown", e => {
            e.preventDefault();
            ensureAudio();
            useSkill(ab.id);
        });

        btn.addEventListener("contextmenu", e => e.preventDefault());

        bar.appendChild(btn);

    });

}


/* jauges circulaires */
function paintSkillBar(){

    const bar = document.getElementById("skillBar");

    if(!bar){
        return;
    }

    for(const btn of bar.children){

        const ab = ABILITIES.find(a => a.id === btn.dataset.skill);

        if(!ab){
            continue;
        }

        const left  = abilityCount(ab.id);
        const cd    = skillCd[ab.id] || 0;
        const ready = cd <= 0 && left > 0;

        const cnt = btn.querySelector(".skillCount");

        if(cnt){
            cnt.textContent = "×" + left;
        }

        btn.classList.toggle("empty", left <= 0);

        const ring = btn.querySelector(".skillRing");

        if(ring){
            const k = left <= 0 ? 0 : (cd <= 0 ? 1 : 1 - cd / ab.cd);
            ring.style.background =
                "conic-gradient(" + ab.color + " " + (k * 360).toFixed(0) +
                "deg, rgba(255,255,255,.07) 0deg)";
        }

        /* une petite vibration au moment ou elle redevient prete */
        if(ready && btn.dataset.ready !== "1"){

            if(playing){
                buzz(15);
            }

            btn.dataset.ready = "1";

        }else if(!ready){
            btn.dataset.ready = "0";
        }

        btn.classList.toggle("ready", ready);

    }

}


/* compatibilite : l'ancien nom est encore appele ailleurs */
function paintDashButton(){
    paintSkillBar();
}


/* =========================================================
   PLACEMENT
========================================================= */

function playArea(){

    return {
        x0:16 * unit,
        y0:topBound,
        x1:W - 16 * unit,
        y1:H - BOTTOM_UI * unit
    };

}

function findSpot(radius, minFromPlayer, gen){

    const R = gen || rnd;

    const a = playArea();

    for(let i = 0; i < 45; i++){

        const x = a.x0 + radius + R() * Math.max(1, (a.x1 - a.x0) - radius * 2);
        const y = a.y0 + radius + R() * Math.max(1, (a.y1 - a.y0) - radius * 2);

        if(Math.hypot(x - player.x, y - player.y) < minFromPlayer * unit){
            continue;
        }

        let ok = true;

        for(const s of solids){
            if(Math.hypot(x - s.x, y - s.y) < s.r + radius + 18 * unit){
                ok = false;
                break;
            }
        }

        if(ok){
            for(const a of archers){
                if(Math.hypot(x - a.x, y - a.y) < a.r + radius + 26 * unit){
                    ok = false;
                    break;
                }
            }
        }

        /*
        Les flaques sont mortelles : aucune pièce, aucun cœur et
        aucune orbe ne doit s'y poser. On garde une marge, sinon
        l'objet est ramassable depuis le bord du piège.
        */
        if(ok){
            for(const q of puddles){
                if(Math.hypot(x - q.x, y - q.y) < q.r + radius + 34 * unit){
                    ok = false;
                    break;
                }
            }
        }

        if(ok){
            for(const m of mimics){
                if(Math.hypot(x - m.x, y - m.y) < 100 * unit){
                    ok = false;
                    break;
                }
            }
        }

        if(ok){
            return {x:x, y:y};
        }

    }

    return null;

}


/* =========================================================
   BLOCS SOLIDES
========================================================= */

function addSolid(){

    /* le mode laser se joue dans une arene vide */
    if(laser.active){
        return;
    }


    const cap = level >= WALL_LEVEL ? MAX_SOLIDS_2 : MAX_SOLIDS;

    if(solids.length >= cap){
        return;
    }

    const r = (20 + wrnd() * 18) * unit;

    const p = findSpot(r, 170, wrnd);

    if(!p){
        return;
    }

    solids.push({
        x:p.x,
        y:p.y,
        r:r,
        pulse:rnd() * 10,
        planet:makePlanet()
    });

}

/*
Repousse une entité hors des blocs.
Le joueur peut donc s'en servir comme abri :
les mimics rebondissent dessus et perdent du terrain.
*/
/*
Les ennemis ne traversent pas les flaques : ils sont repoussés
au bord. Le joueur, lui, peut y entrer — et le paie d'une vie.
*/
function resolvePuddles(e){

    for(const q of puddles){

        let dx = e.x - q.x;
        let dy = e.y - q.y;

        let d = Math.hypot(dx, dy);

        const min = q.r * .88 + e.r;

        if(d < min){

            if(d < .0001){
                dx = 1;
                dy = 0;
                d  = 1;
            }

            e.x = q.x + dx / d * min;
            e.y = q.y + dy / d * min;

        }

    }

}


function resolveSolids(e){

    /*
    Deux passes : avec beaucoup de blocs, être repoussé hors de
    l'un peut te faire entrer dans son voisin.
    */
    for(let pass = 0; pass < 2; pass++){

    for(const s of solids){

        let dx = e.x - s.x;
        let dy = e.y - s.y;

        let d = Math.hypot(dx, dy);

        const min = e.r + s.r;

        if(d < min){

            if(d < .0001){
                dx = 1;
                dy = 0;
                d  = 1;
            }

            e.x = s.x + dx / d * min;
            e.y = s.y + dy / d * min;
        }

    }

    for(const a of archers){

        let dx = e.x - a.x;
        let dy = e.y - a.y;

        let d = Math.hypot(dx, dy);

        const min = e.r + a.r;

        if(d < min){

            if(d < .0001){
                dx = 1;
                dy = 0;
                d  = 1;
            }

            e.x = a.x + dx / d * min;
            e.y = a.y + dy / d * min;
        }

    }

    }

}


/* =========================================================
   LES PLANÈTES

   Chaque bloc du premier monde est une planète unique :
   type, teintes, bandes, cratères, anneaux et vitesse de
   rotation sont tirés au sort à sa création.
========================================================= */

const PLANET_KINDS = ["rocheuse", "gazeuse", "glacee", "volcanique", "oceanique"];

const PLANET_PALETTES = {
    rocheuse:   [["#c8a882","#8a6c4c","#5a4430"], ["#b9a596","#7d6a5c","#4c3f36"], ["#d0a06a","#8f6a3e","#573f24"]],
    gazeuse:    [["#f2d9a8","#d9a05e","#9e6a34"], ["#cfe0f5","#8fa8cf","#57708f"], ["#f0c0b0","#c47f6e","#7d4a40"]],
    glacee:     [["#eaf7ff","#a8d4ec","#6a94b0"], ["#e6f0ff","#b4c4e6","#75839f"]],
    volcanique: [["#ffb35c","#c14a1e","#4a1408"], ["#ffd08a","#d1552a","#3d1006"]],
    oceanique:  [["#a8e8d8","#3f9bd4","#1d4a7a"], ["#9fe0b8","#3d9e7a","#1b4a3c"]]
};


function makePlanet(){

    const kind = PLANET_KINDS[Math.floor(wrnd() * PLANET_KINDS.length)];

    const pal = PLANET_PALETTES[kind];

    const colors = pal[Math.floor(wrnd() * pal.length)];

    const p = {
        kind:kind,
        colors:colors,
        spin:wrnd() * 6.28,
        speed:(wrnd() - .5) * .22,
        tilt:(wrnd() - .5) * 1.1,
        ring:null,
        bands:[],
        craters:[],
        caps:kind === "glacee" || wrnd() > .8
    };

    /* un anneau, pour certaines */
    if(wrnd() > (kind === "gazeuse" ? .35 : .82)){

        p.ring = {
            inner:1.35 + wrnd() * .18,
            outer:1.85 + wrnd() * .35,
            tilt:.18 + wrnd() * .30,
            col:colors[0],
            gaps:1 + Math.floor(wrnd() * 2)
        };

    }

    if(kind === "gazeuse" || kind === "oceanique"){

        const n = 4 + Math.floor(wrnd() * 4);

        for(let i = 0; i < n; i++){
            p.bands.push({
                y:-1 + (i + .5) / n * 2 + (wrnd() - .5) * .1,
                h:.10 + wrnd() * .18,
                shade:wrnd()
            });
        }

        /* la grande tache, façon Jupiter */
        if(kind === "gazeuse" && wrnd() > .5){
            p.spot = {
                y:(wrnd() - .5) * 1.1,
                rx:.24 + wrnd() * .14,
                ry:.13 + wrnd() * .07
            };
        }

    }else{

        const n = 4 + Math.floor(wrnd() * 6);

        for(let i = 0; i < n; i++){

            const a = wrnd() * 6.28;
            const d = wrnd() * .74;

            p.craters.push({
                x:Math.cos(a) * d,
                y:Math.sin(a) * d,
                r:.07 + wrnd() * .15
            });

        }

    }

    return p;

}


function drawPlanet(s, t){

    const p = s.planet;

    if(!p){
        return;
    }

    const r = s.r;

    ctx.save();
    ctx.translate(s.x, s.y);

    const spin = p.spin + t * p.speed;

    /* atmosphère */
    const halo = ctx.createRadialGradient(0, 0, r * .92, 0, 0, r * 1.42);
    halo.addColorStop(0, "rgba(160,200,255,.20)");
    halo.addColorStop(1, "rgba(160,200,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.42, 0, Math.PI * 2);
    ctx.fill();

    /* anneau : la moitié arrière */
    if(p.ring){

        ctx.save();
        ctx.rotate(p.tilt);
        ctx.scale(1, p.ring.tilt);

        ctx.strokeStyle = p.ring.col;
        ctx.globalAlpha = .5;
        ctx.lineWidth   = r * (p.ring.outer - p.ring.inner) * .7;

        ctx.beginPath();
        ctx.arc(0, 0, r * (p.ring.inner + p.ring.outer) / 2, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

    }

    /* le globe */
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    const body = ctx.createLinearGradient(0, -r, 0, r);
    body.addColorStop(0,   p.colors[0]);
    body.addColorStop(.55, p.colors[1]);
    body.addColorStop(1,   p.colors[2]);

    ctx.fillStyle = body;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    /* bandes nuageuses, qui défilent */
    for(const b of p.bands){

        const yy = ((b.y + spin * .28) % 2 + 3) % 2 - 1;

        ctx.globalAlpha = .30 + b.shade * .25;
        ctx.fillStyle   = b.shade > .5 ? p.colors[0] : p.colors[2];

        ctx.beginPath();
        ctx.ellipse(0, yy * r, r * 1.2, r * b.h, 0, 0, Math.PI * 2);
        ctx.fill();

    }

    if(p.spot){

        const sx = Math.sin(spin * .8) * r * .45;

        ctx.globalAlpha = .55;
        ctx.fillStyle   = p.colors[2];

        ctx.beginPath();
        ctx.ellipse(sx, p.spot.y * r, r * p.spot.rx, r * p.spot.ry, 0, 0, Math.PI * 2);
        ctx.fill();

    }

    /* cratères */
    for(const cr of p.craters){

        const cx = ((cr.x + spin * .22) % 2 + 3) % 2 - 1;

        ctx.globalAlpha = .40;
        ctx.fillStyle   = p.colors[2];
        ctx.beginPath();
        ctx.arc(cx * r, cr.y * r, r * cr.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = .25;
        ctx.fillStyle   = p.colors[0];
        ctx.beginPath();
        ctx.arc(cx * r - r * cr.r * .22, cr.y * r - r * cr.r * .22, r * cr.r * .7, 0, Math.PI * 2);
        ctx.fill();

    }

    /* calottes polaires */
    if(p.caps){

        ctx.globalAlpha = .55;
        ctx.fillStyle   = "#eef7ff";

        ctx.beginPath();
        ctx.ellipse(0, -r * .95, r * .62, r * .26, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(0, r * .97, r * .55, r * .22, 0, 0, Math.PI * 2);
        ctx.fill();

    }

    /* la nuit : le côté opposé à l'étoile */
    ctx.globalAlpha = 1;

    const night = ctx.createRadialGradient(
        -r * .42, -r * .42, r * .12,
        -r * .10, -r * .10, r * 1.5
    );

    night.addColorStop(0,   "rgba(255,246,225,.20)");
    night.addColorStop(.45, "rgba(0,0,0,0)");
    night.addColorStop(1,   "rgba(2,3,10,.80)");

    ctx.fillStyle = night;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.restore();

    /* liseré lumineux */
    ctx.globalAlpha = .55;
    ctx.strokeStyle = "rgba(200,225,255,.7)";
    ctx.lineWidth   = 1.4 * unit;
    ctx.beginPath();
    ctx.arc(0, 0, r - .7 * unit, Math.PI * 1.05, Math.PI * 1.85);
    ctx.stroke();
    ctx.globalAlpha = 1;

    /* anneau : la moitié avant */
    if(p.ring){

        ctx.save();
        ctx.rotate(p.tilt);
        ctx.scale(1, p.ring.tilt);

        ctx.strokeStyle = p.ring.col;
        ctx.globalAlpha = .8;
        ctx.lineWidth   = r * (p.ring.outer - p.ring.inner) * .7;

        ctx.beginPath();
        ctx.arc(0, 0, r * (p.ring.inner + p.ring.outer) / 2, 0, Math.PI);
        ctx.stroke();

        /* division dans l'anneau */
        ctx.globalAlpha = .9;
        ctx.strokeStyle = "rgba(5,5,15,.55)";
        ctx.lineWidth   = r * .07;

        for(let i = 0; i < p.ring.gaps; i++){

            const rr = r * (p.ring.inner + (p.ring.outer - p.ring.inner) * (i + 1) / (p.ring.gaps + 1));

            ctx.beginPath();
            ctx.arc(0, 0, rr, 0, Math.PI);
            ctx.stroke();

        }

        ctx.restore();

    }

    ctx.restore();

}


/* =========================================================
   ORBES / PIECES / COEURS
========================================================= */

function addOrb(){

    /*
    Le mode laser, la salle du boss et les cartes maison se
    jouent tels quels : rien n'apparait tout seul.
    */
    if(laser.active || zone === "neant"){
        return;
    }


    if(orbs.length > 0){
        return;
    }

    const r = 19 * unit;
    const p = findSpot(r, 150);

    if(!p){
        return;
    }

    orbs.push({x:p.x, y:p.y, r:r, pulse:rnd() * 10});

}

function addCoin(){

    if(laser.active || zone === "neant"){
        return;
    }


    /* une seule pièce à la fois : quand tu en prends une, une seule réapparaît */
    if(coins.length >= 1){
        return;
    }

    const r = 11 * unit;
    const p = findSpot(r, 90);

    if(!p){
        return;
    }

    coins.push({
        x:p.x,
        y:p.y,
        r:r,
        rotation:rnd() * Math.PI * 2,
        pulse:rnd() * 10
    });

}

function addHeart(){

    /* le mode laser se joue dans une arene vide */
    if(laser.active){
        return;
    }


    if(hearts.length > 0 || lives >= MAX_LIVES){
        return;
    }

    const r = 14 * unit;
    const p = findSpot(r, 120);

    if(!p){
        return;
    }

    hearts.push({x:p.x, y:p.y, r:r, pulse:rnd() * 10});

}


/* =========================================================
   ARCHERS, BOULES DE SLIME ET SLIMES
========================================================= */

const SLIME_COLOR = "#a6e22e";

function spawnArchers(){

    if(archers.length){
        return;
    }

    const a = playArea();

    const r = 26 * unit;

    /*
    Un archer au milieu tout en haut, un au milieu tout en bas.
    Ils sont fixes, solides, et impossibles à détruire.
    */
    const positions = [
        {x:(a.x0 + a.x1) / 2, y:a.y0 + r + 6 * unit},
        {x:(a.x0 + a.x1) / 2, y:a.y1 - r - 6 * unit}
    ];

    positions.forEach((pos, i) => {

        archers.push({
            x:pos.x,
            y:pos.y,
            r:r,
            angle:i === 0 ? Math.PI / 2 : -Math.PI / 2,
            /* tirs décalés : une boule toutes les 10 s en alternance */
            timer:6 + i * (ARCHER_INTERVAL / 2),
            charge:0,
            pulse:rnd() * 10
        });

        /* on dégage ce qui se trouverait pile dessous */
        solids = solids.filter(
            b => Math.hypot(b.x - pos.x, b.y - pos.y) > b.r + r + 14 * unit
        );

        const clear = o =>
            Math.hypot(o.x - pos.x, o.y - pos.y) > o.r + r + 20 * unit;

        orbs   = orbs.filter(clear);
        coins  = coins.filter(clear);
        hearts = hearts.filter(clear);

    });

    pickupMessage("🏹 ARCHERS EN POSITION", SLIME_COLOR);

    sound(150, .4, "square", .05);

}


function fireBall(a){

    const dx = player.x - a.x;
    const dy = player.y - a.y;

    const d = Math.hypot(dx, dy) || 1;

    balls.push({
        x:a.x + dx / d * (a.r + 10 * unit),
        y:a.y + dy / d * (a.r + 10 * unit),
        vx:dx / d * 215 * unit,
        vy:dy / d * 215 * unit,
        r:11 * unit,
        wobble:rnd() * 10
    });

    burst(a.x + dx / d * a.r, a.y + dy / d * a.r, 8, SLIME_COLOR);

    sound(420, .16, "square", .045);

}


/*
Un slime éclot là où la boule s'écrase. Il chasse comme un
HUNTER — droit sur toi — mais plus vite, et il se décompose
au bout de quelques secondes.
*/
function spawnSlime(x, y){

    const area = playArea();

    let sx = x;
    let sy = y;

    /* jamais collé au joueur : on le décale s'il éclot trop près */
    const dx = sx - player.x;
    const dy = sy - player.y;

    const d = Math.hypot(dx, dy);

    const safe = 70 * unit;

    if(d < safe){

        const ang = d < .001 ? rnd() * Math.PI * 2 : Math.atan2(dy, dx);

        sx = player.x + Math.cos(ang) * safe;
        sy = player.y + Math.sin(ang) * safe;

    }

    slimes.push({
        x:Math.max(area.x0, Math.min(area.x1, sx)),
        y:Math.max(area.y0, Math.min(area.y1, sy)),
        r:12 * unit,
        vx:0,
        vy:0,
        life:SLIME_LIFE,
        wobble:rnd() * 10,
        birth:.35
    });

    burst(sx, sy, 18, SLIME_COLOR);

    sound(260, .22, "sawtooth", .05);

}


function updateArchers(dt){

    /*
    Les tourelles ont été retirées du jeu : plus d'archers,
    donc plus de boules de slime tirées sur la première carte.
    Les slimes du MARAIS restent, eux.
    */

    /* ---- tourelles ---- */

    for(const a of archers){

        a.pulse += dt * 3;

        a.angle = Math.atan2(player.y - a.y, player.x - a.x);

        if(a.charge > 0){

            a.charge -= dt;

            if(a.charge <= 0){
                fireBall(a);
                a.timer = ARCHER_INTERVAL;
            }

        }else{

            a.timer -= dt;

            /* une seconde de mise en joue avant chaque tir */
            if(a.timer <= 0){
                a.charge = 1;
            }

        }

    }


    /* ---- boules en vol ---- */

    const area = playArea();

    for(const ball of balls){

        ball.wobble += dt * 9;

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        let hit = false;

        if(player.invincible <= 0 && collide(player, ball)){
            loseLife(null);
            hit = true;
        }

        if(!hit){
            for(const b of solids){
                if(Math.hypot(ball.x - b.x, ball.y - b.y) < b.r + ball.r){
                    hit = true;
                    break;
                }
            }
        }

        if(
            !hit && (
                ball.x < area.x0 || ball.x > area.x1 ||
                ball.y < area.y0 || ball.y > area.y1
            )
        ){
            hit = true;
        }

        if(hit){
            ball.dead = true;
            spawnSlime(ball.x, ball.y);
        }

    }

    balls = balls.filter(b => !b.dead);


    /* ---- slimes ---- */

    for(const sl of slimes){

        sl.wobble += dt * 7;

        sl.life -= dt;

        if(sl.birth > 0){
            sl.birth = Math.max(0, sl.birth - dt);
            continue;
        }

        if(sl.life <= 0){
            sl.dead = true;
            burst(sl.x, sl.y, 20, SLIME_COLOR);
            sound(160, .25, "sawtooth", .04);
            continue;
        }

        /* même comportement que le HUNTER, mais plus rapide */
        const speed = mimicSpeed({type:MIMIC_TYPES[0]}) * 1.5;

        const dx = player.x - sl.x;
        const dy = player.y - sl.y;

        const dist = Math.hypot(dx, dy);

        if(dist > .001){

            const dir = steerAround(sl, dx / dist, dy / dist);

            const turn = 1 - Math.exp(-dt / .14);

            sl.vx += (dir.x * speed - sl.vx) * turn;
            sl.vy += (dir.y * speed - sl.vy) * turn;

            const v = Math.hypot(sl.vx, sl.vy);

            if(v > speed){
                sl.vx = sl.vx / v * speed;
                sl.vy = sl.vy / v * speed;
            }

            sl.x += sl.vx * dt;
            sl.y += sl.vy * dt;

        }

        resolveSolids(sl);

        if(player.invincible <= 0 && collide(player, sl)){
            loseLife(null);
            sl.dead = true;
            burst(sl.x, sl.y, 22, SLIME_COLOR);
        }

    }

    slimes = slimes.filter(sl => !sl.dead);

}


/* =========================================================
   LES SOLS

   Peints une seule fois dans une image hors écran, puis
   recopiés à chaque image : on peut se permettre beaucoup
   de détail sans coûter une seule fraction de seconde.
========================================================= */

floorCache = null;
let floorZone  = null;
let floorW     = 0;
let floorH     = 0;

let twinkles = [];


function buildFloor(){

    floorCache = document.createElement("canvas");

    floorCache.width  = Math.max(1, Math.round(W));
    floorCache.height = Math.max(1, Math.round(H));

    const c = floorCache.getContext("2d");

    floorZone = zone;
    floorW    = W;
    floorH    = H;

    if(zone === "marais"){
        paintEarth(c);
    }else if(zone === "bonbon"){
        paintCandy(c);
    }else if(zone === "abysse"){
        paintAbyss(c);
    }else if(zone === "neant"){
        paintVoid(c);
    }else if(zone === "desert"){
        paintDesert(c);
    }else if(zone === "forge"){
        paintForge(c);
    }else if(zone === "biblio"){
        paintLibrary(c);
    }else if(zone === "horloge"){
        paintClock(c);
    }else{
        paintGalaxy(c);
    }

}


/* --- MONDE 1 : l'espace --- */

function paintGalaxy(c){

    /* fond profond */
    const base = c.createLinearGradient(0, 0, W * .4, H);
    base.addColorStop(0,   "#131035");
    base.addColorStop(.45, "#0a0a22");
    base.addColorStop(1,   "#04030d");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* nébuleuses */
    const clouds = [
        {x:.22, y:.20, r:.55, col:"120,70,210"},
        {x:.78, y:.35, r:.48, col:"40,110,220"},
        {x:.55, y:.78, r:.60, col:"180,60,160"},
        {x:.10, y:.75, r:.40, col:"40,180,190"}
    ];

    for(const n of clouds){

        const R = n.r * Math.max(W, H) * .6;

        const g = c.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, R);

        g.addColorStop(0,   "rgba(" + n.col + ",.16)");
        g.addColorStop(.5,  "rgba(" + n.col + ",.06)");
        g.addColorStop(1,   "rgba(" + n.col + ",0)");

        c.fillStyle = g;
        c.fillRect(0, 0, W, H);

    }

    /* voie lactée : une bande de poussière en diagonale */
    c.save();
    c.translate(W * .5, H * .5);
    c.rotate(-.5);

    const band = c.createLinearGradient(0, -H * .22, 0, H * .22);
    band.addColorStop(0,  "rgba(190,180,255,0)");
    band.addColorStop(.5, "rgba(190,180,255,.055)");
    band.addColorStop(1,  "rgba(190,180,255,0)");

    c.fillStyle = band;
    c.fillRect(-W, -H * .22, W * 2, H * .44);
    c.restore();

    /* étoiles */
    const count = Math.round(W * H / 2600);

    for(let i = 0; i < count; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        const roll = Math.random();

        const r = roll > .97 ? 1.7 : roll > .82 ? 1.15 : .7;

        const a = .25 + Math.random() * .6;

        /* quelques étoiles tirent vers le bleu ou l'ambre */
        const tint =
            roll > .93 ? "190,210,255" :
            roll > .88 ? "255,225,190" :
            "255,255,255";

        c.fillStyle = "rgba(" + tint + "," + a.toFixed(2) + ")";

        c.beginPath();
        c.arc(x, y, r * unit, 0, Math.PI * 2);
        c.fill();

    }

    /* quelques étoiles brillantes avec une croix de diffraction */
    for(let i = 0; i < 14; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const L = (7 + Math.random() * 11) * unit;

        c.strokeStyle = "rgba(255,255,255,.30)";
        c.lineWidth   = 1;

        c.beginPath();
        c.moveTo(x - L, y); c.lineTo(x + L, y);
        c.moveTo(x, y - L); c.lineTo(x, y + L);
        c.stroke();

        c.fillStyle = "rgba(255,255,255,.9)";
        c.beginPath();
        c.arc(x, y, 1.5 * unit, 0, Math.PI * 2);
        c.fill();

    }

    /* étoiles qui scintillent, redessinées à chaque image */
    twinkles = [];

    for(let i = 0; i < 26; i++){

        twinkles.push({
            x:Math.random() * W,
            y:Math.random() * H,
            r:(.9 + Math.random() * 1.5) * unit,
            speed:.6 + Math.random() * 1.9,
            phase:Math.random() * 6.28
        });

    }

}


/* --- MONDE 2 : la terre --- */

function paintEarth(c){

    /* terre humide, en dégradé */
    const base = c.createLinearGradient(0, 0, W * .35, H);
    base.addColorStop(0,   "#6d5133");
    base.addColorStop(.45, "#553d26");
    base.addColorStop(1,   "#3a2a19");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* plaques d'humidité et de terre retournée */
    for(let i = 0; i < 40; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = (70 + Math.random() * 240) * unit;

        const g = c.createRadialGradient(x, y, 0, x, y, r);

        const dark = Math.random() > .42;

        g.addColorStop(0, dark
            ? "rgba(38,27,15,.34)"
            : "rgba(132,102,64,.20)");

        g.addColorStop(.6, dark
            ? "rgba(38,27,15,.13)"
            : "rgba(132,102,64,.07)");

        g.addColorStop(1, "rgba(0,0,0,0)");

        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);

    }

    /* grain fin : la terre n'est jamais lisse */
    const grains = Math.round(W * H / 130);

    for(let i = 0; i < grains; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        const roll = Math.random();

        c.fillStyle =
            roll > .66 ? "rgba(24,17,9,.26)" :
            roll > .33 ? "rgba(150,118,78,.16)" :
                         "rgba(96,72,44,.20)";

        c.fillRect(x, y, unit * (Math.random() > .8 ? 2 : 1), unit);

    }

    /* mousse, dans les creux */
    for(let i = 0; i < 22; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = (24 + Math.random() * 70) * unit;

        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,  "rgba(78,96,42,.30)");
        g.addColorStop(.7, "rgba(70,86,38,.10)");
        g.addColorStop(1,  "rgba(0,0,0,0)");

        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);

    }

    /* cailloux, avec ombre portée */
    for(let i = 0; i < Math.round(W * H / 5200); i++){

        const x  = Math.random() * W;
        const y  = Math.random() * H;
        const rx = (2 + Math.random() * 4.5) * unit;
        const ry = rx * (.6 + Math.random() * .3);
        const a  = Math.random() * 3;

        c.fillStyle = "rgba(16,11,6,.4)";
        c.beginPath();
        c.ellipse(x + rx * .25, y + ry * .5, rx, ry * .8, a, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "rgba(126,106,80,.75)";
        c.beginPath();
        c.ellipse(x, y, rx, ry, a, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "rgba(186,166,138,.45)";
        c.beginPath();
        c.ellipse(x - rx * .28, y - ry * .3, rx * .45, ry * .38, a, 0, Math.PI * 2);
        c.fill();

    }

    /* feuilles mortes */
    for(let i = 0; i < Math.round(W * H / 26000); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const L = (7 + Math.random() * 9) * unit;
        const a = Math.random() * 6.28;

        c.save();
        c.translate(x, y);
        c.rotate(a);

        const tone = Math.random();

        c.fillStyle = tone > .6 ? "rgba(150,96,42,.55)"
                    : tone > .3 ? "rgba(122,78,36,.5)"
                                : "rgba(96,84,40,.45)";

        c.beginPath();
        c.moveTo(-L, 0);
        c.quadraticCurveTo(0, -L * .55, L, 0);
        c.quadraticCurveTo(0,  L * .55, -L, 0);
        c.fill();

        c.strokeStyle = "rgba(60,40,18,.35)";
        c.lineWidth   = .8 * unit;
        c.beginPath();
        c.moveTo(-L, 0);
        c.lineTo(L, 0);
        c.stroke();

        c.restore();

    }

    /* brindilles */
    const twigs = Math.max(8, Math.round(W * H / 60000));

    for(let i = 0; i < twigs; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        c.strokeStyle = "rgba(174,136,86,.6)";
        c.lineWidth   = (1 + Math.random() * .8) * unit;
        c.lineCap     = "round";

        const a0 = Math.random() * Math.PI * 2;
        const L  = (12 + Math.random() * 18) * unit;

        const ex = x + Math.cos(a0) * L;
        const ey = y + Math.sin(a0) * L;

        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(
            x + Math.cos(a0 + .45) * L * .6,
            y + Math.sin(a0 + .45) * L * .6,
            ex, ey
        );
        c.stroke();

        for(let k = 0; k < 2; k++){

            const t  = .4 + Math.random() * .4;
            const bx = x + (ex - x) * t;
            const by = y + (ey - y) * t;
            const a1 = a0 + (Math.random() > .5 ? 1 : -1) * (.6 + Math.random() * .7);

            c.beginPath();
            c.moveTo(bx, by);
            c.lineTo(bx + Math.cos(a1) * L * .4, by + Math.sin(a1) * L * .4);
            c.stroke();

        }

    }

    /* sillons du sol */
    for(let i = 0; i < 26; i++){

        let x = Math.random() * W;
        let y = Math.random() * H;
        let a = Math.random() * Math.PI * 2;

        c.strokeStyle = "rgba(20,13,7,.22)";
        c.lineWidth   = (1 + Math.random() * 1.4) * unit;

        c.beginPath();
        c.moveTo(x, y);

        for(let k = 0; k < 4; k++){
            a += (Math.random() - .5) * .9;
            x += Math.cos(a) * (22 + Math.random() * 40) * unit;
            y += Math.sin(a) * (22 + Math.random() * 40) * unit;
            c.lineTo(x, y);
        }

        c.stroke();

    }

    /* lumière rasante au centre, bords assombris */
    const vig = c.createRadialGradient(
        W * .45, H * .40, Math.min(W, H) * .18,
        W * .5,  H * .5,  Math.max(W, H) * .82
    );

    vig.addColorStop(0, "rgba(255,225,175,.10)");
    vig.addColorStop(.45, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(16,10,4,.55)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


/* --- MONDE 3 : le pays des bonbons --- */

function paintCandy(c){

    /* nappe de sucre rose */
    const base = c.createLinearGradient(0, 0, W * .3, H);
    base.addColorStop(0,   "#ffd3e8");
    base.addColorStop(.45, "#ffb8dc");
    base.addColorStop(1,   "#f78fc6");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* larges rubans de sucre en diagonale */
    c.save();
    c.translate(W / 2, H / 2);
    c.rotate(-.5);

    const stripe = 78 * unit;

    for(let i = -30; i < 30; i++){

        c.fillStyle = i % 2
            ? "rgba(255,255,255,.22)"
            : "rgba(255,150,205,.16)";

        c.fillRect(-W, i * stripe, W * 2, stripe * .55);

    }

    c.restore();

    /* flaques de sirop pastel */
    for(let i = 0; i < 26; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = (60 + Math.random() * 190) * unit;

        const tints = ["173,240,255", "255,240,150", "200,255,190", "230,190,255"];
        const col   = tints[Math.floor(Math.random() * tints.length)];

        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,  "rgba(" + col + ",.35)");
        g.addColorStop(.6, "rgba(" + col + ",.12)");
        g.addColorStop(1,  "rgba(" + col + ",0)");

        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);

    }

    /* vermicelles colorés */
    const sprinkles = Math.round(W * H / 2200);

    const palette = ["#ff5fa2", "#ffd93d", "#5fe0ff", "#8bff9e", "#c08bff", "#ffffff"];

    for(let i = 0; i < sprinkles; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const a = Math.random() * Math.PI;
        const L = (3.5 + Math.random() * 4) * unit;

        c.save();
        c.translate(x, y);
        c.rotate(a);

        c.strokeStyle = palette[Math.floor(Math.random() * palette.length)];
        c.lineWidth   = 2.1 * unit;
        c.lineCap     = "round";
        c.globalAlpha = .85;

        c.beginPath();
        c.moveTo(-L / 2, 0);
        c.lineTo(L / 2, 0);
        c.stroke();

        c.restore();

    }

    /* petits éclats de sucre */
    for(let i = 0; i < Math.round(W * H / 6000); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        c.fillStyle = "rgba(255,255,255,.7)";
        c.fillRect(x, y, unit * 1.4, unit * 1.4);

    }

    /* bords légèrement caramélisés */
    const vig = c.createRadialGradient(
        W / 2, H * .45, Math.min(W, H) * .25,
        W / 2, H / 2, Math.max(W, H) * .8
    );

    vig.addColorStop(0, "rgba(255,255,255,.10)");
    vig.addColorStop(1, "rgba(180,60,120,.30)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


function drawFloor(){

    if(!floorCache || floorZone !== zone || floorW !== W || floorH !== H){
        buildFloor();
    }

    ctx.drawImage(floorCache, 0, 0, W, H);

    /* scintillement des étoiles */
    if(zone !== "marais" && twinkles.length){

        const now = performance.now() / 1000;

        ctx.save();

        for(const t of twinkles){

            const a = .25 + .55 * (.5 + .5 * Math.sin(now * t.speed + t.phase));

            ctx.globalAlpha = a;
            ctx.fillStyle   = "#ffffff";

            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
            ctx.fill();

        }

        ctx.restore();

    }

}


/* =========================================================
   LE PORTAIL ET LE MARAIS  (niveau 35)
========================================================= */

/* transforme #rrggbb en rgba(...) */
function hexA(hex, a){

    const n = parseInt(hex.slice(1), 16);

    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";

}


function portalTarget(){


    if(zone === "cyber" && level >= PORTAL_LEVEL){
        return "marais";
    }

    if(zone === "marais" && level >= CANDY_LEVEL){
        return "bonbon";
    }

    if(zone === "bonbon" && level >= ABYSS_LEVEL){
        return "abysse";
    }

    if(zone === "abysse" && level >= VOID_LEVEL){
        return "neant";
    }

    /*
    Dans LE NÉANT, le portail ne s'ouvre pas au niveau : il
    s'ouvre des que L'OEIL est brise. C'est ca, terminer le
    monde 5.
    */
    if(zone === "neant" && (voidCleared || level >= DESERT_LEVEL)){ return "desert"; }
    if(zone === "desert" && level >= FORGE_LEVEL) { return "forge"; }
    if(zone === "forge"  && level >= BIBLIO_LEVEL){ return "biblio"; }
    if(zone === "biblio" && level >= CLOCK_LEVEL) { return "horloge"; }

    return null;

}


function spawnPortal(){

    const target = portalTarget();

    if(portal || !target){
        return;
    }

    const r = 42 * unit;

    /*
    Le portail DOIT apparaître. On cherche d'abord une place
    confortable, puis on relâche les contraintes, et en dernier
    recours on dégage les blocs qui gênent.
    */
    let p = findSpot(r, 260) || findSpot(r, 150) || findSpot(r, 60);

    if(!p){

        const a = playArea();

        const ang = rnd() * Math.PI * 2;

        p = {
            x:Math.max(a.x0 + r, Math.min(a.x1 - r, player.x + Math.cos(ang) * 300 * unit)),
            y:Math.max(a.y0 + r, Math.min(a.y1 - r, player.y + Math.sin(ang) * 300 * unit))
        };

        solids = solids.filter(
            b => Math.hypot(b.x - p.x, b.y - p.y) > b.r + r + 12 * unit
        );

    }

    portal = {
        x:p.x,
        y:p.y,
        r:r,
        spin:0,
        birth:0,
        pull:0,
        target:target,
        col:  target === "horloge" ? "#9fe9ff" :
              target === "biblio"  ? "#b06cff" :
              target === "forge"   ? "#ff7a2a" :
              target === "desert"  ? "#ffd76a" :
              target === "neant"  ? "#c86aff" :
              target === "abysse" ? "#2fe0ff" :
              target === "bonbon" ? "#ff5fa2" : "#7bd93a",
        col2: target === "horloge" ? "#e8fbff" :
              target === "biblio"  ? "#efe6ff" :
              target === "forge"   ? "#ffe0b0" :
              target === "desert"  ? "#fff2c8" :
              target === "neant"  ? "#f0d8ff" :
              target === "abysse" ? "#c8f6ff" :
              target === "bonbon" ? "#ffd0e6" : "#bdf58a"
    };

    pickupMessage("🌀 UN PORTAIL S'EST OUVERT", portal.col);

    sound(90, .8, "sine", .06);

}


function updatePortal(dt){

    spawnPortal();

    if(!portal){
        return;
    }

    portal.spin  += dt * 1.7;
    portal.birth  = Math.min(1, portal.birth + dt * 1.2);

    const dx = portal.x - player.x;
    const dy = portal.y - player.y;

    const d = Math.hypot(dx, dy) || 1;

    const reach = 210 * unit;

    if(d < reach){

        /*
        L'aspiration : plus tu approches, plus il tire fort.
        On sent le sol se dérober avant même de le toucher.
        */
        const force = (1 - d / reach);

        portal.pull = force;

        player.x += dx / d * force * force * 260 * unit * dt;
        player.y += dy / d * force * force * 260 * unit * dt;

        if(d < portal.r * .55){
            startWarp();
        }

    }else{
        portal.pull = 0;
    }

}


function startWarp(){

    if(warp){
        return;
    }

    warp = {
        phase:"in",
        t:0,
        x:portal.x,
        y:portal.y,
        spin:0,
        target:portal.target,
        col:portal.col,
        col2:portal.col2
    };

    stickReset();

    sound(70, 1.2, "sawtooth", .07);

}


function enterMarais(){

    zone = "marais";

    portal = null;

    /* nouveau décor, nouveaux blocs */
    solids  = [];
    orbs    = [];
    coins   = [];
    hearts  = [];
    balls   = [];
    slimes  = [];
    trails  = [];
    mimics  = [];
    archers = [];

    trace       = [];
    traceLength = 0;

    const a = playArea();

    player.x = (a.x0 + a.x1) / 2;
    player.y = (a.y0 + a.y1) / 2;

    player.invincible = 2.2;

    /* pas de blocs ici : ce sont les flaques qui font le terrain */
    puddles = [];

    logs = [];

    for(let i = 0; i < 3; i++){
        spawnLog();
    }

    addCoin();
    addOrb();

    blobs     = [];
    drips     = [];
    blobTimer = 0;

    for(let i = 0; i < 2; i++){
        spawnBlob();
    }

    noteWorld("marais");

    worldBanner("marais", "🐸");

    sound(300, .5, "triangle", .06);

}


function enterCandy(){

    zone = "bonbon";

    portal = null;

    solids  = [];
    orbs    = [];
    coins   = [];
    hearts  = [];
    balls   = [];
    slimes  = [];
    trails  = [];
    mimics  = [];
    archers = [];
    blobs   = [];
    puddles = [];
    logs    = [];
    crawlers = [];
    drips   = [];

    trace       = [];
    traceLength = 0;

    const a = playArea();

    player.x = (a.x0 + a.x1) / 2;
    player.y = (a.y0 + a.y1) / 2;

    player.invincible = 2.2;

    candies = [];

    for(let i = 0; i < 9; i++){
        spawnCandy();
    }

    gloutons     = [];
    gloutonTimer = 0;

    for(let i = 0; i < 2; i++){
        spawnGlouton();
    }

    guimauves     = [];
    guimauveTimer = 0;

    for(let i = 0; i < 2; i++){
        spawnGuimauve();
    }

    addCoin();
    addOrb();

    noteWorld("bonbon");

    worldBanner("bonbon", "🍬");

    sound(520, .5, "triangle", .06);

}








/* =========================================================
   PROGRESSION, MISSIONS ET COMBO

   Tout ce qui survit d'une partie a l'autre : l'experience,
   les records, les missions du jour et les mondes deja vus.
========================================================= */

let xpTotal    = Number(localStorage.getItem("mimicXP") || 0);
let vibrateOn  = localStorage.getItem("mimicVibrate") !== "0";
let records    = loadJSON("mimicRecords", {best:{}, bestTime:0, boss:0});
let worldsSeen = loadJSON("mimicWorlds", ["cyber"]);
let daily      = loadJSON("mimicDaily", null);

if(!records || typeof records !== "object"){ records = {best:{}, bestTime:0, boss:0}; }
if(!records.best) { records.best = {}; }
if(!Array.isArray(worldsSeen) || !worldsSeen.length){ worldsSeen = ["cyber"]; }

/* les compteurs de la partie en cours */
let runCoins = 0, runGraze = 0, runCombo = 0, runNoHit = 0, runWorld = 1;

/* le combo */
let combo = 0, comboTimer = 0, comboFlash = 0;

/* le ralenti au frolement */
let slowMo = 0, grazeFlash = 0;

/* le leurre */
let decoy = null;


function saveProgress(){

    try{
        localStorage.setItem("mimicXP",      xpTotal);
        localStorage.setItem("mimicRecords", JSON.stringify(records));
        localStorage.setItem("mimicWorlds",  JSON.stringify(worldsSeen));
        localStorage.setItem("mimicDaily",   JSON.stringify(daily));
    }catch(e){}

}


/* --- le niveau du joueur : 500 XP pour le 2, puis de plus en plus --- */
function xpForLevel(n){
    return 500 * (n - 1) * (n - 1);
}

function playerLevel(){
    return 1 + Math.floor(Math.sqrt(xpTotal / 500));
}

function playerLevelProgress(){

    const n  = playerLevel();
    const a  = xpForLevel(n);
    const b  = xpForLevel(n + 1);

    return Math.max(0, Math.min(1, (xpTotal - a) / Math.max(1, b - a)));

}


function addXP(n){

    if(n <= 0){
        return;
    }

    const before = playerLevel();

    xpTotal += Math.round(n);

    const after = playerLevel();

    if(after > before){

        /* chaque niveau rapporte des pieces */
        const gain = 150 * after;

        totalCoins += gain;

        pickupMessage("⭐ NIVEAU " + after + "   +" + gain + " 🪙", "#ffd84d");

        coinChime();
        buzz([30, 60, 30]);

        saveGame();

    }

    passAdd(n);

    saveProgress();

}


/* --- la vibration --- */
function buzz(pattern){

    if(!vibrateOn || !navigator.vibrate){
        return;
    }

    try{ navigator.vibrate(pattern); }catch(e){}

}


function decoyTick(dt){

    if(!decoy){
        return;
    }

    decoy.t    += dt;
    decoy.life -= dt;

    if(decoy.life <= 0){

        burst(decoy.x, decoy.y, 16, "#7bffca");

        sound(300, .16, "sine", .03);

        decoy = null;

    }

}


/* la cible que suivent les poursuivants : le leurre s'il existe */
function lureTarget(){
    return decoy ? decoy : player;
}


function drawDecoy(){

    if(!decoy){
        return;
    }

    const k  = Math.min(1, decoy.life / .4);
    const rr = decoy.r * (1 + Math.sin(decoy.t * 6) * .06);

    ctx.save();

    /* le halo qui appelle */
    const g = ctx.createRadialGradient(decoy.x, decoy.y, 0, decoy.x, decoy.y, rr * 5);
    g.addColorStop(0, "rgba(123,255,202,.30)");
    g.addColorStop(1, "rgba(123,255,202,0)");

    ctx.globalAlpha = k;
    ctx.fillStyle   = g;
    ctx.beginPath();
    ctx.arc(decoy.x, decoy.y, rr * 5, 0, Math.PI * 2);
    ctx.fill();

    /* les ondes qui partent du leurre */
    ctx.strokeStyle = "#7bffca";
    ctx.lineWidth   = 2 * unit;

    for(let i = 0; i < 2; i++){

        const kk = ((decoy.t * .8 + i / 2) % 1);

        ctx.globalAlpha = k * (1 - kk) * .7;

        ctx.beginPath();
        ctx.arc(decoy.x, decoy.y, rr + kk * rr * 3.5, 0, Math.PI * 2);
        ctx.stroke();

    }

    /* le faux slime : la meme silhouette, en transparence */
    ctx.globalAlpha = k * .6;
    ctx.translate(decoy.x, decoy.y);

    const skin = SKINS.find(sk => sk.id === currentSkin) || SKINS[0];

    paintSkinSlime(ctx, skin, rr, gameTime, false, {blink:1});

    ctx.restore();
    ctx.globalAlpha = 1;

}


/* =========================================================
   LE COMBO

   Chaque piece ramassee sans se faire toucher fait monter
   le multiplicateur. Un coup encaisse remet tout a zero.
========================================================= */

const COMBO_STEPS = [
    {at:0,  mult:1},
    {at:5,  mult:2},
    {at:10, mult:3},
    {at:18, mult:4},
    {at:28, mult:5}
];

function comboMult(){

    let m = 1;

    for(const s of COMBO_STEPS){
        if(combo >= s.at){ m = s.mult; }
    }

    return m;

}


function comboUp(){

    const before = comboMult();

    combo++;
    comboTimer = 9;

    runCombo = Math.max(runCombo, combo);

    if(comboMult() > before){

        comboFlash = 1;

        pickupMessage("×" + comboMult() + " COMBO", "#ffd84d");

        sound(880, .1, "sine",     .04);
        sound(1320, .09, "triangle", .03);

        buzz(20);

    }

}


function comboBreak(){

    if(combo > 2){
        comboFlash = -1;
    }

    combo      = 0;
    comboTimer = 0;

}


function comboTick(dt){

    if(comboTimer > 0){

        comboTimer -= dt;

        if(comboTimer <= 0){
            combo = 0;
        }

    }

    if(comboFlash > 0){ comboFlash = Math.max(0, comboFlash - dt * 2); }
    if(comboFlash < 0){ comboFlash = Math.min(0, comboFlash + dt * 2); }

}


function drawCombo(){

    if(combo < 2 || !playing){
        return;
    }

    const m = comboMult();

    const a = playArea();

    const x = (a.x0 + a.x1) / 2;
    const y = a.y0 + 34 * unit;

    ctx.save();
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    const pop = 1 + Math.abs(comboFlash) * .35;

    ctx.translate(x, y);
    ctx.scale(pop, pop);

    ctx.font        = "bold " + Math.round(26 * unit) + "px Arial";
    ctx.fillStyle   = m >= 4 ? "#ff8a3d" : m >= 3 ? "#ffd84d" : "#9fe9ff";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur  = 18;

    ctx.fillText("×" + m, 0, 0);

    ctx.shadowBlur = 0;
    ctx.font       = "bold " + Math.round(10 * unit) + "px Arial";
    ctx.fillStyle  = "rgba(220,235,255,.75)";

    ctx.fillText(combo + " D'AFFILÉE", 0, 20 * unit);

    /* le temps qu'il reste avant que ca retombe */
    const k = Math.max(0, Math.min(1, comboTimer / 9));

    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(-30 * unit, 28 * unit, 60 * unit, 3 * unit);

    ctx.fillStyle = m >= 3 ? "#ffd84d" : "#9fe9ff";
    ctx.fillRect(-30 * unit, 28 * unit, 60 * unit * k, 3 * unit);

    ctx.restore();

}


/* =========================================================
   LE FROLEMENT

   Passer tout pres d'un danger sans le toucher ralentit le
   temps un instant. C'est la recompense de ceux qui jouent
   au plus juste au lieu de fuir.
========================================================= */

const GRAZE_MARGIN = 26;   /* en unites, au-dela du contact */
const GRAZE_COOL   = .5;   /* delai entre deux frolements comptes */

function grazeCheck(){

    if(!playing || slowMo > 0 || player.invincible > 0){
        return;
    }

    const margin = GRAZE_MARGIN * unit;

    const near = function(x, y, r){
        const d = Math.hypot(x - player.x, y - player.y);
        return d > r + player.r && d < r + player.r + margin;
    };

    let hit = false;

    for(const m of mimics){
        if(near(m.x, m.y, m.r)){ hit = true; break; }
    }

    if(!hit){
        for(const b of bossShots){
            if(near(b.x, b.y, b.r)){ hit = true; break; }
        }
    }

    if(!hit){
        for(const g of stunnableCreatures()){
            if(near(g.x, g.y, g.r)){ hit = true; break; }
        }
    }

    if(!hit){
        return;
    }

    /*
    Le temps ne ralentit plus : le frolement rapporte des
    points, rien de plus. Le ralenti rendait le jeu bien
    trop facile des qu'un ennemi approchait.
    */
    slowMo = GRAZE_COOL;

    runGraze++;

    score += 5 * comboMult();

    sound(1500, .05, "sine", .02);

}


function slowTick(dt){

    if(slowMo > 0){
        slowMo = Math.max(0, slowMo - dt);
    }

}


/* le frolement ne se voit plus a l'ecran : il compte, c'est tout */


/* =========================================================
   LES MISSIONS DU JOUR

   Trois objectifs tires au sort a partir de la date : tout
   le monde a les memes le meme jour, et ils changent a
   minuit.
========================================================= */

/* chaque mission rapporte entre 50 et 75 pieces */
const MISSIONS = [
    {id:"coins", min:20, max:55, step:5,   reward:55, txt:g => "Ramasse " + g + " pièces en une partie"},
    {id:"score", min:600, max:2400, step:200, reward:60, txt:g => "Fais " + g + " points en une partie"},
    {id:"world", min:2,  max:9,  step:1,   reward:75, txt:g => "Atteins le monde " + g},
    {id:"time",  min:60, max:180, step:30, reward:60, txt:g => "Survis " + g + " secondes"},
    {id:"combo", min:6,  max:20, step:2,   reward:65, txt:g => "Atteins un combo de " + g},
    {id:"nohit", min:40, max:110, step:10, reward:75, txt:g => "Survis " + g + " s sans perdre de vie"},
    {id:"graze", min:10, max:35, step:5,   reward:50, txt:g => "Frôle " + g + " fois un danger"}
];


function todayKey(){

    const d = new Date();

    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

}


/* un tirage stable : la meme date donne toujours les memes missions */
function dayRandom(seed){

    let h = 2166136261;

    for(let i = 0; i < seed.length; i++){
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }

    return function(){
        h ^= h << 13; h >>>= 0;
        h ^= h >> 17;
        h ^= h << 5;  h >>>= 0;
        return h / 4294967296;
    };

}


function buildDaily(){

    const key = todayKey();
    const rr  = dayRandom(key);

    const pool = MISSIONS.slice();
    const out  = [];

    for(let i = 0; i < 3 && pool.length; i++){

        const k = Math.floor(rr() * pool.length);
        const m = pool.splice(k, 1)[0];

        const steps = Math.floor((m.max - m.min) / m.step) + 1;
        const goal  = m.min + Math.floor(rr() * steps) * m.step;

        out.push({id:m.id, goal:goal, prog:0, done:false});

    }

    daily = {day:key, list:out};

    saveProgress();

}


function checkDaily(){

    if(!daily || daily.day !== todayKey() || !Array.isArray(daily.list)){
        buildDaily();
    }
}


function missionDef(id){
    return MISSIONS.find(m => m.id === id);
}


/* la valeur atteinte dans la partie en cours, pour chaque objectif */
function missionValue(id){

    if(id === "coins"){ return runCoins; }
    if(id === "score"){ return Math.floor(score); }
    if(id === "world"){ return runWorld; }
    if(id === "time") { return Math.floor(gameTime); }
    if(id === "combo"){ return runCombo; }
    if(id === "nohit"){ return Math.floor(runNoHit); }
    if(id === "graze"){ return runGraze; }

    return 0;

}


function missionTick(){

    if(!playing || laser.active || !daily){
        return;
    }

    let changed = false;

    for(const t of daily.list){

        if(t.done){
            continue;
        }

        const v = missionValue(t.id);

        if(v > t.prog){
            t.prog  = v;
            changed = true;
        }

        if(t.prog >= t.goal){

            t.done = true;

            const def = missionDef(t.id);

            totalCoins += def.reward;

            pickupMessage("✅ MISSION   +" + def.reward + " 🪙", "#61ff83");

            coinChime();
            buzz([25, 50, 25]);

            saveGame();

            changed = true;

        }

    }

    if(changed){
        saveProgress();
    }

}


function missionsLeft(){

    checkDaily();

    return daily.list.filter(t => !t.done).length;

}


function renderMissions(){

    checkDaily();

    const box = document.getElementById("missionList");

    if(!box){
        return;
    }

    box.innerHTML = "";

    for(const t of daily.list){

        const def = missionDef(t.id);
        const k   = Math.max(0, Math.min(1, t.prog / t.goal));

        const row = document.createElement("div");

        row.className = "missionRow" + (t.done ? " done" : "");

        const head = document.createElement("div");
        head.className = "missionHead";

        const name = document.createElement("b");
        name.textContent = def.txt(t.goal);

        const rw = document.createElement("span");
        rw.className = "missionReward";
        rw.innerHTML = t.done
            ? "✅"
            : '<i class="coinDot"></i> ' + def.reward;

        head.appendChild(name);
        head.appendChild(rw);
        row.appendChild(head);

        const track = document.createElement("div");
        track.className = "missionTrack";

        const fill = document.createElement("i");
        fill.style.width = (k * 100).toFixed(1) + "%";

        track.appendChild(fill);
        row.appendChild(track);

        const num = document.createElement("small");
        num.textContent = Math.min(t.prog, t.goal) + " / " + t.goal;
        row.appendChild(num);

        box.appendChild(row);

    }

    /* le compte a rebours jusqu'a minuit */
    const left = document.getElementById("missionClock");

    if(left){

        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const s   = Math.max(0, Math.floor((end - now) / 1000));

        left.textContent =
            "Nouvelles missions dans " +
            Math.floor(s / 3600) + " h " +
            String(Math.floor((s % 3600) / 60)).padStart(2, "0");

    }

}






/* =========================================================
   LE PROFIL DU JOUEUR

   Au tout premier lancement on demande un pseudo et un age,
   comme les gros jeux mobiles. Tout reste dans le telephone :
   rien n'est envoye nulle part.
========================================================= */

let profile = loadJSON("mimicProfile", null);

if(!profile || typeof profile !== "object"){
    profile = {name:"", age:0};
}

if(typeof profile.name !== "string"){ profile.name = ""; }
if(typeof profile.age  !== "number"){ profile.age  = 0;  }


function saveProfile(){
    try{ localStorage.setItem("mimicProfile", JSON.stringify(profile)); }catch(e){}
}


/* le nom affiche : le pseudo, ou un nom par defaut */
function playerName(){
    return profile.name || "JOUEUR";
}


/* =========================================================
   LES TROPHEES ET LES RANGS

   On ne gagne des trophees que dans les parties CLASSEES du
   mode rayon. Le rang, lui, se lit dans le nombre de
   trophees : pas de compteur cache.
========================================================= */

const RANKS = [
    {tr:0,   name:"BOIS",     ic:"🪵", col:"#b98a5a"},
    {tr:50,  name:"BRONZE",   ic:"🥉", col:"#d08b4a"},
    {tr:120, name:"ARGENT",   ic:"🥈", col:"#cfd8e8"},
    {tr:220, name:"OR",       ic:"🥇", col:"#ffd76a"},
    {tr:350, name:"DIAMANT",  ic:"💎", col:"#7bf0ff"},
    {tr:500, name:"MAÎTRE",   ic:"👑", col:"#c86aff"},
    {tr:700, name:"LÉGENDE",  ic:"🔥", col:"#ff7a2a"}
];

let rank = loadJSON("mimicRank", null);

if(!rank || typeof rank !== "object"){
    rank = {tr:0, best:0, wins:0, games:0};
}

if(typeof rank.tr    !== "number"){ rank.tr    = 0; }
if(typeof rank.best  !== "number"){ rank.best  = 0; }
if(typeof rank.wins  !== "number"){ rank.wins  = 0; }
if(typeof rank.games !== "number"){ rank.games = 0; }


function saveRank(){
    try{ localStorage.setItem("mimicRank", JSON.stringify(rank)); }catch(e){}
}


function rankOf(tr){

    let out = RANKS[0];

    for(const r of RANKS){
        if(tr >= r.tr){ out = r; }
    }

    return out;

}


/* le rang juste au-dessus, ou null si on est au sommet */
function rankNext(tr){

    for(const r of RANKS){
        if(tr < r.tr){ return r; }
    }

    return null;

}


/*
Ce que rapporte une place. Le premier monte, le dernier
descend, et au milieu on bouge peu. En dessous de 50
trophees on ne perd presque rien : on apprend encore.
*/
function trophyDelta(place, total){

    if(total < 2){
        return 0;
    }

    const k = (total - place) / (total - 1);   /* 1 pour le premier, 0 pour le dernier */

    let d = Math.round(-6 + k * 16);

    if(d < 0 && rank.tr < 50){
        d = Math.max(d, -2);
    }

    if(rank.tr + d < 0){
        d = -rank.tr;
    }

    return d;

}


function paintRankPill(){

    const pill = document.getElementById("rankPillTxt");
    const ic   = document.getElementById("rankPillIcon");
    const nm   = document.getElementById("namePillTxt");

    const r = rankOf(rank.tr);

    if(pill){ pill.textContent = rank.tr; }
    if(ic){   ic.textContent   = r.ic;    }
    if(nm){   nm.textContent   = playerName(); }

}


function renderRank(){

    const r   = rankOf(rank.tr);
    const nx  = rankNext(rank.tr);

    const ic  = document.getElementById("rankBigIcon");
    const nm  = document.getElementById("rankBigName");
    const tr  = document.getElementById("rankBigTro");

    if(ic){ ic.textContent = r.ic; }

    if(nm){
        nm.textContent = r.name;
        nm.style.color = r.col;
    }

    if(tr){
        tr.textContent =
            rank.tr + " trophées   ·   record " + Math.max(rank.best, rank.tr) +
            "   ·   " + rank.wins + " victoire" + (rank.wins > 1 ? "s" : "") +
            " sur " + rank.games;
    }

    const fill = document.getElementById("rankNextFill");
    const txt  = document.getElementById("rankNextTxt");

    if(nx){

        const span = nx.tr - r.tr;
        const done = rank.tr - r.tr;

        if(fill){ fill.style.width = (Math.max(0, Math.min(1, done / span)) * 100).toFixed(1) + "%"; }
        if(txt){  txt.textContent  = (nx.tr - rank.tr) + " trophées avant " + nx.name; }

    }else{

        if(fill){ fill.style.width = "100%"; }
        if(txt){  txt.textContent  = "Tu es au sommet. Bien joué."; }

    }

    const box = document.getElementById("rankLadder");

    if(!box){
        return;
    }

    box.innerHTML = "";

    RANKS.forEach((rr, i) => {

        const nxt = RANKS[i + 1];

        const here = rank.tr >= rr.tr && (!nxt || rank.tr < nxt.tr);
        const past = nxt && rank.tr >= nxt.tr;

        const row = document.createElement("div");
        row.className = "rankRow" + (here ? " on" : past ? " done" : "");

        const em = document.createElement("span");
        em.className   = "ic";
        em.textContent = rr.ic;

        const b = document.createElement("b");
        b.textContent = rr.name;
        b.style.color = rr.col;

        const sm = document.createElement("small");
        sm.textContent = nxt ? rr.tr + " – " + (nxt.tr - 1) : rr.tr + " et plus";

        row.appendChild(em);
        row.appendChild(b);
        row.appendChild(sm);

        box.appendChild(row);

    });

    /* on amene le rang courant sous les yeux */
    setTimeout(function(){

        const cur = box.querySelector(".rankRow.on");

        if(cur){
            try{ box.scrollTop = Math.max(0, cur.offsetTop - 10); }catch(e){}
        }

    }, 30);

}


function openRank(){
    renderRank();
    document.getElementById("rankScreen").style.display = "flex";
}


/* =========================================================
   L'ECRAN DE BIENVENUE
========================================================= */

let helloAge = 0;


function buildAgeGrid(){

    const box = document.getElementById("ageGrid");

    if(!box || box.children.length){
        return;
    }

    /* de 5 a 17, puis "18 et plus" */
    const list = [];

    for(let a = 5; a <= 17; a++){
        list.push(a);
    }

    list.push(18);

    list.forEach(a => {

        const b = document.createElement("button");

        b.className   = "ageBtn";
        b.textContent = a === 18 ? "18+" : a;

        b.onclick = () => {

            helloAge = a;

            for(const c of box.children){
                c.classList.remove("on");
            }

            b.classList.add("on");

            sound(660, .08, "triangle", .05);

            /* on ferme tout de suite : un choix, c'est fini */
            setTimeout(finishHello, 220);

        };

        box.appendChild(b);

    });

}


function openHello(edit){

    buildAgeGrid();

    const input = document.getElementById("helloName");

    input.value = profile.name || "";

    helloAge = profile.age || 0;

    document.getElementById("helloNameWarn").textContent = "";

    document.getElementById("helloStep1").className = "helloStep on";
    document.getElementById("helloStep2").className = "helloStep";

    /* quand on modifie son profil, l'age deja choisi est mis en avant */
    const box = document.getElementById("ageGrid");

    for(const c of box.children){
        c.classList.toggle("on",
            (helloAge === 18 && c.textContent === "18+") || c.textContent === String(helloAge));
    }

    document.getElementById("helloScreen").style.display = "flex";

    setTimeout(() => { try{ input.focus(); }catch(e){} }, 120);

}


function finishHello(){

    const typed = document.getElementById("helloName").value.trim();

    profile.name = typed.slice(0, 12) || "JOUEUR";
    profile.age  = helloAge || profile.age || 0;

    saveProfile();

    paintRankPill();

    document.getElementById("helloScreen").style.display = "none";

    sound(760, .16, "triangle", .05);

}


/* =========================================================
   LA PASSE DE COMBAT

   Une longue piste de paliers. Chaque partie remplit la
   barre, et chaque palier franchi donne sa recompense tout
   seul : pas de bouton a chercher.
========================================================= */

const PASS_STEP = 700;   /* experience par palier */

const PASS_REWARDS = [
    {coins:100},
    {ability:"dash",     n:1},
    {coins:120},
    {ability:"bouclier", n:1},
    {coins:200},
    {ability:"onde",     n:1},
    {coins:120},
    {ability:"leurre",   n:1},
    {coins:150},
    {coins:300},
    {ability:"dash",     n:2},
    {coins:150},
    {ability:"bouclier", n:2},
    {coins:180},
    {ability:"onde",     n:2},
    {coins:200},
    {ability:"leurre",   n:2},
    {coins:220},
    {coins:250},
    {coins:500, all:3}
];

let pass = loadJSON("mimicPass", null);

if(!pass || typeof pass !== "object"){
    pass = {xp:0, claimed:0, seen:0};
}

if(typeof pass.xp      !== "number"){ pass.xp = 0; }
if(typeof pass.claimed !== "number"){ pass.claimed = 0; }
if(typeof pass.seen    !== "number"){ pass.seen = 0; }


function savePass(){
    try{ localStorage.setItem("mimicPass", JSON.stringify(pass)); }catch(e){}
}


/* le palier atteint, de 0 a PASS_REWARDS.length */
function passTier(){
    return Math.min(PASS_REWARDS.length, Math.floor(pass.xp / PASS_STEP));
}


/* la part du palier en cours, de 0 a 1 */
function passProgress(){

    if(passTier() >= PASS_REWARDS.length){
        return 1;
    }

    return (pass.xp % PASS_STEP) / PASS_STEP;

}


function passRewardText(r){

    if(!r){
        return "";
    }

    if(r.all){
        return r.coins + " 🪙  +  " + r.all + " charges de chaque";
    }

    if(r.ability){
        const ab = ABILITIES.find(a => a.id === r.ability);
        return (ab ? ab.name : r.ability) + "  ×" + r.n;
    }

    return r.coins + " pièces";

}


function grantPassReward(r){

    if(r.coins){
        totalCoins += r.coins;
    }

    if(r.ability){
        abilityStock[r.ability] = abilityCount(r.ability) + r.n;
    }

    if(r.all){
        for(const ab of ABILITIES){
            abilityStock[ab.id] = abilityCount(ab.id) + r.all;
        }
    }

    saveGame();

}


/* appelee des qu'on gagne de l'experience */
function passAdd(n){

    if(n <= 0){
        return;
    }

    pass.xp += Math.round(n);

    const tier = passTier();

    /* on donne tous les paliers franchis, meme plusieurs d'un coup */
    while(pass.claimed < tier){

        const r = PASS_REWARDS[pass.claimed];

        pass.claimed++;

        grantPassReward(r);

        const lvl = pass.claimed;

        setTimeout(function(){
            pickupMessage("🎖 PALIER " + lvl + "   " + passRewardText(r), "#ffd76a");
            coinChime();
        }, 600 * (lvl - tier + 1));

        buzz([30, 60, 30]);

    }

    savePass();

}


function passNew(){
    return passTier() > pass.seen;
}


/*
Ce qu'on montre sur la carte : une icone, un montant, et le
nom en petit. Les pieces, une capacite, ou le gros lot.
*/
function passRewardCard(r){

    if(!r){
        return {ic:"?", amt:"", sub:""};
    }

    if(r.all){
        return {ic:"🏆", amt:r.coins + " 🪙", sub:"+" + r.all + " DE CHAQUE"};
    }

    if(r.ability){

        const ab = ABILITIES.find(a => a.id === r.ability);

        return {
            ic:  ab ? ab.icon : "✨",
            amt: "×" + r.n,
            sub: ab ? ab.name : r.ability
        };

    }

    return {ic:"🪙", amt:String(r.coins), sub:"PIÈCES"};

}


function renderPass(){

    const box = document.getElementById("passList");

    if(!box){
        return;
    }

    pass.seen = passTier();
    savePass();

    const done  = passTier();
    const total = PASS_REWARDS.length;

    const badge = document.getElementById("passTierNum");

    if(badge){
        badge.textContent = done;
    }

    const head = document.getElementById("passHead");

    if(head){

        head.textContent = done >= total
            ? "PASSE TERMINÉE — TOUT EST À TOI"
            : (PASS_STEP - (pass.xp % PASS_STEP)) + " XP AVANT LE PALIER " + (done + 1);

    }

    const fill = document.getElementById("passFill");

    if(fill){
        fill.style.width = (passProgress() * 100).toFixed(1) + "%";
    }

    box.innerHTML = "";

    PASS_REWARDS.forEach((r, i) => {

        const n    = i + 1;
        const got  = n <= done;
        const now  = n === done + 1;
        const big  = (n % 5 === 0) || n === total;

        const stop = document.createElement("div");

        stop.className =
            "passStop" +
            (got ? " got" : now ? " now" : " locked") +
            (big ? " big" : "");

        const card = document.createElement("div");
        card.className = "passCard";

        const info = passRewardCard(r);

        const ic = document.createElement("span");
        ic.className   = "ic";
        ic.textContent = info.ic;

        const amt = document.createElement("span");
        amt.className   = "amt";
        amt.textContent = info.amt;

        const sub = document.createElement("span");
        sub.className   = "sub";
        sub.textContent = info.sub;

        card.appendChild(ic);
        card.appendChild(amt);
        card.appendChild(sub);

        const node = document.createElement("i");
        node.className   = "passNode";
        node.textContent = n;

        stop.appendChild(card);
        stop.appendChild(node);

        box.appendChild(stop);

    });

    /* on amene le palier en cours sous les yeux, au milieu */
    setTimeout(function(){

        const cur = box.querySelector(".passStop.now") ||
                    box.querySelector(".passStop:last-child");

        if(cur){
            try{
                box.scrollLeft = cur.offsetLeft - box.clientWidth / 2 + cur.offsetWidth / 2;
            }catch(e){}
        }

    }, 30);

}


/* =========================================================
   LA BOUTIQUE DU JOUR

   Trois skins tires au sort parmi tous, et le cadeau
   quotidien. Comme les missions, le tirage vient de la
   date : la boutique est la meme pour tout le monde et
   change a minuit.
========================================================= */

const SHOP_PICKS = 3;
const GIFT_COINS = 25;

let shopDay = loadJSON("mimicShopDay", null);
let giftDay = localStorage.getItem("mimicGift") || "";


function buildShopDay(){

    const key = todayKey();
    const rr  = dayRandom(key + "-boutique");

    /* les skins de recompense ne s'achetent pas : ils restent dehors */
    const pool = SKINS.filter(sk => !sk.exclusive && sk.price > 0);

    const ids = [];

    for(let i = 0; i < SHOP_PICKS && pool.length; i++){
        const k = Math.floor(rr() * pool.length);
        ids.push(pool.splice(k, 1)[0].id);
    }

    shopDay = {day:key, ids:ids};

    try{ localStorage.setItem("mimicShopDay", JSON.stringify(shopDay)); }catch(e){}

}


function checkShopDay(){

    if(!shopDay || shopDay.day !== todayKey() || !Array.isArray(shopDay.ids)){
        buildShopDay();
    }

}


function dailySkins(){

    checkShopDay();

    return shopDay.ids
        .map(id => SKINS.find(sk => sk.id === id))
        .filter(Boolean);

}


function giftReady(){
    return giftDay !== todayKey();
}


function claimGift(){

    if(!giftReady()){
        return;
    }

    giftDay = todayKey();

    try{ localStorage.setItem("mimicGift", giftDay); }catch(e){}

    totalCoins += GIFT_COINS;

    saveGame();

    coinChime();
    buzz([25, 50, 25]);

    pickupMessage("🎁 +" + GIFT_COINS + " 🪙", "#ffd84d");

    renderShop();

}


/* le temps qu'il reste avant le prochain renouvellement */
function untilMidnight(){

    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s   = Math.max(0, Math.floor((end - now) / 1000));

    return Math.floor(s / 3600) + " h " +
           String(Math.floor((s % 3600) / 60)).padStart(2, "0");

}


/* la carte du cadeau, en tete de la boutique */
function giftCard(){

    const box = document.getElementById("shopGift");

    if(!box){
        return;
    }

    if(!shopInStore){
        box.style.display = "none";
        return;
    }

    box.style.display = "flex";

    const ready = giftReady();

    box.classList.toggle("taken", !ready);

    box.innerHTML =
        '<span class="giftIcon">🎁</span>' +
        '<span class="giftTxt">' +
            '<b>CADEAU DU JOUR</b>' +
            '<small>' +
                (ready
                    ? GIFT_COINS + " pièces offertes"
                    : "Reviens dans " + untilMidnight()) +
            '</small>' +
        '</span>' +
        '<button class="giftBtn"' + (ready ? "" : " disabled") + '>' +
            (ready ? '<i class="coinDot"></i> +' + GIFT_COINS : "✅") +
        '</button>';

    const btn = box.querySelector(".giftBtn");

    if(btn && ready){
        btn.onclick = claimGift;
    }

}




/* =========================================================
   LA PUBLICITE RECOMPENSEE

   Un seul endroit dans tout le jeu appelle une regie : la
   fonction showAd(). Sur le web elle simule ; dans
   l'application Android elle passe par AdMob si le module
   est present. Le reste du jeu n'a pas a savoir lequel.
========================================================= */

const AD_REWARD  = 100;   /* pieces gagnees par pub regardee */
const AD_MAX_DAY = 3;     /* pubs par jour au maximum        */

let ads = loadJSON("mimicAds", null);

if(!ads || typeof ads !== "object"){
    ads = {day:"", n:0};
}


function adsCheck(){

    if(ads.day !== todayKey()){
        ads.day = todayKey();
        ads.n   = 0;
        saveAds();
    }

}


function saveAds(){
    try{ localStorage.setItem("mimicAds", JSON.stringify(ads)); }catch(e){}
}


function adsLeft(){
    adsCheck();
    return Math.max(0, AD_MAX_DAY - ads.n);
}


/*
Le seul point de contact avec une regie publicitaire.

Pour brancher AdMob dans l'application Android, il suffit de
remplacer le corps de cette fonction par l'appel du module
@capacitor-community/admob (voir README-ANDROID.md). Elle doit
appeler donne(true) si la pub a ete regardee jusqu'au bout,
et donne(false) sinon.
*/
function showAd(donne){

    /* --- 1. l'application Android, si AdMob est branche --- */
    const admob = window.Capacitor &&
                  window.Capacitor.Plugins &&
                  window.Capacitor.Plugins.AdMob;

    if(admob && typeof admob.prepareRewardVideoAd === "function"){

        admob.prepareRewardVideoAd({
            adId:AD_UNIT_REWARD,
            isTesting:AD_TESTING
        })
        .then(function(){ return admob.showRewardVideoAd(); })
        .then(function(){ donne(true); })
        .catch(function(err){
            mimicReport(err, "pub");
            donne(false);
        });

        return;

    }

    /* --- 2. sur le web : on simule, pour pouvoir tester --- */
    adFake(donne);

}


/* l'identifiant du bloc AdMob : a remplacer par le tien */
const AD_UNIT_REWARD = "ca-app-pub-3940256099942544/5224354917";
const AD_TESTING     = true;


/* la fausse pub : cinq secondes, un compte a rebours, et c'est tout */
function adFake(donne){

    const el = document.getElementById("adScreen");

    if(!el){
        donne(false);
        return;
    }

    let n = 5;

    const num = document.getElementById("adCount");

    num.textContent = n;

    el.style.display = "flex";

    const tick = setInterval(function(){

        n--;

        num.textContent = n;

        if(n <= 0){

            clearInterval(tick);

            el.style.display = "none";

            donne(true);

        }

    }, 1000);

}


function watchAd(){

    if(adsLeft() <= 0){
        return;
    }

    showAd(function(ok){

        if(!ok){
            pickupMessage("Pub interrompue", "#8fa0c8");
            return;
        }

        ads.n++;
        saveAds();

        totalCoins += AD_REWARD;

        saveGame();
        coinChime();
        buzz([25, 50, 25]);

        pickupMessage("📺 +" + AD_REWARD + " 🪙", "#ffd84d");

        renderShop();

    });

}


/* la carte de la pub, sous le cadeau du jour */
function adCard(){

    const box = document.getElementById("shopAd");

    if(!box){
        return;
    }

    if(!shopInStore){
        box.style.display = "none";
        return;
    }

    const left = adsLeft();

    box.style.display = "flex";

    box.classList.toggle("taken", left <= 0);

    box.innerHTML =
        '<span class="giftIcon">📺</span>' +
        '<span class="giftTxt">' +
            '<b>REGARDER UNE PUB</b>' +
            '<small>' +
                (left > 0
                    ? AD_REWARD + " pièces  ·  " + left + " restantes aujourd'hui"
                    : "Reviens dans " + untilMidnight()) +
            '</small>' +
        '</span>' +
        '<button class="giftBtn"' + (left > 0 ? "" : " disabled") + '>' +
            (left > 0 ? '<i class="coinDot"></i> +' + AD_REWARD : "✅") +
        '</button>';

    const btn = box.querySelector(".giftBtn");

    if(btn && left > 0){
        btn.onclick = watchAd;
    }

}


/* =========================================================
   LES RECORDS
========================================================= */

/*
Un monde ne se debloque qu'en y arrivant PAR LE PORTAIL,
c'est-a-dire en ayant fini le precedent. Un entrainement ou
un code secret te laisse jouer, mais n'ouvre rien de plus.
*/
let byPortal = false;

function worldUnlocked(zoneId){
    return zoneId === "cyber" || worldsSeen.indexOf(zoneId) >= 0;
}

function noteWorld(zoneId){

    /*
    Chaque monde couvre exactement sa tranche de niveaux. En
    arrivant, on cale le niveau sur son debut : la barre de
    progression repart bien de zero, et le portail suivant
    est toujours a la meme distance — meme si on a fini le
    monde precedent en avance (le boss, par exemple).
    */
    const w = WORLDS.find(x => x.zone === zoneId);

    if(w){
        level = w.from;
    }

    if(byPortal && worldsSeen.indexOf(zoneId) < 0){

        worldsSeen.push(zoneId);
        saveProgress();

        const wd = WORLDS.find(w => w.zone === zoneId);

        if(wd){
            setTimeout(function(){
                pickupMessage("🔓 MONDE " + wd.n + " DÉBLOQUÉ", wd.col);
            }, 2200);
        }

    }

    const wd = WORLDS.find(w => w.zone === zoneId);

    if(wd){
        runWorld = Math.max(runWorld, wd.n);
    }

}


function noteRecords(){

    const wd  = currentWorld();
    const fin = Math.floor(score);

    if(!records.best[wd.zone] || fin > records.best[wd.zone]){
        records.best[wd.zone] = fin;
    }

    if(gameTime > (records.bestTime || 0)){
        records.bestTime = Math.floor(gameTime);
    }

    saveProgress();

}


function renderRecords(){

    const box = document.getElementById("recordList");

    if(!box){
        return;
    }

    box.innerHTML = "";

    for(const wd of WORLDS){

        const row = document.createElement("div");
        row.className = "recRow";

        const seen = worldsSeen.indexOf(wd.zone) >= 0;

        const n = document.createElement("b");
        n.textContent   = "MONDE " + wd.n + "  " + wd.name;
        n.style.color   = seen ? wd.col : "#5f6f97";

        const v = document.createElement("span");
        v.textContent = seen ? (records.best[wd.zone] || 0) : "—";

        row.appendChild(n);
        row.appendChild(v);

        box.appendChild(row);

    }

    const extra = document.createElement("div");
    extra.className = "recRow top";

    const et = document.createElement("b");
    et.textContent = "⏱ PLUS LONGUE SURVIE";

    const ev = document.createElement("span");
    ev.textContent = (records.bestTime || 0) + " s";

    extra.appendChild(et);
    extra.appendChild(ev);
    box.appendChild(extra);

    const bo = document.createElement("div");
    bo.className = "recRow";

    const bt = document.createElement("b");
    bt.textContent   = "👁 L'ŒIL DU NÉANT";
    bt.style.color   = records.boss ? "#c86aff" : "#5f6f97";

    const bv = document.createElement("span");
    bv.textContent = records.boss ? "VAINCU × " + records.boss : "jamais vaincu";

    bo.appendChild(bt);
    bo.appendChild(bv);
    box.appendChild(bo);

}


/* =========================================================
   PARTAGE
========================================================= */

function shareScore(){

    const txt =
        "J'ai fait " + bestScore + " points dans MIMIC (niveau " +
        playerLevel() + ") — " + location.origin + location.pathname;

    const done = function(){
        pickupMessage("📋 COPIÉ", "#61ff83");
        sound(880, .09, "sine", .04);
    };

    if(navigator.share){

        navigator.share({title:"MIMIC", text:txt}).catch(() => {});

        return;

    }

    if(navigator.clipboard){
        navigator.clipboard.writeText(txt).then(done, () => {});
        return;
    }

    done();

}


/* =========================================================
   MONDE 5 : LE NÉANT

   Un dernier portail, et plus rien autour : une salle vide
   ou flotte L'OEIL DU NEANT. Il ne se tue pas, il s'use :
   sa jauge descend tant que tu tiens debout, et remonte a
   chaque fois qu'il te touche.
========================================================= */

const BOSS_TIME  = 78;    /* secondes de survie pour le vaincre */
const BOSS_PUNCH = .05;   /* ce qu'il regagne quand il te touche */

const BOSS_PHASES = [
    {name:"SALVES", col:"#c86aff"},
    {name:"FAUX",   col:"#ff5f8f"},
    {name:"TRAQUE", col:"#ff3a52"}
];


function currentWorld(){
    return WORLDS.find(w => w.zone === zone) || WORLDS[0];
}


/* 0 a 1 : ou en es-tu dans le monde courant */
function worldProgress(){

    const wd = currentWorld();

    /* dans le NEANT, la progression c'est l'usure du boss */
    if(wd.zone === "neant"){
        return boss ? 1 - boss.hp : 1;
    }

    if(!wd.to){
        return 1;
    }

    return Math.max(0, Math.min(1, (level - wd.from) / (wd.to - wd.from)));

}


function paintProgress(text, k, col){

    const nameEl = document.getElementById("worldName");
    const fillEl = document.getElementById("progFill");

    if(nameEl){
        nameEl.textContent = text;
        nameEl.style.color = col;
    }

    if(fillEl){
        fillEl.style.width      = (Math.max(0, Math.min(1, k)) * 100).toFixed(1) + "%";
        fillEl.style.background = "linear-gradient(90deg," + col + ",#ffffff)";
    }

}


/* --- le decor : le vide, et ce qui y tourne --- */
function paintVoid(c){

    c.fillStyle = "#05030c";
    c.fillRect(0, 0, W, H);

    /* la nebuleuse violette qui respire au centre */
    const neb = c.createRadialGradient(
        W / 2, H * .42, 0,
        W / 2, H * .42, Math.max(W, H) * .62
    );
    neb.addColorStop(0,   "rgba(120,60,220,.22)");
    neb.addColorStop(.45, "rgba(70,25,140,.12)");
    neb.addColorStop(1,   "rgba(20,5,40,0)");

    c.fillStyle = neb;
    c.fillRect(0, 0, W, H);

    /* les anneaux de runes graves dans le fond */
    c.save();
    c.translate(W / 2, H * .45);

    for(let i = 0; i < 4; i++){

        const rr = Math.min(W, H) * (.28 + i * .17);

        c.strokeStyle = "rgba(150,100,255,.13)";
        c.lineWidth   = 1.4 * unit;

        c.beginPath();
        c.arc(0, 0, rr, 0, Math.PI * 2);
        c.stroke();

        /* les crans sur l'anneau */
        c.strokeStyle = "rgba(190,150,255,.20)";
        c.lineWidth   = 2.2 * unit;

        for(let k = 0; k < 24; k++){

            const a = (k / 24) * Math.PI * 2 + i * .3;

            c.beginPath();
            c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
            c.lineTo(Math.cos(a) * (rr + 9 * unit), Math.sin(a) * (rr + 9 * unit));
            c.stroke();

        }

    }

    c.restore();

    /* la poussiere d'etoiles */
    for(let i = 0; i < Math.round(W * H / 3400); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = (.5 + Math.random() * 1.5) * unit;

        c.globalAlpha = .3 + Math.random() * .6;
        c.fillStyle   = Math.random() < .2 ? "#d8b0ff" : "#ffffff";

        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();

    }

    c.globalAlpha = 1;

    /* le vide se referme sur les bords */
    const vig = c.createRadialGradient(
        W / 2, H * .45, Math.min(W, H) * .18,
        W / 2, H / 2, Math.max(W, H) * .72
    );

    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,.88)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


function enterVoid(){

    zone = "neant";

    portal = null;

    solids  = [];
    orbs    = [];
    coins   = [];
    hearts  = [];
    balls   = [];
    slimes  = [];
    trails  = [];
    mimics  = [];
    archers = [];
    blobs   = [];
    puddles = [];
    logs    = [];
    crawlers = [];
    drips   = [];
    candies = [];
    gloutons = [];
    guimauves = [];
    anguilles = [];
    lanternes = [];
    bulles    = [];

    trace       = [];
    traceLength = 0;

    const a = playArea();

    player.x = (a.x0 + a.x1) / 2;
    player.y = (a.y0 + a.y1) * .72;

    player.invincible = 3;

    bossShots   = [];
    bossBeams   = [];
    voidCleared = false;

    boss = {
        x:(a.x0 + a.x1) / 2,
        y:(a.y0 + a.y1) * .34,
        r:Math.min(W, H) * .12,
        hp:1,
        phase:0,
        t:0,
        fire:2.4,
        spiral:0,
        charge:0,
        shake:0,
        tele:5,
        dead:0,
        gaze:0
    };

    coins  = [];
    orbs   = [];
    hearts = [];

    noteWorld("neant");

    worldBanner("neant", "👁");

    sound(60, 1.4, "sine",     .08);
    sound(92, 1.0, "sawtooth", .04);

}


/* =========================================================
   L'OEIL : ses trois façons d'attaquer
========================================================= */

function bossPhase(){

    if(!boss){
        return 0;
    }

    return boss.hp > .66 ? 0 : boss.hp > .33 ? 1 : 2;

}


function bossShot(x, y, ang, speed, r, col){

    bossShots.push({
        x:x, y:y,
        vx:Math.cos(ang) * speed,
        vy:Math.sin(ang) * speed,
        r:r,
        col:col,
        life:9,
        ph:rnd() * 6.28
    });

}


function bossSalvo(){

    const n   = 14;
    const gap = Math.floor(rnd() * n);
    const off = rnd() * 6.28;

    /*
    Deux trous de deux crans, opposes : assez larges pour
    qu'on les voie venir et qu'on ait le temps de s'y placer.
    */
    const holes = [gap, (gap + 1) % n, (gap + 7) % n, (gap + 8) % n];

    for(let i = 0; i < n; i++){

        if(holes.indexOf(i) >= 0){
            continue;
        }

        bossShot(
            boss.x, boss.y,
            off + (i / n) * Math.PI * 2,
            104 * unit,
            9 * unit,
            "#c86aff"
        );

    }

    sound(150, .3, "sawtooth", .045);

}


/*
Toutes les faux tournent dans LE MEME sens et restent a
egale distance : elles forment une croix qui pivote, et
il suffit de marcher avec elle. En sens contraire, les
deux lames se refermaient en ciseaux et il n'y avait
aucune sortie.
*/
function bossSetBeams(count, spin){

    bossBeams = [];

    const way = rnd() < .5 ? -1 : 1;

    for(let i = 0; i < count; i++){
        bossBeams.push({
            a:(i / count) * Math.PI * 2,
            spin:spin * way,
            grow:0
        });
    }

}


function bossTeleport(){

    const a = playArea();

    /* jamais sur le joueur : il doit rester une chance de lire */
    for(let tries = 0; tries < 24; tries++){

        const x = a.x0 + boss.r + rnd() * Math.max(1, (a.x1 - a.x0) - boss.r * 2);
        const y = a.y0 + boss.r + rnd() * Math.max(1, (a.y1 - a.y0) - boss.r * 2);

        if(Math.hypot(x - player.x, y - player.y) > boss.r * 2.6){

            burst(boss.x, boss.y, 20, "#c86aff");

            boss.x = x;
            boss.y = y;

            burst(boss.x, boss.y, 20, "#ff5f8f");

            /*
            Les lames repartent de leur trait fin : sinon une
            faux pouvait reapparaitre pile sur toi apres un
            saut, sans le moindre avertissement.
            */
            for(const bm of bossBeams){
                bm.grow = 0;
            }

            sound(320, .18, "sine", .04);

            return;

        }

    }

}


function updateBoss(dt){

    if(zone !== "neant"){

        if(boss || bossShots.length || bossBeams.length){
            boss = null;
            bossShots = [];
            bossBeams = [];
        }

        return;

    }

    const area = playArea();

    /* ---- les projectiles vivent meme apres la mort de l'oeil ---- */
    for(const b of bossShots){

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        b.life -= dt;
        b.ph   += dt * 6;

        if(player.invincible <= 0 && Math.hypot(b.x - player.x, b.y - player.y) < b.r + player.r){

            b.life = 0;

            loseLife(null);

            if(boss){
                boss.hp = Math.min(1, boss.hp + BOSS_PUNCH);
            }

        }

    }

    bossShots = bossShots.filter(b =>
        b.life > 0 &&
        b.x > area.x0 - 60 && b.x < area.x1 + 60 &&
        b.y > area.y0 - 60 && b.y < area.y1 + 60
    );

    if(!boss){
        bossBeams = [];
        return;
    }

    boss.t     += dt;
    boss.gaze  += dt;
    boss.shake  = Math.max(0, boss.shake - dt * 3);
    boss.charge = Math.max(0, boss.charge - dt * 2);

    /* ---- l'agonie ---- */
    if(boss.dead > 0){

        boss.dead -= dt;

        if(rnd() < dt * 14){
            burst(
                boss.x + (rnd() - .5) * boss.r * 1.6,
                boss.y + (rnd() - .5) * boss.r * 1.6,
                10, rnd() < .5 ? "#c86aff" : "#ffffff"
            );
        }

        if(boss.dead <= 0){

            burst(boss.x, boss.y, 60, "#ffffff");
            burst(boss.x, boss.y, 40, "#c86aff");

            sound(70, 1.6, "sine", .09);

            boss      = null;
            bossShots = [];
            bossBeams = [];

            pickupMessage("👁 L'ŒIL DU NÉANT EST BRISÉ", "#ffffff");

            records.boss = (records.boss || 0) + 1;
            saveProgress();

            /* le monde 5 est termine : la sortie s'ouvre */
            voidCleared = true;

            buzz([60, 80, 60, 80, 120]);

            unlockExclusive("neant");

        }

        return;

    }

    /* ---- l'usure ---- */
    boss.hp -= dt / BOSS_TIME;

    if(boss.hp <= 0){
        boss.hp   = 0;
        boss.dead = 2.2;
        bossBeams = [];
        return;
    }

    const ph = bossPhase();

    if(ph !== boss.phase){

        boss.phase = ph;
        boss.fire  = 1.2;
        boss.shake = 1;

        bossBeams = [];

        pickupMessage("⚠️ " + BOSS_PHASES[ph].name, BOSS_PHASES[ph].col);

        sound(110, .5, "square", .05);

    }

    /* ---- les attaques ---- */
    if(ph === 0){

        boss.fire -= dt;

        if(boss.fire < .55 && boss.charge <= 0){
            boss.charge = 1;
        }

        if(boss.fire <= 0){
            bossSalvo();
            boss.fire = 2.4;
        }

    }else if(ph === 1){

        if(!bossBeams.length){
            bossSetBeams(2, .40);
        }

        boss.fire -= dt;

        if(boss.fire <= 0){

            /* un tir vise, pour empecher de camper */
            bossShot(
                boss.x, boss.y,
                Math.atan2(player.y - boss.y, player.x - boss.x),
                155 * unit, 8 * unit, "#ff5f8f"
            );

            boss.fire = 2.1;

        }

    }else{

        if(!bossBeams.length){
            /* trois lames : elles tournent bien plus lentement que deux */
            bossSetBeams(3, .34);
        }

        boss.tele -= dt;

        if(boss.tele <= 0){
            bossTeleport();
            boss.tele = 6.5;
        }

        /* la spirale, continue */
        boss.spiral += dt * 3.0;
        boss.fire   -= dt;

        if(boss.fire <= 0){

            for(let i = 0; i < 2; i++){
                bossShot(
                    boss.x, boss.y,
                    boss.spiral + i * Math.PI,
                    122 * unit, 8 * unit, "#ff3a52"
                );
            }

            boss.fire = .30;

        }

    }

    /* ---- les faux qui balaient ---- */
    const reach = Math.hypot(W, H);

    for(const bm of bossBeams){

        bm.a    += bm.spin * dt;
        /* le trait fin dure plus longtemps : on a le temps de lire */
        bm.grow  = Math.min(1, bm.grow + dt * 1.35);

        if(player.invincible > 0 || bm.grow < .8){
            continue;
        }

        /* distance du joueur a la demi-droite */
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;

        const proj = dx * Math.cos(bm.a) + dy * Math.sin(bm.a);

        if(proj < boss.r * .6 || proj > reach){
            continue;
        }

        const perp = Math.abs(-dx * Math.sin(bm.a) + dy * Math.cos(bm.a));

        if(perp < 8 * unit + player.r * .5){

            loseLife(null);

            boss.hp    = Math.min(1, boss.hp + BOSS_PUNCH);
            boss.shake = 1;

        }

    }

    /* ---- l'oeil derive lentement ---- */
    if(ph < 2){

        boss.x += Math.sin(boss.t * .45) * 26 * unit * dt;
        boss.y += Math.cos(boss.t * .33) * 16 * unit * dt;

        boss.x = Math.max(area.x0 + boss.r, Math.min(area.x1 - boss.r, boss.x));
        boss.y = Math.max(area.y0 + boss.r, Math.min(area.y1 - boss.r * .4, boss.y));

    }

}


function drawBoss(){

    /* ---- les faux ---- */
    if(boss){

        const reach = Math.hypot(W, H);

        for(const bm of bossBeams){

            const col = BOSS_PHASES[bossPhase()].col;

            ctx.save();
            ctx.translate(boss.x, boss.y);
            ctx.rotate(bm.a);

            /* l'annonce : un trait fin avant que ca coupe */
            const on = bm.grow >= .8;

            const g = ctx.createLinearGradient(0, 0, reach, 0);
            g.addColorStop(0,  hexA(col, on ? .95 : .35));
            g.addColorStop(.6, hexA(col, on ? .55 : .18));
            g.addColorStop(1,  hexA(col, 0));

            ctx.globalAlpha = 1;
            ctx.fillStyle   = g;
            ctx.shadowColor = col;
            ctx.shadowBlur  = on ? 26 : 8;

            const th = (on ? 8 : 2.2) * unit * (.6 + bm.grow * .4);

            ctx.fillRect(boss.r * .55, -th, reach, th * 2);

            if(on){
                ctx.globalAlpha = .9;
                ctx.fillStyle   = "#ffffff";
                ctx.fillRect(boss.r * .55, -th * .28, reach, th * .56);
            }

            ctx.shadowBlur = 0;
            ctx.restore();

        }

    }

    /* ---- les projectiles ---- */
    for(const b of bossShots){

        ctx.save();
        ctx.translate(b.x, b.y);

        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r * 2.6);
        halo.addColorStop(0, hexA(b.col, .55));
        halo.addColorStop(1, hexA(b.col, 0));

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(b.ph);

        ctx.fillStyle   = b.col;
        ctx.shadowColor = b.col;
        ctx.shadowBlur  = 12;

        ctx.beginPath();

        for(let i = 0; i < 6; i++){
            const a  = i * 1.047;
            const rr = i % 2 ? b.r * .55 : b.r * 1.15;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }

        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle  = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, b.r * .34, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

    if(!boss){
        return;
    }

    const R   = boss.r;
    const col = BOSS_PHASES[bossPhase()].col;

    const die = boss.dead > 0 ? boss.dead / 2.2 : 1;

    ctx.save();
    ctx.translate(
        boss.x + (rnd() - .5) * boss.shake * 8 * unit,
        boss.y + (rnd() - .5) * boss.shake * 8 * unit
    );

    ctx.globalAlpha = die;

    /* le halo qui avale la lumiere autour */
    const glow = ctx.createRadialGradient(0, 0, R * .8, 0, 0, R * 3.2);
    glow.addColorStop(0, hexA(col, .30));
    glow.addColorStop(1, hexA(col, 0));

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, R * 3.2, 0, Math.PI * 2);
    ctx.fill();

    /* les trois anneaux de runes, chacun sur son axe */
    for(let i = 0; i < 3; i++){

        const rr   = R * (1.45 + i * .38);
        const spin = boss.t * (.5 + i * .28) * (i % 2 ? -1 : 1);
        const tilt = .35 + i * .5;

        ctx.save();
        ctx.rotate(spin);
        ctx.scale(1, .35 + Math.abs(Math.sin(tilt + boss.t * .2)) * .55);

        ctx.globalAlpha = die * .55;
        ctx.strokeStyle = col;
        ctx.lineWidth   = 2 * unit;
        ctx.shadowColor = col;
        ctx.shadowBlur  = 14;

        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 3.4 * unit;

        for(let k = 0; k < 16; k++){

            const a = (k / 16) * Math.PI * 2;

            ctx.beginPath();
            ctx.arc(0, 0, rr, a, a + .075);
            ctx.stroke();

        }

        ctx.shadowBlur = 0;
        ctx.restore();

    }

    /* le globe */
    const body = ctx.createRadialGradient(-R * .3, -R * .35, R * .1, 0, 0, R);
    body.addColorStop(0,  "#3a1a60");
    body.addColorStop(.6, "#180a2c");
    body.addColorStop(1,  "#050208");

    ctx.globalAlpha = die;
    ctx.fillStyle   = body;

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();

    /* les fissures : elles s'ouvrent a mesure qu'il s'use */
    const cracks = 1 - boss.hp;

    if(cracks > .05){

        ctx.globalAlpha = die * Math.min(1, cracks * 1.4);
        ctx.strokeStyle = "#ffb0ff";
        ctx.shadowColor = col;
        ctx.shadowBlur  = 16;

        for(let i = 0; i < 7; i++){

            const a = i * .9 + 1.1;

            ctx.lineWidth = (2.6 - i * .18) * unit;

            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * R * .12, Math.sin(a) * R * .12);

            for(let k = 1; k <= 4; k++){
                const kk = k / 4 * Math.min(1, cracks * 1.5);
                ctx.lineTo(
                    Math.cos(a + Math.sin(k * 2.1 + i) * .35) * R * kk,
                    Math.sin(a + Math.sin(k * 2.1 + i) * .35) * R * kk
                );
            }

            ctx.stroke();

        }

        ctx.shadowBlur = 0;

    }

    /* l'iris : il te suit */
    const ga = Math.atan2(player.y - boss.y, player.x - boss.x);
    const gd = R * .16;

    const ix = Math.cos(ga) * gd;
    const iy = Math.sin(ga) * gd;

    ctx.globalAlpha = die;

    const iris = ctx.createRadialGradient(ix, iy, R * .05, ix, iy, R * .55);
    iris.addColorStop(0,   "#fff4c2");
    iris.addColorStop(.35, "#ffc65a");
    iris.addColorStop(.75, col);
    iris.addColorStop(1,   "#1a0630");

    ctx.fillStyle   = iris;
    ctx.shadowColor = col;
    ctx.shadowBlur  = 26 + boss.charge * 30;

    ctx.beginPath();
    ctx.arc(ix, iy, R * .55, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    /* la pupille en fente, qui se resserre avant de tirer */
    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(ga + Math.PI / 2);

    ctx.fillStyle = "#08010f";
    ctx.beginPath();
    ctx.ellipse(0, 0, R * (.16 - boss.charge * .09), R * .48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    /* le reflet */
    ctx.globalAlpha = die * .8;
    ctx.fillStyle   = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(ix - R * .18, iy - R * .22, R * .1, R * .06, -.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();

}


/* la jauge du boss, en haut de l'ecran */
function bossBar(){

    const el = document.getElementById("bossBar");

    if(!el){
        return;
    }

    if(!boss){
        el.style.display = "none";
        return;
    }

    const ph = BOSS_PHASES[bossPhase()];

    el.style.display = "block";

    document.getElementById("bossPhase").textContent = ph.name;
    document.getElementById("bossPhase").style.color = ph.col;

    const f = document.getElementById("bossFill");

    f.style.width      = (boss.hp * 100).toFixed(1) + "%";
    f.style.background = "linear-gradient(90deg,#2a0640," + ph.col + ")";

}




/* =========================================================
   MONDES 6 A 9

   Quatre mondes de plus, et pas un seul ennemi en commun :
   chacun a ses deux habitants, avec sa propre facon de
   t'attraper.
========================================================= */

let mirages    = [];  /* MONDE 6 : tes fausses copies  */
let chaines    = [];  /* MONDE 7 : le fleau qui tourne */
let fournaises = [];  /* MONDE 7 : le cone de feu      */
let grimoires  = [];  /* MONDE 8 : les livres volants  */
let tomes      = [];  /* MONDE 8 : les tomes qui tombent */
let tomeTimer  = 0;
let pages      = [];  /* MONDE 8 : leurs lames         */
let engrenages = [];  /* MONDE 9 : la roue qui longe   */
let pendules   = [];  /* MONDE 9 : le balancier        */
let coucous    = [];  /* MONDE 9 : l'oiseau de laiton  */

let w69Timer = 0;


function clearW69(){
    mirages    = [];
    chaines    = []; fournaises = [];
    grimoires  = []; pages      = []; tomes = []; tomeTimer = 0;
    engrenages = []; pendules   = []; coucous = [];
    w69Timer = 0;
}


/* petit utilitaire commun a ces mondes */
function w69Clamp(e){

    const a = playArea();

    e.x = Math.max(a.x0 + e.r, Math.min(a.x1 - e.r, e.x));
    e.y = Math.max(a.y0 + e.r, Math.min(a.y1 - e.r, e.y));

}


function w69Hit(e){

    if(player.invincible <= 0 && collide(player, e)){
        loseLife(null);
        return true;
    }

    return false;

}


/* =========================================================
   MONDE 6 : LE DESERT DE VERRE
========================================================= */

function paintDesert(c){

    /* le sable, chaud en haut, sombre au sol */
    const base = c.createLinearGradient(0, 0, W * .2, H);
    base.addColorStop(0,   "#ffd89b");
    base.addColorStop(.42, "#e8a95e");
    base.addColorStop(1,   "#8a5426");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* les dunes en bandes molles */
    for(let i = 0; i < 7; i++){

        const y = H * (.15 + i * .13);

        c.fillStyle = i % 2
            ? "rgba(255,225,170,.20)"
            : "rgba(150,90,40,.16)";

        c.beginPath();
        c.moveTo(-10, y + 60 * unit);

        for(let k = 0; k <= 10; k++){
            const kk = k / 10;
            c.lineTo(kk * W, y + Math.sin(kk * 5 + i) * 26 * unit);
        }

        c.lineTo(W + 10, y + 60 * unit);
        c.closePath();
        c.fill();

    }

    /*
    Plus d'eclats peints dans le decor : les pics du desert
    sont de vrais obstacles, poses sur le terrain. On ne
    dessine ici que leur poussiere pour ne pas tromper l'oeil.
    */

    /* la poussiere qui vole */
    for(let i = 0; i < Math.round(W * H / 4200); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        c.fillStyle = "rgba(255,240,210,.5)";
        c.fillRect(x, y, unit * 1.5, unit * 1.1);

    }

    const vig = c.createRadialGradient(
        W / 2, H * .4, Math.min(W, H) * .25,
        W / 2, H / 2, Math.max(W, H) * .8
    );
    vig.addColorStop(0, "rgba(255,255,255,.06)");
    vig.addColorStop(1, "rgba(90,45,10,.45)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


const MAX_MIRAGES = 7;

const DESERT_SPIKES = 9;

function enterDesert(){

    w69Enter("desert", "🏜", "#ffd76a");

    /* les pics de verre : solides, pour toi comme pour eux */
    for(let i = 0; i < DESERT_SPIKES; i++){
        spawnSpike();
    }

    for(let i = 0; i < 3; i++){ spawnMirage(); }

}


function spawnSpike(){

    const r = (26 + rnd() * 16) * unit;

    const p = findSpot(r, 210);

    if(!p){
        return;
    }

    solids.push({
        x:p.x,
        y:p.y,
        r:r,
        pulse:rnd() * 10,
        glass:{
            seed:rnd() * 6.28,
            shards:Array.from({length:3 + Math.floor(rnd() * 2)}, () => ({
                a:(rnd() - .5) * .5,
                w:.30 + rnd() * .26,
                h:1.05 + rnd() * .5,
                x:(rnd() - .5) * .9
            }))
        }
    });

}


/* --- LE MIRAGE : ta propre image, jusqu'a ce qu'elle bouge --- */
function spawnMirage(){

    if(mirages.length >= MAX_MIRAGES){
        return;
    }

    const r = player.r * 1.15;
    const p = findSpot(r, 340) || findSpot(r, 200);

    if(!p){ return; }

    mirages.push({
        x:p.x, y:p.y, r:r,
        phase:"drift", timer:0, near:0,
        rest:rnd() * 2.5,
        ang:0, birth:.5, stunned:0, shimmer:rnd() * 6.28
    });

}


function updateMirages(dt){

    const base = mimicSpeed({type:MIMIC_TYPES[0]});

    for(const m of mirages){

        if(m.birth > 0){ m.birth = Math.max(0, m.birth - dt); continue; }
        if(m.stunned > 0){ m.stunned -= dt; continue; }

        m.shimmer += dt * 3;

        const aim = lureTarget();
        const d   = Math.hypot(aim.x - m.x, aim.y - m.y);

        if(m.phase === "drift"){

            /* il te suit de loin, transparent et inoffensif */
            const a = Math.atan2(aim.y - m.y, aim.x - m.x);

            m.x += Math.cos(a) * base * .62 * dt;
            m.y += Math.sin(a) * base * .62 * dt;

            /* chacun a son propre temps de repos : ils ne
               se jettent jamais tous en meme temps */
            if(m.rest > 0){
                m.rest -= dt;
                m.near  = 0;
            }else{
                m.near = d < 260 * unit ? m.near + dt : 0;
            }

            /* transparent ou non, le toucher coute une vie */
            w69Hit(m);

            if(m.near > 1.1){
                m.phase = "solid";
                m.timer = .55;
                m.near  = 0;
                sound(520, .2, "sine", .04);
            }

        }else if(m.phase === "solid"){

            /* il se durcit : la silhouette devient nette */
            m.timer -= dt;
            m.ang    = Math.atan2(aim.y - m.y, aim.x - m.x);

            if(m.timer <= 0){
                m.phase = "lunge";
                m.timer = .75;
                sound(760, .12, "triangle", .04);
            }

            w69Hit(m);

        }else{

            m.timer -= dt;

            m.x += Math.cos(m.ang) * base * 2.8 * dt;
            m.y += Math.sin(m.ang) * base * 2.8 * dt;

            if(w69Hit(m)){
                burst(m.x, m.y, 18, "#bfe8ff");
            }

            if(m.timer <= 0){
                m.phase = "drift";
                m.rest  = 2.2 + rnd() * 1.6;
            }

        }

        w69Clamp(m);

        /* les pics de verre les arretent aussi */
        resolveSolids(m);

    }

    /* ils gardent leurs distances entre eux */
    for(let i = 0; i < mirages.length; i++){
        for(let j = i + 1; j < mirages.length; j++){

            const a = mirages[i], b = mirages[j];

            let dx = b.x - a.x, dy = b.y - a.y;
            let d  = Math.hypot(dx, dy);

            const min = (a.r + b.r) * 2.1;

            if(d < min){
                if(d < .001){ dx = 1; dy = 0; d = 1; }
                const push = (min - d) / 2;
                a.x -= dx / d * push; a.y -= dy / d * push;
                b.x += dx / d * push; b.y += dy / d * push;
            }

        }
    }

}


function drawMirages(){

    const skin = SKINS.find(sk => sk.id === currentSkin) || SKINS[0];

    for(const m of mirages){

        const solid = m.phase !== "drift";
        const grow  = m.birth > 0 ? 1 - m.birth / .5 : 1;

        ctx.save();
        ctx.translate(m.x, m.y);

        /* la chaleur qui tremble autour */
        ctx.globalAlpha = solid ? .35 : .18;
        ctx.strokeStyle = "#ffe0a8";
        ctx.lineWidth   = 1.6 * unit;

        for(let i = 0; i < 3; i++){
            ctx.beginPath();
            ctx.ellipse(
                0, 0,
                m.r * (1.5 + i * .35),
                m.r * (1.1 + i * .3) + Math.sin(m.shimmer + i) * m.r * .12,
                0, 0, Math.PI * 2
            );
            ctx.stroke();
        }

        ctx.globalAlpha = solid ? 1 : .32;

        paintSkinSlime(
            ctx, skin, m.r * Math.max(.15, grow), gameTime,
            false, {blink:1}
        );

        /* en solide il vire au cuivre : on voit que ce n'est plus toi */
        if(solid){

            ctx.globalAlpha = .5;
            ctx.fillStyle   = "#ff9a3d";

            ctx.beginPath();
            ctx.arc(0, 0, m.r * 1.15, 0, Math.PI * 2);
            ctx.fill();

        }

        ctx.restore();
        ctx.globalAlpha = 1;

    }

}


/* =========================================================
   MONDE 7 : LA FORGE
========================================================= */

function paintForge(c){

    const base = c.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0,   "#2a1208");
    base.addColorStop(.55, "#140803");
    base.addColorStop(1,   "#3a1004");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* les coulees de metal en fusion */
    for(let i = 0; i < 5; i++){

        const x  = (i + .5) / 5 * W + (Math.random() - .5) * W * .1;
        const ww = (30 + Math.random() * 60) * unit;

        const g = c.createLinearGradient(x, 0, x, H);
        g.addColorStop(0,   "rgba(255,180,60,.05)");
        g.addColorStop(.6,  "rgba(255,120,30,.30)");
        g.addColorStop(1,   "rgba(255,220,140,.55)");

        c.fillStyle = g;
        c.fillRect(x - ww / 2, 0, ww, H);

    }

    /* les enclumes et les poutres, en ombre */
    c.fillStyle = "rgba(6,3,2,.8)";

    for(let i = 0; i < 8; i++){

        const x = Math.random() * W;
        const y = H * (.2 + Math.random() * .75);
        const w2 = (50 + Math.random() * 130) * unit;
        const h2 = (16 + Math.random() * 40) * unit;

        c.fillRect(x - w2 / 2, y, w2, h2);

    }

    /* les etincelles */
    for(let i = 0; i < Math.round(W * H / 3000); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = (.8 + Math.random() * 2) * unit;

        const g = c.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, "rgba(255,220,140,.9)");
        g.addColorStop(1, "rgba(255,120,30,0)");

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r * 4, 0, Math.PI * 2);
        c.fill();

    }

    const vig = c.createRadialGradient(
        W / 2, H * .45, Math.min(W, H) * .2,
        W / 2, H / 2, Math.max(W, H) * .78
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,.82)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


function enterForge(){
    w69Enter("forge", "🔥", "#ff7a2a");
    for(let i = 0; i < 2; i++){ spawnChaine(); }
    for(let i = 0; i < 2; i++){ spawnFournaise(); }
}


/* --- LA CHAINE : un fleau qui tourne autour de son ancre --- */
function spawnChaine(){

    const r = (18 + rnd() * 6) * unit;
    const p = findSpot(r * 4, 320) || findSpot(r * 4, 200);

    if(!p){ return; }

    chaines.push({
        x:p.x, y:p.y, r:r,
        len:(120 + rnd() * 70) * unit,
        a:rnd() * 6.28,
        spin:(rnd() < .5 ? -1 : 1) * (1 + rnd() * .5),
        drift:rnd() * 6.28,
        birth:.5, stunned:0
    });

}


function updateChaines(dt){

    for(const c of chaines){

        if(c.birth > 0){ c.birth = Math.max(0, c.birth - dt); continue; }
        if(c.stunned > 0){ c.stunned -= dt; continue; }

        c.a     += c.spin * dt;
        c.drift += dt * .5;

        /* l'ancre derive lentement vers toi */
        const aim = lureTarget();
        const an  = Math.atan2(aim.y - c.y, aim.x - c.x);

        c.x += Math.cos(an) * 26 * unit * dt;
        c.y += Math.sin(an) * 26 * unit * dt;

        const a = playArea();

        c.x = Math.max(a.x0 + c.len, Math.min(a.x1 - c.len, c.x));
        c.y = Math.max(a.y0 + c.len, Math.min(a.y1 - c.len, c.y));

        /* le boulet */
        const bx = c.x + Math.cos(c.a) * c.len;
        const by = c.y + Math.sin(c.a) * c.len;

        if(player.invincible <= 0 &&
           Math.hypot(player.x - bx, player.y - by) < c.r + player.r){
            loseLife(null);
            burst(bx, by, 20, "#ffb347");
        }

    }

}


function drawChaines(){

    for(const c of chaines){

        if(c.birth > 0){ continue; }

        const bx = c.x + Math.cos(c.a) * c.len;
        const by = c.y + Math.sin(c.a) * c.len;

        ctx.save();

        /* l'ancre : un anneau plante dans le sol */
        ctx.strokeStyle = "#6b757f";
        ctx.lineWidth   = c.r * .35;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * .55, 0, Math.PI * 2);
        ctx.stroke();

        /* les maillons */
        const links = 8;

        for(let i = 1; i <= links; i++){

            const kk = i / (links + 1);

            ctx.globalAlpha = .9;
            ctx.strokeStyle = "#9aa5b1";
            ctx.lineWidth   = c.r * .22;

            ctx.beginPath();
            ctx.arc(
                c.x + Math.cos(c.a) * c.len * kk,
                c.y + Math.sin(c.a) * c.len * kk,
                c.r * .2, 0, Math.PI * 2
            );
            ctx.stroke();

        }

        /* le boulet, chauffe a blanc */
        const g = ctx.createRadialGradient(bx - c.r * .3, by - c.r * .3, c.r * .1, bx, by, c.r);
        g.addColorStop(0, "#fff0c0");
        g.addColorStop(.5, "#ff8a2a");
        g.addColorStop(1, "#6b2404");

        ctx.globalAlpha = 1;
        ctx.fillStyle   = g;
        ctx.shadowColor = "#ff7a2a";
        ctx.shadowBlur  = 22;

        ctx.beginPath();
        ctx.arc(bx, by, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        /* les pointes */
        ctx.fillStyle = "#3a2008";

        for(let i = 0; i < 8; i++){
            const a = i * .785 + c.a;
            ctx.beginPath();
            ctx.moveTo(bx + Math.cos(a) * c.r * .8, by + Math.sin(a) * c.r * .8);
            ctx.lineTo(bx + Math.cos(a) * c.r * 1.35, by + Math.sin(a) * c.r * 1.35);
            ctx.lineTo(bx + Math.cos(a + .3) * c.r * .8, by + Math.sin(a + .3) * c.r * .8);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

    }

}


/* =========================================================
   MONDE 8 : LA BIBLIOTHEQUE SUSPENDUE
========================================================= */

function paintLibrary(c){

    const base = c.createLinearGradient(0, 0, W * .3, H);
    base.addColorStop(0,   "#241a3e");
    base.addColorStop(.5,  "#150e28");
    base.addColorStop(1,   "#0a0616");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* les rayonnages qui montent dans le noir */
    for(let i = 0; i < 6; i++){

        const x  = (i / 6) * W + W * .04;
        const ww = W * .1;

        c.fillStyle = "rgba(40,26,64,.7)";
        c.fillRect(x, 0, ww, H);

        /* les livres sur chaque etagere */
        for(let y = H * .08; y < H; y += H * .13){

            c.fillStyle = "rgba(15,9,26,.9)";
            c.fillRect(x, y, ww, 5 * unit);

            let bx = x + 3 * unit;

            while(bx < x + ww - 6 * unit){

                const bw = (5 + Math.random() * 9) * unit;
                const bh = (26 + Math.random() * 26) * unit;

                const hue = 250 + Math.random() * 80;

                c.fillStyle = "hsla(" + hue + ",45%,42%,.65)";
                c.fillRect(bx, y - bh, bw, bh);

                bx += bw + 1.6 * unit;

            }

        }

    }

    /* les pages qui flottent */
    for(let i = 0; i < 26; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const a = Math.random() * Math.PI;
        const s = (7 + Math.random() * 12) * unit;

        c.save();
        c.translate(x, y);
        c.rotate(a);

        c.globalAlpha = .18 + Math.random() * .22;
        c.fillStyle   = "#e8e0ff";
        c.fillRect(-s / 2, -s * .35, s, s * .7);

        c.restore();

    }

    /* les lucioles d'encre */
    for(let i = 0; i < Math.round(W * H / 5000); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        const g = c.createRadialGradient(x, y, 0, x, y, 5 * unit);
        g.addColorStop(0, "rgba(200,160,255,.8)");
        g.addColorStop(1, "rgba(200,160,255,0)");

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, 5 * unit, 0, Math.PI * 2);
        c.fill();

    }

    const vig = c.createRadialGradient(
        W / 2, H * .45, Math.min(W, H) * .2,
        W / 2, H / 2, Math.max(W, H) * .8
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(4,2,10,.85)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


const MAX_GRIMOIRES = 5;

function enterLibrary(){
    w69Enter("biblio", "📖", "#b06cff");
    for(let i = 0; i < MAX_GRIMOIRES; i++){ spawnGrimoire(); }

    tomes     = [];
    tomeTimer = 3;

}


/* --- LE GRIMOIRE : il s'ouvre, puis il tire ses pages --- */
function spawnGrimoire(){

    if(grimoires.length >= MAX_GRIMOIRES){
        return;
    }

    const r = (24 + rnd() * 8) * unit;
    const p = findSpot(r, 320) || findSpot(r, 200);

    if(!p){ return; }

    grimoires.push({
        x:p.x, y:p.y, r:r,
        phase:"fly", timer:1.6 + rnd(),
        open:0, ang:0, flap:rnd() * 6.28,
        birth:.5, stunned:0
    });

}


function updateGrimoires(dt){

    const base = mimicSpeed({type:MIMIC_TYPES[0]});

    for(const g of grimoires){

        if(g.birth > 0){ g.birth = Math.max(0, g.birth - dt); continue; }
        if(g.stunned > 0){ g.stunned -= dt; continue; }

        g.flap += dt * 5;

        const aim = lureTarget();

        if(g.phase === "fly"){

            g.open = Math.max(0, g.open - dt * 2);

            const a = Math.atan2(aim.y - g.y, aim.x - g.x);

            g.x += Math.cos(a) * base * .8 * dt;
            g.y += Math.sin(a) * base * .8 * dt;

            g.timer -= dt;

            if(g.timer <= 0){
                g.phase = "open";
                g.timer = .8;
                sound(300, .18, "sine", .035);
            }

        }else{

            g.open  = Math.min(1, g.open + dt * 2);
            g.timer -= dt;
            g.ang    = Math.atan2(aim.y - g.y, aim.x - g.x);

            if(g.timer <= 0){

                /* trois lames de papier en eventail */
                for(let i = -1; i <= 1; i++){
                    pages.push({
                        x:g.x, y:g.y,
                        vx:Math.cos(g.ang + i * .33) * 190 * unit,
                        vy:Math.sin(g.ang + i * .33) * 190 * unit,
                        r:8 * unit,
                        spin:rnd() * 6.28,
                        life:5
                    });
                }

                sound(620, .12, "triangle", .04);

                g.phase = "fly";
                g.timer = 2.4 + rnd();

            }

        }

        w69Clamp(g);
        w69Hit(g);

    }

    /* les pages en vol */
    const a = playArea();

    for(const pg of pages){

        pg.x    += pg.vx * dt;
        pg.y    += pg.vy * dt;
        pg.spin += dt * 9;
        pg.life -= dt;

        if(player.invincible <= 0 &&
           Math.hypot(pg.x - player.x, pg.y - player.y) < pg.r + player.r){
            pg.life = 0;
            loseLife(null);
        }

    }

    pages = pages.filter(pg =>
        pg.life > 0 &&
        pg.x > a.x0 - 40 && pg.x < a.x1 + 40 &&
        pg.y > a.y0 - 40 && pg.y < a.y1 + 40
    );

}


function drawGrimoires(){

    for(const pg of pages){

        ctx.save();
        ctx.translate(pg.x, pg.y);
        ctx.rotate(pg.spin);

        ctx.fillStyle   = "#f0e8ff";
        ctx.shadowColor = "#b06cff";
        ctx.shadowBlur  = 12;

        ctx.beginPath();
        ctx.moveTo(pg.r * 1.5, 0);
        ctx.lineTo(-pg.r, -pg.r * .8);
        ctx.lineTo(-pg.r * .4, 0);
        ctx.lineTo(-pg.r, pg.r * .8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

    }

    for(const g of grimoires){

        const r = g.r * (g.birth > 0 ? 1 - g.birth / .5 : 1);

        ctx.save();
        ctx.translate(g.x, g.y + Math.sin(g.flap) * r * .12);

        if(g.phase === "open"){
            ctx.rotate(g.ang);
        }

        /* les deux couvertures qui battent */
        const sp = .35 + g.open * .8 + Math.sin(g.flap) * .1;

        [-1, 1].forEach(sg => {

            ctx.save();
            ctx.rotate(sg * sp);

            const gr = ctx.createLinearGradient(0, -r, 0, r);
            gr.addColorStop(0, "#6a3cb0");
            gr.addColorStop(1, "#2a1350");

            ctx.fillStyle = gr;
            ctx.fillRect(-r * .12, -r * .9, r * 1.15, r * 1.8);

            /* les pages */
            ctx.fillStyle = "#efe6ff";
            ctx.fillRect(-r * .05, -r * .78, r * .95, r * 1.56);

            /* le fil d'or sur la tranche */
            ctx.fillStyle = "#ffd76a";
            ctx.fillRect(-r * .12, -r * .9, r * .12, r * 1.8);

            ctx.restore();

        });

        /* l'oeil au milieu du livre */
        ctx.fillStyle   = g.phase === "open" ? "#ff8a5a" : "#c8a6ff";
        ctx.shadowColor = "#b06cff";
        ctx.shadowBlur  = 14;

        ctx.beginPath();
        ctx.ellipse(0, 0, r * .3, r * .18 + g.open * r * .14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle  = "#1a0a2e";

        ctx.beginPath();
        ctx.arc(0, 0, r * .1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

}



/* --- LA FOURNAISE : elle souffle un cone de feu --- */
function spawnFournaise(){

    const r = (30 + rnd() * 10) * unit;
    const p = findSpot(r, 320) || findSpot(r, 200);

    if(!p){ return; }

    fournaises.push({
        x:p.x, y:p.y, r:r,
        ang:rnd() * 6.28,
        phase:"aim", timer:1.4 + rnd(),
        heat:0, flame:0,
        birth:.5, stunned:0
    });

}


const FOURN_CONE  = .42;   /* demi-ouverture du cone, en radians */
const FOURN_REACH = 330;   /* portee, en unites                  */


function updateFournaises(dt){

    for(const f of fournaises){

        if(f.birth > 0){ f.birth = Math.max(0, f.birth - dt); continue; }
        if(f.stunned > 0){ f.stunned -= dt; f.flame = 0; continue; }

        const aim = lureTarget();

        /* elle derive a peine : c'est une piece de forge, pas un coureur */
        const an = Math.atan2(aim.y - f.y, aim.x - f.x);

        f.x += Math.cos(an) * 18 * unit * dt;
        f.y += Math.sin(an) * 18 * unit * dt;

        w69Clamp(f);

        f.timer -= dt;

        if(f.phase === "aim"){

            /* elle pivote vers toi, la gueule rougit */
            let diff = an - f.ang;
            while(diff >  Math.PI){ diff -= Math.PI * 2; }
            while(diff < -Math.PI){ diff += Math.PI * 2; }

            f.ang += Math.max(-2.2 * dt, Math.min(2.2 * dt, diff));

            f.heat  = Math.max(0, f.heat - dt * 1.5);
            f.flame = 0;

            if(f.timer <= 0){
                f.phase = "charge";
                f.timer = .8;
                sound(110, .3, "sine", .04);
            }

        }else if(f.phase === "charge"){

            f.heat = Math.min(1, f.heat + dt * 1.4);

            if(f.timer <= 0){
                f.phase = "blow";
                f.timer = 1;
                sound(220, .5, "sawtooth", .05);
                buzz(20);
            }

        }else{

            f.flame = Math.min(1, f.flame + dt * 5);
            f.heat  = 1;

            /* le cone brule */
            if(player.invincible <= 0){

                const dx = player.x - f.x;
                const dy = player.y - f.y;
                const d  = Math.hypot(dx, dy);

                if(d < FOURN_REACH * unit * f.flame && d > f.r * .5){

                    let diff = Math.atan2(dy, dx) - f.ang;
                    while(diff >  Math.PI){ diff -= Math.PI * 2; }
                    while(diff < -Math.PI){ diff += Math.PI * 2; }

                    if(Math.abs(diff) < FOURN_CONE){
                        loseLife(null);
                    }

                }

            }

            if(f.timer <= 0){
                f.phase = "aim";
                f.timer = 2 + rnd() * 1.2;
            }

        }

        w69Hit(f);

    }

}


function drawFournaises(){

    for(const f of fournaises){

        const r = f.r * (f.birth > 0 ? 1 - f.birth / .5 : 1);

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.ang);

        /* le souffle */
        if(f.flame > 0){

            const reach = FOURN_REACH * unit * f.flame;

            const g = ctx.createLinearGradient(0, 0, reach, 0);
            g.addColorStop(0,   "rgba(255,255,220,.95)");
            g.addColorStop(.35, "rgba(255,170,50,.7)");
            g.addColorStop(1,   "rgba(200,40,10,0)");

            ctx.fillStyle   = g;
            ctx.shadowColor = "#ff7a2a";
            ctx.shadowBlur  = 26;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, reach, -FOURN_CONE, FOURN_CONE);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            /* les braises emportees */
            ctx.fillStyle = "#ffe9a8";

            for(let i = 0; i < 9; i++){
                const kk = ((gameTime * 1.6 + i / 9) % 1);
                const a  = (rnd() - .5) * FOURN_CONE * 1.5;
                ctx.globalAlpha = (1 - kk) * .8;
                ctx.beginPath();
                ctx.arc(kk * reach, Math.sin(a) * kk * reach, r * .07, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;

        }else if(f.phase === "charge"){

            /* l'avertissement : le cone se dessine en creux */
            ctx.globalAlpha = .18 + f.heat * .3;
            ctx.strokeStyle = "#ffb347";
            ctx.lineWidth   = 2.2 * unit;

            const reach = FOURN_REACH * unit;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(-FOURN_CONE) * reach, Math.sin(-FOURN_CONE) * reach);
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(FOURN_CONE) * reach, Math.sin(FOURN_CONE) * reach);
            ctx.stroke();

            ctx.globalAlpha = 1;

        }

        /* le corps : un four trapu sur trois pieds */
        ctx.fillStyle = "#2b3138";

        for(let i = 0; i < 3; i++){
            const a = i * 2.09 + 1.05;
            ctx.save();
            ctx.rotate(a);
            ctx.fillRect(-r * .12, r * .5, r * .24, r * .7);
            ctx.restore();
        }

        const body = ctx.createRadialGradient(-r * .2, -r * .3, r * .1, 0, 0, r);
        body.addColorStop(0, "#7d8892");
        body.addColorStop(1, "#232a30");

        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#12171c";
        ctx.lineWidth   = r * .1;
        ctx.stroke();

        /* les cerclages */
        ctx.strokeStyle = "#4a545e";
        ctx.lineWidth   = r * .12;

        for(let i = -1; i <= 1; i += 2){
            ctx.beginPath();
            ctx.arc(0, 0, r * .72, i * .6, i * .6 + 2.4);
            ctx.stroke();
        }

        /* la gueule, qui rougit avant de souffler */
        const mouth = ctx.createRadialGradient(r * .7, 0, r * .05, r * .7, 0, r * .5);
        mouth.addColorStop(0, f.heat > .1 ? "#fff4c2" : "#3a1a08");
        mouth.addColorStop(.5, "rgba(255,140,40," + (.2 + f.heat * .8).toFixed(2) + ")");
        mouth.addColorStop(1, "rgba(90,20,4,0)");

        ctx.fillStyle   = mouth;
        ctx.shadowColor = "#ff7a2a";
        ctx.shadowBlur  = f.heat * 24;

        ctx.beginPath();
        ctx.ellipse(r * .72, 0, r * .38, r * .5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.restore();

    }

}


/* --- LE COUCOU : il plane, puis il pique --- */
function spawnCoucou(){

    const r = (22 + rnd() * 7) * unit;
    const a = playArea();

    coucous.push({
        x:a.x0 + rnd() * (a.x1 - a.x0),
        y:a.y0 + 20 * unit,
        r:r,
        phase:"hover", timer:1.6 + rnd(),
        ang:0, vx:0, vy:0,
        wing:rnd() * 6.28,
        birth:.5, stunned:0
    });

}


function updateCoucous(dt){

    const base = mimicSpeed({type:MIMIC_TYPES[0]});
    const area = playArea();

    for(const c of coucous){

        if(c.birth > 0){ c.birth = Math.max(0, c.birth - dt); continue; }
        if(c.stunned > 0){ c.stunned -= dt; continue; }

        c.wing += dt * (c.phase === "dive" ? 26 : 13);

        const aim = lureTarget();

        if(c.phase === "hover"){

            /* il tourne au-dessus, en se placant a ta verticale */
            const tx = aim.x;
            const ty = area.y0 + (area.y1 - area.y0) * .18;

            c.x += (tx - c.x) * Math.min(1, dt * 1.2);
            c.y += (ty - c.y) * Math.min(1, dt * 1.6);

            c.ang = Math.sin(gameTime * 2) * .12;

            c.timer -= dt;

            if(c.timer <= 0){
                c.phase = "call";
                c.timer = .6;
                sound(880, .12, "square", .035);
                sound(660, .12, "square", .03);
            }

        }else if(c.phase === "call"){

            /* le chant : deux notes, et il se cabre */
            c.timer -= dt;
            c.ang    = -.5;

            if(c.timer <= 0){

                const a = Math.atan2(aim.y - c.y, aim.x - c.x);

                c.vx = Math.cos(a) * base * 3;
                c.vy = Math.sin(a) * base * 3;

                c.ang   = a;
                c.phase = "dive";
                c.timer = 1.1;

                sound(320, .2, "sawtooth", .04);

            }

        }else{

            c.timer -= dt;

            c.x += c.vx * dt;
            c.y += c.vy * dt;

            /* il rebondit sur les bords au lieu de sortir */
            if(c.x < area.x0 + c.r || c.x > area.x1 - c.r){ c.vx = -c.vx; c.ang = Math.PI - c.ang; }
            if(c.y < area.y0 + c.r || c.y > area.y1 - c.r){ c.vy = -c.vy; c.ang = -c.ang; }

            if(c.timer <= 0){
                c.phase = "hover";
                c.timer = 2 + rnd() * 1.4;
            }

            if(w69Hit(c)){
                burst(c.x, c.y, 18, "#ffd76a");
            }

        }

        w69Clamp(c);

    }

}


function drawCoucous(){

    for(const c of coucous){

        const r    = c.r * (c.birth > 0 ? 1 - c.birth / .5 : 1);
        const dive = c.phase === "dive";

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.ang);

        /* les ailes de laiton, en battement */
        const beat = Math.sin(c.wing) * .7;

        [-1, 1].forEach(sg => {

            ctx.save();
            ctx.rotate(sg * (beat + .3));

            const g = ctx.createLinearGradient(0, 0, -r * .4, sg * r * 1.6);
            g.addColorStop(0, "#ffe6a8");
            g.addColorStop(1, "#a8762a");

            ctx.fillStyle = g;

            ctx.beginPath();
            ctx.moveTo(-r * .1, 0);
            ctx.quadraticCurveTo(-r * .9, sg * r * 1.5, -r * 1.5, sg * r * .5);
            ctx.quadraticCurveTo(-r * .8, sg * r * .3, -r * .1, 0);
            ctx.fill();

            ctx.strokeStyle = "#6b4a10";
            ctx.lineWidth   = r * .07;
            ctx.stroke();

            ctx.restore();

        });

        /* la queue */
        ctx.fillStyle = "#8fb6d0";
        ctx.beginPath();
        ctx.moveTo(-r * .7, 0);
        ctx.lineTo(-r * 1.5, -r * .35);
        ctx.lineTo(-r * 1.3, 0);
        ctx.lineTo(-r * 1.5, r * .35);
        ctx.closePath();
        ctx.fill();

        /* le corps de cuivre */
        const body = ctx.createRadialGradient(r * .1, -r * .25, r * .1, 0, 0, r);
        body.addColorStop(0, "#ffe9c0");
        body.addColorStop(.55, "#d8a53d");
        body.addColorStop(1, "#7a5210");

        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * .78, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#3a2708";
        ctx.lineWidth   = r * .09;
        ctx.stroke();

        /* les rivets */
        ctx.fillStyle = "#5f4210";

        for(let i = 0; i < 5; i++){
            const a = i * 1.25;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * .5, Math.sin(a) * r * .35, r * .07, 0, Math.PI * 2);
            ctx.fill();
        }

        /* le bec */
        ctx.fillStyle = "#e8f2ff";
        ctx.beginPath();
        ctx.moveTo(r * .85, -r * .18);
        ctx.lineTo(r * 1.7, 0);
        ctx.lineTo(r * .85, r * .18);
        ctx.closePath();
        ctx.fill();

        /* l'oeil de verre */
        ctx.fillStyle = "#1a1206";
        ctx.beginPath();
        ctx.arc(r * .45, -r * .22, r * .2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle   = dive ? "#ff5f4d" : "#9fe9ff";
        ctx.shadowColor = dive ? "#ff5f4d" : "#9fe9ff";
        ctx.shadowBlur  = 10;

        ctx.beginPath();
        ctx.arc(r * .5, -r * .24, r * .1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

}



/* --- LE TOME : la colonne tremble, puis ça tombe --- */
const TOME_EVERY = 6.5;   /* secondes entre deux chutes */

function spawnTome(){

    const a = playArea();

    /* il tombe pres de toi, mais pas dessus : on doit pouvoir lire */
    const aim = lureTarget();

    let x = aim.x + (rnd() - .5) * 320 * unit;

    x = Math.max(a.x0 + 60 * unit, Math.min(a.x1 - 60 * unit, x));

    tomes.push({
        x:x,
        y:a.y0 - 120 * unit,
        ty:a.y0 + (a.y1 - a.y0) * (.25 + rnd() * .6),
        r:(46 + rnd() * 18) * unit,
        phase:"shake",
        timer:1.3,
        shake:0,
        ring:0,
        rest:0,
        tilt:(rnd() - .5) * .5,
        stunned:0
    });

    sound(80, .5, "sine", .04);

}


function updateTomes(dt){

    const a = playArea();

    for(const b of tomes){

        b.shake += dt * 34;

        if(b.phase === "shake"){

            b.timer -= dt;

            if(b.timer <= 0){
                b.phase = "fall";
                b.y     = a.y0 - b.r * 2;
                sound(200, .25, "sawtooth", .04);
            }

            continue;

        }

        if(b.phase === "fall"){

            b.y += 1750 * unit * dt;

            if(b.y >= b.ty){

                b.y     = b.ty;
                b.phase = "land";
                b.ring  = .01;
                b.rest  = 2.6;

                burst(b.x, b.y, 26, "#efe6ff");

                sound(70, .5, "sawtooth", .07);
                buzz(35);

                /* le choc : au point de chute */
                if(player.invincible <= 0 &&
                   Math.hypot(player.x - b.x, player.y - b.y) < b.r + player.r){
                    loseLife(null);
                }

            }else if(player.invincible <= 0 &&
                     Math.hypot(player.x - b.x, player.y - b.y) < b.r * .8 + player.r){
                loseLife(null);
            }

            continue;

        }

        /* l'onde de papier qui part du point de chute */
        if(b.ring > 0){

            b.ring += dt * 3.2;

            if(player.invincible <= 0 && b.ring < 1){

                const d  = Math.hypot(player.x - b.x, player.y - b.y);
                const rr = b.ring * b.r * 3;

                if(Math.abs(d - rr) < b.r * .35 + player.r){
                    loseLife(null);
                }

            }

            if(b.ring > 1.3){
                b.ring = 0;
            }

        }

        b.rest -= dt;

    }

    tomes = tomes.filter(b => b.phase !== "land" || b.rest > 0);

}


function drawTomes(){

    const a = playArea();

    for(const b of tomes){

        /* ---- l'annonce : la colonne tremble au-dessus ---- */
        if(b.phase === "shake"){

            const k  = 1 - b.timer / 1.3;
            const sx = Math.sin(b.shake) * 5 * unit * k;

            ctx.save();

            /* la colonne de livres qui vibre */
            ctx.globalAlpha = .35 + k * .3;
            ctx.fillStyle   = "#2a1a44";
            ctx.fillRect(b.x - b.r * .9 + sx, a.y0, b.r * 1.8, b.r * 1.5);

            ctx.fillStyle = "#4a2f78";

            for(let i = 0; i < 6; i++){
                const bw = b.r * .24;
                ctx.fillRect(
                    b.x - b.r * .8 + sx + i * bw * 1.2,
                    a.y0 + b.r * .25,
                    bw, b.r * (.7 + (i % 3) * .18)
                );
            }

            /* la poussiere qui tombe */
            ctx.globalAlpha = .5 * k;
            ctx.fillStyle   = "#d8c8ff";

            for(let i = 0; i < 8; i++){
                const kk = ((gameTime * 1.4 + i / 8) % 1);
                ctx.fillRect(
                    b.x + (rnd() - .5) * b.r * 1.6,
                    a.y0 + b.r * 1.5 + kk * b.r * 2,
                    1.6 * unit, 4 * unit
                );
            }

            /* l'ombre au sol : c'est la que ca va tomber */
            ctx.globalAlpha = .25 + k * .45;
            ctx.fillStyle   = "#1a0e2e";

            ctx.beginPath();
            ctx.ellipse(b.x, b.ty, b.r * (1.2 - k * .3), b.r * .38, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = .8;
            ctx.strokeStyle = "#b06cff";
            ctx.lineWidth   = 2.2 * unit;

            ctx.beginPath();
            ctx.ellipse(b.x, b.ty, b.r * (1.2 - k * .3), b.r * .38, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

            continue;

        }

        /* ---- l'onde de papier ---- */
        if(b.ring > 0){

            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - b.ring) * .85;
            ctx.strokeStyle = "#efe6ff";
            ctx.lineWidth   = b.r * .3 * Math.max(.2, 1 - b.ring);
            ctx.shadowColor = "#b06cff";
            ctx.shadowBlur  = 18;

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.ring * b.r * 3, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

        }

        /* ---- le tome lui-meme ---- */
        const fade = b.phase === "land"
            ? Math.min(1, b.rest / .6)
            : 1;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.phase === "fall" ? b.tilt + b.shake * .05 : b.tilt * .4);

        /* l'ombre */
        if(b.phase === "fall"){
            ctx.globalAlpha = fade * .3;
            ctx.fillStyle   = "#1a0e2e";
            ctx.beginPath();
            ctx.ellipse(0, (b.ty - b.y) * .9, b.r * .9, b.r * .3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = fade;
        }

        /* la couverture */
        const g = ctx.createLinearGradient(-b.r, -b.r * .7, b.r, b.r * .7);
        g.addColorStop(0, "#6a3cb0");
        g.addColorStop(1, "#2a1350");

        ctx.fillStyle = g;

        ctx.beginPath();
        if(ctx.roundRect){
            ctx.roundRect(-b.r, -b.r * .72, b.r * 2, b.r * 1.44, b.r * .1);
        }else{
            ctx.rect(-b.r, -b.r * .72, b.r * 2, b.r * 1.44);
        }
        ctx.fill();

        ctx.strokeStyle = "#150827";
        ctx.lineWidth   = b.r * .07;
        ctx.stroke();

        /* les pages sur la tranche */
        ctx.fillStyle = "#efe6ff";
        ctx.fillRect(b.r * .68, -b.r * .62, b.r * .26, b.r * 1.24);

        for(let i = 0; i < 7; i++){
            ctx.fillStyle = "rgba(160,140,200,.5)";
            ctx.fillRect(b.r * .68, -b.r * .6 + i * b.r * .17, b.r * .26, b.r * .03);
        }

        /* les ferrures d'or */
        ctx.fillStyle = "#ffd76a";
        ctx.fillRect(-b.r * .95, -b.r * .72, b.r * .16, b.r * 1.44);

        [-1, 1].forEach(sg => {
            ctx.beginPath();
            ctx.arc(-b.r * .5, sg * b.r * .42, b.r * .1, 0, Math.PI * 2);
            ctx.fill();
        });

        /* le sceau grave */
        ctx.strokeStyle = "#ffd76a";
        ctx.lineWidth   = b.r * .05;

        ctx.beginPath();
        ctx.arc(-b.r * .05, 0, b.r * .3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-b.r * .05, 0, b.r * .16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

    }

    ctx.globalAlpha = 1;

}


/* =========================================================
   MONDE 9 : L'HORLOGE
========================================================= */

function paintClock(c){

    const base = c.createRadialGradient(
        W / 2, H * .45, 0,
        W / 2, H * .45, Math.max(W, H) * .8
    );
    base.addColorStop(0,   "#1a2a3c");
    base.addColorStop(.55, "#0d1826");
    base.addColorStop(1,   "#050a12");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* le grand cadran grave au fond */
    c.save();
    c.translate(W / 2, H * .45);

    const R = Math.min(W, H) * .62;

    c.strokeStyle = "rgba(150,200,235,.14)";
    c.lineWidth   = 3 * unit;

    c.beginPath();
    c.arc(0, 0, R, 0, Math.PI * 2);
    c.stroke();

    c.beginPath();
    c.arc(0, 0, R * .82, 0, Math.PI * 2);
    c.stroke();

    /* les heures */
    for(let i = 0; i < 12; i++){

        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;

        c.strokeStyle = "rgba(180,225,255,.28)";
        c.lineWidth   = (i % 3 === 0 ? 6 : 3) * unit;

        c.beginPath();
        c.moveTo(Math.cos(a) * R * .82, Math.sin(a) * R * .82);
        c.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        c.stroke();

    }

    /* les minutes */
    for(let i = 0; i < 60; i++){

        const a = (i / 60) * Math.PI * 2;

        c.strokeStyle = "rgba(150,200,235,.12)";
        c.lineWidth   = 1.4 * unit;

        c.beginPath();
        c.moveTo(Math.cos(a) * R * .9, Math.sin(a) * R * .9);
        c.lineTo(Math.cos(a) * R * .95, Math.sin(a) * R * .95);
        c.stroke();

    }

    c.restore();

    /* les rouages en arriere-plan */
    for(let i = 0; i < 7; i++){

        const x  = Math.random() * W;
        const y  = Math.random() * H;
        const rr = (40 + Math.random() * 110) * unit;

        c.save();
        c.translate(x, y);
        c.rotate(Math.random() * 6.28);

        c.strokeStyle = "rgba(120,170,210,.10)";
        c.lineWidth   = rr * .16;

        c.beginPath();
        c.arc(0, 0, rr * .72, 0, Math.PI * 2);
        c.stroke();

        c.lineWidth = rr * .1;

        for(let k = 0; k < 12; k++){
            const a = (k / 12) * Math.PI * 2;
            c.beginPath();
            c.moveTo(Math.cos(a) * rr * .78, Math.sin(a) * rr * .78);
            c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            c.stroke();
        }

        c.restore();

    }

    /* la poussiere de laiton */
    for(let i = 0; i < Math.round(W * H / 6000); i++){

        const x = Math.random() * W;
        const y = Math.random() * H;

        c.fillStyle = "rgba(210,235,255,.4)";
        c.fillRect(x, y, unit * 1.3, unit * 1.3);

    }

    const vig = c.createRadialGradient(
        W / 2, H * .45, Math.min(W, H) * .25,
        W / 2, H / 2, Math.max(W, H) * .8
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,4,10,.8)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


function enterClock(){
    w69Enter("horloge", "🕰", "#9fe9ff");
    for(let i = 0; i < 2; i++){ spawnEngrenage(); }
    for(let i = 0; i < 2; i++){ spawnPendule(); }
    for(let i = 0; i < 2; i++){ spawnCoucou(); }
}


/* --- L'ENGRENAGE : il longe le bord, sans jamais s'arreter --- */
function spawnEngrenage(){

    const r = (32 + rnd() * 12) * unit;

    engrenages.push({
        x:0, y:0, r:r,
        s:rnd(),                       /* position sur le tour, 0 a 1 */
        way:engrenages.length % 2 ? -1 : 1,
        spin:0,
        birth:.5, stunned:0
    });

}


/* le point du perimetre a la distance k (0 a 1) */
function ringPoint(k, inset){

    const a = playArea();

    const x0 = a.x0 + inset, x1 = a.x1 - inset;
    const y0 = a.y0 + inset, y1 = a.y1 - inset;

    const w = Math.max(1, x1 - x0);
    const h = Math.max(1, y1 - y0);

    const per = 2 * (w + h);
    let   d   = ((k % 1) + 1) % 1 * per;

    if(d < w)          { return {x:x0 + d,         y:y0}; }
    d -= w;
    if(d < h)          { return {x:x1,             y:y0 + d}; }
    d -= h;
    if(d < w)          { return {x:x1 - d,         y:y1}; }
    d -= w;
                         return {x:x0,             y:y1 - d};

}


function ringLength(inset){

    const a = playArea();

    return 2 * ((a.x1 - a.x0 - inset * 2) + (a.y1 - a.y0 - inset * 2));

}


function updateEngrenages(dt){

    const speed = mimicSpeed({type:MIMIC_TYPES[0]}) * 1.25;

    for(const g of engrenages){

        if(g.birth > 0){ g.birth = Math.max(0, g.birth - dt); continue; }
        if(g.stunned > 0){ g.stunned -= dt; continue; }

        const per = Math.max(1, ringLength(g.r));

        g.s    += g.way * speed * dt / per;
        g.spin += g.way * dt * 3;

        const p = ringPoint(g.s, g.r);

        g.x = p.x;
        g.y = p.y;

        w69Hit(g);

    }

}


function drawEngrenages(){

    for(const g of engrenages){

        const r = g.r * (g.birth > 0 ? 1 - g.birth / .5 : 1);

        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.spin);

        /* les dents */
        ctx.fillStyle = "#8fb6d0";

        for(let i = 0; i < 14; i++){

            const a = (i / 14) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(Math.cos(a - .1) * r * .82, Math.sin(a - .1) * r * .82);
            ctx.lineTo(Math.cos(a - .07) * r * 1.15, Math.sin(a - .07) * r * 1.15);
            ctx.lineTo(Math.cos(a + .07) * r * 1.15, Math.sin(a + .07) * r * 1.15);
            ctx.lineTo(Math.cos(a + .1) * r * .82, Math.sin(a + .1) * r * .82);
            ctx.closePath();
            ctx.fill();

        }

        /* le corps */
        const gr = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r);
        gr.addColorStop(0, "#cfe6f5");
        gr.addColorStop(1, "#3d5f78");

        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(0, 0, r * .85, 0, Math.PI * 2);
        ctx.fill();

        /* les evidements */
        ctx.fillStyle = "#122232";

        for(let i = 0; i < 5; i++){
            const a = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * .5, Math.sin(a) * r * .5, r * .16, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(0, 0, r * .2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

}


/* --- LE PENDULE : il balaie toujours le meme arc --- */
function spawnPendule(){

    const a = playArea();

    const px = a.x0 + (a.x1 - a.x0) * (.28 + rnd() * .44);

    pendules.push({
        px:px, py:a.y0 + 6 * unit,
        len:(a.y1 - a.y0) * (.55 + rnd() * .3),
        amp:.85 + rnd() * .3,
        t:rnd() * 6.28,
        speed:1 + rnd() * .35,
        r:(26 + rnd() * 10) * unit,
        x:0, y:0,
        birth:.5, stunned:0
    });

}


function updatePendules(dt){

    for(const q of pendules){

        if(q.birth > 0){ q.birth = Math.max(0, q.birth - dt); continue; }
        if(q.stunned > 0){ q.stunned -= dt; continue; }

        q.t += dt * q.speed;

        const a = Math.sin(q.t) * q.amp;

        q.x = q.px + Math.sin(a) * q.len;
        q.y = q.py + Math.cos(a) * q.len;

        w69Hit(q);

    }

}


function drawPendules(){

    for(const q of pendules){

        if(q.birth > 0){ continue; }

        const r = q.r;

        ctx.save();

        /* la tige */
        ctx.strokeStyle = "#7fa6c0";
        ctx.lineWidth   = r * .16;
        ctx.lineCap     = "round";

        ctx.beginPath();
        ctx.moveTo(q.px, q.py);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();

        /* le point d'accroche */
        ctx.fillStyle = "#3d5f78";
        ctx.beginPath();
        ctx.arc(q.px, q.py, r * .3, 0, Math.PI * 2);
        ctx.fill();

        /* le lest : un disque de laiton */
        const g = ctx.createRadialGradient(q.x - r * .3, q.y - r * .3, r * .1, q.x, q.y, r);
        g.addColorStop(0, "#ffeab0");
        g.addColorStop(.6, "#d8a53d");
        g.addColorStop(1, "#6b4a10");

        ctx.fillStyle   = g;
        ctx.shadowColor = "#ffd76a";
        ctx.shadowBlur  = 16;

        ctx.beginPath();
        ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur  = 0;
        ctx.strokeStyle = "#3a2708";
        ctx.lineWidth   = r * .1;
        ctx.stroke();

        /* le chiffre grave */
        ctx.fillStyle = "#4a3410";
        ctx.beginPath();
        ctx.arc(q.x, q.y, r * .42, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

}


/* =========================================================
   L'ARRIVEE DANS CES QUATRE MONDES
========================================================= */

/* le meme bandeau pour tous : MONDE n, puis son nom */
function worldBanner(zoneId, icon){

    const w = WORLDS.find(x => x.zone === zoneId);

    if(!w){
        return;
    }

    pickupMessage(icon + " MONDE " + w.n + "  " + w.name, w.col);

}


function w69Enter(zoneId, label, col){

    zone = zoneId;

    portal = null;

    solids = []; orbs = []; coins = []; hearts = [];
    balls  = []; slimes = []; trails = []; mimics = [];
    archers = []; blobs = []; puddles = []; logs = [];
    crawlers = []; drips = []; candies = []; gloutons = [];
    guimauves = []; anguilles = []; lanternes = []; bulles = [];

    boss = null; bossShots = []; bossBeams = [];

    clearW69();

    trace       = [];
    traceLength = 0;

    const a = playArea();

    player.x = (a.x0 + a.x1) / 2;
    player.y = (a.y0 + a.y1) / 2;

    player.invincible = 2.4;

    addCoin();
    addOrb();

    noteWorld(zoneId);

    worldBanner(zoneId, label);

    sound(200, .7, "triangle", .05);

}


function updateW69(dt){

    if(zone === "desert"){

        updateMirages(dt);

        w69Timer -= dt;

        if(w69Timer <= 0){
            w69Timer = 7;
            spawnMirage();
        }

        return;

    }

    if(zone === "forge"){

        updateChaines(dt);
        updateFournaises(dt);

        w69Timer -= dt;

        if(w69Timer <= 0){
            w69Timer = 12;
            if(chaines.length < 3){ spawnChaine(); }
            else if(fournaises.length < 3){ spawnFournaise(); }
        }

        return;

    }

    if(zone === "biblio"){

        updateGrimoires(dt);
        updateTomes(dt);

        tomeTimer -= dt;

        if(tomeTimer <= 0){
            tomeTimer = TOME_EVERY;
            spawnTome();
        }

        w69Timer -= dt;

        if(w69Timer <= 0){
            w69Timer = 8;
            spawnGrimoire();
        }

        return;

    }

    if(zone === "horloge"){

        updateEngrenages(dt);
        updatePendules(dt);
        updateCoucous(dt);

        w69Timer -= dt;

        if(w69Timer <= 0){
            w69Timer = 12;
            if(coucous.length < 3){ spawnCoucou(); }
            else if(pendules.length < 3){ spawnPendule(); }
        }

        return;

    }

    /* on n'est plus dans ces mondes : on range */
    if(mirages.length || chaines.length || fournaises.length ||
       grimoires.length || pages.length || tomes.length ||
       engrenages.length || pendules.length || coucous.length){
        clearW69();
    }

}


function drawW69(){

    if(zone === "desert"){
        drawMirages();
    }else if(zone === "forge"){
        drawFournaises();
        drawChaines();
    }else if(zone === "biblio"){
        drawTomes();
        drawGrimoires();
    }else if(zone === "horloge"){
        drawEngrenages();
        drawPendules();
        drawCoucous();
    }

}


/* toutes les creatures de ces mondes qui savent etre sonnees */
function w69Creatures(){
    return [].concat(
        mirages, chaines, fournaises,
        grimoires, engrenages, pendules, coucous
    );
}


/* =========================================================
   LA GUIMAUVE  (PAYS DES BONBONS)

   Elle rebondit en ligne droite et s'ecrase a chaque
   impact. Sa trajectoire est lisible : c'est en anticipant
   son rebond qu'on s'en sort, pas en courant devant elle.
========================================================= */

const GUIMAUVE_TONS = [
    ["#fff2f7", "#ffb3d4", "#ff6fae"],
    ["#f4fff0", "#b8f0a8", "#65c95f"],
    ["#fffaf0", "#ffe08a", "#ffab3d"],
    ["#f2f8ff", "#b8dcff", "#6fa8ff"]
];


function spawnGuimauve(){

    if(guimauves.length >= MAX_GUIMAUVES){
        return;
    }

    const r = (28 + rnd() * 10) * unit;

    const p = findSpot(r, 300) || findSpot(r, 190);

    if(!p){
        return;
    }

    const a = rnd() * Math.PI * 2;

    const tons = GUIMAUVE_TONS[Math.floor(rnd() * GUIMAUVE_TONS.length)];

    guimauves.push({
        x:p.x,
        y:p.y,
        r:r,
        ang:a,
        squash:0,
        squashAng:0,
        birth:.6,
        stunned:0,
        blink:2 + rnd() * 4,
        tons:tons,
        sugar:Array.from({length:12}, () => ({
            a:rnd() * 6.28,
            d:.15 + rnd() * .75,
            s:.03 + rnd() * .035
        }))
    });

}


function guimauveBounce(g, nx, ny){

    /* on renvoie l'angle par rapport a la normale du choc */
    const dot = Math.cos(g.ang) * nx + Math.sin(g.ang) * ny;

    const rx = Math.cos(g.ang) - 2 * dot * nx;
    const ry = Math.sin(g.ang) - 2 * dot * ny;

    g.ang       = Math.atan2(ry, rx);
    g.squash    = 1;
    g.squashAng = Math.atan2(ny, nx);

    sound(260, .09, "triangle", .035);

}


function updateGuimauves(dt){

    if(zone !== "bonbon"){

        if(guimauves.length){
            guimauves = [];
        }

        return;

    }

    guimauveTimer -= dt;

    if(guimauveTimer <= 0 && guimauves.length < MAX_GUIMAUVES){
        spawnGuimauve();
        guimauveTimer = 8;
    }

    const area  = playArea();
    const speed = mimicSpeed({type:MIMIC_TYPES[0]}) * 1.15;

    for(const g of guimauves){

        if(g.squash > 0){
            g.squash = Math.max(0, g.squash - dt * 4.5);
        }

        g.blink -= dt;

        if(g.blink < -.14){
            g.blink = 2.4 + rnd() * 4;
        }

        if(g.birth > 0){
            g.birth = Math.max(0, g.birth - dt);
            continue;
        }

        if(g.stunned > 0){
            g.stunned -= dt;
            continue;
        }

        g.x += Math.cos(g.ang) * speed * dt;
        g.y += Math.sin(g.ang) * speed * dt;

        /* les bords du terrain */
        if(g.x < area.x0 + g.r){ g.x = area.x0 + g.r; guimauveBounce(g,  1, 0); }
        if(g.x > area.x1 - g.r){ g.x = area.x1 - g.r; guimauveBounce(g, -1, 0); }
        if(g.y < area.y0 + g.r){ g.y = area.y0 + g.r; guimauveBounce(g, 0,  1); }
        if(g.y > area.y1 - g.r){ g.y = area.y1 - g.r; guimauveBounce(g, 0, -1); }

        /* les friandises solides */
        for(const s of solids){

            if(s.hidden){
                continue;
            }

            const dx = g.x - s.x;
            const dy = g.y - s.y;
            const d  = Math.hypot(dx, dy);

            if(d < s.r + g.r && d > .001){

                const nx = dx / d;
                const ny = dy / d;

                g.x = s.x + nx * (s.r + g.r + .5);
                g.y = s.y + ny * (s.r + g.r + .5);

                guimauveBounce(g, nx, ny);

            }

        }

        if(player.invincible <= 0 && collide(player, g)){
            loseLife(null);
            burst(g.x, g.y, 22, g.tons[2]);
        }

    }

}


function drawGuimauves(){

    for(const g of guimauves){

        const grow = g.birth > 0 ? 1 - g.birth / .6 : 1;
        const r    = g.r * Math.max(.15, grow);

        ctx.save();
        ctx.translate(g.x, g.y);

        /* l'ombre au sol */
        ctx.globalAlpha = .22;
        ctx.fillStyle   = "#a82f6a";
        ctx.beginPath();
        ctx.ellipse(0, r * .9, r * 1.05, r * .3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        /* elle s'ecrase dans l'axe du choc */
        if(g.squash > .01){
            ctx.rotate(g.squashAng);
            ctx.scale(1 - g.squash * .35, 1 + g.squash * .30);
            ctx.rotate(-g.squashAng);
        }

        const w = r * .92;
        const h = r * .86;
        const k = r * .34;   /* arrondi des coins */

        /* le corps : un coussin arrondi */
        const body = ctx.createLinearGradient(0, -h, 0, h);
        body.addColorStop(0,  g.tons[0]);
        body.addColorStop(.55, g.tons[1]);
        body.addColorStop(1,  g.tons[2]);

        ctx.fillStyle = body;

        ctx.beginPath();

        if(ctx.roundRect){
            ctx.roundRect(-w, -h, w * 2, h * 2, k);
        }else{
            ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
        }

        ctx.fill();

        ctx.lineWidth   = Math.max(1.6, r * .07);
        ctx.strokeStyle = g.stunned > 0 ? "#7f8ba8" : g.tons[2];
        ctx.stroke();

        /* le sucre glace */
        ctx.globalAlpha = .55;
        ctx.fillStyle   = "#ffffff";

        for(const sg of g.sugar){
            ctx.beginPath();
            ctx.arc(
                Math.cos(sg.a) * w * sg.d,
                Math.sin(sg.a) * h * sg.d,
                r * sg.s, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        /* la brillance sur le haut */
        ctx.globalAlpha = .5;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-w * .3, -h * .48, w * .38, h * .2, -.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        /* le visage */
        const ex = w * .36;
        const ey = -h * .06;
        const er = r * .15;

        if(g.blink < 0 || g.stunned > 0){

            ctx.strokeStyle = "#4a1030";
            ctx.lineWidth   = Math.max(1.4, r * .07);
            ctx.lineCap     = "round";

            [-1, 1].forEach(sgn => {
                ctx.beginPath();
                ctx.moveTo(sgn * ex - er, ey);
                ctx.lineTo(sgn * ex + er, ey);
                ctx.stroke();
            });

        }else{

            [-1, 1].forEach(sgn => {

                ctx.fillStyle = "#4a1030";
                ctx.beginPath();
                ctx.arc(sgn * ex, ey, er, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(sgn * ex - er * .3, ey - er * .35, er * .38, 0, Math.PI * 2);
                ctx.fill();

            });

        }

        /* la bouche : un petit sourire content */
        ctx.strokeStyle = "#4a1030";
        ctx.lineWidth   = Math.max(1.4, r * .07);
        ctx.lineCap     = "round";

        ctx.beginPath();
        ctx.arc(0, h * .18, r * .22, .25, Math.PI - .25);
        ctx.stroke();

        ctx.restore();

    }

}


/* --- les pics de verre du desert --- */
function drawGlassSpike(s, t){

    const g = s.glass;

    ctx.save();
    ctx.translate(s.x, s.y);

    /* l'ombre portee sur le sable */
    ctx.globalAlpha = .3;
    ctx.fillStyle   = "#8a5426";

    ctx.beginPath();
    ctx.ellipse(s.r * .18, s.r * .78, s.r * .95, s.r * .3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    for(const sh of g.shards){

        const bx = sh.x * s.r * .8;
        const hw = sh.w * s.r;
        const hh = sh.h * s.r;

        ctx.save();
        ctx.translate(bx, s.r * .7);
        ctx.rotate(sh.a);

        const grad = ctx.createLinearGradient(0, -hh, 0, 0);
        grad.addColorStop(0,   "rgba(232,250,255,.95)");
        grad.addColorStop(.55, "rgba(150,215,240,.8)");
        grad.addColorStop(1,   "rgba(70,140,180,.7)");

        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw * .5, 0);
        ctx.lineTo(-hw * .5, 0);
        ctx.closePath();
        ctx.fill();

        /* l'arete qui accroche la lumiere */
        ctx.strokeStyle = "rgba(255,255,255,.85)";
        ctx.lineWidth   = Math.max(1, s.r * .045);

        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(-hw * .12, 0);
        ctx.stroke();

        ctx.strokeStyle = "rgba(20,70,105,.85)";
        ctx.lineWidth   = Math.max(1.4, s.r * .05);

        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw * .5, 0);
        ctx.lineTo(-hw * .5, 0);
        ctx.closePath();
        ctx.stroke();

        /* l'eclat qui scintille */
        ctx.globalAlpha = .35 + .35 * Math.sin(t * 1.6 + g.seed + sh.x * 3);
        ctx.fillStyle   = "#ffffff";

        ctx.beginPath();
        ctx.ellipse(0, -hh * .55, hw * .1, hh * .18, sh.a, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        ctx.restore();

    }

    ctx.restore();

}


/* --- les rochers des abysses, a la place des planetes --- */
function drawAbyssRock(s, t){

    ctx.save();
    ctx.translate(s.x, s.y);

    /* la lueur froide qui les detoure */
    const halo = ctx.createRadialGradient(0, 0, s.r * .7, 0, 0, s.r * 1.7);
    halo.addColorStop(0, "rgba(80,200,240,.26)");
    halo.addColorStop(1, "rgba(80,200,240,0)");

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, s.r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    /* la masse : un caillou irregulier, stable dans le temps */
    const seed = (s.pulse * 97) % 6.28;

    ctx.beginPath();

    for(let i = 0; i <= 11; i++){

        const a  = (i / 11) * Math.PI * 2;
        const rr = s.r * (.82 + .22 * Math.abs(Math.sin(a * 2.3 + seed)));

        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);

    }

    ctx.closePath();

    const g = ctx.createLinearGradient(0, -s.r, 0, s.r);
    g.addColorStop(0, "#3d6f88");
    g.addColorStop(1, "#12303f");

    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth   = Math.max(2, s.r * .08);
    ctx.strokeStyle = "#6fd0e8";
    ctx.stroke();

    /* les coraux lumineux accroches dessus */
    for(let i = 0; i < 4; i++){

        const a  = seed + i * 1.57;
        const bx = Math.cos(a) * s.r * .7;
        const by = Math.sin(a) * s.r * .7;

        const pulse = .35 + .35 * Math.sin(t * 1.6 + i + seed);

        ctx.globalAlpha = pulse;
        ctx.strokeStyle = i % 2 ? "#5fe8ff" : "#7bffca";
        ctx.lineWidth   = Math.max(1.2, s.r * .05);
        ctx.lineCap     = "round";

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a) * s.r * .3, by + Math.sin(a) * s.r * .3);
        ctx.stroke();

        ctx.globalAlpha = pulse;
        ctx.fillStyle   = i % 2 ? "#9ff2ff" : "#b6ffe4";

        ctx.beginPath();
        ctx.arc(bx + Math.cos(a) * s.r * .34, by + Math.sin(a) * s.r * .34, s.r * .07, 0, Math.PI * 2);
        ctx.fill();

    }

    ctx.globalAlpha = 1;
    ctx.restore();

}


/* =========================================================
   MONDE 4 : LES ABYSSES

   Apres le pays des bonbons, le portail s'ouvre vers le
   fond de l'ocean. Il fait noir, tout brille faiblement,
   et deux choses vivent la : l'ANGUILLE, qui ondule sans
   jamais s'arreter, et la LANTERNE, immobile, qui attire
   dans sa lueur avant de se jeter sur toi.
========================================================= */

/* --- le decor --- */
function paintAbyss(c){

    /* l'eau, de plus en plus noire vers le bas */
    const base = c.createLinearGradient(0, 0, W * .15, H);
    base.addColorStop(0,   "#0b2f52");
    base.addColorStop(.35, "#06203c");
    base.addColorStop(.75, "#03101f");
    base.addColorStop(1,   "#01070f");

    c.fillStyle = base;
    c.fillRect(0, 0, W, H);

    /* les rais de lumiere qui tombent de la surface */
    c.save();

    for(let i = 0; i < 7; i++){

        const x = (i + .5) / 7 * W + (Math.random() - .5) * W * .06;
        const w = (40 + Math.random() * 90) * unit;

        const g = c.createLinearGradient(x, 0, x + w * .4, H);
        g.addColorStop(0,  "rgba(150,225,255,.16)");
        g.addColorStop(.5, "rgba(110,190,235,.06)");
        g.addColorStop(1,  "rgba(90,160,210,0)");

        c.fillStyle = g;

        c.beginPath();
        c.moveTo(x - w * .35, 0);
        c.lineTo(x + w * .35, 0);
        c.lineTo(x + w * .95, H);
        c.lineTo(x - w * .05, H);
        c.closePath();
        c.fill();

    }

    c.restore();

    /* les massifs sombres du fond */
    for(let i = 0; i < 9; i++){

        const x  = Math.random() * W;
        const hh = (100 + Math.random() * 260) * unit;
        const ww = (90 + Math.random() * 180) * unit;

        c.fillStyle = "rgba(2,10,20,.75)";

        c.beginPath();
        c.moveTo(x - ww / 2, H);

        for(let k = 0; k <= 8; k++){
            const kk = k / 8;
            c.lineTo(
                x - ww / 2 + kk * ww,
                H - Math.sin(kk * Math.PI) * hh * (.7 + Math.random() * .3)
            );
        }

        c.closePath();
        c.fill();

    }

    /* les algues qui montent du sol */
    for(let i = 0; i < 26; i++){

        const x  = Math.random() * W;
        const hh = (70 + Math.random() * 220) * unit;

        c.strokeStyle = "rgba(20,80,90,.45)";
        c.lineWidth   = (2 + Math.random() * 3) * unit;
        c.lineCap     = "round";

        c.beginPath();
        c.moveTo(x, H);

        for(let k = 1; k <= 5; k++){
            const kk = k / 5;
            c.lineTo(x + Math.sin(kk * 3 + i) * 22 * unit, H - kk * hh);
        }

        c.stroke();

    }

    /* le plancton : de tout petits points lumineux */
    const motes = Math.round(W * H / 5200);

    for(let i = 0; i < motes; i++){

        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = (.7 + Math.random() * 1.9) * unit;

        const tint = Math.random() < .25 ? "160,255,240" : "120,200,255";

        const g = c.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, "rgba(" + tint + ",.85)");
        g.addColorStop(1, "rgba(" + tint + ",0)");

        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r * 4, 0, Math.PI * 2);
        c.fill();

    }

    /* la pression : les bords se referment */
    const vig = c.createRadialGradient(
        W / 2, H * .42, Math.min(W, H) * .22,
        W / 2, H / 2, Math.max(W, H) * .78
    );

    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,4,10,.78)");

    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);

    twinkles = [];

}


/* --- l'arrivee --- */
function enterAbyss(){

    zone = "abysse";

    portal = null;

    solids  = [];
    orbs    = [];
    coins   = [];
    hearts  = [];
    balls   = [];
    slimes  = [];
    trails  = [];
    mimics  = [];
    archers = [];
    blobs   = [];
    puddles = [];
    logs    = [];
    crawlers = [];
    drips   = [];
    candies = [];
    gloutons = [];
    guimauves = [];

    trace       = [];
    traceLength = 0;

    const a = playArea();

    player.x = (a.x0 + a.x1) / 2;
    player.y = (a.y0 + a.y1) / 2;

    player.invincible = 2.2;

    anguilles = [];
    lanternes = [];
    bulles    = [];
    abyssTimer = 0;

    for(let i = 0; i < 2; i++){
        spawnAnguille();
    }

    spawnLanterne();

    addCoin();
    addOrb();

    noteWorld("abysse");

    worldBanner("abysse", "🌑");

    sound(120, .9, "sine",     .07);
    sound(180, .6, "triangle", .04);

    /* la recompense : un skin qu'on ne trouve pas en boutique */
    unlockExclusive("abyssal");

}


/* =========================================================
   LE SKIN EXCLUSIF

   Il ne s'achete pas : on le gagne en traversant tout le
   pays des bonbons et en franchissant le dernier portail.
========================================================= */

function unlockExclusive(id){

    if(ownedSkins.includes(id)){
        return;
    }

    const skin = SKINS.find(s => s.id === id);

    if(!skin){
        return;
    }

    ownedSkins.push(id);
    saveGame();

    setTimeout(() => {
        pickupMessage("🏆 " + skin.name + " DÉBLOQUÉ", skin.color);
        coinChime();
    }, 1400);

}


/* =========================================================
   L'ANGUILLE

   Elle ondule en permanence et se dirige vers toi, mais
   elle tourne lentement : on la seme en changeant d'angle
   au dernier moment.
========================================================= */

function spawnAnguille(){

    if(anguilles.length >= MAX_ANGUILLES){
        return;
    }

    const r = (19 + rnd() * 7) * unit;

    const p = findSpot(r * 2, 300) || findSpot(r * 2, 170);

    if(!p){
        return;
    }

    const ang = rnd() * Math.PI * 2;

    const seg = [];

    for(let i = 0; i < 16; i++){
        seg.push({x:p.x, y:p.y});
    }

    anguilles.push({
        x:p.x,
        y:p.y,
        r:r,
        ang:ang,
        seg:seg,
        wob:rnd() * 6.28,
        birth:.7,
        stunned:0,
        glow:rnd() * 6.28,
        hue:rnd() < .5 ? "#3fe0ff" : "#7bffca"
    });

}


function updateAnguilles(dt){

    if(zone !== "abysse"){
        return;
    }

    const area = playArea();

    const base = mimicSpeed({type:MIMIC_TYPES[0]}) * .92;

    for(const e of anguilles){

        if(e.birth > 0){
            e.birth = Math.max(0, e.birth - dt);
            continue;
        }

        if(e.stunned > 0){
            e.stunned -= dt;
            e.wob     += dt * 2;
            continue;
        }

        /* elle vise le joueur, mais ne tourne que lentement */
        const aim  = lureTarget();
        const want = Math.atan2(aim.y - e.y, aim.x - e.x);

        let diff = want - e.ang;

        while(diff >  Math.PI){ diff -= Math.PI * 2; }
        while(diff < -Math.PI){ diff += Math.PI * 2; }

        e.ang += Math.max(-1.5 * dt, Math.min(1.5 * dt, diff));

        e.wob  += dt * 7;
        e.glow += dt * 3;

        /* l'ondulation : elle n'avance jamais tout droit */
        const swim = e.ang + Math.sin(e.wob) * .55;

        e.x += Math.cos(swim) * base * dt;
        e.y += Math.sin(swim) * base * dt;

        /* elle rebondit sur les bords */
        if(e.x < area.x0 + e.r){ e.x = area.x0 + e.r; e.ang = Math.PI - e.ang; }
        if(e.x > area.x1 - e.r){ e.x = area.x1 - e.r; e.ang = Math.PI - e.ang; }
        if(e.y < area.y0 + e.r){ e.y = area.y0 + e.r; e.ang = -e.ang; }
        if(e.y > area.y1 - e.r){ e.y = area.y1 - e.r; e.ang = -e.ang; }

        /* le corps suit la tete */
        e.seg.unshift({x:e.x, y:e.y});
        e.seg.length = 16;

        if(player.invincible <= 0 && collide(player, e)){
            loseLife(null);
            burst(e.x, e.y, 20, e.hue);
        }

    }

    /* elles reviennent si on en tue... elles ne meurent pas : on complete */
    abyssTimer -= dt;

    if(abyssTimer <= 0){

        abyssTimer = 9;

        if(anguilles.length < MAX_ANGUILLES){
            spawnAnguille();
        }else if(lanternes.length < MAX_LANTERNES){
            spawnLanterne();
        }

    }

}


function drawAnguilles(){

    for(const e of anguilles){

        const grow = e.birth > 0 ? 1 - e.birth / .7 : 1;
        const k    = Math.max(.12, grow);

        ctx.save();

        /* le halo dans l'eau */
        const halo = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 7);
        halo.addColorStop(0, hexA(e.hue, .30));
        halo.addColorStop(1, hexA(e.hue, 0));

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 7, 0, Math.PI * 2);
        ctx.fill();

        /* le corps : un ruban qui s'affine */
        for(let i = e.seg.length - 1; i >= 0; i--){

            const sgm = e.seg[i];
            const kk  = 1 - i / e.seg.length;
            const rr  = e.r * k * (.25 + kk * .75);

            ctx.globalAlpha = e.stunned > 0 ? .5 : .95;
            ctx.fillStyle   = i % 2 ? "#12587a" : "#1a6f96";

            ctx.beginPath();
            ctx.arc(sgm.x, sgm.y, rr, 0, Math.PI * 2);
            ctx.fill();

        }

        /* la ligne lumineuse sur le dos */
        ctx.globalAlpha = .8;
        ctx.strokeStyle = e.hue;
        ctx.lineWidth   = 2.8 * unit;
        ctx.lineCap     = "round";
        ctx.shadowColor = e.hue;
        ctx.shadowBlur  = 12;

        ctx.beginPath();

        for(let i = 0; i < e.seg.length; i++){
            ctx.lineTo(e.seg[i].x, e.seg[i].y);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        /* la tete */
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.ang);

        ctx.fillStyle = "#134f6c";
        ctx.beginPath();
        ctx.ellipse(0, 0, e.r * k * 1.5, e.r * k, 0, 0, Math.PI * 2);
        ctx.fill();

        /* la machoire */
        ctx.fillStyle = "#0a2436";
        ctx.beginPath();
        ctx.moveTo(e.r * k * 1.5, 0);
        ctx.lineTo(e.r * k * .5, -e.r * k * .45);
        ctx.lineTo(e.r * k * .5,  e.r * k * .45);
        ctx.closePath();
        ctx.fill();

        /* les yeux */
        ctx.fillStyle   = e.stunned > 0 ? "#8fa0c0" : "#ffe680";
        ctx.shadowColor = "#ffd24d";
        ctx.shadowBlur  = e.stunned > 0 ? 0 : 8;

        [-1, 1].forEach(sgn => {
            ctx.beginPath();
            ctx.arc(e.r * k * .35, sgn * e.r * k * .45, e.r * k * .22, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
        ctx.restore();

    }

}


/* =========================================================
   LA LANTERNE

   Elle ne bouge presque pas. Sa lueur porte loin : entre
   dedans et elle se ramasse, puis se detend d'un coup.
========================================================= */

function spawnLanterne(){

    if(lanternes.length >= MAX_LANTERNES){
        return;
    }

    const r = (34 + rnd() * 12) * unit;

    const p = findSpot(r, 320) || findSpot(r, 200);

    if(!p){
        return;
    }

    lanternes.push({
        x:p.x,
        y:p.y,
        r:r,
        vx:0,
        vy:0,
        phase:"idle",
        timer:0,
        lure:rnd() * 6.28,
        birth:.7,
        stunned:0,
        facing:1,
        chomp:0
    });

}


function lanterneRange(l){
    return l.r * 5.4;
}


function updateLanternes(dt){

    if(zone !== "abysse"){
        return;
    }

    const area = playArea();

    const rush = mimicSpeed({type:MIMIC_TYPES[0]}) * 2.6;

    for(const l of lanternes){

        if(l.birth > 0){
            l.birth = Math.max(0, l.birth - dt);
            continue;
        }

        l.lure += dt * 2.2;

        if(l.chomp > 0){
            l.chomp = Math.max(0, l.chomp - dt * 3);
        }

        if(l.stunned > 0){
            l.stunned -= dt;
            l.phase    = "idle";
            l.timer    = .6;
            continue;
        }

        const aim = lureTarget();

        const d = Math.hypot(aim.x - l.x, aim.y - l.y);

        if(l.phase === "idle"){

            /* elle derive tres doucement */
            l.x += Math.cos(l.lure * .3) * 12 * unit * dt;
            l.y += Math.sin(l.lure * .21) * 12 * unit * dt;

            l.timer = Math.max(0, l.timer - dt);

            if(d < lanterneRange(l) && l.timer <= 0){

                l.phase = "wind";
                l.timer = .45;

                sound(90, .25, "sine", .05);

            }

        }else if(l.phase === "wind"){

            /* elle se ramasse : c'est le signal */
            l.timer -= dt;

            if(l.timer <= 0){

                const a = Math.atan2(aim.y - l.y, aim.x - l.x);

                l.vx = Math.cos(a) * rush;
                l.vy = Math.sin(a) * rush;

                l.facing = l.vx < 0 ? -1 : 1;

                l.phase = "rush";
                l.timer = .85;
                l.chomp = 1;

                sound(220, .18, "sawtooth", .05);

            }

        }else{

            l.timer -= dt;

            l.x += l.vx * dt;
            l.y += l.vy * dt;

            l.vx *= Math.pow(.12, dt);
            l.vy *= Math.pow(.12, dt);

            if(l.timer <= 0){
                l.phase = "idle";
                l.timer = 1.6;
            }

        }

        l.x = Math.max(area.x0 + l.r, Math.min(area.x1 - l.r, l.x));
        l.y = Math.max(area.y0 + l.r, Math.min(area.y1 - l.r, l.y));

        resolveSolids(l);

        if(player.invincible <= 0 && collide(player, l)){
            loseLife(null);
            burst(l.x, l.y, 22, "#5fe8ff");
        }

    }

    /* elles ne se superposent pas */
    for(let i = 0; i < lanternes.length; i++){
        for(let j = i + 1; j < lanternes.length; j++){

            const a = lanternes[i], b = lanternes[j];

            let dx = b.x - a.x, dy = b.y - a.y;
            let d  = Math.hypot(dx, dy);

            const min = (a.r + b.r) * 1.3;

            if(d < min){
                if(d < .001){ dx = 1; dy = 0; d = 1; }
                const push = (min - d) / 2;
                a.x -= dx / d * push; a.y -= dy / d * push;
                b.x += dx / d * push; b.y += dy / d * push;
            }

        }
    }

}


function drawLanternes(){

    for(const l of lanternes){

        const grow = l.birth > 0 ? 1 - l.birth / .7 : 1;
        const r    = l.r * Math.max(.12, grow);

        const wind = l.phase === "wind";

        /* le halo qui attire */
        const R = lanterneRange(l);

        const halo = ctx.createRadialGradient(l.x, l.y, r * .4, l.x, l.y, R);
        halo.addColorStop(0,  wind ? "rgba(255,120,90,.30)" : "rgba(120,220,255,.20)");
        halo.addColorStop(.6, wind ? "rgba(255,90,70,.10)"  : "rgba(90,190,235,.07)");
        halo.addColorStop(1,  "rgba(60,150,200,0)");

        ctx.save();
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(l.x, l.y, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(l.x, l.y);
        ctx.scale(l.facing, 1);

        /* elle se ramasse avant de bondir */
        if(wind){
            const k = 1 + Math.sin((1 - l.timer / .45) * Math.PI) * .18;
            ctx.scale(1 / k, k);
        }

        /* la nageoire caudale */
        ctx.fillStyle = "#0d3d55";
        ctx.beginPath();
        ctx.moveTo(-r * .85, 0);
        ctx.lineTo(-r * 1.65, -r * .72);
        ctx.lineTo(-r * 1.35, 0);
        ctx.lineTo(-r * 1.65,  r * .72);
        ctx.closePath();
        ctx.fill();

        /* le corps */
        const body = ctx.createRadialGradient(-r * .1, -r * .35, r * .12, 0, 0, r * 1.3);
        body.addColorStop(0, "#2f7a9c");
        body.addColorStop(1, "#0a2c40");

        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(-r * .05, 0, r * 1.05, r * .92, 0, 0, Math.PI * 2);
        ctx.fill();

        /* la gueule grande ouverte, vers l'avant */
        const open = .34 + l.chomp * .55;

        const jx  = r * .15;          /* charniere */
        const tip = r * 1.5;          /* pointe des machoires */
        const ty  = -r * open;
        const by  =  r * open;

        ctx.fillStyle = "#02101a";
        ctx.beginPath();
        ctx.moveTo(jx, 0);
        ctx.lineTo(tip, ty);
        ctx.lineTo(tip * .96, 0);
        ctx.lineTo(tip, by);
        ctx.closePath();
        ctx.fill();

        /* les dents : elles pointent vers l'interieur de la gueule */
        ctx.fillStyle = "#eaf7ff";

        for(let i = 0; i < 6; i++){

            const kk = .12 + (i / 5) * .82;

            const x  = jx + (tip - jx) * kk;
            const yT = ty * kk;
            const yB = by * kk;
            const d  = r * .17 * (.5 + kk * .5);

            ctx.beginPath();
            ctx.moveTo(x - d * .5, yT);
            ctx.lineTo(x + d * .5, yT);
            ctx.lineTo(x,          yT + d);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x - d * .5, yB);
            ctx.lineTo(x + d * .5, yB);
            ctx.lineTo(x,          yB - d);
            ctx.closePath();
            ctx.fill();

        }

        /* l'oeil */
        ctx.fillStyle = "#031722";
        ctx.beginPath();
        ctx.arc(r * .02, -r * .38, r * .28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle   = l.stunned > 0 ? "#8fa0c0" : wind ? "#ff8a5a" : "#d8f8ff";
        ctx.shadowColor = wind ? "#ff8a5a" : "#9ff0ff";
        ctx.shadowBlur  = 10;

        ctx.beginPath();
        ctx.arc(r * .08, -r * .40, r * .14, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        /* la tige et le leurre, en avant du museau */
        const lx = r * (.95 + Math.sin(l.lure) * .12);
        const ly = -r * (1.45 + Math.sin(l.lure * 1.3) * .10);

        ctx.strokeStyle = "#0d3145";
        ctx.lineWidth   = r * .11;
        ctx.lineCap     = "round";

        ctx.beginPath();
        ctx.moveTo(-r * .25, -r * .78);
        ctx.quadraticCurveTo(r * .25, -r * 1.6, lx, ly);
        ctx.stroke();

        const col = l.stunned > 0 ? "#7a8ba8" : wind ? "#ff9a5a" : "#9ff0ff";

        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 1.05);
        glow.addColorStop(0,   hexA(col, .95));
        glow.addColorStop(.35, hexA(col, .45));
        glow.addColorStop(1,   hexA(col, 0));

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, r * 1.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle   = "#ffffff";
        ctx.shadowColor = col;
        ctx.shadowBlur  = 16;

        ctx.beginPath();
        ctx.arc(lx, ly, r * .19, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

}


/* =========================================================
   LES BULLES

   Purement decoratives : elles remontent vers la surface
   et donnent le sens de la profondeur.
========================================================= */

function updateBulles(dt){

    if(zone !== "abysse"){

        if(bulles.length){
            bulles = [];
        }

        return;

    }

    if(bulles.length < 30 && Math.random() < dt * 14){

        bulles.push({
            x:Math.random() * W,
            y:H + 10,
            r:(1.6 + Math.random() * 4.5) * unit,
            sp:(24 + Math.random() * 46) * unit,
            ph:Math.random() * 6.28
        });

    }

    for(const b of bulles){
        b.y  -= b.sp * dt;
        b.ph += dt * 2.4;
        b.x  += Math.sin(b.ph) * 9 * unit * dt;
    }

    bulles = bulles.filter(b => b.y > -20);

}


function drawBulles(){

    if(zone !== "abysse"){
        return;
    }

    ctx.save();

    for(const b of bulles){

        ctx.globalAlpha = .30;
        ctx.strokeStyle = "#bfe9ff";
        ctx.lineWidth   = Math.max(1, b.r * .28);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = .5;
        ctx.fillStyle   = "#e8f8ff";

        ctx.beginPath();
        ctx.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .26, 0, Math.PI * 2);
        ctx.fill();

    }

    ctx.restore();

}



function updateWarp(dt){

    if(!warp){
        return false;
    }

    warp.t    += dt;
    warp.spin += dt * 9;

    if(warp.phase === "in"){

        /* le joueur est happé vers le centre, il rétrécit en tournant */
        const k = Math.min(1, warp.t / 1.25);

        player.x += (warp.x - player.x) * (1 - Math.pow(1 - .12, dt * 60));
        player.y += (warp.y - player.y) * (1 - Math.pow(1 - .12, dt * 60));

        if(k >= 1){

            /* on arrive par le portail : c'est ce qui debloque */
            byPortal = true;

            if(warp.target === "horloge"){
                enterClock();
            }else if(warp.target === "biblio"){
                enterLibrary();
            }else if(warp.target === "forge"){
                enterForge();
            }else if(warp.target === "desert"){
                enterDesert();
            }else if(warp.target === "neant"){
                enterVoid();
            }else if(warp.target === "abysse"){
                enterAbyss();
            }else if(warp.target === "bonbon"){
                enterCandy();
            }else{
                enterMarais();
            }

            byPortal = false;

            warp.phase = "out";
            warp.t     = 0;

            const a = playArea();

            warp.x = (a.x0 + a.x1) / 2;
            warp.y = (a.y0 + a.y1) / 2;

        }

        return true;

    }

    /* phase de sortie : on ressort du sol */
    if(warp.t >= .9){
        warp = null;
        return false;
    }

    return true;

}


function warpScale(){

    if(!warp){
        return 1;
    }

    if(warp.phase === "in"){
        return Math.max(0, 1 - warp.t / 1.25);
    }

    return Math.min(1, warp.t / .55);

}


/* ---------------------------------------------------------
   LES SLIMES DU MARAIS

   Seuls maîtres des lieux. Trois gabarits, un cycle de bond
   annoncé (accroupi → saut → atterrissage), un corps mou qui
   se déforme, des yeux qui te suivent, et une traînée de bave.
--------------------------------------------------------- */

const BLOB_KINDS = [
    {
        name:"petit",
        rMin:13, rMax:16,
        rest:.72, crouch:.30, leap:.32, land:.18,
        boost:2.4,
        weight:.42
    },
    {
        name:"normal",
        rMin:19, rMax:23,
        rest:1.00, crouch:.38, leap:.40, land:.22,
        boost:1.9,
        weight:.40
    },
    {
        name:"gros",
        rMin:28, rMax:33,
        rest:1.45, crouch:.52, leap:.55, land:.30,
        boost:1.7,
        weight:.18
    }
];

let drips = [];   /* la bave laissée au sol */


function pickBlobKind(){

    const roll = rnd();

    let acc = 0;

    for(const k of BLOB_KINDS){
        acc += k.weight;
        if(roll <= acc){
            return k;
        }
    }

    return BLOB_KINDS[1];

}


/* ---------------------------------------------------------
   LE PAYS DES BONBONS

   Des friandises géantes en guise de décor, et des GLOUTONS :
   des masses de sucre fondu à bandes colorées, avec une
   énorme bouche pleine de dents.
--------------------------------------------------------- */

const CANDY_COLORS = [
    ["#ff5fa2", "#ffb3d4"],
    ["#ffd93d", "#fff0a6"],
    ["#5fe0ff", "#b8f2ff"],
    ["#8bff9e", "#d3ffdc"],
    ["#c08bff", "#e6d2ff"]
];


function spawnCandy(){

    const r = (26 + rnd() * 20) * unit;

    const p = findSpot(r, 190);

    if(!p){
        return;
    }

    const pal = CANDY_COLORS[Math.floor(rnd() * CANDY_COLORS.length)];

    solids.push({
        x:p.x,
        y:p.y,
        r:r,
        pulse:rnd() * 10,
        candy:{
            kind:Math.floor(rnd() * 5),
            col:pal[0],
            col2:pal[1],
            spin:rnd() * 6.28,
            speed:(rnd() - .5) * .5,
            tilt:(rnd() - .5) * .9,
            grains:Array.from({length:14}, () => ({
                a:rnd() * 6.28,
                d:rnd() * .8,
                s:.05 + rnd() * .06
            }))
        }
    });

}


function drawCandy(s, t){

    const k = s.candy;

    if(!k){
        return;
    }

    const r = s.r;

    ctx.save();
    ctx.translate(s.x, s.y);

    /* ombre sucrée */
    ctx.globalAlpha = .24;
    ctx.fillStyle   = "#8a2a5c";
    ctx.beginPath();
    ctx.ellipse(r * .1, r * .86, r * .95, r * .3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.lineJoin = "round";

    if(k.kind === 0){

        /* --- GOMME : un dôme couvert de sucre --- */

        const g = ctx.createRadialGradient(-r * .3, -r * .55, r * .05, 0, 0, r * 1.3);
        g.addColorStop(0,  "#ffffff");
        g.addColorStop(.28, k.col2);
        g.addColorStop(1,  k.col);

        ctx.beginPath();
        ctx.moveTo(-r, r * .72);
        ctx.bezierCurveTo(-r * 1.06, -r * .5, -r * .62, -r * 1.16, 0, -r * 1.13);
        ctx.bezierCurveTo(r * .62, -r * 1.16, r * 1.06, -r * .5, r, r * .72);
        ctx.closePath();

        ctx.fillStyle = g;
        ctx.fill();

        /* grains de sucre */
        ctx.save();
        ctx.clip();

        for(const gr of k.grains){

            ctx.globalAlpha = .55;
            ctx.fillStyle   = "#ffffff";

            ctx.beginPath();
            ctx.arc(
                Math.cos(gr.a) * r * gr.d,
                Math.sin(gr.a) * r * gr.d * .8,
                r * gr.s, 0, Math.PI * 2
            );
            ctx.fill();

        }

        ctx.globalAlpha = 1;
        ctx.restore();

        ctx.lineWidth   = r * .09;
        ctx.strokeStyle = "rgba(110,25,72,.35)";
        ctx.stroke();

        ctx.globalAlpha = .85;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-r * .32, -r * .55, r * .24, r * .11, -.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

    }else if(k.kind === 1){

        /* --- SUCETTE : bâton, spirale, vernis --- */

        ctx.save();
        ctx.rotate(k.tilt * .4);

        /* le bâton */
        ctx.fillStyle = "#fff6ea";
        ctx.beginPath();
        ctx.roundRect
            ? ctx.roundRect(-r * .10, r * .3, r * .20, r * 1.15, r * .1)
            : ctx.rect(-r * .10, r * .3, r * .20, r * 1.15);
        ctx.fill();

        ctx.lineWidth   = r * .05;
        ctx.strokeStyle = "rgba(110,25,72,.28)";
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.rotate(k.spin + t * k.speed);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = "#fffdf8";
        ctx.fill();

        ctx.save();
        ctx.clip();

        /* deux spirales entrelacées */
        [k.col, k.col2].forEach((col, n) => {

            ctx.strokeStyle = col;
            ctx.lineWidth   = r * .22;
            ctx.lineCap     = "round";

            ctx.beginPath();

            for(let a = 0; a < 14; a += .08){
                const rr = a / 14 * r * 1.12;
                const x  = Math.cos(a + n * Math.PI) * rr;
                const y  = Math.sin(a + n * Math.PI) * rr;
                if(a === 0){ ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

        });

        ctx.restore();

        ctx.restore();

        /* vernis */
        ctx.globalAlpha = .5;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-r * .34, -r * .38, r * .3, r * .16, -.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.lineWidth   = r * .09;
        ctx.strokeStyle = "rgba(110,25,72,.32)";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

    }else if(k.kind === 2){

        /* --- BONBON EMBALLÉ : papillotes torsadées --- */

        ctx.save();
        ctx.rotate(k.tilt);

        /* les deux papillotes */
        [-1, 1].forEach(sg => {

            ctx.fillStyle = k.col2;

            ctx.beginPath();
            ctx.moveTo(sg * r * .78, 0);
            ctx.lineTo(sg * r * 1.5, -r * .52);
            ctx.lineTo(sg * r * 1.32, 0);
            ctx.lineTo(sg * r * 1.5, r * .52);
            ctx.closePath();
            ctx.fill();

            ctx.lineWidth   = r * .08;
            ctx.strokeStyle = "rgba(110,25,72,.35)";
            ctx.stroke();

            /* les plis */
            ctx.lineWidth = r * .05;
            for(let i = 1; i <= 2; i++){
                ctx.beginPath();
                ctx.moveTo(sg * (r * .85 + i * r * .2), -r * .22 * i);
                ctx.lineTo(sg * (r * .85 + i * r * .2), r * .22 * i);
                ctx.stroke();
            }

        });

        /* le coussin central */
        ctx.beginPath();
        ctx.moveTo(-r * .8, -r * .4);
        ctx.quadraticCurveTo(0, -r * .95, r * .8, -r * .4);
        ctx.quadraticCurveTo(r * .98, 0, r * .8, r * .4);
        ctx.quadraticCurveTo(0, r * .95, -r * .8, r * .4);
        ctx.quadraticCurveTo(-r * .98, 0, -r * .8, -r * .4);
        ctx.closePath();

        ctx.fillStyle = k.col2;
        ctx.fill();

        ctx.save();
        ctx.clip();

        ctx.strokeStyle = k.col;
        ctx.lineWidth   = r * .2;

        for(let i = -4; i <= 4; i++){
            ctx.beginPath();
            ctx.moveTo(i * r * .38 - r * .4, -r);
            ctx.lineTo(i * r * .38 + r * .4, r);
            ctx.stroke();
        }

        ctx.globalAlpha = .55;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-r * .25, -r * .35, r * .3, r * .12, -.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();

        ctx.lineWidth   = r * .09;
        ctx.strokeStyle = "rgba(110,25,72,.35)";
        ctx.stroke();

        ctx.restore();

    }else if(k.kind === 3){

        /* --- CANNE À SUCRE --- */

        ctx.save();
        ctx.rotate(k.tilt * .5);

        const cane = new Path2D();

        cane.moveTo(-r * .22, r * 1.1);
        cane.lineTo(-r * .22, -r * .3);
        cane.arc(r * .22, -r * .3, r * .44, Math.PI, 0);
        cane.lineTo(r * .66, r * .1);

        ctx.lineCap  = "round";
        ctx.lineJoin = "round";

        /* le sucre blanc */
        ctx.strokeStyle = "#fffdf8";
        ctx.lineWidth   = r * .46;
        ctx.stroke(cane);

        /* les rayures : traits nets, sans débordement */
        ctx.save();
        ctx.lineCap     = "butt";
        ctx.lineWidth   = r * .44;
        ctx.strokeStyle = k.col;
        ctx.setLineDash([r * .26, r * .34]);
        ctx.lineDashOffset = k.spin * r * .1;
        ctx.stroke(cane);
        ctx.restore();

        /* reflet */
        ctx.save();
        ctx.globalAlpha = .35;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth   = r * .12;
        ctx.translate(-r * .09, -r * .06);
        ctx.stroke(cane);
        ctx.restore();

        ctx.strokeStyle = "rgba(110,25,72,.30)";
        ctx.lineWidth   = r * .07;
        ctx.stroke(cane);

        ctx.restore();

    }else{

        /* --- MACARON --- */

        ctx.save();
        ctx.rotate(k.tilt * .3);

        const coque = (yy) => {

            ctx.beginPath();
            ctx.ellipse(0, yy, r * .95, r * .42, 0, 0, Math.PI * 2);

            const g = ctx.createLinearGradient(0, yy - r * .4, 0, yy + r * .4);
            g.addColorStop(0, k.col2);
            g.addColorStop(1, k.col);

            ctx.fillStyle = g;
            ctx.fill();

            ctx.lineWidth   = r * .07;
            ctx.strokeStyle = "rgba(110,25,72,.3)";
            ctx.stroke();

        };

        coque(r * .38);

        /* la ganache */
        ctx.beginPath();
        ctx.ellipse(0, 0, r * .88, r * .3, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#7a3a1e";
        ctx.fill();

        ctx.globalAlpha = .5;
        ctx.fillStyle   = "#c98a5e";
        for(let i = -3; i <= 3; i++){
            ctx.beginPath();
            ctx.arc(i * r * .26, 0, r * .12, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        coque(-r * .38);

        ctx.globalAlpha = .5;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-r * .3, -r * .52, r * .26, r * .1, -.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();

    }

    ctx.restore();

}


/* ---------------------------------------------------------
   LE GLOUTON
--------------------------------------------------------- */

function spawnGlouton(){

    if(gloutons.length >= MAX_GLOUTONS){
        return;
    }

    const r = (32 + rnd() * 14) * unit;

    const p = findSpot(r, 230);

    if(!p){
        return;
    }

    /* ses couches de sucre, de haut en bas */
    const bands = [];

    const pool = ["#7bd44f", "#ffd93d", "#ff5fa2", "#5fb8ff", "#ffd93d", "#ff8fc4"];

    let off = Math.floor(rnd() * pool.length);

    for(let i = 0; i < 5; i++){
        bands.push(pool[(off + i) % pool.length]);
    }

    gloutons.push({
        x:p.x,
        y:p.y,
        r:r,
        vx:0,
        vy:0,
        bands:bands,
        seed:rnd() * 6.28,
        wobble:rnd() * 10,
        phase:"creep",
        timer:1 + rnd() * 1.5,
        chomp:0,
        facing:1,
        birth:.6,
        drool:[],
        eyeX:0,
        eyeY:0,
        blink:2 + rnd() * 4,
        stretch:0,
        sparks:Array.from({length:10}, () => ({
            a:rnd() * 6.28,
            d:.2 + rnd() * .7,
            s:.03 + rnd() * .04,
            ph:rnd() * 6.28
        }))
    });

}


function updateGloutons(dt){

    if(zone !== "bonbon"){
        return;
    }

    gloutonTimer -= dt;

    if(gloutonTimer <= 0 && gloutons.length < MAX_GLOUTONS){
        spawnGlouton();
        gloutonTimer = 7;
    }

    const base = mimicSpeed({type:MIMIC_TYPES[0]});

    const area = playArea();

    for(const g of gloutons){

        g.wobble += dt * 4;

        if(g.birth > 0){
            g.birth = Math.max(0, g.birth - dt);
            continue;
        }

        if(g.stunned > 0){
            g.stunned -= dt;
            continue;
        }

        const aim = lureTarget();

        const dx = aim.x - g.x;
        const dy = aim.y - g.y;

        const dist = Math.hypot(dx, dy);

        if(Math.abs(dx) > g.r * .3){
            g.facing = dx >= 0 ? 1 : -1;
        }

        /* il te fixe */
        const ed = dist || 1;

        g.eyeX += ((dx / ed) * g.facing * .6 - g.eyeX) * Math.min(1, dt * 6);
        g.eyeY += ((dy / ed) * .45 - g.eyeY) * Math.min(1, dt * 6);

        g.blink -= dt;

        if(g.blink < -.11){
            g.blink = 2 + rnd() * 4.5;
        }

        /* il s'allonge dans la ruée */
        const sp = Math.hypot(g.vx, g.vy);

        g.stretch += (Math.min(.26, sp / Math.max(1, base * 9)) - g.stretch) * Math.min(1, dt * 8);

        g.timer -= dt;

        /* la mâchoire s'ouvre avant la ruée */
        if(g.phase === "creep"){

            g.chomp += (0 - g.chomp) * Math.min(1, dt * 4);

            const speed = base * .55;

            if(dist > .001){

                const dir = steerAround(g, dx / dist, dy / dist);

                const turn = 1 - Math.exp(-dt / .3);

                g.vx += (dir.x * speed - g.vx) * turn;
                g.vy += (dir.y * speed - g.vy) * turn;

            }

            if(g.timer <= 0 && dist < 260 * unit){
                g.phase = "open";
                g.timer = .5;
            }

        }else if(g.phase === "open"){

            g.chomp += (1 - g.chomp) * Math.min(1, dt * 7);

            g.vx *= Math.pow(.05, dt);
            g.vy *= Math.pow(.05, dt);

            if(g.timer <= 0){

                const d2 = Math.hypot(dx, dy) || 1;

                const dir = steerAround(g, dx / d2, dy / d2);

                const lunge = base * 2.4;

                g.vx = dir.x * lunge;
                g.vy = dir.y * lunge;

                g.phase = "lunge";
                g.timer = .45;

                sound(90, .2, "square", .05);

            }

        }else{

            g.chomp += (.25 - g.chomp) * Math.min(1, dt * 6);

            g.vx *= Math.pow(.25, dt);
            g.vy *= Math.pow(.25, dt);

            /* il bave en fonçant */
            if(g.drool.length < 14 && rnd() < dt * 20){
                g.drool.push({
                    x:g.x + (rnd() - .5) * g.r,
                    y:g.y + g.r * .5,
                    r:g.r * (.12 + rnd() * .12),
                    life:1.1,
                    col:g.bands[Math.floor(rnd() * g.bands.length)]
                });
            }

            if(g.timer <= 0){
                g.phase = "creep";
                g.timer = 1.4 + rnd() * 1.6;
            }

        }

        g.x += g.vx * dt;
        g.y += g.vy * dt;

        resolveSolids(g);

        g.x = Math.max(area.x0 + g.r, Math.min(area.x1 - g.r, g.x));
        g.y = Math.max(area.y0 + g.r, Math.min(area.y1 - g.r, g.y));

        for(const d of g.drool){
            d.life -= dt;
        }

        g.drool = g.drool.filter(d => d.life > 0);

        if(player.invincible <= 0 && collide(player, g)){
            loseLife(null);
            burst(g.x, g.y, 22, g.bands[2]);
        }

    }

    /* ils ne se superposent pas */
    for(let i = 0; i < gloutons.length; i++){
        for(let j = i + 1; j < gloutons.length; j++){

            const a = gloutons[i], b = gloutons[j];

            let dx = b.x - a.x, dy = b.y - a.y;
            let d = Math.hypot(dx, dy);

            const min = (a.r + b.r) * 1.25;

            if(d < min){
                if(d < .001){ dx = 1; dy = 0; d = 1; }
                const push = (min - d) / 2;
                a.x -= dx / d * push; a.y -= dy / d * push;
                b.x += dx / d * push; b.y += dy / d * push;
            }

        }
    }

}


function drawGloutons(){

    for(const g of gloutons){

        /* la bave au sol */
        for(const d of g.drool){
            ctx.save();
            ctx.globalAlpha = Math.max(0, d.life) * .5;
            ctx.fillStyle   = d.col;
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, d.r * 1.5, d.r * .7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const grow = g.birth > 0 ? 1 - g.birth / .6 : 1;

        const r = g.r * Math.max(.15, grow);

        ctx.save();
        ctx.translate(g.x, g.y);

        /* la masse s'étire vers l'avant quand elle fonce */
        if(g.stretch > .005){
            const a = Math.atan2(g.vy, g.vx);
            ctx.rotate(a);
            ctx.scale(1 + g.stretch, 1 - g.stretch * .7);
            ctx.rotate(-a);
        }

        ctx.scale(g.facing, 1);

        /* ombre */
        ctx.globalAlpha = .25;
        ctx.fillStyle   = "#7a1f4e";
        ctx.beginPath();
        ctx.ellipse(0, r * .88, r * 1.25, r * .34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        /* corps : une masse boursouflée */
        const w = r * 1.45;
        const h = r * 1.02;

        /*
        Les coulures sont peintes AVANT le corps : elles semblent
        ainsi sortir de dessous la masse, et non y être accrochées.
        */
        for(let i = -2; i <= 2; i++){

            const dx = i * w * .42;
            const dl = h * (.30 + Math.abs(Math.sin(g.seed + i * 2.1 + g.wobble * .3)) * .55);

            const top = w * .19;
            const bot = w * .10;

            const y0 = h * .30;

            ctx.beginPath();
            ctx.moveTo(dx - top, y0);
            ctx.bezierCurveTo(
                dx - top * .9, y0 + dl * .55,
                dx - bot,      y0 + dl * .8,
                dx - bot * .9, y0 + dl
            );
            ctx.quadraticCurveTo(dx, y0 + dl + bot * 1.5, dx + bot * .9, y0 + dl);
            ctx.bezierCurveTo(
                dx + bot,      y0 + dl * .8,
                dx + top * .9, y0 + dl * .55,
                dx + top,      y0
            );
            ctx.closePath();

            ctx.fillStyle = g.bands[(i + 4) % g.bands.length];
            ctx.fill();

            ctx.lineJoin    = "round";
            ctx.lineWidth   = Math.max(2, r * .12);
            ctx.strokeStyle = "#2a0a1c";
            ctx.stroke();

        }

        const N   = 24;
        const pts = [];

        for(let i = 0; i < N; i++){

            const a = i / N * Math.PI * 2;

            const lump =
                1 +
                Math.sin(a * 3 + g.wobble + g.seed) * .09 +
                Math.sin(a * 6 - g.wobble * .6 + g.seed * 2) * .05;

            const sy = Math.sin(a) > 0 ? .82 : 1;

            pts.push({
                x:Math.cos(a) * w * lump,
                y:Math.sin(a) * h * lump * sy + h * .1
            });

        }

        ctx.beginPath();
        ctx.moveTo((pts[0].x + pts[N - 1].x) / 2, (pts[0].y + pts[N - 1].y) / 2);

        for(let i = 0; i < N; i++){
            const cur = pts[i], nx = pts[(i + 1) % N];
            ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + nx.x) / 2, (cur.y + nx.y) / 2);
        }

        ctx.closePath();

        ctx.fillStyle = g.bands[0];
        ctx.fill();

        /* les couches de sucre */
        ctx.save();
        ctx.clip();

        /*
        Les couches ne sont plus des bandes droites : chacune
        déborde sur la suivante en vagues irrégulières, comme
        du sucre fondu versé en plusieurs fois.
        */
        for(let i = 0; i < g.bands.length; i++){

            const y0 = -h * 1.15 + (i / g.bands.length) * h * 2.3;
            const hh = (h * 2.3) / g.bands.length + h * .28;

            ctx.fillStyle = g.bands[i];

            ctx.beginPath();
            ctx.moveTo(-w * 1.3, y0 + hh);

            for(let x = -w * 1.3; x <= w * 1.3; x += w * .13){

                const yy =
                    y0 +
                    Math.sin(x * .055 + g.wobble * .6 + i * 1.7) * h * .13 +
                    Math.sin(x * .11 - g.wobble * .35 + i) * h * .06;

                ctx.lineTo(x, yy);

            }

            ctx.lineTo(w * 1.3, y0 + hh);
            ctx.closePath();
            ctx.fill();

        }

        /* éclats de sucre pris dans la masse */
        for(const sp of g.sparks){

            const tw = .35 + .45 * (.5 + .5 * Math.sin(g.wobble * 1.6 + sp.ph));

            ctx.globalAlpha = tw;
            ctx.fillStyle   = "#ffffff";

            ctx.beginPath();
            ctx.arc(
                Math.cos(sp.a) * w * sp.d,
                Math.sin(sp.a) * h * sp.d * .8,
                r * sp.s, 0, Math.PI * 2
            );
            ctx.fill();

        }

        /* brillance du dessus */
        ctx.globalAlpha = .34;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-w * .34, -h * .62, w * .32, h * .15, -.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();

        /* contour */
        ctx.lineJoin    = "round";
        ctx.lineWidth   = Math.max(2.5, r * .14);
        ctx.strokeStyle = "#2a0a1c";
        ctx.stroke();

        /* --- la bouche --- */

        const open = g.chomp;

        const mw = w * .86;
        const mh = h * (.20 + open * .62);

        ctx.beginPath();
        ctx.moveTo(-mw, h * .12);
        ctx.quadraticCurveTo(0, h * .12 - mh, mw, h * .12);
        ctx.quadraticCurveTo(0, h * .12 + mh, -mw, h * .12);
        ctx.closePath();

        ctx.fillStyle = "#5c0d2e";
        ctx.fill();

        ctx.lineWidth   = Math.max(2, r * .09);
        ctx.strokeStyle = "#2a0a1c";
        ctx.stroke();

        /*
        Les dents : deux rangées en zigzag qui traversent toute
        la bouche. Le découpage ne laisse voir que ce qui est
        réellement dans la gueule.
        */
        ctx.save();
        ctx.clip();

        ctx.fillStyle = "#ffffff";

        const teeth = 8;
        const my    = h * .12;
        const tooth = mh * .62;

        /* rangée du haut */
        ctx.beginPath();
        ctx.moveTo(-mw, my - mh * 1.2);
        ctx.lineTo(mw, my - mh * 1.2);
        ctx.lineTo(mw, my - mh * .1);

        for(let i = teeth; i > 0; i--){

            const x0 = -mw + (i / teeth) * mw * 2;
            const xm = -mw + ((i - .5) / teeth) * mw * 2;

            ctx.lineTo(xm, my - mh * .1 - tooth);
            ctx.lineTo(x0 - (mw * 2 / teeth), my - mh * .1);

        }

        ctx.closePath();
        ctx.fill();

        /* rangée du bas */
        ctx.beginPath();
        ctx.moveTo(-mw, my + mh * 1.2);
        ctx.lineTo(mw, my + mh * 1.2);
        ctx.lineTo(mw, my + mh * .1);

        for(let i = teeth; i > 0; i--){

            const x0 = -mw + (i / teeth) * mw * 2;
            const xm = -mw + ((i - .5) / teeth) * mw * 2;

            ctx.lineTo(xm, my + mh * .1 + tooth * .8);
            ctx.lineTo(x0 - (mw * 2 / teeth), my + mh * .1);

        }

        ctx.closePath();
        ctx.fill();

        /* la langue, au fond */
        ctx.globalAlpha = .85;
        ctx.fillStyle   = "#ff5f8f";
        ctx.beginPath();
        ctx.ellipse(
            Math.sin(g.wobble * .9) * mw * .12,
            my + mh * (.42 + open * .12),
            mw * .52, mh * .36, 0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.globalAlpha = .35;
        ctx.fillStyle   = "#ffb3cd";
        ctx.beginPath();
        ctx.ellipse(
            Math.sin(g.wobble * .9) * mw * .12,
            my + mh * (.36 + open * .12),
            mw * .3, mh * .14, 0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.globalAlpha = 1;

        ctx.restore();

    /* --- les yeux --- */

        [-1, 1].forEach(sgn => {

            const ox = sgn * w * .34;
            const oy = -h * .52;

            if(g.blink < 0){

                ctx.strokeStyle = "#2a0a1c";
                ctx.lineWidth   = Math.max(2, r * .09);
                ctx.lineCap     = "round";

                ctx.beginPath();
                ctx.moveTo(ox - r * .18, oy);
                ctx.lineTo(ox + r * .18, oy);
                ctx.stroke();

                return;

            }

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(ox, oy, r * .2, r * .22, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.lineWidth   = Math.max(1.5, r * .07);
            ctx.strokeStyle = "#2a0a1c";
            ctx.stroke();

            /* la pupille te suit */
            ctx.fillStyle = "#231018";
            ctx.beginPath();
            ctx.arc(
                ox + g.eyeX * r * .08,
                oy + g.eyeY * r * .08,
                r * .105, 0, Math.PI * 2
            );
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(
                ox + g.eyeX * r * .08 - r * .04,
                oy + g.eyeY * r * .08 - r * .04,
                r * .035, 0, Math.PI * 2
            );
            ctx.fill();

        });

        ctx.restore();

    }

}


/* ---------------------------------------------------------
   LES FLAQUES DU MARAIS

   Elles remplacent les blocs : on ne les contourne pas pour
   se protéger, on les évite pour survivre. Les toucher coûte
   une vie. Leur contour vit en permanence et des bulles y
   crèvent la surface.
--------------------------------------------------------- */

function spawnPuddle(){

    const r = (36 + rnd() * 26) * unit;

    const a = playArea();

    for(let attempt = 0; attempt < 60; attempt++){

        const x = a.x0 + r + rnd() * Math.max(1, (a.x1 - a.x0) - r * 2);
        const y = a.y0 + r + rnd() * Math.max(1, (a.y1 - a.y0) - r * 2);

        /* jamais sur le point d'arrivée du joueur */
        if(Math.hypot(x - player.x, y - player.y) < 190 * unit){
            continue;
        }

        let ok = true;

        for(const q of puddles){
            if(Math.hypot(x - q.x, y - q.y) < q.r + r + 46 * unit){
                ok = false;
                break;
            }
        }

        if(ok){
            for(const l of logs){
                if(Math.hypot(x - l.x, y - l.y) < l.len * .6 + r + 30 * unit){
                    ok = false;
                    break;
                }
            }
        }

        if(!ok){
            continue;
        }

        /* chaque flaque a sa silhouette : 16 rayons irréguliers */
        const shape = [];

        for(let i = 0; i < 16; i++){
            shape.push({
                amp:.78 + rnd() * .46,
                speed:.5 + rnd() * .9,
                phase:rnd() * 6.28
            });
        }

        /* dépôts au fond, figés une fois pour toutes */
        const silt = [];

        for(let i = 0; i < 4; i++){
            silt.push({
                x:(rnd() - .5) * 1.05,
                y:(rnd() - .5) * .8,
                rx:.14 + rnd() * .2,
                ry:.06 + rnd() * .1,
                a:rnd() * 3.14
            });
        }

        puddles.push({
            x:x,
            y:y,
            r:r,
            shape:shape,
            silt:silt,
            t:rnd() * 10,
            bubbles:[]
        });

        /*
        Si la flaque recouvre un objet déjà posé, on retire
        l'objet : il réapparaîtra ailleurs de lui-même.
        */
        const clear = o =>
            Math.hypot(o.x - x, o.y - y) > r + o.r + 34 * unit;

        coins  = coins.filter(clear);
        hearts = hearts.filter(clear);
        orbs   = orbs.filter(clear);

        return;

    }

}


function updatePuddles(dt){

    if(zone !== "marais"){
        return;
    }

    for(const q of puddles){

        q.t += dt;

        /* des bulles montent et crèvent */
        if(q.bubbles.length < 3 && rnd() < dt * .9){

            const a = rnd() * Math.PI * 2;
            const d = rnd() * .62;

            q.bubbles.push({
                x:Math.cos(a) * q.r * d,
                y:Math.sin(a) * q.r * d * .7,
                r:(2.5 + rnd() * 5) * unit,
                life:0,
                max:.75 + rnd() * .8
            });

        }

        for(const bu of q.bubbles){
            bu.life += dt;
        }

        q.bubbles = q.bubbles.filter(bu => bu.life < bu.max);

        /* contact : une vie en moins, et on est repoussé hors de la flaque */
        if(player.invincible <= 0){

            const dx = player.x - q.x;
            const dy = player.y - q.y;

            const d = Math.hypot(dx, dy);

            const reach = q.r * .84 + player.r;

            if(d < reach){

                loseLife(null);

                burst(player.x, player.y, 24, "#6ee85a");

                const nx = d < .001 ? 1 : dx / d;
                const ny = d < .001 ? 0 : dy / d;

                player.x = q.x + nx * (reach + 6 * unit);
                player.y = q.y + ny * (reach + 6 * unit);

                const a = playArea();

                player.x = Math.max(a.x0 + player.r, Math.min(a.x1 - player.r, player.x));
                player.y = Math.max(a.y0 + player.r, Math.min(a.y1 - player.r, player.y));

            }

        }

    }

}


function puddlePath(c, q, scale){

    const N = q.shape.length;

    const pts = [];

    for(let i = 0; i < N; i++){

        const ang = i / N * Math.PI * 2;

        const sh = q.shape[i];

        /* le rayon respire, chaque pointe à son rythme */
        const rr =
            q.r * scale * sh.amp *
            (1 + Math.sin(q.t * sh.speed + sh.phase) * .07);

        pts.push({
            x:Math.cos(ang) * rr,
            y:Math.sin(ang) * rr * .74
        });

    }

    c.beginPath();

    c.moveTo(
        (pts[0].x + pts[N - 1].x) / 2,
        (pts[0].y + pts[N - 1].y) / 2
    );

    for(let i = 0; i < N; i++){

        const cur  = pts[i];
        const next = pts[(i + 1) % N];

        c.quadraticCurveTo(
            cur.x, cur.y,
            (cur.x + next.x) / 2,
            (cur.y + next.y) / 2
        );

    }

    c.closePath();

}


function drawPuddles(){

    for(const q of puddles){

        ctx.save();
        ctx.translate(q.x, q.y);

        /* auréole humide sur la terre */
        ctx.save();
        ctx.globalAlpha = .34;
        ctx.fillStyle   = "#2a1f10";
        puddlePath(ctx, q, 1.22);
        ctx.fill();
        ctx.globalAlpha = .30;
        ctx.fillStyle   = "#1a2a0e";
        puddlePath(ctx, q, 1.09);
        ctx.fill();
        ctx.restore();

        /* corps : une eau épaisse, pas une gomme fluo */
        puddlePath(ctx, q, 1);

        const g = ctx.createRadialGradient(
            -q.r * .18, -q.r * .16, q.r * .06,
            0, 0, q.r
        );

        g.addColorStop(0,   "#7fbe38");
        g.addColorStop(.45, "#59912a");
        g.addColorStop(.82, "#3a641d");
        g.addColorStop(1,   "#244013");

        ctx.globalAlpha = .95;
        ctx.fillStyle   = g;
        ctx.fill();
        ctx.globalAlpha = 1;

        /* bourrelet sombre, comme une berge */
        ctx.lineJoin    = "round";
        ctx.lineWidth   = Math.max(2.5, q.r * .11);
        ctx.strokeStyle = "rgba(26,38,14,.9)";
        ctx.stroke();

        /* fin liseré clair : elle reste lisible en jeu */
        ctx.lineWidth   = Math.max(1, q.r * .035);
        ctx.strokeStyle = "rgba(178,232,110,.55)";
        ctx.stroke();

        /* l'intérieur est découpé : rien ne déborde */
        ctx.save();
        puddlePath(ctx, q, 1);
        ctx.clip();

        /* reflet du ciel sur l'eau */
        const sheen = ctx.createLinearGradient(
            -q.r * .5, -q.r * .45,
             q.r * .2,  q.r * .1
        );

        sheen.addColorStop(0,  "rgba(226,255,200,.42)");
        sheen.addColorStop(.6, "rgba(226,255,200,.08)");
        sheen.addColorStop(1,  "rgba(226,255,200,0)");

        ctx.globalAlpha = 1;
        ctx.fillStyle   = sheen;
        ctx.beginPath();
        ctx.ellipse(-q.r * .24, -q.r * .28, q.r * .48, q.r * .21, -.32, 0, Math.PI * 2);
        ctx.fill();

        /* dépôts au fond, immobiles */
        ctx.globalAlpha = .20;
        ctx.fillStyle   = "#1e3411";

        for(const d of (q.silt || [])){

            ctx.beginPath();
            ctx.ellipse(
                d.x * q.r * .55,
                d.y * q.r * .5,
                q.r * d.rx,
                q.r * d.ry,
                d.a, 0, Math.PI * 2
            );
            ctx.fill();

        }

        /* bulles */
        for(const bu of q.bubbles){

            const k = bu.life / bu.max;

            /* elle grossit, remonte, puis crève */
            const rr = bu.r * (k < .8 ? .5 + k * .75 : 1.1 + (k - .8) * 4);

            ctx.globalAlpha = k < .8 ? .55 : .55 * (1 - (k - .8) / .2);

            ctx.strokeStyle = "rgba(215,255,190,.75)";
            ctx.lineWidth   = Math.max(1, q.r * .035);

            ctx.beginPath();
            ctx.arc(bu.x, bu.y - k * q.r * .12, rr, 0, Math.PI * 2);
            ctx.stroke();

            if(k < .8){
                ctx.globalAlpha = .22;
                ctx.fillStyle   = "#b6ffa0";
                ctx.beginPath();
                ctx.arc(bu.x, bu.y - k * q.r * .12, rr, 0, Math.PI * 2);
                ctx.fill();
            }

        }

        ctx.restore();
        ctx.restore();

    }

}


/* ---------------------------------------------------------
   LES RONDINS

   Solides — on ne les traverse pas — et habités. S'approcher
   trop près réveille ce qui dort dedans.
--------------------------------------------------------- */

function spawnLog(){

    const len = (78 + rnd() * 52) * unit;
    const rad = (20 + rnd() * 7) * unit;

    const a = playArea();

    for(let attempt = 0; attempt < 90; attempt++){

        const x = a.x0 + len + rnd() * Math.max(1, (a.x1 - a.x0) - len * 2);
        const y = a.y0 + rad * 2 + rnd() * Math.max(1, (a.y1 - a.y0) - rad * 4);

        if(Math.hypot(x - player.x, y - player.y) < 200 * unit){
            continue;
        }

        let ok = true;

        for(const q of puddles){
            if(Math.hypot(x - q.x, y - q.y) < q.r + len + 30 * unit){
                ok = false;
                break;
            }
        }

        for(const l of logs){
            if(ok && Math.hypot(x - l.x, y - l.y) < 150 * unit){
                ok = false;
            }
        }

        if(!ok){
            continue;
        }

        /* légèrement de travers, comme un tronc tombé */
        const ang = (rnd() - .5) * .5;

        const log = {
            x:x,
            y:y,
            len:len,
            r:rad,
            ang:ang,
            /* de quel côté se trouve la coupe */
            side:rnd() > .5 ? 1 : -1,
            shake:0,
            wake:0,
            cooldown:2 + rnd() * 3,
            glow:0,
            rings:2 + Math.floor(rnd() * 3)
        };

        logs.push(log);

        /*
        Le rondin devient solide grâce à trois cercles invisibles :
        toute la physique existante s'applique sans rien réécrire.
        */
        for(let i = -1; i <= 1; i++){

            solids.push({
                x:x + Math.cos(ang) * (len * .38) * i,
                y:y + Math.sin(ang) * (len * .38) * i,
                r:rad * .95,
                pulse:0,
                hidden:true
            });

        }

        return;

    }

}


function logMouth(l){

    return {
        x:l.x + Math.cos(l.ang) * l.len * .52 * l.side,
        y:l.y + Math.sin(l.ang) * l.len * .52 * l.side
    };

}


function updateLogs(dt){

    if(zone !== "marais"){
        return;
    }

    for(const l of logs){

        l.cooldown -= dt;

        if(l.shake > 0){
            l.shake = Math.max(0, l.shake - dt);
        }

        l.glow = Math.max(0, l.glow - dt * .8);

        const d = Math.hypot(player.x - l.x, player.y - l.y);

        const near = 165 * unit;

        /* le rondin gronde quand on rôde autour */
        if(d < near * 1.5 && l.cooldown <= 0){
            l.glow = Math.min(1, l.glow + dt * 1.6);
        }

        if(d < near && l.cooldown <= 0 && l.wake <= 0){

            l.wake  = .85;
            l.shake = .85;

            sound(60, .7, "sawtooth", .07);

            pickupMessage("🪵 QUELQUE CHOSE SORT DU RONDIN", "#e8a45c");

        }

        if(l.wake > 0){

            l.wake -= dt;

            if(l.wake <= 0){

                spawnCrawler(l);

                l.cooldown = 13 + rnd() * 7;
                l.glow     = 0;

            }

        }

    }

}


function drawLogs(){

    for(const l of logs){

        const shake = l.shake > 0
            ? Math.sin(l.shake * 60) * 2.4 * unit * (l.shake / .85)
            : 0;

        ctx.save();
        ctx.translate(l.x + shake, l.y);
        ctx.rotate(l.ang);

        const L = l.len;
        const R = l.r;

        /* ombre au sol */
        ctx.save();
        ctx.globalAlpha = .3;
        ctx.fillStyle   = "#3a2812";
        ctx.beginPath();
        ctx.ellipse(0, R * .85, L * .58, R * .42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        /* corps du tronc */
        ctx.beginPath();
        ctx.moveTo(-L * .5, -R);
        ctx.lineTo(L * .5, -R);
        ctx.quadraticCurveTo(L * .5 + R * .5, 0, L * .5, R);
        ctx.lineTo(-L * .5, R);
        ctx.quadraticCurveTo(-L * .5 - R * .5, 0, -L * .5, -R);
        ctx.closePath();

        const g = ctx.createLinearGradient(0, -R, 0, R);
        g.addColorStop(0,   "#8a6535");
        g.addColorStop(.45, "#7a5729");
        g.addColorStop(1,   "#5b3f1d");

        ctx.fillStyle = g;
        ctx.fill();

        /* nervures de l'écorce */
        ctx.save();
        ctx.clip();

        ctx.strokeStyle = "rgba(52,34,15,.55)";
        ctx.lineWidth   = 1.4 * unit;

        for(let i = -5; i <= 5; i++){

            const yy = i * R * .19;

            ctx.beginPath();
            ctx.moveTo(-L * .5, yy);

            ctx.bezierCurveTo(
                -L * .15, yy + R * .12,
                 L * .15, yy - R * .12,
                 L * .5,  yy
            );

            ctx.stroke();

        }

        /* mousse sur le dessus */
        ctx.fillStyle = "rgba(84,104,44,.5)";

        for(let i = 0; i < 5; i++){

            const mx = (-.42 + i * .21) * L;

            ctx.beginPath();
            ctx.ellipse(
                mx, -R * .72,
                L * .10, R * .28,
                0, 0, Math.PI * 2
            );
            ctx.fill();

        }

        ctx.restore();

        /* la coupe, du côté habité */
        ctx.save();
        ctx.translate(L * .5 * l.side, 0);
        ctx.scale(l.side, 1);

        ctx.beginPath();
        ctx.ellipse(0, 0, R * .45, R, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c99a5e";
        ctx.fill();

        ctx.lineWidth   = 2 * unit;
        ctx.strokeStyle = "#4d3517";
        ctx.stroke();

        /* cernes */
        ctx.strokeStyle = "rgba(120,84,40,.75)";
        ctx.lineWidth   = 1.3 * unit;

        for(let i = 1; i <= l.rings; i++){

            const k = i / (l.rings + 1);

            ctx.beginPath();
            ctx.ellipse(0, 0, R * .45 * k, R * k, 0, 0, Math.PI * 2);
            ctx.stroke();

        }

        /* le trou, et deux yeux dedans quand ça se réveille */
        ctx.beginPath();
        ctx.ellipse(0, 0, R * .20, R * .44, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#1c1207";
        ctx.fill();

        if(l.glow > .05 || l.wake > 0){

            const a = l.wake > 0 ? 1 : l.glow;

            ctx.globalAlpha = a;
            ctx.fillStyle   = "#ffb14d";
            ctx.shadowBlur  = 16;
            ctx.shadowColor = "#ff9c2a";

            ctx.beginPath();
            ctx.arc(0, -R * .16, R * .085, 0, Math.PI * 2);
            ctx.arc(0,  R * .16, R * .085, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

        }

        ctx.restore();

        ctx.restore();

    }

}


/* ---------------------------------------------------------
   LE MILLE-PATTES

   Il sort du rondin, file droit sur toi, et son corps
   ondule derrière lui avant de retourner sous terre.
--------------------------------------------------------- */

function spawnCrawler(l){

    if(crawlers.length >= 3){
        return;
    }

    const m = logMouth(l);

    const segs = [];

    for(let i = 0; i < 11; i++){
        segs.push({x:m.x, y:m.y});
    }

    crawlers.push({
        x:m.x,
        y:m.y,
        vx:Math.cos(l.ang) * 40 * l.side,
        vy:Math.sin(l.ang) * 40 * l.side,
        r:11 * unit,
        segs:segs,
        t:0,
        life:15,
        emerge:.6
    });

    burst(m.x, m.y, 20, "#c98a3e");

    sound(220, .3, "sawtooth", .06);

}


function updateCrawlers(dt){

    const area = playArea();

    for(const cr of crawlers){

        cr.t    += dt;
        cr.life -= dt;

        if(cr.emerge > 0){
            cr.emerge = Math.max(0, cr.emerge - dt);
        }

        /* fin de vie : il retourne sous terre */
        if(cr.life <= 1.8 && !cr.burrow){

            cr.burrow = {x:cr.x, y:cr.y, t:0, dust:0};

            sound(110, .5, "sawtooth", .045);

        }

        if(cr.burrow){

            cr.burrow.t += dt;

            /* la tête plonge dans le trou et n'en bouge plus */
            cr.x += (cr.burrow.x - cr.x) * Math.min(1, dt * 9);
            cr.y += (cr.burrow.y - cr.y) * Math.min(1, dt * 9);

            cr.vx = 0;
            cr.vy = 0;

            /* la terre gicle */
            cr.burrow.dust -= dt;

            if(cr.burrow.dust <= 0 && cr.segs.length){

                for(let k = 0; k < 3; k++){

                    const a = Math.PI + rnd() * Math.PI;

                    particles.push({
                        x:cr.burrow.x,
                        y:cr.burrow.y,
                        vx:Math.cos(a) * (40 + rnd() * 90),
                        vy:Math.sin(a) * (40 + rnd() * 90),
                        life:1,
                        color:rnd() > .5 ? "#8a6535" : "#5b3f1d",
                        size:(2 + rnd() * 2.5) * unit
                    });

                }

                cr.burrow.dust = .12;

            }

            /*
            Les anneaux s'engouffrent un par un : le corps
            disparaît par la queue vers le trou.
            */
            const step = .16;

            const gone = Math.floor(cr.burrow.t / step);

            while(cr.segs.length > 0 && cr.segs.length > 11 - gone){
                cr.segs.pop();
            }

            /* les restants glissent vers le trou */
            for(const sg of cr.segs){
                sg.x += (cr.burrow.x - sg.x) * Math.min(1, dt * 2.4);
                sg.y += (cr.burrow.y - sg.y) * Math.min(1, dt * 2.4);
            }

            if(cr.segs.length === 0){
                cr.dead = true;
                cr.hole = {x:cr.burrow.x, y:cr.burrow.y};
                burst(cr.burrow.x, cr.burrow.y, 14, "#7a5a2e");
            }

            continue;

        }

        if(cr.life <= 0){
            cr.dead = true;
            burst(cr.x, cr.y, 16, "#8a5a24");
            continue;
        }

        const speed = mimicSpeed({type:MIMIC_TYPES[0]}) * 1.35;

        const dx = player.x - cr.x;
        const dy = player.y - cr.y;

        const dist = Math.hypot(dx, dy);

        if(dist > .001 && cr.emerge <= 0){

            const dir = steerAround(cr, dx / dist, dy / dist);

            /* il ondule : sa trajectoire serpente */
            const wig = Math.sin(cr.t * 9) * .45;

            const ca = Math.atan2(dir.y, dir.x) + wig;

            const turn = 1 - Math.exp(-dt / .13);

            cr.vx += (Math.cos(ca) * speed - cr.vx) * turn;
            cr.vy += (Math.sin(ca) * speed - cr.vy) * turn;

            cr.x += cr.vx * dt;
            cr.y += cr.vy * dt;

        }

        resolveSolids(cr);
        resolvePuddles(cr);

        cr.x = Math.max(area.x0 + cr.r, Math.min(area.x1 - cr.r, cr.x));
        cr.y = Math.max(area.y0 + cr.r, Math.min(area.y1 - cr.r, cr.y));

        /* le corps suit la tête, anneau par anneau */
        let px = cr.x, py = cr.y;

        const gap = cr.r * 1.05;

        for(const sg of cr.segs){

            const sdx = px - sg.x;
            const sdy = py - sg.y;

            const sd = Math.hypot(sdx, sdy);

            if(sd > gap){
                sg.x += sdx / sd * (sd - gap);
                sg.y += sdy / sd * (sd - gap);
            }

            px = sg.x;
            py = sg.y;

        }

        if(player.invincible <= 0 && cr.emerge <= 0 && collide(player, cr)){
            loseLife(null);
            burst(cr.x, cr.y, 20, "#d0842e");
        }

    }

    crawlers = crawlers.filter(c => !c.dead);

}


function drawCrawlers(){

    for(const cr of crawlers){

        ctx.save();
        ctx.globalAlpha = cr.emerge > 0 ? 1 - cr.emerge / .6 : 1;

        /* le monticule de terre remuée, pendant qu'il s'enfouit */
        if(cr.burrow){

            ctx.save();
            ctx.globalAlpha = .85;

            const R = cr.r * (1.5 + Math.min(1, cr.burrow.t) * .7);

            ctx.fillStyle = "#4a3320";
            ctx.beginPath();
            ctx.ellipse(cr.burrow.x, cr.burrow.y + cr.r * .3, R, R * .45, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#231708";
            ctx.beginPath();
            ctx.ellipse(cr.burrow.x, cr.burrow.y + cr.r * .2, R * .5, R * .24, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

        }

        /* le corps, du dernier anneau vers la tête */
        for(let i = cr.segs.length - 1; i >= 0; i--){

            const sg = cr.segs[i];

            const k = 1 - i / cr.segs.length;

            const rr = cr.r * (.42 + k * .62);

            /* pattes */
            const ang = Math.atan2(
                (i === 0 ? cr.y : cr.segs[i - 1].y) - sg.y,
                (i === 0 ? cr.x : cr.segs[i - 1].x) - sg.x
            );

            const legLen = rr * 1.5;
            const wave   = Math.sin(cr.t * 14 + i * .9) * .45;

            ctx.strokeStyle = "#f0c04a";
            ctx.lineWidth   = Math.max(1, rr * .22);
            ctx.lineCap     = "round";

            for(const sgn of [-1, 1]){

                const la = ang + sgn * (Math.PI / 2 + wave);

                ctx.beginPath();
                ctx.moveTo(sg.x, sg.y);
                ctx.lineTo(
                    sg.x + Math.cos(la) * legLen,
                    sg.y + Math.sin(la) * legLen
                );
                ctx.stroke();

            }

            ctx.beginPath();
            ctx.arc(sg.x, sg.y, rr, 0, Math.PI * 2);

            ctx.fillStyle = i % 2 === 0 ? "#a8451c" : "#8d3714";
            ctx.fill();

            ctx.lineWidth   = Math.max(1.2, rr * .2);
            ctx.strokeStyle = "#3d1607";
            ctx.stroke();

        }

        /* la tête : elle disparaît dès que l'enfouissement commence */
        if(cr.burrow && cr.burrow.t > .35){
            ctx.restore();
            continue;
        }

        ctx.save();
        ctx.translate(cr.x, cr.y);
        ctx.rotate(Math.atan2(cr.vy, cr.vx));

        ctx.beginPath();
        ctx.ellipse(0, 0, cr.r * 1.25, cr.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c1521f";
        ctx.fill();

        ctx.lineWidth   = Math.max(1.5, cr.r * .22);
        ctx.strokeStyle = "#3d1607";
        ctx.stroke();

        /* mandibules */
        ctx.strokeStyle = "#3d1607";
        ctx.lineWidth   = Math.max(1.5, cr.r * .22);

        ctx.beginPath();
        ctx.moveTo(cr.r * .9, -cr.r * .45);
        ctx.lineTo(cr.r * 1.8, -cr.r * .15);
        ctx.moveTo(cr.r * .9, cr.r * .45);
        ctx.lineTo(cr.r * 1.8, cr.r * .15);
        ctx.stroke();

        /* yeux */
        ctx.fillStyle = "#ffd24a";
        ctx.beginPath();
        ctx.arc(cr.r * .35, -cr.r * .4, cr.r * .2, 0, Math.PI * 2);
        ctx.arc(cr.r * .35,  cr.r * .4, cr.r * .2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.restore();

    }

}


function spawnBlob(){

    if(blobs.length >= MAX_BLOBS){
        return;
    }

    const kind = pickBlobKind();

    const r = (kind.rMin + rnd() * (kind.rMax - kind.rMin)) * unit;

    const p = findSpot(r, 200);

    if(!p){
        return;
    }

    blobs.push({
        x:p.x,
        y:p.y,
        r:r,
        kind:kind,
        vx:0,
        vy:0,
        wobble:rnd() * 10,
        seed:rnd() * 6.28,
        stunned:0,
        phase:"rest",
        timer:rnd() * kind.rest,
        squash:0,
        stretch:0,
        facing:1,
        birth:.55,
        blink:2 + rnd() * 5,
        eyeX:0,
        eyeY:0,
        dripTimer:0
    });

}


function updateBlobs(dt){

    /* la bave s'évapore, même hors du marais */
    for(const d of drips){
        d.life -= dt;
    }

    drips = drips.filter(d => d.life > 0);

    if(zone !== "marais"){
        return;
    }

    blobTimer -= dt;

    if(blobTimer <= 0 && blobs.length < MAX_BLOBS){
        spawnBlob();
        blobTimer = 9;
    }

    const base = mimicSpeed({type:MIMIC_TYPES[0]}) * .8;

    const area = playArea();

    for(const b of blobs){

        b.wobble += dt * 5.5;

        if(b.birth > 0){
            b.birth = Math.max(0, b.birth - dt);
            continue;
        }

        /* les yeux suivent le joueur */
        const ex = player.x - b.x;
        const ey = player.y - b.y;
        const ed = Math.hypot(ex, ey) || 1;

        b.eyeX += ((ex / ed) * .5 - b.eyeX) * Math.min(1, dt * 6);
        b.eyeY += ((ey / ed) * .35 - b.eyeY) * Math.min(1, dt * 6);

        if(Math.abs(ex) > b.r * .3){
            b.facing = ex >= 0 ? 1 : -1;
        }

        /* clignement */
        b.blink -= dt;

        if(b.blink < -.13){
            b.blink = 2.5 + rnd() * 5;
        }

        /* l'orbe STOP les fige aussi */
        if(b.stunned > 0){
            b.stunned -= dt;
            b.squash  = .25;
            continue;
        }

        b.timer -= dt;

        const k = b.kind;

        if(b.phase === "rest"){

            b.squash  = Math.sin(b.wobble * .8) * .05;
            b.stretch = 0;

            /* freinage doux */
            b.vx *= Math.pow(.02, dt);
            b.vy *= Math.pow(.02, dt);

            if(b.timer <= 0){
                b.phase = "crouch";
                b.timer = k.crouch;
            }

        }else if(b.phase === "crouch"){

            /* il s'écrase avant de bondir : c'est l'avertissement */
            const t = 1 - Math.max(0, b.timer) / k.crouch;

            b.squash  = .18 + t * .32;
            b.stretch = 0;

            b.vx *= Math.pow(.02, dt);
            b.vy *= Math.pow(.02, dt);

            if(b.timer <= 0){

                /* il vise là où tu seras, pas où tu es */
                const lead = k.leap * .7;

                const tx = player.x + playerVX * lead - b.x;
                const ty = player.y + playerVY * lead - b.y;

                const td = Math.hypot(tx, ty) || 1;

                const dir = steerAround(b, tx / td, ty / td);

                const speed = base * k.boost;

                b.vx = dir.x * speed;
                b.vy = dir.y * speed;

                b.phase = "leap";
                b.timer = k.leap;

                sound(150 + rnd() * 60, .12, "sine", .03);

            }

        }else if(b.phase === "leap"){

            const t = Math.max(0, b.timer) / k.leap;

            /* il s'étire dans le saut, puis retombe */
            b.stretch = Math.sin(t * Math.PI) * .30;
            b.squash  = -b.stretch * .5;

            b.x += b.vx * dt;
            b.y += b.vy * dt;

            /* il ralentit en fin de bond */
            b.vx *= Math.pow(.35, dt);
            b.vy *= Math.pow(.35, dt);

            b.dripTimer -= dt;

            if(b.dripTimer <= 0 && drips.length < 90){

                drips.push({
                    x:b.x + (rnd() - .5) * b.r,
                    y:b.y + b.r * .5,
                    r:b.r * (.18 + rnd() * .14),
                    life:1.6 + rnd() * .9,
                    max:2.5
                });

                b.dripTimer = .09;

            }

            if(b.timer <= 0){

                b.phase = "land";
                b.timer = k.land;

                /* éclaboussure à l'atterrissage */
                burst(b.x, b.y + b.r * .4, 7, "#8fe04a");

                sound(95, .14, "sine", .035);

            }

        }else{

            /* atterrissage : il s'aplatit puis se recompose */
            const t = 1 - Math.max(0, b.timer) / k.land;

            b.squash  = .45 * (1 - t);
            b.stretch = 0;

            b.vx *= Math.pow(.005, dt);
            b.vy *= Math.pow(.005, dt);

            if(b.timer <= 0){
                b.phase = "rest";
                b.timer = k.rest * (.75 + rnd() * .5);
            }

        }

        resolveSolids(b);
        resolvePuddles(b);

        b.x = Math.max(area.x0 + b.r, Math.min(area.x1 - b.r, b.x));
        b.y = Math.max(area.y0 + b.r, Math.min(area.y1 - b.r, b.y));

        if(player.invincible <= 0 && collide(player, b)){
            loseLife(null);
            burst(b.x, b.y, 22, "#8fe04a");
        }

    }

    /* ils se repoussent, sans jamais se chevaucher */
    for(let i = 0; i < blobs.length; i++){
        for(let j = i + 1; j < blobs.length; j++){

            const a = blobs[i], c = blobs[j];

            let dx = c.x - a.x, dy = c.y - a.y;

            let d = Math.hypot(dx, dy);

            const min = (a.r + c.r) * 1.35;

            if(d < min){

                if(d < .001){ dx = 1; dy = 0; d = 1; }

                const push = (min - d) / 2;

                a.x -= dx / d * push; a.y -= dy / d * push;
                c.x += dx / d * push; c.y += dy / d * push;

            }

        }
    }

}


/* la bave au sol, dessinée sous tout le reste */
function drawDrips(){

    for(const d of drips){

        const k = Math.min(1, d.life / d.max);

        ctx.save();
        ctx.globalAlpha = k * .30;
        ctx.fillStyle   = d.color || "#7cc93a";

        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r * (1.6 - k * .4), d.r * .62, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }

}


/*
Le slime, d'après le croquis : masse molle plus large que
haute, gros contour noir, deux yeux en fentes inclinées.
Le contour est irrégulier et vit en permanence — c'est de la
gelée, pas un ballon.
*/
function drawBlobCreature(x, y, r, wobble, squash, facing, alpha, blob){

    const stretch = blob ? blob.stretch : 0;
    const seed    = blob ? blob.seed    : 0;

    const eyeX  = blob ? blob.eyeX : 0;
    const eyeY  = blob ? blob.eyeY : 0;
    const blink = blob ? blob.blink : 9;

    ctx.save();

    if(alpha !== undefined){
        ctx.globalAlpha = alpha;
    }

    /* ombre portée : il pèse sur le sol */
    ctx.save();
    ctx.globalAlpha = (alpha === undefined ? 1 : alpha) * .28;
    ctx.fillStyle   = "#05100a";
    ctx.beginPath();
    ctx.ellipse(
        x,
        y + r * (.72 + squash * .25),
        r * (1.25 - stretch * .5),
        r * (.26 - stretch * .12),
        0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    ctx.translate(x, y);

    /* écrasement / étirement */
    const sx = (1 + squash * .34 - stretch * .30) * facing;
    const sy = (1 - squash * .38 + stretch * .44);

    ctx.scale(sx, sy);

    /* --- contour organique --- */

    const w = r * 1.40;
    const h = r * 0.94;

    const N   = 22;
    const pts = [];

    for(let i = 0; i < N; i++){

        const a = i / N * Math.PI * 2;

        /* deux ondulations de fréquences différentes : ça vit */
        const noise =
            1 +
            Math.sin(a * 3 + wobble + seed) * .055 +
            Math.sin(a * 5 - wobble * .7 + seed * 2.3) * .032;

        /* le bas est plus plat : il repose sur le sol */
        const sy2 = Math.sin(a) > 0 ? .74 : 1;

        pts.push({
            x:Math.cos(a) * w * noise,
            y:Math.sin(a) * h * noise * sy2 + h * .14
        });

    }

    ctx.beginPath();

    ctx.moveTo(
        (pts[0].x + pts[N - 1].x) / 2,
        (pts[0].y + pts[N - 1].y) / 2
    );

    for(let i = 0; i < N; i++){

        const cur  = pts[i];
        const next = pts[(i + 1) % N];

        ctx.quadraticCurveTo(
            cur.x,
            cur.y,
            (cur.x + next.x) / 2,
            (cur.y + next.y) / 2
        );

    }

    ctx.closePath();

    /* gelée : plus clair en haut, plus dense en bas */
    const grad = ctx.createLinearGradient(0, -h, 0, h);
    grad.addColorStop(0,   "#5aa838");
    grad.addColorStop(.55, "#367a22");
    grad.addColorStop(1,   "#1f5014");

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineJoin    = "round";
    ctx.lineCap     = "round";
    ctx.lineWidth   = Math.max(2.5, r * .22);
    ctx.strokeStyle = "#0b1607";

    /* fine lueur : ils se détachent du marais */
    ctx.shadowBlur  = 14;
    ctx.shadowColor = "rgba(120,220,70,.55)";

    ctx.stroke();

    ctx.shadowBlur = 0;

    /*
    Tout ce qui suit est enfermé dans le corps : sans ce
    découpage, le reflet dépassait du contour comme une antenne.
    */
    ctx.save();
    ctx.clip();

    /* noyau interne, décalé par l'inertie */
    ctx.globalAlpha = (alpha === undefined ? 1 : alpha) * .20;
    ctx.fillStyle   = "#0a2408";
    ctx.beginPath();
    ctx.ellipse(
        -eyeX * r * .12,
        h * .34 - stretch * r * .2,
        w * .52,
        h * .26,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    /* reflet de gelée, à l'intérieur */
    ctx.globalAlpha = (alpha === undefined ? 1 : alpha) * .45;
    ctx.strokeStyle = "#b6ef86";
    ctx.lineWidth   = Math.max(1.5, r * .13);
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.arc(-w * .26, -h * .30, r * .46, Math.PI * 1.12, Math.PI * 1.58);
    ctx.stroke();

    /* petite bulle claire */
    ctx.globalAlpha = (alpha === undefined ? 1 : alpha) * .30;
    ctx.fillStyle   = "#c8f7a0";
    ctx.beginPath();
    ctx.ellipse(w * .30, -h * .40, r * .13, r * .09, .4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    /* --- les yeux --- */

    const closing = blink < 0 ? 1 : 0;

    const eye = (ex, tilt, glint) => {

        ctx.save();
        ctx.translate(ex + eyeX * r * .10, -h * .12 + eyeY * r * .10);
        ctx.rotate(tilt);

        if(closing){

            /* paupière fermée : un simple trait */
            ctx.strokeStyle = "#0b1607";
            ctx.lineWidth   = Math.max(2, r * .13);
            ctx.lineCap     = "round";

            ctx.beginPath();
            ctx.moveTo(-r * .40, 0);
            ctx.lineTo( r * .38, -r * .05);
            ctx.stroke();

            ctx.restore();
            return;

        }

        ctx.beginPath();
        ctx.moveTo(-r * .46, -r * .05);
        ctx.lineTo( r * .36, -r * .23);
        ctx.lineTo( r * .44,  r * .12);
        ctx.lineTo(-r * .37,  r * .19);
        ctx.closePath();

        ctx.fillStyle = "#0b1607";
        ctx.fill();

        if(glint){

            ctx.beginPath();
            ctx.moveTo(r * .05 + eyeX * r * .06, -r * .08);
            ctx.lineTo(r * .35 + eyeX * r * .06, -r * .15);
            ctx.lineTo(r * .33 + eyeX * r * .06,  r * .08);
            ctx.closePath();

            ctx.fillStyle = "#7fdc3f";
            ctx.fill();

        }

        ctx.restore();

    };

    eye(-r * .52, -.20, false);
    eye( r * .50, -.13, true);

    ctx.restore();

}
