/* =========================================================
   MIMICS
========================================================= */

const MIMIC_TYPES = [

    {
        name:"HUNTER",
        color:"#ff713d",
        /*
        Poursuite directe : il ne rejoue rien, il vient te chercher
        en ligne droite et contourne les blocs par le côté libre.
        */
        mode:"chase",
        speed:140,
        lead:0,
        size:16
    },

    {
        name:"PREDICTOR",
        color:"#a855ff",
        /*
        Il ne vise pas où tu es, mais où tu vas être :
        il coupe naturellement les virages pour t'intercepter.
        */
        mode:"predict",
        speed:148,
        lead:.62,
        size:15
    },

    {
        name:"TRAQUEUR",
        color:"#ff2f4d",
        /* le seul qui remonte réellement ta piste */
        mode:"trace",
        speed:168,
        /* l'orbe STOP ne le bloque pas : elle le ralentit seulement */
        unstoppable:true,
        lookahead:30,
        size:17,
        /* ...mais il sprinte de temps en temps */
        burst:{
            minWait:8.5,
            maxWait:15,
            warn:.7,
            duration:1.25,
            multiplier:2.2
        }
    },

    {
        /*
        L'élite. N'apparaît qu'au niveau 25 et n'est jamais tirée
        au sort avant : c'est une récompense pour être allé loin.
        Beaucoup plus rapide que les trois autres.
        */
        name:"TRAQUEUR NOIR",
        color:"#aab6cf",
        mode:"trace",
        speed:255,
        lookahead:40,
        size:19,
        unstoppable:true,
        elite:true,
        minLevel:25,
        burst:{
            minWait:13,
            maxWait:21,
            warn:.85,
            duration:1.05,
            multiplier:1.6
        }
    }

];


/*
Distance à laquelle un mimic démarre derrière toi, le long
de la trace. Chaque mimic a sa propre tranche : ils ne peuvent
pas se retrouver au même endroit.
*/
/*
Vitesse d'un mimic. Elle monte avec les niveaux mais PLAFONNE :
la valeur inscrite dans MIMIC_TYPES est le maximum qu'il puisse
atteindre, jamais un point de départ. Il démarre à 84 % de ce
plafond et l'atteint vers le niveau 8 — après quoi il n'accélère
plus jamais. Seul le sprint du TRAQUEUR passe au-dessus.
*/
function mimicSpeed(m){

    const ramp = Math.min(1, .84 + (level - 1) * .023);

    return m.type.speed * ramp * unit;

}


function startLag(order){

    const base = (380 + order * 210) * unit;

    return Math.max(150 * unit, base - (level - 1) * 9 * unit);

}


/*
Position sur la trace à la distance parcourue "s".
La trace ne contient que des points où tu bougeais vraiment :
les mimics ne repassent donc jamais par tes arrêts.
*/
function traceAt(m, s){

    if(trace.length === 0){
        return null;
    }

    s = Math.max(trace[0].d, Math.min(traceLength, s));

    if(m.cursor > trace.length - 1){
        m.cursor = trace.length - 1;
    }

    while(m.cursor < trace.length - 1 && trace[m.cursor + 1].d <= s){
        m.cursor++;
    }

    while(m.cursor > 0 && trace[m.cursor].d > s){
        m.cursor--;
    }

    const a = trace[m.cursor];
    const b = trace[Math.min(m.cursor + 1, trace.length - 1)];

    if(b === a || b.d <= a.d){
        return {x:a.x, y:a.y};
    }

    const k = Math.max(0, Math.min(1, (s - a.d) / (b.d - a.d)));

    return {
        x:a.x + (b.x - a.x) * k,
        y:a.y + (b.y - a.y) * k
    };

}


/*
Point d'apparition : sur ta trace, mais jamais collé à toi —
sinon on se fait toucher dans la seconde qui suit son arrivée,
ou en boucle après un coup encaissé.
*/
function spawnSpot(m){

    const area = playArea();

    /*
    Les poursuivants arrivent de loin dans ton dos ;
    le traqueur, lui, apparaît sur ta piste.
    */
    const onTrace = m.type.mode === "trace"
        ? (traceAt(m, m.s) || {x:player.x, y:player.y})
        : {
            x:player.x - playerVX * 1.6,
            y:player.y - playerVY * 1.6
          };

    let vx = onTrace.x - player.x;
    let vy = onTrace.y - player.y;
    let vd = Math.hypot(vx, vy);

    const safe = (m.type.mode === "trace" ? 230 : 330) * unit;

    if(vd >= safe){
        return {
            x:Math.max(area.x0, Math.min(area.x1, onTrace.x)),
            y:Math.max(area.y0, Math.min(area.y1, onTrace.y))
        };
    }

    if(vd < .001){
        const ang = rnd() * Math.PI * 2;
        vx = Math.cos(ang);
        vy = Math.sin(ang);
        vd = 1;
    }

    return {
        x:Math.max(area.x0, Math.min(area.x1, player.x + vx / vd * safe)),
        y:Math.max(area.y0, Math.min(area.y1, player.y + vy / vd * safe))
    };

}


/*
Contournement : si un bloc se trouve sur la route directe,
le mimic dévie du côté libre au lieu de foncer dedans.
C'est ce qui lui donne l'air de choisir son chemin.
*/
function steerAround(m, dx, dy){

    let ax = dx;
    let ay = dy;

    /* les flaques sont des obstacles au même titre que les blocs */
    const obstacles = puddles.length ? solids.concat(puddles) : solids;

    for(const s of obstacles){

        const ox = s.x - m.x;
        const oy = s.y - m.y;

        const dist = Math.hypot(ox, oy);

        const range = s.r + m.r + 110 * unit;

        if(dist > range || dist < .001){
            continue;
        }

        /* le bloc est-il devant lui ? */
        const front = ox * dx + oy * dy;

        if(front <= 0){
            continue;
        }

        /* est-il vraiment sur la trajectoire ? */
        const side = ox * -dy + oy * dx;

        const clearance = s.r + m.r + 20 * unit;

        if(Math.abs(side) > clearance){
            continue;
        }

        const force = (1 - dist / range) * 2.1;
        const away  = side > 0 ? -1 : 1;

        ax += -dy * away * force;
        ay +=  dx * away * force;

    }

    const len = Math.hypot(ax, ay) || 1;

    return {x:ax / len, y:ay / len};

}


function resetBurst(m){

    if(!m.type.burst){
        return;
    }

    const b = m.type.burst;

    m.burstWait = b.minWait + rnd() * (b.maxWait - b.minWait);
    m.burstWarn = 0;
    m.burstLeft = 0;

}


