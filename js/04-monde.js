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

const VERSION = "2.4";

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


/* catalogue des capacites achetables */
const ABILITIES = [
    {
        id:"dash",
        name:"DASH",
        icon:"»",
        price:600,
        rarity:2,
        color:"#4fd8ff",
        color2:"#1b6fd6",
        desc:"Ruée courte et très rapide, avec un instant d'invincibilité. Recharge 3,8 s."
    }
];


function hasAbility(id){
    return ownedAbilities.includes(id);
}


function dashReady(){
    return playing && !paused && hasAbility("dash") && dash.cd <= 0 && dash.t <= 0;
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
}


/* jauge circulaire du bouton */
function paintDashButton(){

    const btn = document.getElementById("dashBtn");

    if(!btn){
        return;
    }

    const ring = btn.querySelector(".skillRing");

    if(ring){
        const p = dash.cd > 0 ? 1 - dash.cd / DASH_CD : 1;
        ring.style.background =
            "conic-gradient(#4fd8ff " + (p * 360).toFixed(0) + "deg, rgba(255,255,255,.07) 0deg)";
    }

    btn.classList.toggle("ready", dash.cd <= 0);

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

    /* le mode laser se joue dans une arene vide */
    if(laser.active){
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

    /* le mode laser se joue dans une arene vide */
    if(laser.active){
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

let floorCache = null;
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
        col:target === "bonbon" ? "#ff5fa2" : "#7bd93a",
        col2:target === "bonbon" ? "#ffd0e6" : "#bdf58a"
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

    for(let i = 0; i < 3; i++){
        spawnPuddle();
    }

    addCoin();
    addOrb();

    blobs     = [];
    drips     = [];
    blobTimer = 0;

    for(let i = 0; i < 2; i++){
        spawnBlob();
    }

    pickupMessage("🐸 LE MARAIS", "#8fe04a");

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

    addCoin();
    addOrb();

    pickupMessage("🍬 LE PAYS DES BONBONS", "#ff8fc4");

    sound(520, .5, "triangle", .06);

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

            if(warp.target === "bonbon"){
                enterCandy();
            }else{
                enterMarais();
            }

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

        const dx = player.x - g.x;
        const dy = player.y - g.y;

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