function createMimic(forcedType){

    /* le mode laser se joue dans une arene vide */
    if(laser.active){
        return;
    }


    /* le TRAQUEUR NOIR vient EN PLUS des cinq autres */
    /*
    Dans LE MARAIS, aucun poursuivant : ni HUNTER, ni PREDICTOR,
    ni TRAQUEUR, ni TRAQUEUR NOIR. Les slimes y règnent seuls.
    */
    if(zone === "marais" || zone === "bonbon"){
        return;
    }

    const cap = level >= ELITE_LEVEL ? MAX_MIMICS + 1 : MAX_MIMICS;

    if(trace.length === 0 || mimics.length >= cap){
        return;
    }

    const order = mimics.length;

    /*
    Les trois premiers sont imposés — HUNTER, puis PREDICTOR,
    puis TRAQUEUR — pour qu'il y ait toujours au moins un
    ennemi de chaque classe avant d'en tirer d'autres au sort.
    */
    /* les élites ne sortent jamais du tirage au sort */
    const pool = MIMIC_TYPES.filter(t => !t.elite);

    const type =
        forcedType         ? forcedType :
        order < pool.length ? pool[order] :
        pool[Math.floor(rnd() * pool.length)];

    /*
    Tranche de trace : l'élite a la sienne, elle ne peut donc
    pas se superposer au traqueur normal.
    */
    const lagSlot = type.elite ? 3 : Math.min(order, 2);

    const m = {
        x:player.x,
        y:player.y,
        r:type.size * unit,
        type:type,
        order:order,
        /* sa position le long de ta trace, en distance parcourue */
        lagSlot:lagSlot,
        s:Math.max(trace[0].d, traceLength - startLag(lagSlot)),
        cursor:0,
        vx:0,
        vy:0,
        /*
        Chacun aborde le joueur sous son propre angle : sans ça,
        deux poursuivants de la même classe visent la même ligne
        et se collent l'un à l'autre.
        */
        flank:(order % 3 - 1) + (rnd() - .5) * .5,
        animationTime:rnd() * 10,
        rotation:0,
        scale:1,
        stunned:0,
        spawnFlash:1.1,
        trailTimer:0,
        burstWait:0,
        burstWarn:0,
        burstLeft:0
    };

    resetBurst(m);

    const spot = spawnSpot(m);

    m.x = spot.x;
    m.y = spot.y;

    mimics.push(m);

    burst(m.x, m.y, 22, type.color);

    sound(220, .25, "sawtooth", .045);

    if(type.elite){
        pickupMessage("☠️ LE TRAQUEUR NOIR EST LÀ", "#dce6ff");
        sound(70, .7, "sawtooth", .07);
    }else{
        pickupMessage("⚠️ " + type.name + " ARRIVE", type.color);
    }

}


/* =========================================================
   MESSAGES
========================================================= */

function pickupMessage(text, color){

    const el = document.getElementById("pickupMessage");

    el.textContent  = text;
    el.style.color  = color;

    el.classList.remove("pickupAnimation");

    void el.offsetWidth;

    el.classList.add("pickupAnimation");

}


/* =========================================================
   RESET
========================================================= */

function reset(){

    const a = playArea();

    player.x = W / 2;
    player.y = (a.y0 + a.y1) / 2;
    player.r = 15 * unit;
    player.invincible = 0;

    trace       = [];
    traceLength = 0;

    prevPlayerX = player.x;
    prevPlayerY = player.y;
    playerVX    = 0;
    playerVY    = 0;

    /* on remet la glisse à zéro */
    pfx.speed  = 0;
    pfx.shear  = 0;
    pfx.jiggle = 0;
    pfx.eyeX   = 0;
    pfx.eyeY   = 0;
    mimics    = [];
    solids    = [];
    orbs      = [];
    coins     = [];
    hearts    = [];
    archers   = [];
    balls     = [];
    slimes    = [];
    blobs     = [];
    puddles   = [];
    logs      = [];
    crawlers  = [];
    gloutons  = [];
    candies   = [];
    gloutonTimer = 0;
    drips     = [];
    portal    = null;
    warp      = null;
    zone      = "cyber";
    blobTimer = 0;
    particles = [];
    trails    = [];

    score      = 0;
    level      = 1;
    lives      = MAX_LIVES;
    gameTime   = 0;
    levelTimer = 0;
    orbTimer   = 0;
    coinTimer  = 0;
    heartTimer = 0;

    stickReset();
    dashReset();

    for(let i = 0; i < START_SOLIDS; i++){
        addSolid();
    }

    addCoin();
    addOrb();

}


/* =========================================================
   UPDATE
========================================================= */

function update(dt){

    /* pendant l'aspiration, le monde entier est figé */
    if(updateWarp(dt)){
        return;
    }

    gameTime += dt;


    /* ---------- JOUEUR ---------- */

    const v = inputVector();

    const speed = PLAYER_SPEED * unit;

    /* recharge du dash */
    if(dash.cd > 0){
        dash.cd = Math.max(0, dash.cd - dt);
    }

    if(dash.t > 0){

        /*
        Pendant la ruee on remplace la direction du manche.
        On garde une integration image par image : la
        collision est donc testee normalement, pas de
        traversee de mur.
        */
        dash.t = Math.max(0, dash.t - dt);

        /*
        On avance par petits pas : la sortie de bloc est
        radiale, donc un grand pas d'un coup ferait ressortir
        de l'autre cote du bloc. Un pas fait au plus un
        demi-rayon de slime.
        */
        const total = speed * DASH_MULT * dt;
        const steps = Math.max(1, Math.ceil(total / (player.r * .5)));

        const ar = playArea();

        for(let i = 0; i < steps; i++){

            player.x += dash.dx * total / steps;
            player.y += dash.dy * total / steps;

            player.x = Math.max(ar.x0 + player.r, Math.min(ar.x1 - player.r, player.x));
            player.y = Math.max(ar.y0 + player.r, Math.min(ar.y1 - player.r, player.y));

            resolveSolids(player);

        }

        /* trainee de matiere */
        dash.puff -= dt;

        if(dash.puff <= 0){
            dash.puff = .03;
            burst(player.x, player.y, 3, "#8fefff");
        }

    }else{

        player.x += v.dx * speed * v.mag * dt;
        player.y += v.dy * speed * v.mag * dt;

    }

    const a = playArea();

    player.x = Math.max(a.x0 + player.r, Math.min(a.x1 - player.r, player.x));
    player.y = Math.max(a.y0 + player.r, Math.min(a.y1 - player.r, player.y));

    resolveSolids(player);

    if(player.invincible > 0){
        player.invincible = Math.max(0, player.invincible - dt);
    }

    /* vitesse lissée du joueur : c'est ce que le PREDICTOR anticipe */
    if(dt > 0){

        const smooth = 1 - Math.exp(-dt / .18);

        playerVX += ((player.x - prevPlayerX) / dt - playerVX) * smooth;
        playerVY += ((player.y - prevPlayerY) / dt - playerVY) * smooth;

    }

    prevPlayerX = player.x;
    prevPlayerY = player.y;


    /* ---------- LA GLISSE DU SLIME ---------- */

    const spd    = Math.hypot(playerVX, playerVY);
    const maxSpd = PLAYER_SPEED * unit;

    const run = Math.min(1, spd / Math.max(1, maxSpd));

    if(spd > 6){
        pfx.angle = Math.atan2(playerVY, playerVX);
    }

    /* la vitesse ressentie monte et descend en douceur */
    pfx.speed += (run - pfx.speed) * Math.min(1, dt * 6);

    /* l'onde parcourt la masse d'autant plus vite qu'il file */
    pfx.wave += dt * (1.6 + pfx.speed * 9);

    /* le haut du corps traîne derrière : inertie de la matière */
    const targetShear = -(playerVX / Math.max(1, maxSpd)) * .26;

    pfx.shear += (targetShear - pfx.shear) * Math.min(1, dt * 5);

    /* à-coups : changement brusque de cap ou d'allure */
    const accel = Math.abs(run - pfx.speed);

    pfx.jiggle = Math.max(pfx.jiggle - dt * 1.8, Math.min(1, accel * 7));

    /* le regard suit la course */
    pfx.eyeX += ((spd > 6 ? Math.cos(pfx.angle) : 0) - pfx.eyeX) * Math.min(1, dt * 7);
    pfx.eyeY += ((spd > 6 ? Math.sin(pfx.angle) : 0) - pfx.eyeY) * Math.min(1, dt * 7);

    pfx.blink -= dt;

    if(pfx.blink < -.12){
        pfx.blink = 2.5 + rnd() * 4;
    }

    /* il laisse une traînée continue derrière lui, pas des flaques */
    pfx.drip -= dt;

    if(pfx.drip <= 0 && run > .16 && drips.length < 100){

        drips.push({
            x:player.x - Math.cos(pfx.angle) * player.r * .5,
            y:player.y + player.r * .55,
            r:player.r * (.22 + run * .16),
            life:.7 + rnd() * .5,
            max:1.3,
            color:(SKINS.find(sk => sk.id === currentSkin) || SKINS[0]).color
        });

        pfx.drip = .05;

    }


    /* ---------- TA TRACE ---------- */

    const lastPoint = trace[trace.length - 1];

    if(!lastPoint){

        trace.push({x:player.x, y:player.y, d:0});

    }else{

        const moved = Math.hypot(player.x - lastPoint.x, player.y - lastPoint.y);

        /*
        On n'enregistre que si tu t'es réellement déplacé.
        Rester immobile n'écrit rien : ta trace n'a pas de
        "points d'arrêt" sur lesquels un mimic viendrait se poser.
        */
        if(moved >= TRACE_STEP * unit){

            traceLength += moved;

            trace.push({x:player.x, y:player.y, d:traceLength});

        }

    }

    let trimmed = 0;

    while(
        trace.length > 2 &&
        traceLength - trace[0].d > TRACE_KEEP * unit
    ){
        trace.shift();
        trimmed++;
    }

    if(trimmed){
        for(const m of mimics){
            m.cursor = Math.max(0, m.cursor - trimmed);
        }
    }


    /* ---------- APPARITION DES MIMICS ---------- */

    if(gameTime > 6  && mimics.length < 1) createMimic();
    if(gameTime > 22 && mimics.length < 2) createMimic();

    if(level >= 5  && mimics.length < 3) createMimic();
    if(level >= 8  && mimics.length < 4) createMimic();
    if(level >= 11 && mimics.length < 5) createMimic();

    /* l'élite, au niveau 25 */
    if(level >= ELITE_LEVEL && !mimics.some(m => m.type.elite)){
        createMimic(MIMIC_TYPES[MIMIC_TYPES.length - 1]);
    }


    /* ---------- MIMICS ---------- */

    for(const m of mimics){

        m.animationTime += dt * 5;

        /* pendant son apparition, le mimic est inerte et inoffensif */
        if(m.spawnFlash > 0){
            m.spawnFlash = Math.max(0, m.spawnFlash - dt);
            continue;
        }

        let slowed = false;

        if(m.stunned > 0){

            m.stunned = Math.max(0, m.stunned - dt);

            /*
            L'orbe fige les poursuivants, mais le TRAQUEUR, lui,
            ne s'arrête jamais : il est seulement ralenti. Sinon
            deux orbes suffisaient à le semer définitivement.
            */
            if(!m.type.unstoppable){
                continue;
            }

            slowed = true;

        }

        /* ---- SPRINT DU TRAQUEUR ---- */

        let speedFactor = 1;

        if(m.type.burst){

            const b = m.type.burst;

            if(m.burstLeft > 0){

                m.burstLeft -= dt;

                speedFactor = b.multiplier;

                if(m.burstLeft <= 0){
                    resetBurst(m);
                }

            }else if(m.burstWarn > 0){

                m.burstWarn -= dt;

                if(m.burstWarn <= 0){

                    m.burstLeft = b.duration;

                    sound(90, .35, "sawtooth", .06);

                }

            }else{

                m.burstWait -= dt;

                if(m.burstWait <= 0){

                    /* petit préavis : le sprint ne tombe jamais sans prévenir */
                    m.burstWarn = b.warn;

                    /* un seul avertissement affiché si plusieurs traqueurs */
                    if(!mimics.some(o => o !== m && o.burstWarn > 0)){

                        pickupMessage(
                            m.type.elite
                            ? "☠️ LE TRAQUEUR NOIR CHARGE"
                            : "⚡ LE TRAQUEUR ACCÉLÈRE",
                            m.type.elite ? "#dce6ff" : m.type.color
                        );

                    }

                    sound(320, .18, "square", .045);

                }

            }

        }


        /* ---- OU VA-T-IL ? ---- */

        let target = null;
        let speed  = 0;

        if(m.type.mode === "trace"){

            /*
            TRAQUEUR : le seul qui remonte ta piste. Il avance dessus
            à SA vitesse, pas à un retard fixe — si tu t'arrêtes, ta
            trace n'avance plus, il continue et il te rattrape.
            */
            const here = traceAt(m, m.s);

            if(!here){
                continue;
            }

            speed = mimicSpeed(m) * speedFactor * (slowed ? .45 : 1);

            const gap = Math.hypot(here.x - m.x, here.y - m.y);

            /* s'il a été bloqué par un décor, il rattrape son point d'abord */
            if(gap < 140 * unit){
                m.s = Math.min(traceLength, m.s + speed * dt);
            }

            /*
            Distance maximale : quoi qu'il arrive — orbes, blocs,
            longues fuites — il ne peut jamais traîner plus loin
            que ça derrière toi. Il revient toujours dans le jeu.
            */
            const maxLag = startLag(m.lagSlot) * 1.7;

            if(traceLength - m.s > maxLag){
                m.s = traceLength - maxLag;
            }

            target = traceAt(m, m.s + m.type.lookahead * unit) || here;

        }else{

            /*
            HUNTER et PREDICTOR ne rejouent plus rien : ils viennent
            te chercher par le plus court chemin. Le PREDICTOR vise
            là où tu seras dans un peu plus d'une demi-seconde.
            */
            speed = mimicSpeed(m);

            const area = playArea();

            let tx = player.x + playerVX * m.type.lead;
            let ty = player.y + playerVY * m.type.lead;

            /*
            Décalage latéral personnel : il vient te prendre de côté.
            L'écart s'efface quand il arrive sur toi, sinon il
            tournerait autour sans jamais te toucher.
            */
            const bx = tx - m.x;
            const by = ty - m.y;
            const bl = Math.hypot(bx, by) || 1;

            const spread = m.flank * 95 * unit * Math.min(1, bl / (230 * unit));

            tx += -by / bl * spread;
            ty +=  bx / bl * spread;

            target = {
                x:Math.max(area.x0, Math.min(area.x1, tx)),
                y:Math.max(area.y0, Math.min(area.y1, ty))
            };

        }


        /* ---- DEPLACEMENT ---- */

        const dx = target.x - m.x;
        const dy = target.y - m.y;

        const dist = Math.hypot(dx, dy);

        if(dist > .001){

            /* direction voulue, corrigée pour contourner les blocs */
            const dir = steerAround(m, dx / dist, dy / dist);

            /*
            Il ne pivote pas instantanément : il s'incline vers sa
            nouvelle direction. C'est ce qui rend sa course lisible.
            */
            const turn = 1 - Math.exp(-dt / .16);

            m.vx += (dir.x * speed - m.vx) * turn;
            m.vy += (dir.y * speed - m.vy) * turn;

            const v = Math.hypot(m.vx, m.vy);

            if(v > speed){
                m.vx = m.vx / v * speed;
                m.vy = m.vy / v * speed;
            }

            /* il ne dépasse jamais sa cible d'un coup */
            const stepX = m.vx * dt;
            const stepY = m.vy * dt;

            const stepLen = Math.hypot(stepX, stepY);

            if(stepLen > dist){
                m.x += dx;
                m.y += dy;
            }else{
                m.x += stepX;
                m.y += stepY;
            }

            if(v > 1){
                m.rotation = Math.atan2(m.vy, m.vx);
            }

        }

        resolveSolids(m);

        m.scale = 1 + Math.sin(m.animationTime * 2) * .08;

        m.trailTimer -= dt;

        if(m.trailTimer <= 0){

            trails.push({
                x:m.x,
                y:m.y,
                life:m.burstLeft > 0 ? .5 : .35,
                color:m.burstLeft > 0 ? "#ffffff" : m.type.color
            });

            m.trailTimer = m.burstLeft > 0 ? .025 : .04;

        }

        if(player.invincible <= 0 && collide(player, m)){
            loseLife(m);
        }

    }


    /*
    Séparation : deux mimics ne peuvent plus se confondre,
    ils se repoussent doucement et restent lisibles.
    */
    for(let i = 0; i < mimics.length; i++){

        for(let j = i + 1; j < mimics.length; j++){

            const a = mimics[i];
            const b = mimics[j];

            let dx = b.x - a.x;
            let dy = b.y - a.y;

            let d = Math.hypot(dx, dy);

            const min = (a.r + b.r) * 1.35;

            if(d < min){

                if(d < .001){
                    dx = 1;
                    dy = 0;
                    d  = 1;
                }

                const push = (min - d) / 2;

                a.x -= dx / d * push;
                a.y -= dy / d * push;

                b.x += dx / d * push;
                b.y += dy / d * push;

            }

        }

    }

    for(const m of mimics){
        resolveSolids(m);
    }


    /* ---------- BLOCS ---------- */

    for(const s of solids){
        s.pulse += dt * 3;
    }


    /* ---------- ARCHERS, BOULES ET SLIMES ---------- */

    updateArchers(dt);


    /* ---------- PORTAIL ET MARAIS ---------- */

    updatePortal(dt);
    updateGloutons(dt);
    updatePuddles(dt);
    updateLogs(dt);
    updateCrawlers(dt);
    updateBlobs(dt);


    /* ---------- ORBES ---------- */

    for(const o of orbs){

        o.pulse += dt * 3;

        if(collide(player, o)){

            for(const m of mimics){
                m.stunned = 3.2;
            }

            for(const b of blobs){
                b.stunned = 3.2;
            }

            for(const g of gloutons){
                g.stunned = 3.2;
            }

            burst(o.x, o.y, 28, "#a855ff");

            score += 25;

            sound(180, .3, "triangle", .06);

            pickupMessage("🟣 " + T("hud.frozen"), "#b66cff");

            o.taken = true;

            orbTimer = 9;

        }

    }

    orbs = orbs.filter(o => !o.taken);

    if(orbs.length === 0){

        orbTimer -= dt;

        if(orbTimer <= 0){
            addOrb();
            orbTimer = 9;
        }

    }


    /* ---------- PIECES ---------- */

    for(const c of coins){

        c.rotation += dt * 4;
        c.pulse    += dt * 5;

        if(collide(player, c)){

            /* le mode laser ne rapporte aucune piece */
            if(!laser.active){
                totalCoins++;
            }

            score += 20;

            burst(c.x, c.y, 15, "#ffd84d");

            pickupMessage("🪙 +1", "#ffd84d");

            coinChime();

            c.collected = true;

        }

    }

    coins = coins.filter(c => !c.collected);

    coinTimer -= dt;

    if(coinTimer <= 0 && coins.length < 1){
        addCoin();
        coinTimer = 3.5;
    }


    /* ---------- COEURS ---------- */

    for(const h of hearts){

        h.pulse += dt * 4;

        if(collide(player, h)){

            if(lives < MAX_LIVES){

                lives++;
                score += 30;

                pickupMessage("💚 +1 VIE", "#69ff88");

            }else{

                score += 50;

                pickupMessage("💚 +50 SCORE", "#69ff88");

            }

            burst(h.x, h.y, 20, "#69ff88");

            sound(750, .12, "sine", .05);

            h.collected = true;

        }

    }

    hearts = hearts.filter(h => !h.collected);

    if(lives < MAX_LIVES && hearts.length === 0){

        heartTimer -= dt;

        if(heartTimer <= 0){
            addHeart();
            heartTimer = 22;
        }

    }else{
        heartTimer = 22;
    }


    /* ---------- NIVEAUX ---------- */

    levelTimer += dt;

    if(levelTimer > 12){

        levelTimer = 0;
        level++;

        score += 50;

        if(!laser.active){
            totalCoins += 10;
        }

        /* le marais se remplit de flaques, la surface de blocs */
        if(zone === "bonbon"){

            if(solids.length < 16){
                spawnCandy();
            }

        }else if(zone === "marais"){

            if(puddles.length < 5 && level % 2 === 0){
                spawnPuddle();
            }

        }else{

            addSolid();

        }

        if(zone !== "marais"){

            if(level % 3 === 0){
                addSolid();
            }

            /* à partir du niveau 30, les murs poussent deux fois plus vite */
            if(level >= WALL_LEVEL){
                addSolid();
                addSolid();
            }

        }

        pickupMessage("⭐ NIVEAU " + level + "   +10 🪙", "#55d9ff");

        sound(784, .22, "sine", .038);

    }

    score += dt * 2;


    /* ---------- PARTICULES / TRAINEES ---------- */

    for(const p of particles){

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const damp = Math.pow(.25, dt);

        p.vx *= damp;
        p.vy *= damp;

        p.life -= dt * 2;

    }

    particles = particles.filter(p => p.life > 0);

    for(const t of trails){
        t.life -= dt;
    }

    trails = trails.filter(t => t.life > 0);


    /* ---------- UI ---------- */

    updateUI();

    if(laser.active){

        /* en mode laser, le HUD montre le temps et les survivants */
        document.getElementById("score").textContent = laser.time.toFixed(1) + " s";

        const alive = laser.players.filter(p => p.alive).length;

        document.getElementById("level").textContent = alive + "/" + laser.players.length;

    }else{

        document.getElementById("score").textContent = Math.floor(score);
        document.getElementById("level").textContent = level;

    }

    paintDashButton();

    if(duel.active){
        duelUpdate(dt);
    }

}


function collide(a, b){
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
}


/* =========================================================
   PERDRE UNE VIE
========================================================= */

function loseLife(m){

    if(!playing || player.invincible > 0){
        return;
    }

    lives--;

    burst(player.x, player.y, 35, "#ff466e");

    sound(120, .3, "sawtooth", .06);

    /* une boule ou un slime n'a rien à repositionner */
    if(!m || !m.type){

        player.invincible = INVINCIBLE;

        pickupMessage("💔 " + T("hud.lifeLost"), "#ff466e");

        updateUI();

        if(lives <= 0){
            playing = false;
            endGame();
        }

        return;

    }

    /* le mimic est renvoyé loin derrière sur ta trace */
    m.stunned = 1.4;

    if(m.type.burst){
        resetBurst(m);
    }

    m.s = Math.max(trace.length ? trace[0].d : 0, traceLength - startLag(m.lagSlot));

    const spot = spawnSpot(m);

    m.x  = spot.x;
    m.y  = spot.y;
    m.vx = 0;
    m.vy = 0;

    player.invincible = INVINCIBLE;

    pickupMessage("💔 " + T("hud.lifeLost"), "#ff466e");

    updateUI();

    if(lives <= 0){
        playing = false;
        endGame();
    }

}


/* =========================================================
   DRAW
========================================================= */


/* =========================================================
   FILTRE DALTONIEN

   Plutot que de retoucher les centaines d'endroits ou une
   couleur est posee, on intercepte fillStyle et strokeStyle
   le temps d'une image. Seules les teintes listees dans
   CB_COLORS changent : le decor, lui, ne bouge pas.
========================================================= */

function cbWrap(c, fn){

    if(!daltonien){
        fn();
        return;
    }

    const proto = Object.getPrototypeOf(c);

    const fd = Object.getOwnPropertyDescriptor(proto, "fillStyle");
    const sd = Object.getOwnPropertyDescriptor(proto, "strokeStyle");

    if(!fd || !sd || !fd.set || !sd.set){
        fn();
        return;
    }

    Object.defineProperty(c, "fillStyle", {
        configurable:true,
        get(){ return fd.get.call(c); },
        set(v){ fd.set.call(c, cbCol(v)); }
    });

    Object.defineProperty(c, "strokeStyle", {
        configurable:true,
        get(){ return sd.get.call(c); },
        set(v){ sd.set.call(c, cbCol(v)); }
    });

    try{
        fn();
    }finally{
        delete c.fillStyle;
        delete c.strokeStyle;
    }

}


function draw(){
    cbWrap(ctx, drawRaw);
}


function drawRaw(){

    ctx.clearRect(0, 0, W, H);


    /* LE SOL */

    drawFloor();


    /* CRÉATURES QUI DÉRIVENT DERRIÈRE LE MENU */

    if(!playing){

        if(lobbyVisible()){
            drawLobbyScene(performance.now() / 1000);
        }else{
            drawAmbient();
        }

    }


    /* BAVE AU SOL */

    drawDrips();


    /* FLAQUES */

    drawPuddles();


    /* RONDINS */

    if(zone === "marais"){
        drawLogs();
    }


    /* PORTAIL */

    if(portal){

        const grow = portal.birth;

        ctx.save();
        ctx.translate(portal.x, portal.y);

        /* halo d'aspiration */
        const halo = ctx.createRadialGradient(0, 0, portal.r * .3, 0, 0, portal.r * 4.2);
        halo.addColorStop(0, hexA(portal.col, .28));
        halo.addColorStop(1, hexA(portal.col, 0));

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, portal.r * 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.scale(grow, grow);

        /* spirale : trois anneaux brisés qui tournent */
        for(let i = 0; i < 3; i++){

            const rr    = portal.r * (1 - i * .22);
            const speed = portal.spin * (1 + i * .7);

            ctx.beginPath();
            ctx.arc(0, 0, rr, speed, speed + Math.PI * 1.35);

            ctx.strokeStyle = i === 0 ? portal.col2 : portal.col;
            ctx.lineWidth   = (5 - i) * unit;
            ctx.lineCap     = "round";

            ctx.shadowBlur  = 22;
            ctx.shadowColor = portal.col;

            ctx.stroke();

        }

        ctx.shadowBlur = 0;

        /* gouffre sombre au centre */
        const hole = ctx.createRadialGradient(0, 0, 0, 0, 0, portal.r * .62);
        hole.addColorStop(0, "#020703");
        hole.addColorStop(.7, "#0d2410");
        hole.addColorStop(1, "rgba(20,60,25,0)");

        ctx.fillStyle = hole;
        ctx.beginPath();
        ctx.arc(0, 0, portal.r * .62, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        /* quand il tire, des traits filent vers le centre */
        if(portal.pull > .05){

            ctx.save();
            ctx.globalAlpha = portal.pull * .8;
            ctx.strokeStyle = portal.col2;
            ctx.lineWidth   = 2;

            for(let i = 0; i < 8; i++){

                const a  = portal.spin * 2 + i * Math.PI / 4;
                const r1 = portal.r * (1.5 + (i % 3) * .5);
                const r2 = r1 - 26 * unit;

                ctx.beginPath();
                ctx.moveTo(portal.x + Math.cos(a) * r1, portal.y + Math.sin(a) * r1);
                ctx.lineTo(portal.x + Math.cos(a) * r2, portal.y + Math.sin(a) * r2);
                ctx.stroke();

            }

            ctx.restore();

        }

    }


    /* BLOCS SOLIDES */

    const marais = zone === "marais";

    const nowSec = performance.now() / 1000;

    for(const s of solids){

        if(s.hidden){
            continue;
        }

        if(s.candy){
            drawCandy(s, nowSec);
            continue;
        }

        if(!marais && zone !== "bonbon"){
            drawPlanet(s, nowSec);
            continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#28381f";
        ctx.fill();

        ctx.lineWidth   = 2;
        ctx.strokeStyle = "#6f9455";
        ctx.stroke();

    }


    /* ARCHERS */

    for(const a of archers){

        ctx.save();

        /* socle */
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "#1b2438";
        ctx.fill();

        ctx.lineWidth   = 2;
        ctx.strokeStyle = a.charge > 0 ? SLIME_COLOR : "#5d7a4a";
        ctx.stroke();

        /* halo de mise en joue */
        if(a.charge > 0){

            ctx.beginPath();
            ctx.arc(
                a.x, a.y,
                a.r + 8 * unit + Math.sin(a.pulse * 6) * 4 * unit,
                0, Math.PI * 2
            );
            ctx.strokeStyle = "rgba(166,226,46,.7)";
            ctx.lineWidth   = 3;
            ctx.stroke();

        }

        /* canon orienté vers le joueur */
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);

        ctx.fillStyle   = a.charge > 0 ? SLIME_COLOR : "#7f9a63";
        ctx.shadowBlur  = a.charge > 0 ? 22 : 0;
        ctx.shadowColor = SLIME_COLOR;

        ctx.beginPath();
        ctx.moveTo(a.r * .35, -6 * unit);
        ctx.lineTo(a.r * 1.15, -3.5 * unit);
        ctx.lineTo(a.r * 1.15, 3.5 * unit);
        ctx.lineTo(a.r * .35, 6 * unit);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        /* réservoir de slime */
        ctx.beginPath();
        ctx.arc(0, 0, a.r * .42, 0, Math.PI * 2);
        ctx.fillStyle = "#3f5a22";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, a.r * .42 * (a.charge > 0 ? 1 : .7), 0, Math.PI * 2);
        ctx.fillStyle = SLIME_COLOR;
        ctx.globalAlpha = .8;
        ctx.fill();

        ctx.restore();

    }


    /* ORBES */

    for(const o of orbs){

        const pulse = Math.sin(o.pulse) * 3 * unit;

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r + 9 * unit + pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,85,255,.14)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle   = "#a855ff";
        ctx.shadowBlur  = 25;
        ctx.shadowColor = "#a855ff";
        ctx.fill();
        ctx.shadowBlur  = 0;

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * .45, 0, Math.PI * 2);
        ctx.fillStyle = "#28113d";
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font      = "bold " + Math.round(8 * unit) + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText("STOP", o.x, o.y + 3 * unit);

    }


    /* PIECES */

    for(const c of coins){

        const scale = 1 + Math.sin(c.pulse) * .08;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.scale(scale, scale);
        ctx.rotate(c.rotation);

        ctx.shadowBlur  = 22;
        ctx.shadowColor = "#ffd84d";
        ctx.fillStyle   = "#ffd84d";

        ctx.beginPath();
        ctx.ellipse(0, 0, 9 * unit, 12 * unit, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff2a0";
        ctx.font      = "bold " + Math.round(10 * unit) + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText("¢", 0, 4 * unit);

        ctx.restore();

    }


    /* COEURS */

    for(const h of hearts){

        const s = 1 + Math.sin(h.pulse) * .12;

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(s, s);

        ctx.shadowBlur  = 25;
        ctx.shadowColor = "#69ff88";
        ctx.fillStyle   = "#69ff88";

        drawHeart(0, 0, 14 * unit);

        ctx.shadowBlur = 0;

        ctx.restore();

    }


    /* TRAINEES */

    for(const t of trails){

        ctx.save();
        ctx.globalAlpha = t.life * .45;
        ctx.fillStyle   = t.color;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = t.color;

        ctx.beginPath();
        ctx.arc(t.x, t.y, (5 + t.life * 5) * unit, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }


    /* BOULES DE SLIME */

    for(const ball of balls){

        ctx.save();
        ctx.translate(ball.x, ball.y);

        ctx.shadowBlur  = 20;
        ctx.shadowColor = SLIME_COLOR;
        ctx.fillStyle   = SLIME_COLOR;

        /* la boule tremblote en vol */
        ctx.beginPath();
        ctx.ellipse(
            0, 0,
            ball.r * (1 + Math.sin(ball.wobble) * .18),
            ball.r * (1 - Math.sin(ball.wobble) * .18),
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.beginPath();
        ctx.arc(-ball.r * .3, -ball.r * .3, ball.r * .26, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    }


    /* SLIMES */

    for(const sl of slimes){

        const grow  = sl.birth > 0 ? 1 - sl.birth / .35 : 1;
        const decay = Math.min(1, sl.life / 1.2);

        const scale = Math.max(.12, grow * (.4 + decay * .6));

        drawBlobCreature(
            sl.x,
            sl.y,
            sl.r * scale * 1.15,
            sl.wobble,
            0,
            1,
            Math.max(.3, decay)
        );

    }

    ctx.globalAlpha = 1;


    /* GLOUTONS */

    drawGloutons();


    /* MILLE-PATTES */

    drawCrawlers();


    /* SLIMES DU MARAIS */

    for(const b of blobs){

        const scale = b.birth > 0 ? 1 - b.birth / .5 : 1;

        drawBlobCreature(
            b.x,
            b.y,
            b.r * Math.max(.15, scale),
            b.wobble,
            b.squash,
            b.facing,
            1,
            b
        );

    }

    ctx.globalAlpha = 1;


    /* MIMICS */

    for(const m of mimics){

        ctx.save();

        const floatY = Math.sin(m.animationTime * 2) * 3 * unit;

        ctx.translate(m.x, m.y + floatY);
        ctx.rotate(m.rotation);
        ctx.scale(m.scale * unit, m.scale * unit);

        if(m.stunned > 0){
            ctx.globalAlpha = .45;
        }

        if(m.spawnFlash > 0){
            ctx.globalAlpha = Math.max(.3, 1 - m.spawnFlash);
        }

        if(m.type.name === "HUNTER"){

            ctx.shadowBlur  = 30;
            ctx.shadowColor = "#ff713d";
            ctx.fillStyle   = "#ff713d";

            ctx.beginPath();
            ctx.moveTo(21, 0);
            ctx.lineTo(-11, -14);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-11, 14);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = "#32151a";
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(4, -2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffb08c";

            ctx.beginPath();
            ctx.moveTo(-8, -8);
            ctx.lineTo(-16, -18);
            ctx.lineTo(-3, -11);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(-16, 18);
            ctx.lineTo(-3, 11);
            ctx.fill();

        }else if(m.type.name === "PREDICTOR"){

            ctx.shadowBlur  = 35;
            ctx.shadowColor = "#a855ff";

            ctx.strokeStyle = "#a855ff";
            ctx.lineWidth   = 4;

            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#a855ff";
            ctx.beginPath();
            ctx.moveTo(19, 0);
            ctx.lineTo(0, -15);
            ctx.lineTo(-19, 0);
            ctx.lineTo(0, 15);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = "#160b29";
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(3, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#d7a8ff";
            ctx.lineWidth   = 2;

            ctx.beginPath();
            ctx.arc(0, 0, 25, m.animationTime, m.animationTime + Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 30, -m.animationTime, -m.animationTime + Math.PI);
            ctx.stroke();

        }else{

            /* ---- TRAQUEUR ---- */

            const sprinting = m.burstLeft > 0;
            const warning   = m.burstWarn > 0;
            const elite     = !!m.type.elite;

            /*
            Le TRAQUEUR NOIR reprend la silhouette du traqueur,
            mais en anthracite cerclé d'argent : un noir plein
            serait invisible sur ce fond sombre.
            */
            const body = elite
                ? (sprinting ? "#e9eeff" : warning ? "#8e99b0" : "#39404f")
                : (sprinting ? "#ffffff" : warning ? "#ff8095" : "#ff2f4d");

            const aura = elite ? "#aab6cf" : "#ff2f4d";

            ctx.shadowBlur  = sprinting ? 48 : 30;
            ctx.shadowColor = aura;

            ctx.fillStyle = body;

            ctx.beginPath();
            ctx.moveTo(24, 0);
            ctx.lineTo(2, -11);
            ctx.lineTo(-14, -16);
            ctx.lineTo(-8, 0);
            ctx.lineTo(-14, 16);
            ctx.lineTo(2, 11);
            ctx.closePath();
            ctx.fill();

            /* liseré clair : c'est ce qui le rend lisible */
            if(elite){
                ctx.strokeStyle = sprinting ? "#ffffff" : "#c8d4ec";
                ctx.lineWidth   = 2;
                ctx.stroke();
            }

            ctx.shadowBlur = 0;

            /* griffes arrière */
            ctx.strokeStyle = elite ? "#c8d4ec" : body;
            ctx.lineWidth   = 2.5;

            ctx.beginPath();
            ctx.moveTo(-10, -9);
            ctx.lineTo(-25, -21);
            ctx.moveTo(-10, 9);
            ctx.lineTo(-25, 21);
            ctx.moveTo(-12, 0);
            ctx.lineTo(-28, 0);
            ctx.stroke();

            /* oeil */
            ctx.fillStyle = elite ? "#0d1019" : "#2a0710";
            ctx.beginPath();
            ctx.arc(4, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = elite
                ? (sprinting ? "#39404f" : "#dce6ff")
                : (sprinting ? "#ff2f4d" : "#fff");
            ctx.beginPath();
            ctx.arc(6, 0, 3.2, 0, Math.PI * 2);
            ctx.fill();

            /* traits de vitesse pendant le sprint */
            if(sprinting){

                ctx.strokeStyle = "rgba(255,255,255,.85)";
                ctx.lineWidth   = 2;

                for(let i = 0; i < 3; i++){

                    const off = -22 - i * 10;
                    const yy  = -7 + i * 7;

                    ctx.beginPath();
                    ctx.moveTo(off, yy);
                    ctx.lineTo(off - 15, yy);
                    ctx.stroke();

                }

            }

            /* cercle d'alerte juste avant le sprint */
            if(warning){

                ctx.strokeStyle = elite
                    ? "rgba(220,230,255,.8)"
                    : "rgba(255,47,77,.75)";

                ctx.lineWidth   = 3;

                ctx.beginPath();
                ctx.arc(0, 0, 26 + Math.sin(m.animationTime * 9) * 5, 0, Math.PI * 2);
                ctx.stroke();

            }

        }

        ctx.restore();


        ctx.save();
        ctx.fillStyle =
            m.stunned   > 0 ? "#b66cff" :
            m.burstLeft > 0 ? (m.type.elite ? "#dce6ff" : "#ff2f4d") :
            "#fff";

        ctx.font      = "bold " + Math.round(10 * unit) + "px Arial";
        ctx.textAlign = "center";

        /*
        À cinq ennemis, afficher tous les noms devient illisible :
        on ne nomme que celui qui te menace vraiment.
        */
        const named =
            Math.hypot(m.x - player.x, m.y - player.y) < 260 * unit ||
            m.stunned > 0 || m.burstLeft > 0 || m.spawnFlash > 0;

        if(named){

            ctx.fillText(
                m.stunned   > 0 ? (m.type.unstoppable ? T("hud.slowed") : T("hud.blocked")) :
                m.burstLeft > 0 ? "⚡ " + T("hud.sprint") :
                m.type.name,
                m.x,
                /* décalé par rang : les noms ne se chevauchent plus */
                m.y - (34 + (m.order % 3) * 13) * unit
            );

        }

        /*
        En mode daltonien, chaque poursuivant porte aussi un
        symbole : la forme reste lisible sans la couleur.
        */
        if(daltonien){

            const mark = CB_MARKS[
                m.type.elite ? "noir" :
                m.type.name === "HUNTER" ? "hunter" :
                m.type.name === "PREDICTOR" ? "predictor" : "traqueur"
            ];

            if(mark){

                const my = m.y - (20 + (m.order % 3) * 13) * unit;

                ctx.font        = "bold " + Math.round(15 * unit) + "px Arial";
                ctx.textAlign   = "center";
                ctx.lineWidth   = Math.max(2, 4 * unit);
                ctx.strokeStyle = "#05070f";
                ctx.strokeText(mark, m.x, my);

                ctx.fillStyle = "#ffffff";
                ctx.fillText(mark, m.x, my);

            }

        }

        ctx.restore();

    }


    /* LES AUTRES JOUEURS DU MODE LASER */

    if(laser.active){
        drawLaserPlayers();
    }


    /* JOUEUR */

    drawPlayer();

    /* LES RAYONS PASSENT PAR-DESSUS TOUT */

    if(laser.active){
        drawLaserBeams();
    }


    /* PARTICULES */

    for(const p of particles){

        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle   = p.color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = p.color;

        ctx.fillRect(p.x, p.y, p.size, p.size);

    }

    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;


    /* VOILE D'ASPIRATION */

    if(warp){

        const k = warp.phase === "in"
            ? Math.min(1, warp.t / 1.25)
            : 1 - Math.min(1, warp.t / .9);

        ctx.save();

        ctx.fillStyle = warp.target === "bonbon"
            ? "rgba(120,20,70," + (k * .92).toFixed(3) + ")"
            : "rgba(16,48,20," + (k * .92).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, H);

        /* tourbillon au centre de l'écran */
        ctx.translate(warp.x, warp.y);
        ctx.globalAlpha = k;

        ctx.strokeStyle = warp.col2 || "#9ae85a";
        ctx.lineCap     = "round";

        for(let i = 0; i < 5; i++){

            const rr = (60 + i * 55) * unit * (1.25 - k * .55);

            ctx.beginPath();
            ctx.arc(
                0, 0, rr,
                warp.spin * (1 + i * .35),
                warp.spin * (1 + i * .35) + Math.PI * 1.15
            );

            ctx.lineWidth = (5 - i * .7) * unit;
            ctx.stroke();

        }

        ctx.restore();

        if(k > .55){

            ctx.save();
            ctx.globalAlpha = (k - .55) / .45;
            ctx.fillStyle   = warp.target === "bonbon" ? "#ffd6ea" : "#d7ffa8";
            ctx.font        = "bold " + Math.round(30 * unit) + "px Arial";
            ctx.textAlign   = "center";
            ctx.fillText(warp.target === "bonbon" ? "LE PAYS DES BONBONS" : "LE MARAIS", W / 2, H * .34);
            ctx.restore();

        }

    }


    /* JOYSTICK */

    if(stick.active && playing && !paused){

        const R = stickRadius();

        ctx.save();
        ctx.globalAlpha = .28;

        ctx.beginPath();
        ctx.arc(stick.ox, stick.oy, R, 0, Math.PI * 2);
        ctx.strokeStyle = "#8fb6ff";
        ctx.lineWidth   = 2;
        ctx.stroke();

        ctx.globalAlpha = .45;

        ctx.beginPath();
        ctx.arc(stick.x, stick.y, R * .42, 0, Math.PI * 2);
        ctx.fillStyle = "#8fb6ff";
        ctx.fill();

        ctx.restore();

    }

}


function drawHeart(x, y, size){

    ctx.beginPath();

    ctx.moveTo(x, y + size * .8);

    ctx.bezierCurveTo(
        x - size * 1.4, y - size * .2,
        x - size * .8,  y - size * 1.2,
        x,              y - size * .4
    );

    ctx.bezierCurveTo(
        x + size * .8,  y - size * 1.2,
        x + size * 1.4, y - size * .2,
        x,              y + size * .8
    );

    ctx.fill();

}


function drawPlayer(){

    const skin = SKINS.find(s => s.id === currentSkin) || SKINS[0];

    ctx.save();

    /* clignotement pendant l'invincibilité */
    if(player.invincible > 0){
        ctx.globalAlpha =
            .35 + .65 * Math.abs(Math.sin(player.invincible * 22));
    }

    ctx.translate(player.x, player.y);

    /* aspiration : il tourne sur lui-même en rétrécissant */
    const ws = warpScale();

    if(warp){
        ctx.rotate(warp.spin);
    }

    if(ws <= .002){
        ctx.restore();
        return;
    }

    ctx.scale(ws, ws);

    /* l'ombre s'étire avec lui : il reste collé au sol */
    ctx.save();
    ctx.globalAlpha *= .30;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
        -Math.cos(pfx.angle) * player.r * pfx.speed * .18,
        player.r * .98,
        player.r * (.95 + pfx.speed * .22),
        player.r * (.30 - pfx.speed * .05),
        0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    paintSkinSlime(
        ctx,
        skin,
        player.r * 1.12,
        performance.now() / 1000,
        false,
        pfx
    );

    ctx.restore();

}


/* =========================================================
   FIN DE PARTIE
========================================================= */

function endGame(){

    const final = Math.floor(score);

    if(final > bestScore){
        if(!laser.active){
            bestScore = final;
        }
    }

    saveGame();

    stickReset();

    document.getElementById("finalScore").textContent = final;
    document.getElementById("finalLevel").textContent = level;
    document.getElementById("finalBest").textContent  = bestScore;

    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("skillBar").style.display = "none";

    if(duel.active){
        duelDeath();
        return;
    }

    document.getElementById("gameOver").style.display = "flex";

}


/* =========================================================
   PAUSE
========================================================= */

function setPaused(state){

    if(!playing || duel.active){
        return;
    }

    paused = state;

    document.getElementById("pauseScreen").style.display =
        paused ? "flex" : "none";

    document.getElementById("pauseBtn").style.display =
        paused ? "none" : "block";

    document.getElementById("skillBar").style.display =
        (paused || !hasAbility("dash")) ? "none" : "flex";

    if(paused){
        stickReset();
    }

}

function togglePause(){
    setPaused(!paused);
}

document.addEventListener("visibilitychange", () => {

    if(document.hidden && playing && !paused){
        setPaused(true);
    }

});

addEventListener("blur", () => {

    if(playing && !paused){
        setPaused(true);
    }

});


/* =========================================================
   DEMARRAGE
========================================================= */

function startGame(seed){

    ensureAudio();

    goFullscreenLandscape();

    /*
    Toute la partie découle de cette graine : en duel, les deux
    téléphones reçoivent la même et génèrent donc le même terrain.
    */
    seedRandom(
        seed === undefined
        ? (Math.random() * 0xFFFFFFFF) >>> 0
        : seed
    );

    document.getElementById("mainMenu").style.display    = "none";
    document.getElementById("gameOver").style.display    = "none";
    document.getElementById("shop").style.display        = "none";
    document.getElementById("pauseScreen").style.display = "none";
    document.getElementById("duelScreen").style.display  = "none";
    document.getElementById("duelResult").style.display  = "none";

    const inDuel = !!(duel.conn && duel.conn.open);

    /* pas de pause en duel : le chrono de l'autre, lui, tourne */
    /* pas de pause en reseau : ca desynchroniserait tout le monde */
    document.getElementById("pauseBtn").style.display =
        (inDuel || laser.active) ? "none" : "block";

    document.getElementById("skillBar").style.display =
        hasAbility("dash") ? "flex" : "none";

    if(inDuel){
        duelBegin();
    }else{
        duel.active = false;
        document.getElementById("duelBar").style.display = "none";
    }

    keys.up = keys.down = keys.left = keys.right = false;

    reset();

    paused  = false;
    playing = true;

    sound(600, .1, "triangle", .05);

}


function quitToMenu(){

    playing = false;
    paused  = false;

    duelCleanup();

    stickReset();
    saveGame();

    document.getElementById("pauseScreen").style.display = "none";
    document.getElementById("pauseBtn").style.display    = "none";
    document.getElementById("skillBar").style.display    = "none";
    document.getElementById("mainMenu").style.display    = "block";

}
