/* =========================================================
   SKINS
========================================================= */

const SKINS = [
    {id:"cyber",  name:"CYBER SLIME",  color:"#3fc9ff", color2:"#1b6fd6", price:0,    effect:"normal", rarity:0},
    {id:"void",   name:"VOID SLIME",   color:"#8b5cf6", color2:"#3b1d80", price:250,  effect:"void", rarity:1},
    {id:"toxic",  name:"TOXIC SLIME",  color:"#4ce04c", color2:"#177a2a", price:250,  effect:"toxic", rarity:1},
    {id:"crater", name:"CRATER SLIME", color:"#e0453a", color2:"#8a1a14", price:400, effect:"crater", rarity:2},
    {id:"ghost",  name:"GHOST SLIME",  color:"#eaf4ff", color2:"#a9c2dd", price:400, effect:"ghost", rarity:2},
    {id:"neon",   name:"NEON SLIME",   color:"#ff4fd8", color2:"#2ad0ff", price:500, effect:"neon", rarity:3},
    {id:"galaxy", name:"GALAXY SLIME", color:"#a86cff", color2:"#2a1a6a", price:500, effect:"galaxy", rarity:3},

    /* --- la deuxieme fournee --- */
    {id:"ocean",  name:"OCÉAN SLIME",  color:"#3ad9d0", color2:"#0d5a86", price:250,  effect:"ocean",  rarity:1},
    {id:"bonbon", name:"BONBON SLIME", color:"#ff8ec4", color2:"#c9316f", price:250,  effect:"bonbon", rarity:1},
    {id:"givre",  name:"GIVRE SLIME",  color:"#a9e8ff", color2:"#3a7fb5", price:250,  effect:"givre",  rarity:1},
    {id:"zombie", name:"ZOMBIE SLIME", color:"#9dc44a", color2:"#3e5c1c", price:400,  effect:"zombie", rarity:2},
    {id:"ninja",  name:"NINJA SLIME",  color:"#4a5570", color2:"#161c2c", price:400,  effect:"ninja",  rarity:2},
    {id:"meca",   name:"MÉCA SLIME",   color:"#b9c6d8", color2:"#5a6880", price:400,  effect:"meca",   rarity:2},
    {id:"orage",  name:"ORAGE SLIME",  color:"#7d9dff", color2:"#141a3c", price:400,  effect:"orage",  rarity:2},
    {id:"dragon", name:"DRAGON SLIME", color:"#37c46a", color2:"#0f5a35", price:500,  effect:"dragon", rarity:3},
    {id:"magma",  name:"MAGMA SLIME",  color:"#ff7a2f", color2:"#3a1206", price:500, effect:"magma",  rarity:3},
    {id:"prisme", name:"PRISME SLIME", color:"#ff5ec7", color2:"#2ad0ff", price:500, effect:"prisme", rarity:3},

    /* --- la grande fournee --- */
    {id:"donut",     name:"DONUT SLIME",      color:"#ff9ec7", color2:"#c4507f", price:100,   effect:"donut",     rarity:0},
    {id:"chocolat",  name:"CHOCOLAT SLIME",   color:"#8a5a34", color2:"#3d2214", price:100,  effect:"chocolat",  rarity:0},
    {id:"peluche",   name:"PELUCHE SLIME",    color:"#d8b48c", color2:"#8a6642", price:100,  effect:"peluche",   rarity:0},
    {id:"mousse",    name:"MOUSSE SLIME",     color:"#5fa843", color2:"#22441c", price:250,  effect:"mousse",    rarity:1},
    {id:"desert",    name:"DÉSERT SLIME",     color:"#e0c184", color2:"#9a7440", price:250,  effect:"desert",    rarity:1},
    {id:"fluo",      name:"FLUO SLIME",       color:"#8dff2e", color2:"#2f8f00", price:250,  effect:"fluo",      rarity:1},
    {id:"corail",    name:"CORAIL SLIME",     color:"#54d7e8", color2:"#116d92", price:250,  effect:"corail",    rarity:1},
    {id:"gumball",   name:"GUMBALL SLIME",    color:"#cfe6f5", color2:"#7d9ab0", price:250,  effect:"gumball",   rarity:1},
    {id:"lianes",    name:"LIANES SLIME",     color:"#6fb84a", color2:"#2c5322", price:250,  effect:"lianes",    rarity:1},
    {id:"artisan",   name:"ARTISAN SLIME",    color:"#f0e2c4", color2:"#a8875c", price:400,  effect:"artisan",   rarity:2},
    {id:"binaire",   name:"BINAIRE SLIME",    color:"#1fb8a8", color2:"#06333a", price:400,  effect:"binaire",   rarity:2},
    {id:"geode",     name:"GÉODE SLIME",      color:"#b9a7f0", color2:"#5a3f9c", price:400,  effect:"geode",     rarity:2},
    {id:"spriggan",  name:"SPRIGGAN SLIME",   color:"#9be86a", color2:"#3d7a2c", price:400,  effect:"spriggan",  rarity:2},
    {id:"alien",     name:"ALIEN SLIME",      color:"#3a5fd0", color2:"#0a1440", price:400,  effect:"alien",     rarity:2},
    {id:"mage",      name:"MAGE SLIME",       color:"#8f6ee8", color2:"#33206b", price:400,  effect:"mage",      rarity:2},
    {id:"viking",    name:"VIKING SLIME",     color:"#7fa87c", color2:"#3a4d3a", price:400,  effect:"viking",    rarity:2},
    {id:"steampunk", name:"STEAMPUNK SLIME",  color:"#c08b4a", color2:"#5a3a1c", price:400,  effect:"steampunk", rarity:2},
    {id:"horloge",   name:"HORLOGE SLIME",    color:"#a9b6c4", color2:"#4e5a6b", price:400,  effect:"horloge",   rarity:2},
    {id:"samourai",  name:"SAMOURAÏ SLIME",   color:"#8f4a3a", color2:"#3a1a14", price:500,  effect:"samourai",  rarity:3},
    {id:"pharaon",   name:"PHARAON SLIME",    color:"#f0c64a", color2:"#8a6410", price:500, effect:"pharaon",   rarity:3},
    {id:"maudit",    name:"MAUDIT SLIME",     color:"#3a2450", color2:"#0a040f", price:500, effect:"maudit",    rarity:3},
    {id:"tresor",    name:"TRÉSOR SLIME",     color:"#ffcf4a", color2:"#a06a10", price:500, effect:"tresor",    rarity:3},
    {id:"phenix",    name:"PHÉNIX SLIME",     color:"#ffb43a", color2:"#c43a08", price:500, effect:"phenix",    rarity:3},

    /* --- troisieme fournee --- */
    {id:"pasteque",  name:"PASTÈQUE SLIME",  color:"#ff5f6e", color2:"#2f7a3a", price:100,   effect:"pasteque",  rarity:0},
    {id:"cactus",    name:"CACTUS SLIME",    color:"#6bbf5a", color2:"#2c5a26", price:100,   effect:"cactus",    rarity:0},
    {id:"nuage",     name:"NUAGE SLIME",     color:"#e8f2ff", color2:"#9db4d0", price:100,  effect:"nuage",     rarity:0},
    {id:"miel",      name:"MIEL SLIME",      color:"#ffc23a", color2:"#a06a08", price:250,  effect:"miel",      rarity:1},
    {id:"sushi",     name:"SUSHI SLIME",     color:"#f5efe2", color2:"#b8a888", price:250,  effect:"sushi",     rarity:1},
    {id:"panda",     name:"PANDA SLIME",     color:"#f4f4f4", color2:"#b8b8b8", price:250,  effect:"panda",     rarity:1},
    {id:"pixel",     name:"PIXEL SLIME",     color:"#5fe86a", color2:"#1f6a28", price:250,  effect:"pixel",     rarity:1},
    {id:"citrouille",name:"CITROUILLE SLIME",color:"#ff8a1f", color2:"#a04a08", price:400,  effect:"citrouille",rarity:2},
    {id:"momie",     name:"MOMIE SLIME",     color:"#e6dcc0", color2:"#9a8a66", price:400,  effect:"momie",     rarity:2},
    {id:"squelette", name:"SQUELETTE SLIME", color:"#eef2f5", color2:"#8f9aa8", price:400,  effect:"squelette", rarity:2},
    {id:"requin",    name:"REQUIN SLIME",    color:"#7f95ad", color2:"#2c3f56", price:400,  effect:"requin",    rarity:2},
    {id:"bulle",     name:"BULLE SLIME",     color:"#bfe8ff", color2:"#7fa8d8", price:400,  effect:"bulle",     rarity:2},
    {id:"lampe",     name:"LAVA LAMP SLIME", color:"#ff6ad5", color2:"#5a1a6a", price:400,  effect:"lampe",     rarity:2},
    {id:"origami",   name:"ORIGAMI SLIME",   color:"#ff7b6a", color2:"#b8402f", price:400,  effect:"origami",   rarity:2},
    {id:"tokyo",     name:"TOKYO SLIME",     color:"#2a1a4a", color2:"#0c0618", price:400,  effect:"tokyo",     rarity:2},
    {id:"holo",      name:"HOLO SLIME",      color:"#5fe8ff", color2:"#1a6a8a", price:500,  effect:"holo",      rarity:3},
    {id:"vitrail",   name:"VITRAIL SLIME",   color:"#ff5f9e", color2:"#2a1a6a", price:500, effect:"vitrail",   rarity:3},
    {id:"plasma",    name:"PLASMA SLIME",    color:"#c86aff", color2:"#3a0a6a", price:500, effect:"plasma",    rarity:3},
    {id:"vangogh",   name:"NUIT ÉTOILÉE",    color:"#4a7ad8", color2:"#12204a", price:500, effect:"vangogh",   rarity:3},

    /* --- douzieme fournee --- */
    {id:"sirene",    name:"SIRÈNE SLIME",    color:"#4fe6c8", color2:"#1a6fa0", price:250,  effect:"sirene",    rarity:1},
    {id:"abeille",   name:"ABEILLE SLIME",   color:"#ffcf3d", color2:"#a8730a", price:250,  effect:"abeille",   rarity:1},
    {id:"automne",   name:"AUTOMNE SLIME",   color:"#ff9b45", color2:"#9a3f14", price:250,  effect:"automne",   rarity:1},
    {id:"meduse",    name:"MÉDUSE SLIME",    color:"#c9a6ff", color2:"#5a3ba8", price:250,  effect:"meduse",    rarity:1},
    {id:"koi",       name:"KOÏ SLIME",       color:"#fff3ea", color2:"#d95a2a", price:400,  effect:"koi",       rarity:2},
    {id:"bambou",    name:"BAMBOU SLIME",    color:"#8fd94f", color2:"#2f6b1e", price:400,  effect:"bambou",    rarity:2},
    {id:"arcade",    name:"ARCADE SLIME",    color:"#ff4f8b", color2:"#2a0f4a", price:400,  effect:"arcade",    rarity:2},
    {id:"encre",     name:"ENCRE SLIME",     color:"#f2f4f8", color2:"#1a1d26", price:400,  effect:"encre",     rarity:2},
    {id:"aurore",    name:"AURORE SLIME",    color:"#5fffc8", color2:"#123a6a", price:500,  effect:"aurore",    rarity:3},
    {id:"miroir",    name:"MIROIR SLIME",    color:"#dfe9f7", color2:"#7a90ad", price:500,  effect:"miroir",    rarity:3},
    {id:"tornade",   name:"TORNADE SLIME",   color:"#9fb4c9", color2:"#2c3a4d", price:500,  effect:"tornade",   rarity:3},
    {id:"nova",      name:"NOVA SLIME",      color:"#ffd76a", color2:"#a8241a", price:500,  effect:"nova",      rarity:3},
    {id:"eclipse",   name:"ÉCLIPSE SLIME",   color:"#1a0c24", color2:"#07030d", price:500,  effect:"eclipse",   rarity:3},
    {id:"sablier",   name:"SABLIER SLIME",   color:"#ffcf4d", color2:"#0d0a1e", price:500,  effect:"sablier",   rarity:3},
    {id:"kintsugi",  name:"KINTSUGI SLIME",  color:"#f0e6d8", color2:"#c9a13a", price:500,  effect:"kintsugi",  rarity:3},

    /* --- recompense : il ne s'achete pas --- */
    {id:"abyssal",   name:"ABYSSAL SLIME",   color:"#2fe0ff", color2:"#04243a", price:0,    effect:"abyssal",   rarity:4, exclusive:true},
    {id:"neant",     name:"NÉANT SLIME",     color:"#c86aff", color2:"#100322", price:0,    effect:"neant",     rarity:4, exclusive:true},
    {id:"mimic",     name:"MIMIC SLIME",     color:"#1b1424", color2:"#c86aff", price:0,    effect:"mimic",     rarity:4, exclusive:true},
    {id:"pantin",    name:"MARIONNETTE",     color:"#2b2038", color2:"#b06cff", price:600,  effect:"pantin",    rarity:3},

    /* --- vague 9 : 30 motifs nets, lisibles meme en tout petit --- */
    {id:"damier",    name:"DAMIER SLIME",    color:"#f2f4f8", color2:"#1a1d26", price:250,  effect:"damier",    rarity:1},
    {id:"zebre",     name:"ZEBRE SLIME",     color:"#f4f4f4", color2:"#141414", price:250,  effect:"zebre",     rarity:1},
    {id:"leopard",   name:"LEOPARD SLIME",   color:"#e8b45a", color2:"#4a2c10", price:250,  effect:"leopard",   rarity:1},
    {id:"menthe",    name:"MENTHE SLIME",    color:"#7fe8c0", color2:"#2a6a54", price:250,  effect:"menthe",    rarity:1},
    {id:"citron",    name:"CITRON SLIME",    color:"#ffd94a", color2:"#b07a08", price:250,  effect:"citron",    rarity:1},
    {id:"caramel",   name:"CARAMEL SLIME",   color:"#fbe8c4", color2:"#c9964e", price:250,  effect:"caramel",   rarity:1},
    {id:"neige",     name:"BOULE A NEIGE",   color:"#eaf4ff", color2:"#7fa8d8", price:250,  effect:"neige",     rarity:1},
    {id:"cible",     name:"CIBLE SLIME",     color:"#f4f4f4", color2:"#d02a2a", price:250,  effect:"cible",     rarity:1},
    {id:"pois",      name:"POIS SLIME",      color:"#5fb8ff", color2:"#1a4f8a", price:250,  effect:"pois",      rarity:1},
    {id:"vague",     name:"VAGUE SLIME",     color:"#4aa8e0", color2:"#0f3a6a", price:250,  effect:"vague",     rarity:1},

    {id:"circuit",   name:"CIRCUIT SLIME",   color:"#1fd8a8", color2:"#06282a", price:400,  effect:"circuit",   rarity:2},
    {id:"synth",     name:"SYNTHWAVE SLIME", color:"#ff5fa8", color2:"#1a0a3a", price:400,  effect:"synth",     rarity:2},
    {id:"camo",      name:"CAMO SLIME",      color:"#7f8f5a", color2:"#2c3a1c", price:400,  effect:"camo",      rarity:2},
    {id:"tigre",     name:"TIGRE SLIME",     color:"#ff9a2a", color2:"#2a1608", price:400,  effect:"tigre",     rarity:2},
    {id:"marbre",    name:"MARBRE SLIME",    color:"#f2f0ea", color2:"#8a8f96", price:400,  effect:"marbre",    rarity:2},
    {id:"denim",     name:"DENIM SLIME",     color:"#4a7ab8", color2:"#1c3450", price:400,  effect:"denim",     rarity:2},
    {id:"brique",    name:"BRIQUE SLIME",    color:"#ff4f4f", color2:"#8a1414", price:400,  effect:"brique",    rarity:2},
    {id:"foot",      name:"FOOTBALL SLIME",  color:"#f4f4f4", color2:"#1a1a1a", price:400,  effect:"foot",      rarity:2},
    {id:"cassette",  name:"CASSETTE SLIME",  color:"#e8dcc0", color2:"#2a2420", price:400,  effect:"cassette",  rarity:2},
    {id:"carte",     name:"CARTE SLIME",     color:"#fbfbf7", color2:"#c01828", price:400,  effect:"carte",     rarity:2},
    {id:"boussole",  name:"BOUSSOLE SLIME",  color:"#d8c8a0", color2:"#4a3a20", price:400,  effect:"boussole",  rarity:2},
    {id:"flipper",   name:"FLIPPER SLIME",   color:"#3fd8ff", color2:"#14204a", price:400,  effect:"flipper",   rarity:2},

    {id:"foudre",    name:"FOUDRE SLIME",    color:"#8fd8ff", color2:"#101838", price:500,  effect:"foudre",    rarity:3},
    {id:"cristal",   name:"CRISTAL SLIME",   color:"#9fe8ff", color2:"#2a4a8a", price:500,  effect:"cristal",   rarity:3},
    {id:"sakura",    name:"SAKURA SLIME",    color:"#ffc0d8", color2:"#8a3a5a", price:500,  effect:"sakura",    rarity:3},
    {id:"griffe",    name:"GRIFFE SLIME",    color:"#3a2a34", color2:"#0a0810", price:500,  effect:"griffe",    rarity:3},
    {id:"matrice",   name:"MATRICE SLIME",   color:"#3fe87a", color2:"#04120a", price:500,  effect:"matrice",   rarity:3},
    {id:"ormassif",  name:"OR MASSIF SLIME", color:"#ffd76a", color2:"#6a4208", price:500,  effect:"ormassif",  rarity:3},
    {id:"trounoir",  name:"TROU NOIR SLIME", color:"#1a1030", color2:"#04020c", price:500,  effect:"trounoir",  rarity:3},
    {id:"papillon",  name:"PAPILLON SLIME",  color:"#6a8fff", color2:"#2a1a6a", price:500,  effect:"papillon",  rarity:3}
];


/* =========================================================
   LE SLIME DU JOUEUR

   Le même dessin sert à la boutique et à la partie : ce que
   tu vois dans la vitrine est exactement ce que tu incarnes.
========================================================= */

/* le cœur en fusion : blanc au centre, orange sur les bords */
function c_grad(c, cx, cy, cw, ch){

    const g = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cw, ch));

    g.addColorStop(0,   "#fffdf2");
    g.addColorStop(.35, "#ffd24a");
    g.addColorStop(.72, "#ff6a1e");
    g.addColorStop(1,   "#8f2a06");

    return g;

}


function paintSkinSlime(c, skin, r, t, detailed, fx){

    c.save();

    const f = fx || {};

    const speed  = f.speed  || 0;   /* 0 à 1 */
    const shear  = f.shear  || 0;   /* inclinaison du haut du corps */
    const wave   = f.wave   || 0;   /* onde qui parcourt la masse */
    const jiggle = f.jiggle || 0;   /* tremblement après un à-coup */
    const dir    = f.angle  || 0;

    /*
    Il ne saute pas : il glisse. Le corps s'étale vers l'avant,
    s'aplatit avec la vitesse, et une onde le traverse en continu.
    */
    if(speed > .01){

        c.rotate(dir);
        c.scale(1 + speed * .20, 1 - speed * .16);
        c.rotate(-dir);

    }

    /* le haut de la masse traîne derrière la base */
    if(shear){
        c.transform(1, 0, shear, 1, 0, 0);
    }

    const w = r * 1.06;
    const h = r * (1.00 - speed * .06);

    /* --- contour vivant : 26 points animés --- */

    const N   = 26;
    const pts = [];

    for(let i = 0; i < N; i++){

        const a = i / N * Math.PI * 2 - Math.PI / 2;

        /* onde qui descend le long du corps quand il avance */
        const flow = Math.sin(a * 2 - wave) * (.030 + speed * .055);

        /* frisson permanent, plus fort après un à-coup */
        const trem =
            Math.sin(a * 3 + t * 2.1) * (.022 + jiggle * .09) +
            Math.sin(a * 5 - t * 1.4) * .014;

        const k = 1 + flow + trem;

        /* le bas est plat : il repose sur le sol */
        const sy = Math.sin(a) > 0 ? .80 : 1.06;

        pts.push({
            x:Math.cos(a) * w * k,
            y:Math.sin(a) * h * k * sy + h * .10
        });

    }

    /*
    La silhouette est gardee de cote : elle sert au remplissage,
    au decoupage des details, puis a la lumiere de bord. Sans
    ca il faudrait la redessiner trois fois.
    */
    const shape = (typeof Path2D !== "undefined") ? new Path2D() : null;
    const path  = shape || c;

    if(!shape){
        c.beginPath();
    }

    path.moveTo(
        (pts[0].x + pts[N - 1].x) / 2,
        (pts[0].y + pts[N - 1].y) / 2
    );

    for(let i = 0; i < N; i++){

        const cur  = pts[i];
        const next = pts[(i + 1) % N];

        path.quadraticCurveTo(
            cur.x, cur.y,
            (cur.x + next.x) / 2,
            (cur.y + next.y) / 2
        );

    }

    path.closePath();

    /*
    L'ombre portee au sol : c'est elle qui pose la masse sur
    le terrain au lieu de la laisser flotter.
    */
    const drop = c.createRadialGradient(0, h * 1.02, r * .06, 0, h * 1.02, r * 1.05);
    drop.addColorStop(0,  "rgba(0,0,0,.34)");
    drop.addColorStop(.6, "rgba(0,0,0,.13)");
    drop.addColorStop(1,  "rgba(0,0,0,0)");

    c.globalAlpha = 1;
    c.fillStyle   = drop;
    c.beginPath();
    c.ellipse(0, h * 1.02, w * 1.02, h * .26, 0, 0, Math.PI * 2);
    c.fill();

    const body = c.createLinearGradient(0, -h * 1.1, 0, h);

    if(skin.effect === "prisme"){

        /* le corps traverse tout le spectre, et ca defile */
        const base = t * 55;

        for(let i = 0; i <= 6; i++){
            body.addColorStop(i / 6, "hsl(" + ((base + i * 52) % 360) + ",95%,64%)");
        }

    }else if(skin.effect === "magma"){

        /* croute sombre en haut, coeur incandescent en bas */
        body.addColorStop(0,   "#2a0d04");
        body.addColorStop(.42, "#4d1608");
        body.addColorStop(.78, skin.color);
        body.addColorStop(1,   "#ffd35c");

    }else{

        body.addColorStop(0,   skin.color);
        body.addColorStop(.52, skin.color);
        body.addColorStop(1,   skin.color2);

    }

    c.globalAlpha = skin.effect === "ghost" ? .72 : 1;

    c.fillStyle = body;

    c.shadowBlur  = r * .5;
    c.shadowColor = skin.color;

    if(shape){ c.fill(shape); }else{ c.fill(); }

    c.shadowBlur  = 0;

    c.globalAlpha = 1;

    /* on enferme les détails dans le corps */
    c.save();

    if(shape){ c.clip(shape); }else{ c.clip(); }

    /* diffusion interne : la lumière traverse la gelée */
    const sss = c.createRadialGradient(
        0, h * .25, r * .05,
        0, h * .15, r * 1.25
    );
    sss.addColorStop(0,  "rgba(255,255,255,.32)");
    sss.addColorStop(.5, "rgba(255,255,255,.06)");
    sss.addColorStop(1,  "rgba(255,255,255,0)");

    c.globalAlpha = 1;
    c.fillStyle   = sss;
    c.fillRect(-w * 1.2, -h * 1.3, w * 2.4, h * 2.6);

    /* base plus dense, où la matière s'accumule */
    c.globalAlpha = .30;
    c.fillStyle   = skin.color2;
    c.beginPath();
    c.ellipse(0, h * .78, w * .98, h * .42, 0, 0, Math.PI * 2);
    c.fill();

    /* large voile de lumière sur le dessus */
    const sheen = c.createLinearGradient(0, -h * 1.05, 0, h * .2);
    sheen.addColorStop(0,  "rgba(255,255,255,.42)");
    sheen.addColorStop(.6, "rgba(255,255,255,.05)");
    sheen.addColorStop(1,  "rgba(255,255,255,0)");

    c.globalAlpha = 1;
    c.fillStyle   = sheen;
    c.fillRect(-w, -h * 1.1, w * 2, h * 1.4);

    /* reflet net, qui glisse avec le mouvement */
    c.globalAlpha = .8;
    c.fillStyle   = "#ffffff";
    c.beginPath();
    c.ellipse(
        -w * .30 - (f.eyeX || 0) * w * .12,
        -h * .58,
        w * .26, h * .13, -.38, 0, Math.PI * 2
    );
    c.fill();

    /* petit point spéculaire */
    c.globalAlpha = .9;
    c.beginPath();
    c.ellipse(-w * .52, -h * .34, w * .07, h * .05, -.4, 0, Math.PI * 2);
    c.fill();

    /* lumière de bord, en bas à droite */
    c.globalAlpha = .35;
    c.strokeStyle = "#ffffff";
    c.lineWidth   = r * .10;
    c.beginPath();
    c.arc(0, 0, r * .96, .15, 1.5);
    c.stroke();

    /* taches internes */
    if(detailed){

        c.globalAlpha = .18;
        c.fillStyle   = "#ffffff";

        for(let i = 0; i < 3; i++){

            const a = t * .3 + i * 2.1;

            c.beginPath();
            c.ellipse(
                Math.cos(a) * w * .35,
                Math.sin(a) * h * .25 + h * .1,
                w * .18, h * .12, a, 0, Math.PI * 2
            );
            c.fill();

        }

    }

    /* motifs propres à chaque skin, à l'intérieur du corps */
    paintSkinInner(c, skin, w, h, r, t, f);

    /* =====================================================
       PASSE DE VOLUME

       Elle s'applique a TOUS les skins, par-dessus leur
       motif : un fond d'ombre sur les bords, une lumiere
       froide qui vient de derriere, et un liset clair sur
       l'arete. C'est ce trio qui fait passer la masse de
       la pastille plate au volume.
    ===================================================== */

    c.globalAlpha = 1;

    /* occlusion : la matiere s'assombrit la ou elle s'epaissit */
    const ao = c.createRadialGradient(
        -w * .18, -h * .30, r * .12,
        -w * .05,  h * .05, r * 1.32
    );
    ao.addColorStop(0,   "rgba(0,0,0,0)");
    ao.addColorStop(.62, "rgba(0,0,0,0)");
    ao.addColorStop(.86, "rgba(0,0,0,.22)");
    ao.addColorStop(1,   "rgba(0,0,0,.46)");

    c.fillStyle = ao;
    c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

    /* lumiere de contre-jour, en bas a droite */
    const rim = c.createLinearGradient(w * .1, h * .1, w, h);
    rim.addColorStop(0,   "rgba(255,255,255,0)");
    rim.addColorStop(.55, hexA(skin.color, .28));
    rim.addColorStop(1,   "rgba(255,255,255,.55)");

    if(shape){

        c.globalAlpha = .85;
        c.strokeStyle = rim;
        c.lineWidth   = r * .22;
        c.lineJoin    = "round";
        c.stroke(shape);

        /* liset froid sur le haut, pour decoller du fond */
        const cold = c.createLinearGradient(0, -h * 1.1, 0, -h * .2);
        cold.addColorStop(0, "rgba(190,225,255,.55)");
        cold.addColorStop(1, "rgba(190,225,255,0)");

        c.globalAlpha = .7;
        c.strokeStyle = cold;
        c.lineWidth   = r * .13;
        c.stroke(shape);

    }

    c.globalAlpha = 1;

    c.restore();
    c.globalAlpha = 1;

    /* le fin trait de lumiere qui detoure toute la masse */
    if(shape){

        c.globalAlpha = .30;
        c.strokeStyle = "#ffffff";
        c.lineWidth   = Math.max(.8, r * .035);
        c.lineJoin    = "round";
        c.stroke(shape);

        c.globalAlpha = 1;

    }

    /* --- le cratère, pour le slime rouge --- */

    if(skin.effect === "crater"){

        const cx = 0;
        const cy = -h * .60;
        const cw = w * .48;
        const ch = h * .21;

        /* le bourrelet du cratère */
        c.beginPath();
        c.ellipse(cx, cy, cw * 1.16, ch * 1.30, 0, 0, Math.PI * 2);
        c.fillStyle = "#6d1610";
        c.fill();

        /* la gueule du cratère */
        c.beginPath();
        c.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);

        const core = c_grad(c, cx, cy, cw, ch);

        c.fillStyle = core;
        c.fill();

        c.lineWidth   = Math.max(1.5, r * .06);
        c.strokeStyle = "#4a0d09";
        c.stroke();

        /* la lave bout : des bulles crèvent la surface */
        c.save();
        c.beginPath();
        c.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
        c.clip();

        for(let i = 0; i < 4; i++){

            const k = ((t * .8 + i * .27) % 1);

            const bx = cx + Math.sin(i * 2.3 + t * .6) * cw * .5;
            const by = cy + ch * .5 - k * ch * 1.1;

            c.globalAlpha = (1 - k) * .9;
            c.fillStyle   = "#fff3c4";

            c.beginPath();
            c.arc(bx, by, r * (.035 + k * .05), 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;
        c.restore();

        /* braises qui s'échappent */
        for(let i = 0; i < 5; i++){

            const k = ((t * .45 + i * .2) % 1);

            const ex = cx + Math.sin(i * 3.1 + t * 1.4) * cw * .6;
            const ey = cy - k * h * 1.15;

            c.globalAlpha = (1 - k) * .85;
            c.fillStyle   = i % 2 ? "#ffb347" : "#ff6a2a";

            c.beginPath();
            c.arc(ex, ey, r * .045 * (1 - k * .5), 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

        /* la chaleur éclaire le pourtour */
        c.save();
        c.globalAlpha = .35;
        c.fillStyle   = "#ff7a2a";
        c.beginPath();
        c.ellipse(cx, cy + ch * .9, cw * 1.5, ch * 1.1, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();

    }


    /* --- les yeux --- */

    const ey = -h * .18 + (f.eyeY || 0) * r * .07;
    const ex = w * .34;
    const er = r * .21;

    const blinking = f.blink < 0;
    const robot    = skin.effect === "meca";
    const plush    = skin.effect === "peluche";

    /* le méca n'a pas d'yeux : il a une visière */
    if(robot){

        paintVisor(c, skin, w, h, r, t, f);

    }else if(skin.effect === "neant"){

        /* un seul oeil, deja peint au centre du corps : rien ici */

    }else if(skin.effect === "pantin"){

        /*
        Les yeux de la marionnette, repris trait pour trait :
        deux ovales blancs qui brulent, sans pupille.
        */
        [-1, 1].forEach(sgn => {

            c.shadowColor = "#ffffff";
            c.shadowBlur  = r * .5;
            c.fillStyle   = "#ffffff";

            c.beginPath();
            c.ellipse(sgn * w * .30, -h * .12, w * .155, h * .21, 0, 0, Math.PI * 2);
            c.fill();

        });

        c.shadowBlur = 0;

    }else if(skin.effect === "squelette"){

        /* deux orbites vides */
        [-1, 1].forEach(sgn => {

            c.fillStyle = "#1a2028";

            c.beginPath();
            c.ellipse(sgn * ex, ey, er * 1.05, er * 1.15, 0, 0, Math.PI * 2);
            c.fill();

            /* une lueur au fond */
            c.globalAlpha = .5 + .3 * Math.sin(t * 2 + sgn);
            c.fillStyle   = "#8fd8ff";
            c.beginPath();
            c.arc(sgn * ex, ey + er * .1, er * .3, 0, Math.PI * 2);
            c.fill();
            c.globalAlpha = 1;

        });

    }else if(skin.effect === "momie"){

        /* un seul oeil : l'autre est sous la bandelette */
        c.save();
        c.translate(-w * .34, ey);
        c.rotate(-.22);

        c.fillStyle = "#f2ead2";
        c.fillRect(-w * .72, -er * .85, w * 1.30, er * 1.6);

        c.strokeStyle = "#b8a882";
        c.lineWidth   = Math.max(1, r * .022);
        c.beginPath();
        c.moveTo(-w * .72, er * .75);
        c.lineTo(w * .58, er * .75);
        c.stroke();

        c.restore();

        c.fillStyle = "#241a10";
        c.beginPath();
        c.ellipse(ex, ey, er * .8, er, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#ffd24d";
        c.beginPath();
        c.arc(ex - er * .2, ey - er * .3, er * .32, 0, Math.PI * 2);
        c.fill();

    }else if(plush){

        /* deux boutons cousus */
        [-1, 1].forEach(sgn => {

            c.fillStyle = "#3f6f9c";
            c.beginPath();
            c.arc(sgn * ex, ey, er * .92, 0, Math.PI * 2);
            c.fill();

            c.strokeStyle = "#f2ead8";
            c.lineWidth   = Math.max(1, r * .035);

            [[-1,-1,1,1],[-1,1,1,-1]].forEach(d => {
                c.beginPath();
                c.moveTo(sgn * ex + d[0] * er * .34, ey + d[1] * er * .34);
                c.lineTo(sgn * ex + d[2] * er * .34, ey + d[3] * er * .34);
                c.stroke();
            });

        });

    }else if(blinking){

        c.strokeStyle = "#101828";
        c.lineWidth   = Math.max(1.2, r * .09);
        c.lineCap     = "round";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(sgn * ex - er * .8, ey);
            c.lineTo(sgn * ex + er * .8, ey);
            c.stroke();
        });

    }else [-1, 1].forEach(sgn => {

        /*
        Sur les skins sombres (ninja, magma, orage) des yeux
        noirs disparaissent : on les eclaire.
        */
        const DARK_EYES = {
            tokyo:  ["#3affd0", "#3affd0"],
            plasma: ["#f0d0ff", "#c86aff"],
            vangogh:["#fff3b0", "#ffd24d"],
            encre:  ["#1a1d26", "#1a1d26"],
            tornade:["#e8f2ff", "#e8f2ff"],
            aurore: ["#c8fff0", "#7ef0d0"],
            arcade: ["#5ffff0", "#5ffff0"],
            nova:   ["#fff6d0", "#ffd76a"],
            eclipse:["#ffd76a", "#ff9a3d"],
            sablier:["#ffe9a8", "#ffcf4d"],
            abyssal:["#5fe8ff", "#7bffca"],
            neant:  ["#ffc65a", "#ffc65a"],
            mimic:  ["#ffffff", "#c86aff"],
            lampe:  ["#ffd0f5", "#ff6ad5"],
            holo:   ["#d8feff", "#5fe8ff"],
            requin: ["#eef4fa", "#eef4fa"],
            citrouille:["#fff0a0", "#ff9a2a"],
            ninja:  ["#eaf4ff", "#eaf4ff"],
            magma:  ["#ffd88a", "#ffb347"],
            maudit: ["#ff3a52", "#ff3a52"],
            alien:  ["#8dfff0", "#8dfff0"],
            binaire:["#4dffd0", "#4dffd0"],
            fluo:   ["#eaffd0", "#8dff2e"],
            samourai:["#ffd15c", "#ffd15c"],
            viking: ["#f2ead8", "#f2ead8"]
        };

        const dark = DARK_EYES[skin.effect];

        if(dark){
            c.shadowBlur  = r * .35;
            c.shadowColor = dark[1];
        }

        c.fillStyle = dark ? dark[0] : "#101828";
        c.beginPath();
        c.ellipse(
            sgn * ex + (f.eyeX || 0) * r * .05,
            ey,
            er * .82, er, 0, 0, Math.PI * 2
        );
        c.fill();

        c.shadowBlur = 0;

        c.fillStyle = dark ? "#1a1020" : "#ffffff";
        c.beginPath();
        c.arc(
            sgn * ex - er * .22 + (f.eyeX || 0) * r * .05,
            ey - er * .32,
            er * .34, 0, Math.PI * 2
        );
        c.fill();

        c.globalAlpha = .7;
        c.beginPath();
        c.arc(sgn * ex + er * .26, ey + er * .30, er * .16, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;

    });

    /* la bouche */
    if(!robot && !plush && skin.effect !== "neant" && skin.effect !== "pantin"){

        c.strokeStyle = "#101828";
        c.lineWidth   = Math.max(1, r * .07);
        c.lineCap     = "round";

        c.beginPath();

        if(skin.effect === "dragon"){

            /* museau : deux crocs qui depassent */
            c.arc(0, h * .10, r * .22, .2, Math.PI - .2);
            c.stroke();

            c.fillStyle = "#ffffff";

            [-1, 1].forEach(sgn => {
                c.beginPath();
                c.moveTo(sgn * r * .13, h * .16);
                c.lineTo(sgn * r * .21, h * .16);
                c.lineTo(sgn * r * .17, h * .30);
                c.closePath();
                c.fill();
            });

        }else if(skin.effect === "requin"){

            /* une gueule pleine de dents */
            c.fillStyle = "#1a2430";
            c.beginPath();
            c.ellipse(0, h * .16, r * .34, r * .14, 0, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#ffffff";

            for(let i = -3; i <= 3; i++){
                c.beginPath();
                c.moveTo(i * r * .09 - r * .04, h * .10);
                c.lineTo(i * r * .09 + r * .04, h * .10);
                c.lineTo(i * r * .09, h * .20);
                c.closePath();
                c.fill();
            }

        }else if(skin.effect === "citrouille"){

            /* la bouche decoupee */
            c.fillStyle = "#3a1a04";
            c.beginPath();
            c.moveTo(-r * .34, h * .06);

            for(let i = 0; i <= 6; i++){
                c.lineTo(-r * .34 + i * r * .113, h * (i % 2 ? .22 : .06));
            }

            c.lineTo(r * .34, h * .30);
            c.lineTo(-r * .34, h * .30);
            c.closePath();
            c.fill();

        }else if(skin.effect === "squelette"){

            /* la machoire */
            c.strokeStyle = "#8f9aa8";
            c.lineWidth   = Math.max(1, r * .05);

            c.beginPath();
            c.moveTo(-r * .26, h * .10);
            c.lineTo(r * .26, h * .10);
            c.stroke();

            for(let i = -2; i <= 2; i++){
                c.beginPath();
                c.moveTo(i * r * .11, h * .04);
                c.lineTo(i * r * .11, h * .17);
                c.stroke();
            }

        }else if(skin.effect === "zombie"){

            /* rictus de travers */
            c.moveTo(-r * .22, h * .12);
            c.lineTo(r * .06, h * .20);
            c.lineTo(r * .24, h * .10);
            c.stroke();

        }else{

            c.arc(0, h * .10, r * .20, .25, Math.PI - .25);
            c.stroke();

        }

    }

    /* --- effets par-dessus --- */

    if(skin.effect === "galaxy" || skin.effect === "neon"){

        for(let i = 0; i < 2; i++){

            c.strokeStyle = i ? skin.color2 : skin.color;
            c.lineWidth   = r * .07;
            c.globalAlpha = .7;

            c.beginPath();
            c.arc(
                0, 0, r * (1.30 + i * .18),
                t * (i ? -.9 : 1.1),
                t * (i ? -.9 : 1.1) + Math.PI * 1.35
            );
            c.stroke();

        }

        c.globalAlpha = 1;

    }

    if(skin.effect === "void"){

        /* l'auréole */
        c.strokeStyle = "#c79bff";
        c.lineWidth   = r * .13;
        c.shadowBlur  = r * .5;
        c.shadowColor = "#a86cff";

        c.beginPath();
        c.ellipse(0, -h * 1.28, r * .62, r * .18, 0, 0, Math.PI * 2);
        c.stroke();

        c.shadowBlur = 0;

    }

    if(skin.effect === "toxic" || skin.effect === "neon" || skin.effect === "galaxy"){

        /* particules qui montent */
        for(let i = 0; i < 5; i++){

            const k  = (t * .55 + i * .2) % 1;
            const px = Math.sin(i * 3.1 + t) * r * .9;
            const py = h * .6 - k * r * 2;

            c.globalAlpha = (1 - k) * .8;
            c.fillStyle   = i % 2 ? skin.color : (skin.effect === "toxic" ? "#b8ff5a" : skin.color2);

            c.fillRect(px, py, r * .09, r * .09);

        }

        c.globalAlpha = 1;

    }


    /* ---------- accessoires des nouveaux skins ---------- */

    /* GIVRE : cristaux plantes dans le dos */
    if(skin.effect === "givre"){

        c.fillStyle   = "#dff6ff";
        c.strokeStyle = "#6fb6dd";
        c.lineWidth   = Math.max(1, r * .035);

        c.shadowBlur  = r * .4;
        c.shadowColor = "#a9e8ff";

        [[-.62,-.72,.9],[-.05,-1.02,1.25],[.55,-.78,1]].forEach(sh => {

            const bx = sh[0] * w;
            const by = sh[1] * h;
            const sc = sh[2];

            c.beginPath();
            c.moveTo(bx, by + r * .30 * sc);
            c.lineTo(bx - r * .14 * sc, by);
            c.lineTo(bx, by - r * .40 * sc);
            c.lineTo(bx + r * .14 * sc, by);
            c.closePath();

            c.fill();
            c.stroke();

        });

        c.shadowBlur = 0;

    }

    /* DRAGON : cornes et epines dorsales */
    if(skin.effect === "dragon"){

        c.fillStyle = "#f2e6c8";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(sgn * w * .46, -h * .82);
            c.lineTo(sgn * w * .30, -h * .96);
            c.lineTo(sgn * w * .72, -h * 1.36);
            c.lineTo(sgn * w * .60, -h * .86);
            c.closePath();
            c.fill();
        });

        /* crete */
        c.fillStyle = "#1c7a45";

        for(let i = 0; i < 3; i++){

            const bx = -w * .30 + i * w * .30;
            const sz = r * (.20 - Math.abs(i - 1) * .04);

            c.beginPath();
            c.moveTo(bx - sz * .6, -h * .92);
            c.lineTo(bx, -h * 1.28);
            c.lineTo(bx + sz * .6, -h * .92);
            c.closePath();
            c.fill();

        }

    }

    /* NINJA : shurikens en orbite */
    if(skin.effect === "ninja"){

        for(let i = 0; i < 2; i++){

            const a  = t * 1.6 + i * Math.PI;
            const px = Math.cos(a) * r * 1.42;
            const py = Math.sin(a) * r * .48 - h * .30;

            c.save();
            c.translate(px, py);
            c.rotate(t * 5 + i);

            c.fillStyle = "#c9d4e6";

            c.beginPath();

            for(let k = 0; k < 4; k++){
                const b = k * Math.PI / 2;
                c.lineTo(Math.cos(b) * r * .20, Math.sin(b) * r * .20);
                c.lineTo(Math.cos(b + .78) * r * .07, Math.sin(b + .78) * r * .07);
            }

            c.closePath();
            c.fill();

            c.restore();

        }

    }

    /* MECA : antenne avec voyant */
    if(skin.effect === "meca"){

        c.strokeStyle = "#8593ad";
        c.lineWidth   = Math.max(1, r * .05);

        c.beginPath();
        c.moveTo(w * .30, -h * .95);
        c.lineTo(w * .46, -h * 1.42);
        c.stroke();

        c.globalAlpha = .55 + Math.sin(t * 5) * .45;
        c.fillStyle   = "#ff5470";
        c.shadowBlur  = r * .4;
        c.shadowColor = "#ff5470";

        c.beginPath();
        c.arc(w * .46, -h * 1.46, r * .10, 0, Math.PI * 2);
        c.fill();

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

    }

    /* ORAGE : petit nuage au-dessus, qui gronde */
    if(skin.effect === "orage"){

        c.globalAlpha = .9;
        c.fillStyle   = "#2b3358";

        [[-.42,0,.46],[0,-.14,.58],[.44,0,.44]].forEach(b => {
            c.beginPath();
            c.ellipse(b[0] * w, -h * 1.34 + b[1] * h, r * b[2], r * b[2] * .68, 0, 0, Math.PI * 2);
            c.fill();
        });

        const flash = Math.pow(Math.max(0, Math.sin(t * 3.1)), 8);

        if(flash > .02){

            c.globalAlpha = flash;
            c.fillStyle   = "#ffe98a";
            c.shadowBlur  = r * .6;
            c.shadowColor = "#ffe98a";

            c.beginPath();
            c.moveTo(-r * .10, -h * 1.12);
            c.lineTo(r * .12, -h * 1.12);
            c.lineTo(0, -h * .90);
            c.lineTo(r * .16, -h * .90);
            c.lineTo(-r * .10, -h * .58);
            c.lineTo(r * .02, -h * .86);
            c.lineTo(-r * .14, -h * .86);
            c.closePath();
            c.fill();

            c.shadowBlur = 0;

        }

        c.globalAlpha = 1;

    }

    /* MAGMA : braises qui s'envolent */
    if(skin.effect === "magma"){

        for(let i = 0; i < 6; i++){

            const k  = (t * .6 + i * .167) % 1;
            const px = Math.sin(i * 2.7 + t * .8) * w * .8;
            const py = h * .5 - k * r * 2.4;

            c.globalAlpha = (1 - k) * .9;
            c.fillStyle   = k < .5 ? "#ffd35c" : "#ff6a1f";

            c.beginPath();
            c.arc(px, py, r * (.07 - k * .04), 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

    }

    /* OCEAN : gouttes qui retombent */
    if(skin.effect === "ocean"){

        c.globalAlpha = .7;
        c.fillStyle   = "#9ff4ff";

        for(let i = 0; i < 3; i++){

            const k  = (t * .8 + i * .33) % 1;
            const px = (i - 1) * w * .6;
            const py = -h * 1.1 + k * h * 2.2;

            c.globalAlpha = (1 - k) * .7;

            c.beginPath();
            c.ellipse(px, py, r * .05, r * .09, 0, 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

    }

    /* BONBON : petites etoiles sucrees */
    if(skin.effect === "bonbon"){

        c.strokeStyle = "#fff0f7";
        c.lineWidth   = Math.max(1, r * .045);
        c.lineCap     = "round";

        for(let i = 0; i < 3; i++){

            const a  = t * 1.1 + i * 2.1;
            const px = Math.cos(a) * r * 1.34;
            const py = Math.sin(a) * r * .52 - h * .35;
            const sz = r * .13 * (.7 + Math.sin(t * 3 + i) * .3);

            c.globalAlpha = .85;

            [0, Math.PI / 2].forEach(b => {
                c.beginPath();
                c.moveTo(px - Math.cos(b) * sz, py - Math.sin(b) * sz);
                c.lineTo(px + Math.cos(b) * sz, py + Math.sin(b) * sz);
                c.stroke();
            });

        }

        c.globalAlpha = 1;

    }

    /* ZOMBIE : mouches */
    if(skin.effect === "zombie"){

        c.fillStyle = "#1e2a10";

        for(let i = 0; i < 2; i++){

            const a  = t * 2.6 + i * 3.1;
            const px = Math.cos(a) * r * 1.1;
            const py = Math.sin(a * 1.7) * r * .55 - h * .8;

            c.beginPath();
            c.arc(px, py, r * .045, 0, Math.PI * 2);
            c.fill();

        }

    }

    /* PRISME : halo qui change de couleur */
    if(skin.effect === "prisme"){

        for(let i = 0; i < 3; i++){

            c.strokeStyle = "hsl(" + ((t * 90 + i * 120) % 360) + ",100%,68%)";
            c.lineWidth   = r * .06;
            c.globalAlpha = .6;

            c.beginPath();
            c.arc(
                0, 0, r * (1.24 + i * .16),
                t * (1 + i * .4),
                t * (1 + i * .4) + Math.PI * 1.1
            );
            c.stroke();

        }

        c.globalAlpha = 1;

    }


    /* ---------- accessoires de la grande fournee ---------- */

    /* GEODE : cristaux qui percent la coque */
    if(skin.effect === "geode"){

        c.shadowBlur  = r * .4;
        c.shadowColor = "#c9a8ff";

        [[-.55,-.85,1],[0,-1.10,1.3],[.5,-.92,1.05],[.85,-.5,.8]].forEach(sh => {

            const bx = sh[0] * w;
            const by = sh[1] * h;
            const sc = sh[2];

            c.fillStyle = "#e2d0ff";

            c.beginPath();
            c.moveTo(bx, by + r * .26 * sc);
            c.lineTo(bx - r * .13 * sc, by);
            c.lineTo(bx, by - r * .44 * sc);
            c.lineTo(bx + r * .13 * sc, by);
            c.closePath();
            c.fill();

            c.fillStyle   = "#ffffff";
            c.globalAlpha = .45;
            c.beginPath();
            c.moveTo(bx, by + r * .26 * sc);
            c.lineTo(bx, by - r * .44 * sc);
            c.lineTo(bx + r * .13 * sc, by);
            c.closePath();
            c.fill();
            c.globalAlpha = 1;

        });

        c.shadowBlur = 0;

    }

    /* MOUSSE : champignons sur le dos */
    if(skin.effect === "mousse"){

        [[-.45,-.88,1],[.28,-1.02,1.2],[.62,-.72,.85]].forEach(m => {

            const bx = m[0] * w;
            const by = m[1] * h;
            const sc = m[2];

            c.fillStyle = "#f2e2c8";
            c.fillRect(bx - r * .05 * sc, by, r * .10 * sc, r * .26 * sc);

            c.fillStyle = "#d84a3a";
            c.beginPath();
            c.ellipse(bx, by, r * .19 * sc, r * .14 * sc, 0, Math.PI, 0);
            c.fill();

            c.fillStyle = "#ffeede";

            for(let i = 0; i < 3; i++){
                c.beginPath();
                c.arc(bx - r * .09 * sc + i * r * .09 * sc, by - r * .06 * sc, r * .025 * sc, 0, Math.PI * 2);
                c.fill();
            }

        });

    }

    /* LIANES : fleur sur la tete */
    if(skin.effect === "lianes"){

        const fx = -w * .5;
        const fy = -h * .95;

        c.fillStyle = "#ff8ec4";

        for(let i = 0; i < 5; i++){
            const a = i * (Math.PI * 2 / 5) + t * .3;
            c.beginPath();
            c.ellipse(fx + Math.cos(a) * r * .13, fy + Math.sin(a) * r * .13, r * .09, r * .06, a, 0, Math.PI * 2);
            c.fill();
        }

        c.fillStyle = "#ffd84d";
        c.beginPath();
        c.arc(fx, fy, r * .07, 0, Math.PI * 2);
        c.fill();

    }

    /* CORAIL : branches de corail sur le dessus */
    if(skin.effect === "corail"){

        ["#ff7ba8","#ffb15c"].forEach((col, i) => {

            const bx = (i ? .5 : -.45) * w;

            c.strokeStyle = col;
            c.lineWidth   = r * .09;
            c.lineCap     = "round";

            c.beginPath();
            c.moveTo(bx, -h * .82);
            c.lineTo(bx, -h * 1.16);
            c.moveTo(bx, -h * 1.02);
            c.lineTo(bx - r * .18, -h * 1.28);
            c.moveTo(bx, -h * 1.06);
            c.lineTo(bx + r * .18, -h * 1.34);
            c.stroke();

        });

    }

    /* GUMBALL : couvercle metallique */
    if(skin.effect === "gumball"){

        c.fillStyle = "#c0392b";
        c.beginPath();
        c.ellipse(0, -h * 1.02, w * .42, h * .16, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#8e2b20";
        c.fillRect(-w * .10, -h * 1.24, w * .20, h * .22);

        c.fillStyle = "#e8e8e8";
        c.beginPath();
        c.arc(0, -h * 1.26, r * .09, 0, Math.PI * 2);
        c.fill();

    }

    /* ARTISAN : pinceau plante dans le dos */
    if(skin.effect === "artisan"){

        c.save();
        c.translate(w * .62, -h * .78);
        c.rotate(-.55);

        c.fillStyle = "#a8763a";
        c.fillRect(-r * .035, -r * .60, r * .07, r * .60);

        c.fillStyle = "#c9c9c9";
        c.fillRect(-r * .05, -r * .05, r * .10, r * .12);

        c.fillStyle = "#c9452f";
        c.beginPath();
        c.moveTo(-r * .06, r * .07);
        c.lineTo(r * .06, r * .07);
        c.lineTo(0, r * .26);
        c.closePath();
        c.fill();

        c.restore();

    }

    /* BINAIRE : lignes de balayage */
    if(skin.effect === "binaire"){

        c.globalAlpha = .35;
        c.strokeStyle = "#4dffd0";
        c.lineWidth   = Math.max(1, r * .02);

        for(let i = 0; i < 5; i++){
            const y = -h + ((t * .5 + i * .2) % 1) * h * 2;
            c.beginPath();
            c.moveTo(-r * 1.05, y);
            c.lineTo(r * 1.05, y);
            c.stroke();
        }

        c.globalAlpha = 1;

    }

    /* SPRIGGAN : ailes de fee */
    if(skin.effect === "spriggan"){

        const beat = Math.sin(t * 7) * .22;

        [-1, 1].forEach(sgn => {

            c.save();
            c.translate(sgn * w * .55, -h * .35);
            c.rotate(sgn * (.5 + beat));

            const g = c.createLinearGradient(0, 0, sgn * r * .9, -r * .5);

            g.addColorStop(0, "rgba(216,255,200,.75)");
            g.addColorStop(1, "rgba(150,220,255,.15)");

            c.fillStyle = g;

            c.beginPath();
            c.ellipse(sgn * r * .42, -r * .22, r * .46, r * .19, sgn * -.35, 0, Math.PI * 2);
            c.fill();

            c.restore();

        });

    }

    /* ALIEN : antennes */
    if(skin.effect === "alien"){

        c.strokeStyle = "#5f8fe8";
        c.lineWidth   = Math.max(1, r * .045);
        c.lineCap     = "round";

        [-1, 1].forEach(sgn => {

            const tipX = sgn * w * (.34 + Math.sin(t * 1.5 + sgn) * .06);
            const tipY = -h * 1.42;

            c.beginPath();
            c.moveTo(sgn * w * .26, -h * .88);
            c.quadraticCurveTo(sgn * w * .44, -h * 1.2, tipX, tipY);
            c.stroke();

            c.globalAlpha = .5 + Math.sin(t * 3 + sgn) * .5;
            c.fillStyle   = "#8dfff0";
            c.shadowBlur  = r * .4;
            c.shadowColor = "#8dfff0";

            c.beginPath();
            c.arc(tipX, tipY, r * .09, 0, Math.PI * 2);
            c.fill();

            c.shadowBlur  = 0;
            c.globalAlpha = 1;

        });

    }

    /* MAGE : chapeau pointu */
    if(skin.effect === "mage"){

        c.fillStyle = "#4a2f8f";

        c.beginPath();
        c.moveTo(-w * .70, -h * .78);
        c.quadraticCurveTo(-w * .30, -h * 1.05, w * .18, -h * 1.62);
        c.quadraticCurveTo(w * .12, -h * .98, w * .62, -h * .80);
        c.closePath();
        c.fill();

        /* le bord */
        c.fillStyle = "#33206b";
        c.beginPath();
        c.ellipse(-w * .04, -h * .80, w * .78, h * .16, 0, 0, Math.PI * 2);
        c.fill();

        /* etoiles */
        c.fillStyle = "#ffd84d";

        for(let i = 0; i < 3; i++){

            const px = -w * .30 + i * w * .26;
            const py = -h * (1.00 + i * .13);
            const sz = r * .07 * (.7 + Math.sin(t * 3 + i) * .3);

            c.beginPath();

            for(let k = 0; k < 10; k++){
                const a  = k * Math.PI / 5 - Math.PI / 2;
                const rr = k % 2 ? sz * .45 : sz;
                c.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr);
            }

            c.closePath();
            c.fill();

        }

    }

    /* VIKING : casque a cornes + bouclier */
    if(skin.effect === "viking"){

        c.fillStyle = "#9aa5b0";

        c.beginPath();
        c.ellipse(0, -h * .86, w * .52, h * .34, 0, Math.PI, 0);
        c.fill();

        c.fillStyle = "#6d7783";
        c.fillRect(-w * .55, -h * .90, w * 1.10, h * .10);

        c.fillStyle = "#efe3c8";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(sgn * w * .46, -h * .96);
            c.quadraticCurveTo(sgn * w * .96, -h * 1.20, sgn * w * .82, -h * 1.54);
            c.quadraticCurveTo(sgn * w * .74, -h * 1.16, sgn * w * .40, -h * 1.04);
            c.closePath();
            c.fill();
        });

        /* bouclier rond a gauche */
        c.fillStyle = "#b03a2e";
        c.beginPath();
        c.arc(-w * .86, h * .32, r * .24, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#e8dcc0";
        c.lineWidth   = Math.max(1.5, r * .045);
        c.stroke();

        c.beginPath();
        c.arc(-w * .86, h * .32, r * .08, 0, Math.PI * 2);
        c.stroke();

    }

    /* STEAMPUNK : chapeau, manometre et vapeur */
    if(skin.effect === "steampunk"){

        /* haut-de-forme */
        c.fillStyle = "#3a2c18";
        c.fillRect(-w * .34, -h * 1.52, w * .68, h * .58);

        c.fillStyle = "#7a5a30";
        c.fillRect(-w * .34, -h * 1.10, w * .68, h * .10);

        c.fillStyle = "#3a2c18";
        c.beginPath();
        c.ellipse(0, -h * .94, w * .62, h * .13, 0, 0, Math.PI * 2);
        c.fill();

        /* manometre sur le flanc */
        c.fillStyle = "#c9a24a";
        c.beginPath();
        c.arc(w * .70, -h * .18, r * .17, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#f2ead8";
        c.beginPath();
        c.arc(w * .70, -h * .18, r * .12, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#8a2a1a";
        c.lineWidth   = Math.max(1, r * .03);
        c.beginPath();
        c.moveTo(w * .70, -h * .18);
        c.lineTo(w * .70 + Math.cos(Math.sin(t * 2) * 1.2 - 1.6) * r * .09,
                 -h * .18 + Math.sin(Math.sin(t * 2) * 1.2 - 1.6) * r * .09);
        c.stroke();

        /* vapeur */
        for(let i = 0; i < 3; i++){

            const k = (t * .55 + i * .33) % 1;

            c.globalAlpha = (1 - k) * .5;
            c.fillStyle   = "#ffffff";

            c.beginPath();
            c.arc(-w * .30 + Math.sin(k * 4 + i) * r * .14, -h * 1.55 - k * r * .9, r * (.07 + k * .13), 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

    }

    /* HORLOGE : petit oiseau qui sort */
    if(skin.effect === "horloge"){

        /* toit */
        c.fillStyle = "#6b4a28";

        c.beginPath();
        c.moveTo(-w * .78, -h * .84);
        c.lineTo(0, -h * 1.42);
        c.lineTo(w * .78, -h * .84);
        c.closePath();
        c.fill();

        /* le coucou sort toutes les quelques secondes */
        const out = Math.max(0, Math.sin(t * 1.1));

        c.fillStyle = "#ffd24d";

        c.beginPath();
        c.ellipse(0, -h * 1.02 - out * r * .12, r * .13, r * .11, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#e07a2a";
        c.beginPath();
        c.moveTo(r * .11, -h * 1.02 - out * r * .12);
        c.lineTo(r * .22, -h * 1.00 - out * r * .12);
        c.lineTo(r * .11, -h * .98 - out * r * .12);
        c.closePath();
        c.fill();

        c.fillStyle = "#3a2c18";
        c.beginPath();
        c.arc(-r * .03, -h * 1.04 - out * r * .12, r * .022, 0, Math.PI * 2);
        c.fill();

    }

    /* SAMOURAI : kabuto */
    if(skin.effect === "samourai"){

        c.fillStyle = "#2a1410";
        c.beginPath();
        c.ellipse(0, -h * .82, w * .60, h * .40, 0, Math.PI, 0);
        c.fill();

        /* le croissant dore */
        c.fillStyle   = "#e8c24a";
        c.shadowBlur  = r * .3;
        c.shadowColor = "#ffe07a";

        c.beginPath();
        c.arc(0, -h * 1.02, r * .52, Math.PI * 1.15, Math.PI * 1.85);
        c.arc(0, -h * .90, r * .52, Math.PI * 1.85, Math.PI * 1.15, true);
        c.closePath();
        c.fill();

        c.shadowBlur = 0;

        /* les protections laterales */
        c.fillStyle = "#5f2a1e";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(sgn * w * .60, -h * .84);
            c.lineTo(sgn * w * .98, -h * .70);
            c.lineTo(sgn * w * .92, -h * .40);
            c.lineTo(sgn * w * .62, -h * .56);
            c.closePath();
            c.fill();
        });

    }

    /* PHARAON : coiffe et cobra */
    if(skin.effect === "pharaon"){

        /* les pans du nemes */
        c.fillStyle = "#1f5fb5";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(sgn * w * .62, -h * .78);
            c.lineTo(sgn * w * 1.00, -h * .30);
            c.lineTo(sgn * w * .80, h * .40);
            c.lineTo(sgn * w * .54, -h * .10);
            c.closePath();
            c.fill();
        });

        /* la barre frontale */
        c.fillStyle = "#f0c64a";
        c.fillRect(-w * .78, -h * .82, w * 1.56, h * .16);

        /* le cobra */
        c.fillStyle = "#c9a24a";
        c.beginPath();
        c.ellipse(0, -h * .98, r * .13, r * .17, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#2a7a4a";
        c.beginPath();
        c.arc(0, -h * 1.02, r * .07, 0, Math.PI * 2);
        c.fill();

    }

    /* MAUDIT : aura noire et yeux rouges */
    if(skin.effect === "maudit"){

        for(let i = 0; i < 4; i++){

            const k = (t * .5 + i * .25) % 1;

            c.globalAlpha = (1 - k) * .45;
            c.strokeStyle = "#7a2fd0";
            c.lineWidth   = r * .07;

            c.beginPath();
            c.arc(0, 0, r * (1.0 + k * .7), 0, Math.PI * 2);
            c.stroke();

        }

        /* fumee qui tombe */
        c.globalAlpha = .5;
        c.fillStyle   = "#1a0a26";

        for(let i = 0; i < 4; i++){
            const k = (t * .7 + i * .25) % 1;
            c.beginPath();
            c.arc(Math.sin(i * 2.4 + t) * w * .7, h * .8 + k * r * .8, r * (.14 - k * .1), 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;

    }

    /* TRESOR : petit dragon endormi sur le tas */
    if(skin.effect === "tresor"){

        c.fillStyle = "#2f8f52";

        /* le corps enroule */
        c.beginPath();
        c.ellipse(w * .10, -h * .94, r * .30, r * .12, -.15, 0, Math.PI * 2);
        c.fill();

        /* la queue */
        c.strokeStyle = "#2f8f52";
        c.lineWidth   = r * .07;
        c.lineCap     = "round";
        c.beginPath();
        c.moveTo(-w * .16, -h * .92);
        c.quadraticCurveTo(-w * .38, -h * .84, -w * .30, -h * 1.06);
        c.stroke();

        /* la tete */
        c.fillStyle = "#37a55f";
        c.beginPath();
        c.ellipse(w * .42, -h * 1.04, r * .15, r * .12, 0, 0, Math.PI * 2);
        c.fill();

        /* il dort : l'oeil est ferme */
        c.strokeStyle = "#12351f";
        c.lineWidth   = Math.max(1, r * .028);
        c.beginPath();
        c.arc(w * .45, -h * 1.06, r * .05, .2, Math.PI - .2);
        c.stroke();

        c.fillStyle = "#f2e6c8";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(w * .40 + sgn * r * .05, -h * 1.14);
            c.lineTo(w * .40 + sgn * r * .10, -h * 1.30);
            c.lineTo(w * .40 + sgn * r * .12, -h * 1.12);
            c.closePath();
            c.fill();
        });

        /* il dort : des Z montent */
        for(let i = 0; i < 2; i++){

            const k = (t * .5 + i * .5) % 1;

            c.globalAlpha = (1 - k) * .8;
            c.fillStyle   = "#ffffff";
            c.font        = (r * (.14 + k * .08)).toFixed(1) + "px sans-serif";
            c.textAlign   = "center";

            c.fillText("z", w * .62, -h * 1.25 - k * r * .5);

        }

        c.globalAlpha = 1;

    }

    /* PHENIX : aigrette de flammes (sans ailes) */
    if(skin.effect === "phenix"){

        c.fillStyle   = "#ffd35c";
        c.shadowBlur  = r * .35;
        c.shadowColor = "#ff9a30";

        for(let i = 0; i < 5; i++){

            const bx = (i - 2) * w * .21;
            const ht = 1.14 + Math.abs(2 - i) * -.08;

            c.beginPath();
            c.moveTo(bx - r * .07, -h * .88);
            c.quadraticCurveTo(
                bx + Math.sin(t * 3 + i) * r * .12,
                -h * (ht + .18),
                bx + r * .07, -h * .88
            );
            c.closePath();
            c.fill();

        }

        c.shadowBlur = 0;

        /* braises qui montent */
        for(let i = 0; i < 5; i++){

            const k = (t * .7 + i * .2) % 1;

            c.globalAlpha = (1 - k) * .85;
            c.fillStyle   = k < .5 ? "#fff0b0" : "#ff7a2f";

            c.beginPath();
            c.arc(
                Math.sin(i * 2.4 + t * 1.2) * w * .7,
                -h * .9 - k * r * 1.4,
                r * (.06 - k * .03), 0, Math.PI * 2
            );
            c.fill();

        }

        c.globalAlpha = 1;

    }

    /* PELUCHE : oreilles cousues */
    if(skin.effect === "peluche"){

        c.fillStyle = "#c9a377";

        [-1, 1].forEach(sgn => {

            c.beginPath();
            c.arc(sgn * w * .55, -h * .78, r * .26, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#e8c9a8";
            c.beginPath();
            c.arc(sgn * w * .55, -h * .78, r * .14, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#c9a377";

        });

    }

    /* DONUT : un morceau croque */
    if(skin.effect === "donut"){

        c.globalAlpha = .9;
        c.strokeStyle = "#ffe0ee";
        c.lineWidth   = Math.max(1, r * .04);

        c.beginPath();
        c.arc(0, h * .05, r * .95, -.5, .6);
        c.stroke();

        c.globalAlpha = 1;

    }


    /* ---------- accessoires de la troisieme fournee ---------- */

    /* CACTUS : fleur sur la tete */
    if(skin.effect === "cactus"){

        const fx = w * .3;
        const fy = -h * .98;

        c.fillStyle = "#ff5f9e";

        for(let i = 0; i < 6; i++){
            const a = i * (Math.PI / 3) + t * .25;
            c.beginPath();
            c.ellipse(fx + Math.cos(a) * r * .11, fy + Math.sin(a) * r * .11, r * .08, r * .05, a, 0, Math.PI * 2);
            c.fill();
        }

        c.fillStyle = "#ffd84d";
        c.beginPath();
        c.arc(fx, fy, r * .06, 0, Math.PI * 2);
        c.fill();

    }

    /* SUSHI : la tranche de saumon sur le dessus */
    if(skin.effect === "sushi"){

        c.save();
        c.translate(0, -h * .86);
        c.rotate(-.06);

        c.fillStyle = "#ff7a5a";

        c.beginPath();
        c.ellipse(0, 0, w * .82, h * .26, 0, 0, Math.PI * 2);
        c.fill();

        /* les veines blanches */
        c.strokeStyle = "#ffd8c8";
        c.lineWidth   = Math.max(1, r * .04);

        for(let i = -2; i <= 2; i++){
            c.beginPath();
            c.moveTo(-w * .7, i * h * .09);
            c.quadraticCurveTo(0, i * h * .09 - h * .05, w * .7, i * h * .09);
            c.stroke();
        }

        c.restore();

    }

    /* PANDA : oreilles rondes */
    if(skin.effect === "panda"){

        c.fillStyle = "#161616";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.arc(sgn * w * .58, -h * .78, r * .22, 0, Math.PI * 2);
            c.fill();
        });

    }

    /* CITROUILLE : la tige */
    if(skin.effect === "citrouille"){

        c.strokeStyle = "#4a7a2a";
        c.lineWidth   = r * .10;
        c.lineCap     = "round";

        c.beginPath();
        c.moveTo(0, -h * .88);
        c.quadraticCurveTo(r * .10, -h * 1.14, r * .22, -h * 1.02);
        c.stroke();

        c.fillStyle = "#6bbf5a";
        c.save();
        c.translate(-r * .2, -h * 1.0);
        c.rotate(-.5);
        c.beginPath();
        c.ellipse(0, 0, r * .18, r * .07, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();

    }

    /* MOMIE : une bandelette qui pend */
    if(skin.effect === "momie"){

        c.fillStyle = "#f2ead2";

        c.save();
        c.translate(w * .62, h * .35);
        c.rotate(.35 + Math.sin(t * 1.6) * .12);
        c.fillRect(0, 0, r * .16, r * .55);
        c.restore();

    }

    /* REQUIN : aileron et queue */
    if(skin.effect === "requin"){

        c.fillStyle = "#5d7governance";
        c.fillStyle = "#5d7690";

        /* l'aileron */
        c.beginPath();
        c.moveTo(-w * .12, -h * .85);
        c.lineTo(w * .16, -h * 1.42);
        c.lineTo(w * .34, -h * .78);
        c.closePath();
        c.fill();

        /* la queue */
        c.beginPath();
        c.moveTo(-w * .82, h * .05);
        c.lineTo(-w * 1.32, -h * .38);
        c.lineTo(-w * 1.18, h * .12);
        c.lineTo(-w * 1.34, h * .52);
        c.closePath();
        c.fill();

    }

    /* BULLE : petites bulles filles */
    if(skin.effect === "bulle"){

        for(let i = 0; i < 4; i++){

            const k  = (t * .4 + i * .25) % 1;
            const px = Math.sin(i * 2.3 + t) * w * .8;
            const py = h * .5 - k * r * 2.2;

            c.globalAlpha = (1 - k) * .6;
            c.strokeStyle = "#ffffff";
            c.lineWidth   = Math.max(1, r * .025);

            c.beginPath();
            c.arc(px, py, r * (.10 - k * .05), 0, Math.PI * 2);
            c.stroke();

        }

        c.globalAlpha = 1;

    }

    /* LAVA LAMP : le capuchon et le socle */
    if(skin.effect === "lampe"){

        c.fillStyle = "#c9a24a";

        c.beginPath();
        c.ellipse(0, -h * .94, w * .42, h * .16, 0, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.ellipse(0, h * .94, w * .5, h * .18, 0, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = .5 + Math.sin(t * 2.4) * .3;
        c.fillStyle   = "#ffd0f5";
        c.beginPath();
        c.ellipse(0, h * .94, w * .3, h * .09, 0, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;

    }

    /* ORIGAMI : les pointes de papier */
    if(skin.effect === "origami"){

        c.fillStyle = "#e05a45";

        [-1, 1].forEach(sgn => {
            c.beginPath();
            c.moveTo(sgn * w * .55, -h * .70);
            c.lineTo(sgn * w * 1.05, -h * 1.30);
            c.lineTo(sgn * w * .90, -h * .55);
            c.closePath();
            c.fill();
        });

    }

    /* TOKYO : la pluie sur la ville */
    if(skin.effect === "tokyo"){

        c.globalAlpha = .35;
        c.strokeStyle = "#8fd8ff";
        c.lineWidth   = Math.max(1, r * .02);

        for(let i = 0; i < 8; i++){

            const k  = (t * 1.8 + i * .125) % 1;
            const px = -w * 1.1 + i * w * .3;
            const py = -h * 1.3 + k * h * 2.8;

            c.beginPath();
            c.moveTo(px, py);
            c.lineTo(px - r * .04, py + r * .18);
            c.stroke();

        }

        c.globalAlpha = 1;

    }

    /* HOLO : le socle de projection */
    if(skin.effect === "holo"){

        c.globalAlpha = .5;

        const g = c.createLinearGradient(0, h * .8, 0, h * 1.5);

        g.addColorStop(0, "rgba(95,232,255,.6)");
        g.addColorStop(1, "rgba(95,232,255,0)");

        c.fillStyle = g;

        c.beginPath();
        c.moveTo(-w * .55, h * .85);
        c.lineTo(w * .55, h * .85);
        c.lineTo(w * .95, h * 1.45);
        c.lineTo(-w * .95, h * 1.45);
        c.closePath();
        c.fill();

        c.globalAlpha = 1;

    }

    /* PLASMA : l'arc qui saute vers l'exterieur */
    if(skin.effect === "plasma"){

        const a = t * 2.1;

        c.globalAlpha = .6 + .4 * Math.sin(t * 9);
        c.strokeStyle = "#e0a0ff";
        c.lineWidth   = r * .04;
        c.shadowBlur  = r * .4;
        c.shadowColor = "#c86aff";

        c.beginPath();
        c.moveTo(Math.cos(a) * r * .95, Math.sin(a) * r * .95);

        for(let k = 1; k <= 4; k++){
            const kk = 1 + k * .12;
            const aa = a + Math.sin(t * 6 + k) * .3;
            c.lineTo(Math.cos(aa) * r * kk, Math.sin(aa) * r * kk);
        }

        c.stroke();

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

    }


    /* MIMIC : les eclats de glitch qui le cernent */
    if(skin.effect === "mimic"){

        c.save();

        for(let i = 0; i < 5; i++){

            const k = (t * .5 + i / 5) % 1;

            c.globalAlpha = (1 - k) * .5;
            c.fillStyle   = i % 2 ? "#ff3af0" : "#c86aff";

            const yy = (-.5 + ((i * .37 + t * .3) % 1)) * r * 2.4;

            c.fillRect(-r * (1.1 + k * .8), yy, r * (2.2 + k * 1.6), r * .05);

        }

        c.globalAlpha = 1;
        c.restore();

    }

    /* ECLIPSE : la couronne qui rayonne au-dela du corps */
    if(skin.effect === "eclipse"){

        c.save();

        /* le halo large */
        const halo = c.createRadialGradient(0, 0, r * .95, 0, 0, r * 2.6);
        halo.addColorStop(0,   "rgba(255,180,90,0)");
        halo.addColorStop(.06, "rgba(255,180,90,.26)");
        halo.addColorStop(.45, "rgba(255,110,40,.10)");
        halo.addColorStop(1,   "rgba(255,90,20,0)");

        c.fillStyle = halo;
        c.beginPath();
        c.arc(0, 0, r * 2.6, 0, Math.PI * 2);
        c.fill();

        /* les filaments de la couronne */
        c.strokeStyle = "#ffcf8a";
        c.lineCap     = "round";
        c.shadowColor = "#ff9a3d";
        c.shadowBlur  = 14;

        for(let i = 0; i < 40; i++){

            const a  = (i / 40) * Math.PI * 2 + t * .12;
            const ln = r * (.10 + Math.abs(Math.sin(i * 2.7 + t * .9)) * .42);

            c.globalAlpha = .10 + .22 * Math.abs(Math.sin(i * 1.3 + t));
            c.lineWidth   = r * .014;

            c.beginPath();
            c.moveTo(Math.cos(a) * r * 1.02, Math.sin(a) * r * 1.02);
            c.lineTo(Math.cos(a) * (r * 1.02 + ln), Math.sin(a) * (r * 1.02 + ln));
            c.stroke();

        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        c.restore();

    }

    /* SABLIER : les grains qui s'echappent du verre */
    if(skin.effect === "sablier"){

        for(let i = 0; i < 10; i++){

            const kk = ((t * .5 + i / 10) % 1);
            const a  = i * .628 + t * .2;

            c.globalAlpha = (1 - kk) * .7;
            c.fillStyle   = "#ffd76a";

            c.beginPath();
            c.arc(
                Math.cos(a) * r * (1.05 + kk * .8),
                Math.sin(a) * r * (1.05 + kk * .8) - kk * r * .4,
                r * .03, 0, Math.PI * 2
            );
            c.fill();

        }

        c.globalAlpha = 1;

    }

    /* KINTSUGI : la poussiere d'or qui flotte autour */
    if(skin.effect === "kintsugi"){

        c.save();
        c.shadowColor = "#ffd76a";
        c.shadowBlur  = 8;

        for(let i = 0; i < 12; i++){

            const a  = i * .524 - t * .35;
            const rr = r * (1.15 + Math.sin(t * 1.1 + i) * .18);

            c.globalAlpha = .3 + .45 * Math.sin(t * 2 + i * .7);
            c.fillStyle   = i % 3 ? "#ffe9a8" : "#e8b53d";

            c.beginPath();
            c.arc(Math.cos(a) * rr, Math.sin(a) * rr * .92, r * .022, 0, Math.PI * 2);
            c.fill();

        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        c.restore();

    }

    /* NÉANT : les anneaux de runes qui gravitent autour */
    if(skin.effect === "neant"){

        for(let i = 0; i < 3; i++){

            const rr   = r * (1.28 + i * .26);
            const spin = t * (.5 + i * .3) * (i % 2 ? -1 : 1);

            c.save();
            c.rotate(spin);
            c.scale(1, .30 + Math.abs(Math.sin(t * .35 + i)) * .6);

            c.globalAlpha = .55;
            c.strokeStyle = i === 1 ? "#ffc65a" : "#c86aff";
            c.lineWidth   = r * .045;
            c.shadowColor = i === 1 ? "#ffb347" : "#c86aff";
            c.shadowBlur  = 12;

            c.beginPath();
            c.arc(0, 0, rr, 0, Math.PI * 2);
            c.stroke();

            c.lineWidth = r * .085;

            for(let k = 0; k < 12; k++){
                const a = (k / 12) * Math.PI * 2;
                c.beginPath();
                c.arc(0, 0, rr, a, a + .1);
                c.stroke();
            }

            c.shadowBlur  = 0;
            c.globalAlpha = 1;

            c.restore();

        }

    }

    /* NUIT ETOILEE : le cypres et les etoiles autour */
    if(skin.effect === "vangogh"){

        for(let i = 0; i < 4; i++){

            const a = t * .3 + i * 1.57;

            c.globalAlpha = .5 + .5 * Math.sin(t * 2 + i);
            c.fillStyle   = "#fff3b0";

            const px = Math.cos(a) * r * 1.3;
            const py = Math.sin(a) * r * 1.3;

            c.beginPath();

            for(let k = 0; k < 8; k++){
                const b  = k * Math.PI / 4;
                const rr = k % 2 ? r * .04 : r * .11;
                c.lineTo(px + Math.cos(b) * rr, py + Math.sin(b) * rr);
            }

            c.closePath();
            c.fill();

        }

        c.globalAlpha = 1;

    }

    /* PASTEQUE : une graine qui s'echappe */
    if(skin.effect === "pasteque"){

        for(let i = 0; i < 2; i++){

            const k = (t * .8 + i * .5) % 1;

            c.globalAlpha = (1 - k) * .8;
            c.fillStyle   = "#2a1208";

            c.save();
            c.translate(Math.sin(i * 3 + t) * w * .7, h * .3 - k * r * 1.6);
            c.rotate(t * 4 + i);
            c.beginPath();
            c.ellipse(0, 0, r * .045, r * .075, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

        }

        c.globalAlpha = 1;

    }

    /* NUAGE : un eclair de temps en temps */
    if(skin.effect === "nuage"){

        const flash = Math.pow(Math.max(0, Math.sin(t * 1.7)), 12);

        if(flash > .02){

            c.globalAlpha = flash;
            c.fillStyle   = "#ffe98a";
            c.shadowBlur  = r * .5;
            c.shadowColor = "#ffe98a";

            c.beginPath();
            c.moveTo(-r * .06, h * .55);
            c.lineTo(r * .10, h * .55);
            c.lineTo(0, h * .85);
            c.lineTo(r * .14, h * .85);
            c.lineTo(-r * .08, h * 1.25);
            c.lineTo(r * .02, h * .9);
            c.lineTo(-r * .12, h * .9);
            c.closePath();
            c.fill();

            c.shadowBlur  = 0;
            c.globalAlpha = 1;

        }

    }

    /* MIEL : une abeille en orbite */
    if(skin.effect === "miel"){

        const a  = t * 1.9;
        const px = Math.cos(a) * r * 1.35;
        const py = Math.sin(a * 1.3) * r * .6 - h * .4;

        c.save();
        c.translate(px, py);

        c.fillStyle = "#ffd23a";
        c.beginPath();
        c.ellipse(0, 0, r * .09, r * .06, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#241208";
        c.fillRect(-r * .03, -r * .06, r * .022, r * .12);
        c.fillRect(r * .02, -r * .055, r * .022, r * .11);

        c.globalAlpha = .55;
        c.fillStyle   = "#ffffff";
        c.beginPath();
        c.ellipse(0, -r * .07, r * .07, r * .03, Math.sin(t * 30) * .5, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;

        c.restore();

    }

    if(skin.effect === "ghost"){

        c.globalAlpha = .5;
        c.fillStyle   = "#ffffff";

        for(let i = 0; i < 3; i++){
            const k = (t * .4 + i * .33) % 1;
            c.globalAlpha = (1 - k) * .45;
            c.beginPath();
            c.arc(Math.sin(i * 2 + t) * r * .6, h * .4 - k * r * 1.6, r * .1, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;

    }

    c.restore();

}


/* =========================================================
   MOTIFS INTERNES DES SKINS

   Appele pendant que le corps sert de masque : tout ce
   qu'on dessine ici reste dans la silhouette du slime.
========================================================= */

function paintSkinInner(c, skin, w, h, r, t, f){

    /*
    Le bloc des taches internes laisse l'opacite a 18 % :
    sans cette remise a zero, tous les motifs peints ici
    sortaient delaves.
    */
    c.globalAlpha = 1;

    const e = skin.effect;

    /* ---------- MAGMA : croute fissuree ---------- */
    if(e === "magma"){

        /* plaques de roche refroidie */
        c.globalAlpha = .32;
        c.fillStyle   = "#1c0803";

        for(let i = 0; i < 5; i++){

            const a = i * 1.25 + Math.sin(t * .3 + i) * .12;

            c.beginPath();
            c.ellipse(
                Math.cos(a) * w * .55,
                Math.sin(a) * h * .40 - h * .10,
                w * .22, h * .15, a, 0, Math.PI * 2
            );
            c.fill();

        }

        /* fissures qui palpitent */
        const puls = .55 + Math.sin(t * 2.4) * .3;

        c.globalAlpha = puls;
        c.strokeStyle = "#ffe89a";
        c.lineWidth   = r * .035;
        c.lineCap     = "round";

        c.shadowBlur  = r * .45;
        c.shadowColor = "#ff8a2a";

        for(let i = 0; i < 3; i++){

            const y0 = -h * .62 + i * h * .62;

            c.beginPath();
            c.moveTo(-w, y0);

            for(let k = 1; k <= 5; k++){
                c.lineTo(
                    -w + k * w * .4,
                    y0 + Math.sin(k * 1.9 + i * 2.2) * h * .13
                );
            }

            c.stroke();

        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- GIVRE : facettes de glace ---------- */
    if(e === "givre"){

        c.globalAlpha = .30;
        c.fillStyle   = "#ffffff";

        for(let i = 0; i < 7; i++){

            const a = i * .92;
            const d = .30 + (i % 3) * .22;

            c.beginPath();
            c.moveTo(Math.cos(a) * w * d, Math.sin(a) * h * d);
            c.lineTo(Math.cos(a + .8) * w * (d + .34), Math.sin(a + .8) * h * (d + .34));
            c.lineTo(Math.cos(a - .5) * w * (d + .30), Math.sin(a - .5) * h * (d + .30));
            c.closePath();
            c.fill();

        }

        /* petites etoiles de gel */
        c.globalAlpha = .8;
        c.strokeStyle = "#ffffff";
        c.lineWidth   = Math.max(1, r * .035);

        for(let i = 0; i < 3; i++){

            const px = Math.sin(i * 2.4 + t * .5) * w * .5;
            const py = Math.cos(i * 1.7 + t * .4) * h * .4;
            const sz = r * .13;

            for(let k = 0; k < 3; k++){
                const a = k * Math.PI / 3;
                c.beginPath();
                c.moveTo(px - Math.cos(a) * sz, py - Math.sin(a) * sz);
                c.lineTo(px + Math.cos(a) * sz, py + Math.sin(a) * sz);
                c.stroke();
            }

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- OCEAN : bulles qui montent ---------- */
    if(e === "ocean"){

        /* ligne de flottaison */
        c.globalAlpha = .35;
        c.fillStyle   = "#bffbff";

        c.beginPath();
        c.moveTo(-w, h * .05 + Math.sin(t * 1.6) * h * .05);

        for(let k = 0; k <= 8; k++){
            c.lineTo(
                -w + k * w / 4,
                h * .05 + Math.sin(t * 1.6 + k * .8) * h * .06
            );
        }

        c.lineTo(w, h * 1.3);
        c.lineTo(-w, h * 1.3);
        c.closePath();
        c.fill();

        /* bulles */
        for(let i = 0; i < 7; i++){

            const k  = (t * .35 + i * .143) % 1;
            const px = Math.sin(i * 2.6) * w * .62;
            const py = h * .95 - k * h * 2.1;
            const rr = r * (.05 + (i % 3) * .028);

            c.globalAlpha = (1 - k) * .75;
            c.strokeStyle = "#ffffff";
            c.lineWidth   = Math.max(1, r * .025);

            c.beginPath();
            c.arc(px, py, rr, 0, Math.PI * 2);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- BONBON : spirale sucree ---------- */
    if(e === "bonbon"){

        c.globalAlpha = .55;
        c.strokeStyle = "#fff4fa";
        c.lineWidth   = r * .20;
        c.lineCap     = "butt";

        for(let i = -4; i <= 4; i++){

            const off = i * r * .46 + ((t * 14) % (r * .46));

            c.beginPath();
            c.moveTo(off - h * 1.4, -h * 1.4);
            c.lineTo(off + h * 1.4, h * 1.4);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- ZOMBIE : chairs et coutures ---------- */
    if(e === "zombie"){

        c.globalAlpha = .45;
        c.fillStyle   = "#54711f";

        for(let i = 0; i < 4; i++){

            const a = i * 1.6 + .4;

            c.beginPath();
            c.ellipse(
                Math.cos(a) * w * .45,
                Math.sin(a) * h * .38,
                w * .22, h * .16, a, 0, Math.PI * 2
            );
            c.fill();

        }

        /* la couture */
        c.globalAlpha = .85;
        c.strokeStyle = "#2c3d10";
        c.lineWidth   = Math.max(1, r * .05);

        c.beginPath();
        c.moveTo(-w * .8, -h * .05);
        c.lineTo(w * .8, h * .12);
        c.stroke();

        for(let i = 0; i < 7; i++){

            const px = -w * .75 + i * w * .25;
            const py = -h * .05 + i * h * .028;

            c.beginPath();
            c.moveTo(px, py - h * .10);
            c.lineTo(px, py + h * .10);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- MECA : plaques et rivets ---------- */
    if(e === "meca"){

        c.globalAlpha = .35;
        c.fillStyle   = "#7d8ba5";

        for(let i = 0; i < 3; i++){
            c.fillRect(-w, -h * .7 + i * h * .62, w * 2, h * .30);
        }

        c.globalAlpha = .5;
        c.strokeStyle = "#3d485e";
        c.lineWidth   = Math.max(1, r * .04);

        for(let i = 0; i < 4; i++){
            const y = -h * .8 + i * h * .55;
            c.beginPath();
            c.moveTo(-w, y);
            c.lineTo(w, y);
            c.stroke();
        }

        /* rivets */
        c.globalAlpha = .7;
        c.fillStyle   = "#dfe8f5";

        for(let i = 0; i < 8; i++){
            const px = -w * .8 + (i % 4) * w * .53;
            const py = i < 4 ? -h * .52 : h * .58;
            c.beginPath();
            c.arc(px, py, r * .045, 0, Math.PI * 2);
            c.fill();
        }

        /* voyant qui pulse */
        c.globalAlpha = .5 + Math.sin(t * 4) * .4;
        c.fillStyle   = "#54ffd0";
        c.beginPath();
        c.arc(w * .45, h * .30, r * .09, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- ORAGE : eclairs internes ---------- */
    if(e === "orage"){

        /* nuages sombres */
        c.globalAlpha = .4;
        c.fillStyle   = "#141a38";

        for(let i = 0; i < 4; i++){
            const a = i * 1.7 + t * .12;
            c.beginPath();
            c.ellipse(
                Math.cos(a) * w * .42,
                Math.sin(a) * h * .32,
                w * .34, h * .22, 0, 0, Math.PI * 2
            );
            c.fill();
        }

        /* la foudre claque par a-coups */
        const flash = Math.pow(Math.max(0, Math.sin(t * 3.1)), 8);

        if(flash > .02){

            /* toute la masse s'illumine d'un coup */
            const g = c.createRadialGradient(0, -h * .1, r * .05, 0, 0, r * 1.2);

            g.addColorStop(0,  "rgba(200,225,255,.85)");
            g.addColorStop(.5, "rgba(140,180,255,.35)");
            g.addColorStop(1,  "rgba(140,180,255,0)");

            c.globalAlpha = flash;
            c.fillStyle   = g;
            c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

            /* une petite decharge nerveuse */
            c.strokeStyle = "#f2f8ff";
            c.lineWidth   = r * .028;
            c.lineJoin    = "round";
            c.lineCap     = "round";

            c.beginPath();
            c.moveTo(-w * .55, -h * .55);

            for(let k = 1; k <= 6; k++){
                c.lineTo(
                    -w * .55 + k * w * .19,
                    -h * .55 + Math.sin(k * 2.7) * h * .30 + k * h * .12
                );
            }

            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- DRAGON : ecailles ---------- */
    if(e === "dragon"){

        c.globalAlpha = .40;
        c.strokeStyle = "#0a3d22";
        c.lineWidth   = Math.max(1, r * .045);

        for(let row = 0; row < 5; row++){

            const y  = -h * .85 + row * h * .42;
            const dx = row % 2 ? r * .21 : 0;

            for(let col = -3; col <= 3; col++){

                c.beginPath();
                c.arc(col * r * .42 + dx, y, r * .21, Math.PI * .12, Math.PI * .88);
                c.stroke();

            }

        }

        /* ventre plus clair */
        c.globalAlpha = .3;
        c.fillStyle   = "#c8f5a8";
        c.beginPath();
        c.ellipse(0, h * .55, w * .55, h * .38, 0, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- NINJA : bandeau ---------- */
    if(e === "ninja"){

        c.globalAlpha = .9;
        c.fillStyle   = "#101623";

        c.fillRect(-w * 1.2, -h * .40, w * 2.4, h * .40);

        /* liseré rouge */
        c.fillStyle = "#e03050";
        c.fillRect(-w * 1.2, -h * .06, w * 2.4, h * .05);

        c.globalAlpha = 1;

        return;

    }


    /* ---------- DONUT : glacage et vermicelles ---------- */
    if(e === "donut"){

        c.globalAlpha = .9;
        c.fillStyle   = "#ffd0e4";

        c.beginPath();
        c.moveTo(-w * 1.2, -h * .10);

        for(let k = 0; k <= 8; k++){
            c.lineTo(-w * 1.2 + k * w * .3, -h * .10 + Math.sin(k * 1.4) * h * .13);
        }

        c.lineTo(w * 1.2, -h * 1.4);
        c.lineTo(-w * 1.2, -h * 1.4);
        c.closePath();
        c.fill();

        /* vermicelles */
        const cols = ["#ff5f8a","#ffd84d","#5fd0ff","#8dff7a","#c78cff"];

        for(let i = 0; i < 14; i++){

            const a = i * 1.7;

            c.save();
            c.translate(Math.cos(a) * w * .68, -h * .45 + Math.sin(a * 1.3) * h * .35);
            c.rotate(a);

            c.fillStyle = cols[i % 5];
            c.fillRect(-r * .09, -r * .028, r * .18, r * .056);

            c.restore();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CHOCOLAT : coulure blanche ---------- */
    if(e === "chocolat"){

        c.globalAlpha = .85;
        c.strokeStyle = "#f6e3c8";
        c.lineWidth   = r * .075;
        c.lineCap     = "round";

        for(let i = 0; i < 3; i++){

            c.beginPath();
            c.moveTo(-w * .95, -h * .55 + i * h * .46);

            for(let k = 1; k <= 7; k++){
                c.lineTo(
                    -w * .95 + k * w * .28,
                    -h * .55 + i * h * .46 + Math.sin(k * 1.5 + i) * h * .11
                );
            }

            c.stroke();

        }

        /* eclats de noisette */
        c.globalAlpha = .6;
        c.fillStyle   = "#5c3418";

        for(let i = 0; i < 6; i++){
            const a = i * 1.9;
            c.beginPath();
            c.arc(Math.cos(a) * w * .55, Math.sin(a) * h * .45, r * .05, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- PELUCHE : tissu et rapiecage ---------- */
    if(e === "peluche"){

        /* grain du tissu */
        c.globalAlpha = .12;
        c.strokeStyle = "#5a3f22";
        c.lineWidth   = Math.max(1, r * .02);

        for(let i = -6; i <= 6; i++){
            c.beginPath();
            c.moveTo(i * r * .18, -h * 1.2);
            c.lineTo(i * r * .18, h * 1.2);
            c.stroke();
        }

        /* couture centrale */
        c.globalAlpha = .5;
        c.strokeStyle = "#7a5734";
        c.lineWidth   = Math.max(1, r * .04);
        c.setLineDash([r * .10, r * .08]);

        c.beginPath();
        c.moveTo(0, -h * 1.1);
        c.lineTo(0, h * 1.1);
        c.stroke();

        c.setLineDash([]);

        /* piece rapiecee */
        c.globalAlpha = .8;
        c.fillStyle   = "#b98f63";

        c.save();
        c.translate(w * .5, h * .35);
        c.rotate(.3);
        c.fillRect(-r * .22, -r * .18, r * .44, r * .36);

        c.strokeStyle = "#5a3f22";
        c.lineWidth   = Math.max(1, r * .03);
        c.setLineDash([r * .07, r * .05]);
        c.strokeRect(-r * .22, -r * .18, r * .44, r * .36);
        c.setLineDash([]);
        c.restore();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- MOUSSE : touffes et champignons ---------- */
    if(e === "mousse"){

        c.globalAlpha = .55;
        c.fillStyle   = "#2f5c25";

        for(let i = 0; i < 7; i++){

            const a = i * .9;

            c.beginPath();
            c.ellipse(
                Math.cos(a) * w * .5,
                Math.sin(a) * h * .42,
                w * .24, h * .16, a * .5, 0, Math.PI * 2
            );
            c.fill();

        }

        /* brins d'herbe */
        c.globalAlpha = .7;
        c.strokeStyle = "#8fd45c";
        c.lineWidth   = Math.max(1, r * .035);
        c.lineCap     = "round";

        for(let i = 0; i < 8; i++){

            const px = -w * .8 + i * w * .23;
            const sw = Math.sin(t * 1.4 + i) * r * .06;

            c.beginPath();
            c.moveTo(px, h * .5);
            c.quadraticCurveTo(px + sw, h * .18, px + sw * 2, h * .02);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- DESERT : dunes qui defilent ---------- */
    if(e === "desert"){

        c.globalAlpha = .85;

        for(let i = 0; i < 4; i++){

            c.fillStyle = i % 2 ? "#a87b3e" : "#f7e6bd";

            c.beginPath();
            c.moveTo(-w * 1.3, -h * .7 + i * h * .5);

            for(let k = 0; k <= 8; k++){
                c.lineTo(
                    -w * 1.3 + k * w * .33,
                    -h * .7 + i * h * .5 + Math.sin(k * .9 + t * .8 + i) * h * .10
                );
            }

            c.lineTo(w * 1.3, h * 1.4);
            c.lineTo(-w * 1.3, h * 1.4);
            c.closePath();
            c.fill();

        }

        /* grains emportes par le vent */
        c.globalAlpha = .6;
        c.fillStyle   = "#fff3d6";

        for(let i = 0; i < 9; i++){
            const k = (t * 1.2 + i * .11) % 1;
            c.fillRect(-w + k * w * 2, -h * .6 + Math.sin(i * 2.2) * h * .8, r * .06, r * .02);
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- FLUO : coeur radioactif ---------- */
    if(e === "fluo"){

        const puls = .5 + Math.sin(t * 2.6) * .35;

        const g = c.createRadialGradient(0, h * .1, r * .04, 0, h * .1, r * 1.1);

        g.addColorStop(0,  "rgba(230,255,190," + puls + ")");
        g.addColorStop(.4, "rgba(141,255,46,.5)");
        g.addColorStop(1,  "rgba(141,255,46,0)");

        c.fillStyle = g;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* symbole radioactif tres discret */
        c.globalAlpha = .22;
        c.fillStyle   = "#0d3a00";

        for(let i = 0; i < 3; i++){
            c.beginPath();
            c.moveTo(0, h * .1);
            c.arc(0, h * .1, r * .55, i * 2.09 - .35, i * 2.09 + .35);
            c.closePath();
            c.fill();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CORAIL : fond marin ---------- */
    if(e === "corail"){

        /* coraux au fond */
        c.globalAlpha = .6;

        ["#ff7ba8","#ffb15c","#a97bff"].forEach((col, i) => {

            c.strokeStyle = col;
            c.lineWidth   = r * .08;
            c.lineCap     = "round";

            const bx = (i - 1) * w * .5;

            c.beginPath();
            c.moveTo(bx, h * .95);
            c.lineTo(bx, h * .45);
            c.moveTo(bx, h * .62);
            c.lineTo(bx - r * .16, h * .40);
            c.moveTo(bx, h * .58);
            c.lineTo(bx + r * .16, h * .34);
            c.stroke();

        });

        /* un poisson qui traverse */
        const fx = ((t * .35) % 1) * w * 2.4 - w * 1.2;

        c.globalAlpha = .9;
        c.fillStyle   = "#ffd15c";

        c.beginPath();
        c.ellipse(fx, -h * .35, r * .13, r * .08, 0, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.moveTo(fx - r * .12, -h * .35);
        c.lineTo(fx - r * .24, -h * .43);
        c.lineTo(fx - r * .24, -h * .27);
        c.closePath();
        c.fill();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- GUMBALL : boules dans le bocal ---------- */
    if(e === "gumball"){

        const cols = ["#ff4f6e","#ffd24d","#4fd0ff","#8dff6a","#c78cff","#ff8f4d"];

        for(let i = 0; i < 11; i++){

            const a  = i * 2.4 + Math.sin(t * .5 + i) * .06;
            const d  = .28 + (i % 4) * .19;
            const px = Math.cos(a) * w * d;
            const py = Math.sin(a) * h * d + h * .18;

            c.fillStyle = cols[i % 6];

            c.beginPath();
            c.arc(px, py, r * .16, 0, Math.PI * 2);
            c.fill();

            c.globalAlpha = .55;
            c.fillStyle   = "#ffffff";
            c.beginPath();
            c.arc(px - r * .05, py - r * .05, r * .05, 0, Math.PI * 2);
            c.fill();
            c.globalAlpha = 1;

        }

        return;

    }

    /* ---------- LIANES : tresses vegetales ---------- */
    if(e === "lianes"){

        c.globalAlpha = .8;
        c.strokeStyle = "#4a3a1e";
        c.lineWidth   = r * .07;
        c.lineCap     = "round";

        for(let i = 0; i < 4; i++){

            c.beginPath();
            c.moveTo(-w * 1.2, -h * .8 + i * h * .55);

            for(let k = 1; k <= 8; k++){
                c.lineTo(
                    -w * 1.2 + k * w * .3,
                    -h * .8 + i * h * .55 + Math.sin(k * 1.2 + i * 1.5 + t * .4) * h * .17
                );
            }

            c.stroke();

        }

        /* feuilles */
        c.fillStyle = "#8fd45c";

        for(let i = 0; i < 6; i++){

            const a = i * 1.6 + t * .2;

            c.save();
            c.translate(Math.cos(a) * w * .6, Math.sin(a) * h * .55);
            c.rotate(a);
            c.beginPath();
            c.ellipse(0, 0, r * .14, r * .07, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- ARTISAN : taches de peinture ---------- */
    if(e === "artisan"){

        const cols = ["#e0453a","#3f8dff","#ffd24d","#4ce04c","#b06cff"];

        cols.forEach((col, i) => {

            const a = i * 1.28 + .3;

            c.globalAlpha = .85;
            c.fillStyle   = col;

            c.beginPath();
            c.arc(
                Math.cos(a) * w * .55,
                Math.sin(a) * h * .45 - h * .05,
                r * .17, 0, Math.PI * 2
            );
            c.fill();

        });

        /* trainee de pinceau */
        c.globalAlpha = .5;
        c.strokeStyle = "#c9452f";
        c.lineWidth   = r * .10;
        c.lineCap     = "round";

        c.beginPath();
        c.moveTo(-w * .7, h * .55);
        c.quadraticCurveTo(0, h * .25, w * .7, h * .6);
        c.stroke();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- BINAIRE : pluie de chiffres ---------- */
    if(e === "binaire"){

        c.font         = (r * .22).toFixed(1) + "px monospace";
        c.textAlign    = "center";
        c.textBaseline = "middle";

        for(let col = 0; col < 6; col++){

            const px = -w * .85 + col * w * .34;

            for(let row = 0; row < 6; row++){

                const k = ((t * .5 + col * .17 + row * .17) % 1);

                c.globalAlpha = .25 + (1 - k) * .6;
                c.fillStyle   = k < .18 ? "#d8fff4" : "#4dffd0";

                c.fillText(
                    ((col * 7 + row * 3 + Math.floor(t * 2 + col)) % 2) ? "1" : "0",
                    px,
                    -h * .9 + ((row / 6 + k) % 1) * h * 1.9
                );

            }

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- GEODE : cavite cristalline ---------- */
    if(e === "geode"){

        /* la roche */
        c.globalAlpha = .4;
        c.fillStyle   = "#4a3a66";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* la cavite */
        c.globalAlpha = 1;

        const g = c.createRadialGradient(0, -h * .1, r * .05, 0, -h * .1, r * .85);

        g.addColorStop(0,  "#f0e4ff");
        g.addColorStop(.5, "#b98cff");
        g.addColorStop(1,  "#5a3f9c");

        c.fillStyle = g;
        c.beginPath();
        c.ellipse(0, -h * .1, w * .68, h * .72, 0, 0, Math.PI * 2);
        c.fill();

        /* les aiguilles de cristal */
        c.globalAlpha = .75;

        for(let i = 0; i < 12; i++){

            const a = i * (Math.PI * 2 / 12) + .2;

            c.fillStyle = i % 2 ? "#ffffff" : "#d9c2ff";

            c.beginPath();
            c.moveTo(Math.cos(a) * w * .66, Math.sin(a) * h * .70 - h * .1);
            c.lineTo(Math.cos(a + .18) * w * .40, Math.sin(a + .18) * h * .42 - h * .1);
            c.lineTo(Math.cos(a - .18) * w * .40, Math.sin(a - .18) * h * .42 - h * .1);
            c.closePath();
            c.fill();

        }

        /* etincelle qui se promene */
        c.globalAlpha = .5 + Math.sin(t * 3) * .5;
        c.fillStyle   = "#ffffff";
        c.beginPath();
        c.arc(Math.cos(t) * w * .3, Math.sin(t * 1.3) * h * .3 - h * .1, r * .06, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- SPRIGGAN : petales et lucioles ---------- */
    if(e === "spriggan"){

        c.globalAlpha = .5;
        c.fillStyle   = "#d8ffb0";

        for(let i = 0; i < 5; i++){

            const a = i * 1.26 + t * .15;

            c.save();
            c.translate(Math.cos(a) * w * .5, Math.sin(a) * h * .45);
            c.rotate(a);
            c.beginPath();
            c.ellipse(0, 0, r * .20, r * .09, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

        }

        /* lucioles internes */
        for(let i = 0; i < 5; i++){

            const k = (t * .6 + i * .2) % 1;

            c.globalAlpha = Math.sin(k * Math.PI) * .9;
            c.fillStyle   = "#fffbc4";

            c.beginPath();
            c.arc(
                Math.sin(i * 2.1 + t) * w * .6,
                h * .7 - k * h * 1.6,
                r * .05, 0, Math.PI * 2
            );
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- ALIEN : taches bioluminescentes ---------- */
    if(e === "alien"){

        for(let i = 0; i < 9; i++){

            const a  = i * 1.4;
            const px = Math.cos(a) * w * (.25 + (i % 3) * .24);
            const py = Math.sin(a) * h * (.25 + (i % 3) * .22);
            const rr = r * (.09 + (i % 3) * .04);

            const puls = .35 + Math.sin(t * 2 + i * .9) * .35;

            const g = c.createRadialGradient(px, py, 0, px, py, rr * 2.4);

            g.addColorStop(0,  "rgba(120,255,230," + (puls + .4) + ")");
            g.addColorStop(.4, "rgba(60,200,255,.5)");
            g.addColorStop(1,  "rgba(60,200,255,0)");

            c.fillStyle = g;
            c.beginPath();
            c.arc(px, py, rr * 2.4, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#d8fffa";
            c.globalAlpha = puls + .35;
            c.beginPath();
            c.arc(px, py, rr * .55, 0, Math.PI * 2);
            c.fill();
            c.globalAlpha = 1;

        }

        return;

    }

    /* ---------- MAGE : runes ---------- */
    if(e === "mage"){

        c.globalAlpha = .55;
        c.strokeStyle = "#e8d8ff";
        c.lineWidth   = Math.max(1, r * .035);

        for(let i = 0; i < 4; i++){

            const a  = i * 1.57 + t * .35;
            const px = Math.cos(a) * w * .5;
            const py = Math.sin(a) * h * .45;
            const sz = r * .12;

            c.beginPath();
            c.moveTo(px - sz, py - sz);
            c.lineTo(px + sz, py - sz);
            c.lineTo(px - sz * .3, py + sz);
            c.lineTo(px + sz * .6, py + sz * .1);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- VIKING : planches de coque ---------- */
    if(e === "viking"){

        c.globalAlpha = .5;

        for(let i = 0; i < 5; i++){

            c.fillStyle = i % 2 ? "#5f4a2e" : "#7d6440";
            c.fillRect(-w * 1.3, -h * .85 + i * h * .46, w * 2.6, h * .30);

        }

        /* les clous */
        c.globalAlpha = .6;
        c.fillStyle   = "#3a2c18";

        for(let i = 0; i < 10; i++){
            c.beginPath();
            c.arc(-w * .8 + (i % 5) * w * .4, i < 5 ? -h * .55 : h * .35, r * .035, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- STEAMPUNK : engrenages ---------- */
    if(e === "steampunk"){

        [[-.45,-.25,.30,1],[.42,.12,.24,-1],[-.05,.48,.20,1]].forEach((gr, i) => {

            const gx = gr[0] * w;
            const gy = gr[1] * h;
            const gr2 = gr[2] * r;
            const spin = t * gr[3] * (.8 + i * .3);

            c.save();
            c.translate(gx, gy);
            c.rotate(spin);

            c.fillStyle = i % 2 ? "#8a6230" : "#a87c40";

            const teeth = 8;

            c.beginPath();

            for(let k = 0; k < teeth * 2; k++){
                const a  = k / (teeth * 2) * Math.PI * 2;
                const rr = k % 2 ? gr2 : gr2 * 1.28;
                c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            }

            c.closePath();
            c.fill();

            c.fillStyle = "#4a3418";
            c.beginPath();
            c.arc(0, 0, gr2 * .34, 0, Math.PI * 2);
            c.fill();

            c.restore();

        });

        return;

    }

    /* ---------- HORLOGE : cadran ---------- */
    if(e === "horloge"){

        /* le cadran, sur le ventre pour laisser la place au visage */
        c.fillStyle = "#f2ead8";
        c.beginPath();
        c.arc(0, h * .46, r * .40, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#7a5a30";
        c.lineWidth   = Math.max(1.5, r * .05);
        c.stroke();

        /* les graduations */
        c.strokeStyle = "#3a2c18";
        c.lineWidth   = Math.max(1, r * .03);

        for(let i = 0; i < 12; i++){

            const a = i * Math.PI / 6;

            c.beginPath();
            c.moveTo(Math.cos(a) * r * .30, Math.sin(a) * r * .30 + h * .46);
            c.lineTo(Math.cos(a) * r * .36, Math.sin(a) * r * .36 + h * .46);
            c.stroke();

        }

        /* les aiguilles */
        c.lineCap = "round";

        c.lineWidth = Math.max(1.5, r * .05);
        c.beginPath();
        c.moveTo(0, h * .46);
        c.lineTo(Math.cos(t * .5 - 1.57) * r * .18, Math.sin(t * .5 - 1.57) * r * .18 + h * .46);
        c.stroke();

        c.lineWidth = Math.max(1, r * .035);
        c.beginPath();
        c.moveTo(0, h * .46);
        c.lineTo(Math.cos(t * 2 - 1.57) * r * .28, Math.sin(t * 2 - 1.57) * r * .28 + h * .46);
        c.stroke();

        return;

    }

    /* ---------- SAMOURAI : plaques laquees ---------- */
    if(e === "samourai"){

        c.globalAlpha = .75;

        for(let row = 0; row < 3; row++){

            const y = h * .18 + row * h * .32;

            for(let col = -2; col <= 2; col++){

                c.fillStyle = "#5f2a1e";
                c.fillRect(col * r * .40 - r * .17, y, r * .34, r * .30);

                c.fillStyle = "#c9a24a";
                c.fillRect(col * r * .40 - r * .17, y, r * .34, r * .05);

            }

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- PHARAON : bandes du nemes ---------- */
    if(e === "pharaon"){

        c.globalAlpha = .9;

        for(let i = -6; i <= 6; i++){

            c.fillStyle = i % 2 ? "#1f5fb5" : "#f0c64a";
            c.fillRect(i * r * .22, -h * 1.3, r * .22, h * .95);

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- MAUDIT : vortex d'ombre ---------- */
    if(e === "maudit"){

        c.fillStyle = "#050208";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        for(let i = 0; i < 5; i++){

            const a = t * .9 + i * 1.26;

            c.globalAlpha = .5;
            c.strokeStyle = i % 2 ? "#7a2fd0" : "#3a1060";
            c.lineWidth   = r * .16;
            c.lineCap     = "round";

            c.beginPath();

            for(let k = 0; k <= 10; k++){
                const kk = k / 10;
                const rr = kk * r * .95;
                const aa = a + kk * 3.2;
                c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr * .9);
            }

            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- TRESOR : pieces et gemmes ---------- */
    if(e === "tresor"){

        for(let i = 0; i < 14; i++){

            const a  = i * 1.9;
            const px = Math.cos(a) * w * (.20 + (i % 4) * .19);
            const py = Math.sin(a) * h * (.18 + (i % 4) * .19) + h * .12;

            c.save();
            c.translate(px, py);
            c.rotate(Math.sin(i * 2.3) * .5);

            c.fillStyle = "#ffe07a";
            c.beginPath();
            c.ellipse(0, 0, r * .15, r * .10, 0, 0, Math.PI * 2);
            c.fill();

            c.strokeStyle = "#a06a10";
            c.lineWidth   = Math.max(1, r * .025);
            c.stroke();

            c.restore();

        }

        /* gemmes */
        ["#ff4f6e","#4fd0ff","#8dff6a"].forEach((col, i) => {

            const px = (i - 1) * w * .48;
            const py = h * .38;

            c.fillStyle = col;

            c.beginPath();
            c.moveTo(px, py - r * .14);
            c.lineTo(px + r * .11, py);
            c.lineTo(px, py + r * .14);
            c.lineTo(px - r * .11, py);
            c.closePath();
            c.fill();

        });

        return;

    }

    /* ---------- PHENIX : plumes de feu ---------- */
    if(e === "phenix"){

        for(let i = 0; i < 6; i++){

            const a = i * 1.05 + t * .5;

            c.globalAlpha = .55;
            c.fillStyle   = i % 2 ? "#ffe07a" : "#ff7a2f";

            c.save();
            c.translate(Math.cos(a) * w * .35, Math.sin(a) * h * .3);
            c.rotate(a);
            c.beginPath();
            c.ellipse(0, 0, r * .32, r * .10, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

        }

        /* coeur incandescent */
        const g = c.createRadialGradient(0, 0, r * .04, 0, 0, r * .8);

        g.addColorStop(0,  "rgba(255,255,220,.9)");
        g.addColorStop(.5, "rgba(255,180,60,.5)");
        g.addColorStop(1,  "rgba(255,90,20,0)");

        c.globalAlpha = 1;
        c.fillStyle   = g;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        return;

    }


    /* ---------- PASTEQUE : chair et pepins ---------- */
    if(e === "pasteque"){

        /* l'ecorce verte, en bas */
        c.fillStyle = "#2f7a3a";
        c.fillRect(-w * 1.3, h * .30, w * 2.6, h * 1.2);

        c.fillStyle = "#8fd45c";
        c.fillRect(-w * 1.3, h * .22, w * 2.6, h * .10);

        /* les pepins */
        c.fillStyle = "#2a1208";

        for(let i = 0; i < 7; i++){

            const a = i * 1.5;

            c.save();
            c.translate(Math.cos(a) * w * .5, Math.sin(a) * h * .35 - h * .12);
            c.rotate(a);
            c.beginPath();
            c.ellipse(0, 0, r * .05, r * .085, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

        }

        return;

    }

    /* ---------- CACTUS : cotes et epines ---------- */
    if(e === "cactus"){

        c.globalAlpha = .35;
        c.strokeStyle = "#2c5a26";
        c.lineWidth   = r * .06;

        for(let i = -2; i <= 2; i++){
            c.beginPath();
            c.moveTo(i * w * .34, -h * 1.2);
            c.lineTo(i * w * .34, h * 1.2);
            c.stroke();
        }

        c.globalAlpha = .9;
        c.strokeStyle = "#f2e8c0";
        c.lineWidth   = Math.max(1, r * .028);
        c.lineCap     = "round";

        for(let row = 0; row < 5; row++){

            for(let i = -2; i <= 2; i++){

                const px = i * w * .34;
                const py = -h * .8 + row * h * .42;

                c.beginPath();
                c.moveTo(px - r * .07, py - r * .05);
                c.lineTo(px + r * .07, py + r * .05);
                c.moveTo(px + r * .07, py - r * .05);
                c.lineTo(px - r * .07, py + r * .05);
                c.stroke();

            }

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- NUAGE : vapeur et pluie ---------- */
    if(e === "nuage"){

        c.globalAlpha = .5;
        c.fillStyle   = "#ffffff";

        for(let i = 0; i < 5; i++){

            const a = i * 1.26 + t * .18;

            c.beginPath();
            c.arc(Math.cos(a) * w * .42, Math.sin(a) * h * .3 - h * .15, r * .34, 0, Math.PI * 2);
            c.fill();

        }

        /* la pluie sous le ventre */
        c.globalAlpha = .55;
        c.strokeStyle = "#7fb8ff";
        c.lineWidth   = Math.max(1, r * .035);

        for(let i = 0; i < 6; i++){

            const k  = (t * 1.4 + i * .17) % 1;
            const px = -w * .7 + i * w * .28;
            const py = h * .35 + k * h * .8;

            c.globalAlpha = (1 - k) * .7;

            c.beginPath();
            c.moveTo(px, py);
            c.lineTo(px - r * .03, py + r * .13);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- MIEL : alveoles et coulure ---------- */
    if(e === "miel"){

        c.globalAlpha = .30;
        c.strokeStyle = "#8a5a08";
        c.lineWidth   = Math.max(1, r * .035);

        const hr = r * .22;

        for(let row = -2; row <= 2; row++){

            for(let col = -2; col <= 2; col++){

                const px = col * hr * 1.75 + (row % 2 ? hr * .87 : 0);
                const py = row * hr * 1.5;

                c.beginPath();

                for(let k = 0; k < 6; k++){
                    const a = k * Math.PI / 3;
                    c.lineTo(px + Math.cos(a) * hr, py + Math.sin(a) * hr);
                }

                c.closePath();
                c.stroke();

            }

        }

        /* le miel qui coule */
        c.globalAlpha = .55;
        c.fillStyle   = "#ffe07a";

        for(let i = 0; i < 3; i++){

            const px = (i - 1) * w * .5;
            const dl = (.3 + .2 * Math.sin(t * 1.2 + i)) * h;

            c.beginPath();
            c.moveTo(px - r * .09, -h * 1.2);
            c.lineTo(px + r * .09, -h * 1.2);
            c.lineTo(px + r * .09, dl);
            c.arc(px, dl, r * .09, 0, Math.PI);
            c.closePath();
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- SUSHI : riz, algue et poisson ---------- */
    if(e === "sushi"){

        /* les grains de riz */
        c.globalAlpha = .35;
        c.fillStyle   = "#ffffff";

        for(let i = 0; i < 16; i++){

            const a = i * 1.9;

            c.save();
            c.translate(Math.cos(a) * w * .55, Math.sin(a) * h * .5);
            c.rotate(a);
            c.beginPath();
            c.ellipse(0, 0, r * .09, r * .05, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();

        }

        /* la bande d'algue */
        c.globalAlpha = .95;
        c.fillStyle   = "#1c2a1c";
        c.fillRect(-w * .26, -h * 1.3, w * .52, h * 2.6);

        c.globalAlpha = 1;

        return;

    }

    /* ---------- PANDA : taches ---------- */
    if(e === "panda"){

        c.fillStyle = "#161616";

        /* les cernes */
        [-1, 1].forEach(sgn => {
            c.save();
            c.translate(sgn * w * .34, -h * .18);
            c.rotate(sgn * .5);
            c.beginPath();
            c.ellipse(0, 0, r * .30, r * .22, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();
        });

        /* le ventre plus sombre */
        c.globalAlpha = .18;
        c.beginPath();
        c.ellipse(0, h * .7, w * .6, h * .4, 0, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;

        return;

    }

    /* ---------- PIXEL : gros pixels ---------- */
    if(e === "pixel"){

        const px = r * .28;

        for(let x = -5; x <= 5; x++){

            for(let y = -5; y <= 5; y++){

                /* damier deterministe, pas de hasard qui scintille */
                const v = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;

                if(v > .35 || v < -.35){
                    continue;
                }

                c.globalAlpha = .30;
                c.fillStyle   = v > 0 ? "#a8ff9a" : "#144a1c";

                c.fillRect(x * px - px / 2, y * px - px / 2, px, px);

            }

        }

        /* la grille */
        c.globalAlpha = .18;
        c.strokeStyle = "#0b2a12";
        c.lineWidth   = Math.max(1, r * .015);

        for(let i = -5; i <= 5; i++){
            c.beginPath();
            c.moveTo(i * px - px / 2, -h * 1.3);
            c.lineTo(i * px - px / 2, h * 1.3);
            c.moveTo(-w * 1.3, i * px - px / 2);
            c.lineTo(w * 1.3, i * px - px / 2);
            c.stroke();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CITROUILLE : cotes et lueur ---------- */
    if(e === "citrouille"){

        c.globalAlpha = .3;
        c.strokeStyle = "#a04a08";
        c.lineWidth   = r * .07;

        for(let i = -2; i <= 2; i++){

            c.beginPath();
            c.moveTo(i * w * .32, -h * 1.2);
            c.quadraticCurveTo(i * w * .42, 0, i * w * .32, h * 1.2);
            c.stroke();

        }

        /* la bougie a l'interieur */
        const puls = .45 + Math.sin(t * 5) * .25;

        const g = c.createRadialGradient(0, h * .1, r * .04, 0, h * .1, r * .9);

        g.addColorStop(0,  "rgba(255,240,170," + puls + ")");
        g.addColorStop(.5, "rgba(255,160,40,.3)");
        g.addColorStop(1,  "rgba(255,120,20,0)");

        c.globalAlpha = 1;
        c.fillStyle   = g;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        return;

    }

    /* ---------- MOMIE : bandelettes ---------- */
    if(e === "momie"){

        c.globalAlpha = .9;

        for(let i = 0; i < 9; i++){

            const y = -h * 1.1 + i * h * .27;

            c.save();
            c.translate(0, y);
            c.rotate(Math.sin(i * 1.3) * .16);

            c.fillStyle = i % 2 ? "#f2ead2" : "#ddd2b2";
            c.fillRect(-w * 1.3, 0, w * 2.6, h * .20);

            c.strokeStyle = "#b8a882";
            c.lineWidth   = Math.max(1, r * .02);
            c.beginPath();
            c.moveTo(-w * 1.3, h * .20);
            c.lineTo(w * 1.3, h * .20);
            c.stroke();

            c.restore();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- SQUELETTE : cage thoracique ---------- */
    if(e === "squelette"){

        c.globalAlpha = .8;
        c.strokeStyle = "#8f9aa8";
        c.lineWidth   = Math.max(1.5, r * .06);
        c.lineCap     = "round";

        /* la colonne */
        c.beginPath();
        c.moveTo(0, h * .15);
        c.lineTo(0, h * .95);
        c.stroke();

        /* les cotes */
        for(let i = 0; i < 4; i++){

            const y = h * .28 + i * h * .19;
            const ww = w * (.52 - i * .07);

            c.beginPath();
            c.moveTo(-ww, y - r * .06);
            c.quadraticCurveTo(0, y + r * .10, ww, y - r * .06);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- REQUIN : ventre et branchies ---------- */
    if(e === "requin"){

        /* le ventre clair */
        c.fillStyle = "#e8eef5";
        c.beginPath();
        c.moveTo(-w * 1.3, h * .18);

        for(let k = 0; k <= 8; k++){
            c.lineTo(-w * 1.3 + k * w * .33, h * .18 + Math.sin(k * .9) * h * .06);
        }

        c.lineTo(w * 1.3, h * 1.4);
        c.lineTo(-w * 1.3, h * 1.4);
        c.closePath();
        c.fill();

        /* les branchies */
        c.globalAlpha = .55;
        c.strokeStyle = "#22344a";
        c.lineWidth   = Math.max(1, r * .04);

        for(let i = 0; i < 4; i++){

            const px = -w * .70 + i * r * .14;

            c.beginPath();
            c.moveTo(px, -h * .18);
            c.quadraticCurveTo(px - r * .05, 0, px, h * .16);
            c.stroke();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- BULLE : irisations ---------- */
    if(e === "bulle"){

        for(let i = 0; i < 5; i++){

            const a = t * .35 + i * 1.26;

            const g = c.createRadialGradient(
                Math.cos(a) * w * .4, Math.sin(a) * h * .35, 0,
                Math.cos(a) * w * .4, Math.sin(a) * h * .35, r * .8
            );

            g.addColorStop(0,  "hsla(" + ((t * 40 + i * 70) % 360) + ",100%,72%,.45)");
            g.addColorStop(1,  "hsla(" + ((t * 40 + i * 70) % 360) + ",100%,72%,0)");

            c.fillStyle = g;
            c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        }

        /* la paroi mince */
        c.globalAlpha = .5;
        c.strokeStyle = "#ffffff";
        c.lineWidth   = r * .05;
        c.beginPath();
        c.arc(0, 0, r * .92, 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;

        return;

    }

    /* ---------- LAVA LAMP : blobs qui montent ---------- */
    if(e === "lampe"){

        c.fillStyle = "#1a0328";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        for(let i = 0; i < 6; i++){

            const k  = (t * .22 + i * .17) % 1;
            const py = h * .95 - k * h * 2;
            const rr = r * (.18 + Math.sin(k * Math.PI) * .18);
            const px = Math.sin(i * 2.1 + k * 3) * w * .34;

            const g = c.createRadialGradient(px, py, 0, px, py, rr * 1.4);

            g.addColorStop(0,  "#fff0ff");
            g.addColorStop(.45,"#ff6ad5");
            g.addColorStop(1,  "rgba(255,60,190,0)");

            c.fillStyle = g;

            c.beginPath();
            c.ellipse(px, py, rr, rr * 1.25, 0, 0, Math.PI * 2);
            c.fill();

        }

        return;

    }

    /* ---------- ORIGAMI : facettes de papier ---------- */
    if(e === "origami"){

        const faces = [
            ["#ff9b8c", -.9, -1, .1, -.2, -.5, 1],
            ["#e05a45", .1, -.2, 1, -.9, .9, .9],
            ["#c4402f", -.9, 1, .1, -.2, .9, .9],
            ["#ffb9ad", -.9, -1, 1, -.9, .1, -.2]
        ];

        faces.forEach(f => {

            c.fillStyle = f[0];

            c.beginPath();
            c.moveTo(f[1] * w, f[2] * h);
            c.lineTo(f[3] * w, f[4] * h);
            c.lineTo(f[5] * w, f[6] * h);
            c.closePath();
            c.fill();

        });

        /* les plis */
        c.globalAlpha = .35;
        c.strokeStyle = "#7a2418";
        c.lineWidth   = Math.max(1, r * .025);

        faces.forEach(f => {
            c.beginPath();
            c.moveTo(f[1] * w, f[2] * h);
            c.lineTo(f[3] * w, f[4] * h);
            c.stroke();
        });

        c.globalAlpha = 1;

        return;

    }

    /* ---------- TOKYO : enseignes au neon ---------- */
    if(e === "tokyo"){

        c.fillStyle = "#160c2a";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        const cols = ["#ff3a8a", "#3affd0", "#ffd23a", "#8a6aff"];

        for(let i = 0; i < 6; i++){

            const col = cols[i % cols.length];
            const px  = -w * .7 + (i % 3) * w * .7;
            const py  = -h * .6 + Math.floor(i / 3) * h * .8;

            /* l'enseigne clignote un peu */
            const on = .55 + .45 * Math.sin(t * (2 + i) + i * 2);

            c.globalAlpha = on;
            c.strokeStyle = col;
            c.lineWidth   = Math.max(1.5, r * .05);
            c.shadowBlur  = r * .3;
            c.shadowColor = col;

            c.beginPath();

            if(i % 3 === 0){
                c.rect(px - r * .12, py - r * .16, r * .24, r * .32);
            }else if(i % 3 === 1){
                c.moveTo(px - r * .12, py - r * .14);
                c.lineTo(px + r * .12, py - r * .14);
                c.moveTo(px, py - r * .14);
                c.lineTo(px, py + r * .16);
            }else{
                c.arc(px, py, r * .13, 0, Math.PI * 2);
            }

            c.stroke();

        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- HOLO : lignes de balayage ---------- */
    if(e === "holo"){

        c.globalAlpha = .22;
        c.fillStyle   = "#0b3a4a";

        for(let y = -12; y <= 12; y++){
            c.fillRect(-w * 1.3, y * r * .09 + ((t * 30) % (r * .09)), w * 2.6, r * .045);
        }

        /* le decalage de couleur, comme un signal instable */
        c.globalAlpha = .3;

        c.fillStyle = "#ff3a6a";
        c.fillRect(-w * 1.3, Math.sin(t * 3) * h * .3, w * 2.6, h * .07);

        c.fillStyle = "#3affd0";
        c.fillRect(-w * 1.3, Math.sin(t * 3 + 1) * h * .3 + h * .09, w * 2.6, h * .05);

        c.globalAlpha = 1;

        return;

    }

    /* ---------- VITRAIL : verres sertis de plomb ---------- */
    if(e === "vitrail"){

        const cols = ["#ff5f9e","#ffd23a","#3ad0ff","#8dff6a","#c86aff","#ff8a3a"];

        for(let i = 0; i < 9; i++){

            const a0 = i * (Math.PI * 2 / 9);
            const a1 = (i + 1) * (Math.PI * 2 / 9);

            c.fillStyle = cols[i % cols.length];

            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(Math.cos(a0) * w * 1.4, Math.sin(a0) * h * 1.4);
            c.lineTo(Math.cos(a1) * w * 1.4, Math.sin(a1) * h * 1.4);
            c.closePath();
            c.fill();

        }

        /* le plomb */
        c.strokeStyle = "#1a1226";
        c.lineWidth   = r * .07;

        for(let i = 0; i < 9; i++){

            const a = i * (Math.PI * 2 / 9);

            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(Math.cos(a) * w * 1.4, Math.sin(a) * h * 1.4);
            c.stroke();

        }

        c.beginPath();
        c.arc(0, 0, r * .32, 0, Math.PI * 2);
        c.stroke();

        c.fillStyle = "#fff0c0";
        c.beginPath();
        c.arc(0, 0, r * .30, 0, Math.PI * 2);
        c.fill();

        return;

    }

    /* ---------- PLASMA : filaments vers la coque ---------- */
    if(e === "plasma"){

        c.fillStyle = "#150430";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        for(let i = 0; i < 7; i++){

            const a = i * (Math.PI * 2 / 7) + Math.sin(t * .7 + i) * .3;

            c.globalAlpha = .55 + .35 * Math.sin(t * 4 + i * 2);
            c.strokeStyle = i % 2 ? "#e0a0ff" : "#8a5aff";
            c.lineWidth   = r * .045;
            c.lineCap     = "round";
            c.shadowBlur  = r * .3;
            c.shadowColor = "#c86aff";

            c.beginPath();
            c.moveTo(0, 0);

            for(let k = 1; k <= 5; k++){

                const kk = k / 5;
                const aa = a + Math.sin(t * 3 + k + i) * .22 * kk;

                c.lineTo(Math.cos(aa) * w * kk, Math.sin(aa) * h * kk);

            }

            c.stroke();

        }

        c.shadowBlur = 0;

        /* le coeur */
        c.globalAlpha = 1;

        const g = c.createRadialGradient(0, 0, 0, 0, 0, r * .35);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "rgba(200,106,255,0)");

        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, r * .35, 0, Math.PI * 2);
        c.fill();

        return;

    }

    /* ---------- NUIT ETOILEE : tourbillons ---------- */
    if(e === "vangogh"){

        c.fillStyle = "#16264f";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* les coups de pinceau en spirale */
        for(let sw = 0; sw < 3; sw++){

            const cx = (sw - 1) * w * .5;
            const cy = (sw % 2 ? -.25 : .25) * h;

            for(let i = 0; i < 5; i++){

                c.globalAlpha = .55;
                c.strokeStyle = i % 2 ? "#7fa8e8" : "#2f4f9c";
                c.lineWidth   = r * .07;
                c.lineCap     = "round";

                c.beginPath();

                for(let k = 0; k <= 14; k++){

                    const kk = k / 14;
                    const a  = t * .25 + i * 1.2 + kk * 4.2;
                    const rr = (i * .07 + kk * .34) * r;

                    c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .85);

                }

                c.stroke();

            }

        }

        /* les astres jaunes */
        c.globalAlpha = .9;

        [[-.55,-.5,.16],[.5,-.35,.12],[.15,.5,.10]].forEach(st => {

            const g = c.createRadialGradient(
                st[0] * w, st[1] * h, 0,
                st[0] * w, st[1] * h, r * st[2] * 2.4
            );

            g.addColorStop(0,  "#fff3b0");
            g.addColorStop(.4, "rgba(255,220,90,.55)");
            g.addColorStop(1,  "rgba(255,200,60,0)");

            c.fillStyle = g;
            c.beginPath();
            c.arc(st[0] * w, st[1] * h, r * st[2] * 2.4, 0, Math.PI * 2);
            c.fill();

        });

        c.globalAlpha = 1;

        return;

    }

    /* ---------- PRISME : facettes qui glissent ---------- */
    if(e === "prisme"){

        c.globalAlpha = .22;
        c.fillStyle   = "#ffffff";

        for(let i = 0; i < 5; i++){

            const a = i * 1.3 + t * .5;

            c.beginPath();
            c.moveTo(Math.cos(a) * w * .2, Math.sin(a) * h * .2);
            c.lineTo(Math.cos(a + .55) * w * 1.2, Math.sin(a + .55) * h * 1.2);
            c.lineTo(Math.cos(a - .25) * w * 1.2, Math.sin(a - .25) * h * 1.2);
            c.closePath();
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- SIRENE : ecailles irisees ---------- */
    if(e === "sirene"){

        c.lineWidth = r * .05;

        for(let ry = -3; ry <= 3; ry++){
            for(let cx = -3; cx <= 3; cx++){

                const px  = cx * w * .34 + (ry % 2 ? w * .17 : 0);
                const py  = ry * h * .26;
                const hue = (ry * 24 + cx * 14 + t * 45) % 360;

                c.globalAlpha = .5;
                c.strokeStyle = "hsl(" + hue + ",85%,72%)";

                c.beginPath();
                c.arc(px, py, w * .19, Math.PI * .12, Math.PI * .88);
                c.stroke();

            }
        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- ABEILLE : rayures en diagonale ---------- */
    if(e === "abeille"){

        c.save();
        c.rotate(-.28);

        c.globalAlpha = .85;
        c.fillStyle   = "#2a1c04";

        for(let i = -4; i <= 4; i++){
            c.fillRect(-w * 1.6, i * h * .36 - h * .075, w * 3.2, h * .15);
        }

        c.restore();

        /* le duvet dore entre les bandes */
        c.globalAlpha = .3;
        c.fillStyle   = "#fff0a8";

        for(let i = 0; i < 14; i++){
            const a = i * 2.39 + t * .2;
            c.beginPath();
            c.arc(Math.cos(a) * w * .7, Math.sin(a) * h * .7, r * .035, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- AUTOMNE : feuilles qui tombent ---------- */
    if(e === "automne"){

        const TONS = ["#ffb347", "#e8622a", "#c9412a", "#f5d06a"];

        for(let i = 0; i < 7; i++){

            const ph = (t * .3 + i * .143) % 1;
            const px = Math.sin(i * 2.1 + t * .8) * w * .7;
            const py = (ph - .5) * h * 2.1;

            c.globalAlpha = .95 * Math.min(1, Math.sin(ph * Math.PI) * 1.6);
            c.fillStyle   = TONS[i % 4];

            c.save();
            c.translate(px, py);
            c.rotate(t * 1.1 + i);

            /* une feuille en amande, avec sa nervure */
            c.beginPath();
            c.moveTo(-r * .24, 0);
            c.quadraticCurveTo(0, -r * .17, r * .24, 0);
            c.quadraticCurveTo(0,  r * .17, -r * .24, 0);
            c.fill();

            c.strokeStyle = "#7a3410";
            c.lineWidth   = r * .022;
            c.beginPath();
            c.moveTo(-r * .24, 0);
            c.lineTo(r * .24, 0);
            c.stroke();

            c.restore();

        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- MEDUSE : ombrelle et filaments ---------- */
    if(e === "meduse"){

        /* le dome translucide */
        c.globalAlpha = .55;

        const gm = c.createLinearGradient(0, -h * .8, 0, h * .1);
        gm.addColorStop(0,  "#fdf4ff");
        gm.addColorStop(1,  "rgba(160,110,255,.15)");

        c.fillStyle = gm;
        c.beginPath();
        c.ellipse(0, -h * .12, w * .85, h * .6, 0, Math.PI, 0);
        c.fill();

        c.globalAlpha = .7;
        c.strokeStyle = "#f6ecff";
        c.lineWidth   = r * .05;
        c.beginPath();
        c.ellipse(0, -h * .12, w * .85, h * .6, 0, Math.PI, 0);
        c.stroke();

        /* les filaments qui ondulent */
        c.globalAlpha = .8;
        c.strokeStyle = "#fbf2ff";
        c.lineWidth   = r * .06;
        c.lineCap     = "round";

        for(let i = 0; i < 6; i++){

            const bx = (i - 2.5) * w * .3;

            c.beginPath();
            c.moveTo(bx, h * .05);

            for(let k = 1; k <= 6; k++){
                const kk = k / 6;
                c.lineTo(bx + Math.sin(t * 3 + i + kk * 3) * w * .12, h * (.05 + kk * .95));
            }

            c.stroke();

        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- KOI : taches et ondes a la surface ---------- */
    if(e === "koi"){

        const TACHES = [[-.45,-.35,.30],[.4,-.15,.24],[-.1,.45,.27],[.5,.5,.18]];

        TACHES.forEach((p, i) => {

            c.globalAlpha = .8;
            c.fillStyle   = i % 2 ? "#d95a2a" : "#20242c";

            c.save();
            c.translate(p[0] * w, p[1] * h);
            c.rotate(Math.sin(t * .5 + i) * .2 + i);

            c.beginPath();
            c.ellipse(0, 0, w * p[2], h * p[2] * .72, 0, 0, Math.PI * 2);
            c.fill();

            c.restore();

        });

        /* les ronds dans l'eau */
        c.globalAlpha = .3;
        c.strokeStyle = "#ffffff";
        c.lineWidth   = r * .04;

        for(let i = 0; i < 3; i++){
            const rr = ((t * .4 + i / 3) % 1) * r * 1.3;
            c.beginPath();
            c.ellipse(0, h * .1, rr, rr * .55, 0, 0, Math.PI * 2);
            c.stroke();
        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- BAMBOU : cannes et noeuds ---------- */
    if(e === "bambou"){

        for(let i = -3; i <= 3; i++){

            const px = i * w * .32 + Math.sin(t * .4 + i) * w * .03;

            c.globalAlpha = .55;
            c.fillStyle   = i % 2 ? "#2f6b1e" : "#4d8f2c";
            c.fillRect(px - w * .1, -h * 1.4, w * .2, h * 2.8);

            /* les noeuds */
            c.globalAlpha = .7;
            c.fillStyle   = "#1d4a12";

            for(let k = -2; k <= 2; k++){
                c.fillRect(px - w * .12, k * h * .5, w * .24, h * .05);
            }

        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- ARCADE : pixels qui s'allument ---------- */
    if(e === "arcade"){

        const TON = ["#ff4f8b", "#5ffff0", "#ffe14f", "#a45cff"];
        const px  = w * .27, py = h * .27;

        for(let gx = -3; gx <= 3; gx++){
            for(let gy = -3; gy <= 3; gy++){

                const k = Math.sin(gx * 1.7 + gy * 2.3 + t * 2.2);

                if(k < .25) continue;

                c.globalAlpha = .25 + k * .5;
                c.fillStyle   = TON[(gx + gy + 8) % 4];
                c.fillRect(gx * px - px * .42, gy * py - py * .42, px * .84, py * .84);

            }
        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- ENCRE : volutes noires sur blanc ---------- */
    if(e === "encre"){

        c.globalAlpha = .8;
        c.fillStyle   = "#f4f6fa";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        c.strokeStyle = "#161922";
        c.lineCap     = "round";

        for(let i = 0; i < 4; i++){

            c.globalAlpha = .75;
            c.lineWidth   = r * (.14 - i * .025);

            c.beginPath();

            for(let k = 0; k <= 16; k++){
                const kk = k / 16;
                const a  = t * .3 + i * 1.6 + kk * 5;
                const rr = kk * r * (.5 + i * .18);
                c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .9);
            }

            c.stroke();

        }

        /* les gouttes */
        c.globalAlpha = .7;
        c.fillStyle   = "#161922";

        for(let i = 0; i < 5; i++){
            const a = i * 1.25 + t * .5;
            c.beginPath();
            c.arc(Math.cos(a) * w * .8, Math.sin(a) * h * .8, r * .05, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- AURORE : rideaux de lumiere ---------- */
    if(e === "aurore"){

        c.fillStyle = "#0d1f3d";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        for(let i = 0; i < 4; i++){

            const bx  = (i - 1.5) * w * .5;
            const hue = 140 + Math.sin(t * .6 + i * 1.4) * 80;

            const g = c.createLinearGradient(0, -h, 0, h);
            g.addColorStop(0,   "hsla(" + hue + ",95%,70%,0)");
            g.addColorStop(.45, "hsla(" + hue + ",95%,68%,.75)");
            g.addColorStop(1,   "hsla(" + (hue + 40) + ",95%,60%,0)");

            c.globalAlpha = .9;
            c.strokeStyle = g;
            c.lineWidth   = w * .30;
            c.lineCap     = "round";
            c.lineJoin    = "round";

            c.beginPath();

            for(let k = 0; k <= 12; k++){
                const kk = k / 12;
                c.lineTo(bx + Math.sin(t * 1.1 + i * 1.7 + kk * 3.4) * w * .38, -h * 1.2 + kk * h * 2.4);
            }

            c.stroke();

        }

        /* quelques etoiles au fond */
        c.globalAlpha = .8;
        c.fillStyle   = "#eaf6ff";

        for(let i = 0; i < 8; i++){
            const a = i * 2.4;
            c.beginPath();
            c.arc(Math.cos(a) * w * .85, Math.sin(a * 1.7) * h * .85, r * .025, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;
        return;

    }

    /* ---------- MIROIR : facettes qui renvoient la lumiere ---------- */
    if(e === "miroir"){

        for(let i = 0; i < 7; i++){

            const a = i * .9 + t * .25;

            c.globalAlpha = .10 + .16 * (1 + Math.sin(t * 1.6 + i)) / 2;
            c.fillStyle   = i % 2 ? "#ffffff" : "#9fc0e8";

            c.beginPath();
            c.moveTo(Math.cos(a) * w * .12, Math.sin(a) * h * .12);
            c.lineTo(Math.cos(a + .5) * w * 1.3, Math.sin(a + .5) * h * 1.3);
            c.lineTo(Math.cos(a - .3) * w * 1.3, Math.sin(a - .3) * h * 1.3);
            c.closePath();
            c.fill();

        }

        /* l'eclat qui balaie */
        const sx = Math.sin(t * .9) * w * .6;

        const g = c.createLinearGradient(sx - w * .3, 0, sx + w * .3, 0);
        g.addColorStop(0,  "rgba(255,255,255,0)");
        g.addColorStop(.5, "rgba(255,255,255,.55)");
        g.addColorStop(1,  "rgba(255,255,255,0)");

        c.globalAlpha = 1;
        c.fillStyle   = g;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        return;

    }

    /* ---------- TORNADE : spirale de debris ---------- */
    if(e === "tornade"){

        c.strokeStyle = "#c7d8ea";
        c.lineCap     = "round";

        for(let i = 0; i < 5; i++){

            c.globalAlpha = .5 + i * .09;
            c.lineWidth   = r * .10;

            c.beginPath();

            for(let k = 0; k <= 18; k++){

                const kk = k / 18;
                const a  = t * 3 + i * 1.25 + kk * 7;
                const rr = (.15 + kk * .8) * w;

                c.lineTo(Math.cos(a) * rr, -h + kk * h * 2.1);

            }

            c.stroke();

        }

        /* les brindilles emportees */
        c.globalAlpha = .7;
        c.fillStyle   = "#6a5340";

        for(let i = 0; i < 7; i++){

            const a  = t * 4 + i * .9;
            const kk = (t * .5 + i / 7) % 1;

            c.beginPath();
            c.arc(Math.cos(a) * w * (.2 + kk * .8), -h + kk * h * 2, r * .04, 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;
        return;

    }


    /* ---------- MARIONNETTE : sa tete, et rien d'autre ---------- */
    if(e === "pantin"){

        /* le bois sombre et verni de son crane */
        const wood = c.createRadialGradient(-w * .26, -h * .55, 0, 0, -h * .10, w * 1.1);
        wood.addColorStop(0,  "#5e4a6e");
        wood.addColorStop(.6, "#2f2340");
        wood.addColorStop(1,  "#150e1e");

        c.fillStyle = wood;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* la rangee de dents, exactement comme sur sa tete */
        c.fillStyle = "#f6f2ff";

        for(let i = 0; i < 5; i++){

            const px = -w * .34 + i * w * .17;

            c.beginPath();
            c.moveTo(px - w * .075, h * .38);
            c.lineTo(px + w * .075, h * .38);
            c.lineTo(px,            h * .58);
            c.closePath();
            c.fill();

        }

        /* l'anneau du fil, sur le sommet du crane */
        c.strokeStyle = "#b06cff";
        c.lineWidth   = h * .07;
        c.shadowColor = "#b06cff";
        c.shadowBlur  = 12;

        c.beginPath();
        c.arc(0, -h * .84, h * .15, 0, Math.PI * 2);
        c.stroke();

        c.shadowBlur = 0;

        return;

    }


    /* ---------- MIMIC : du metal sombre, et des dents ---------- */
    if(e === "mimic"){

        /* la carcasse : un metal presque noir */
        const shell = c.createLinearGradient(0, -h, 0, h);
        shell.addColorStop(0,   "#4a3a58");
        shell.addColorStop(.32, "#231a30");
        shell.addColorStop(1,   "#0d0714");

        c.fillStyle = shell;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* le dome du haut, comme sur sa tete */
        const dome = c.createLinearGradient(0, -h, 0, -h * .15);
        dome.addColorStop(0, "#6a5580");
        dome.addColorStop(1, "rgba(60,45,80,0)");

        c.fillStyle = dome;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 1.35);

        /* la couture */
        c.strokeStyle = "rgba(0,0,0,.55)";
        c.lineWidth   = h * .05;

        c.beginPath();
        c.moveTo(-w, -h * .18);
        c.lineTo( w, -h * .18);
        c.stroke();

        /* le liseré violet sur le flanc */
        c.strokeStyle = "rgba(200,106,255,.7)";
        c.lineWidth   = h * .045;
        c.shadowColor = "#c86aff";
        c.shadowBlur  = 12;

        c.beginPath();
        c.moveTo(-w * .82, -h * .4);
        c.lineTo(-w * .82,  h * .4);
        c.stroke();

        c.shadowBlur = 0;

        /* la rangee de dents, bien en bas pour laisser la place aux yeux */
        const my = h * .52;
        const mw = w * .62;
        const mh = h * .13;

        c.fillStyle = "#05020a";

        c.beginPath();
        c.moveTo(-mw, my - mh);
        c.quadraticCurveTo(0, my + mh * 2.4, mw, my - mh);
        c.closePath();
        c.fill();

        c.fillStyle = "#f8f5ff";

        const N = 7;

        for(let i = 0; i < N; i++){

            const u  = (i + .5) / N;
            const px = -mw + u * mw * 2;

            const top = my - mh + Math.sin(u * Math.PI) * mh * .5;
            const len = mh * (.9 + Math.sin(u * Math.PI) * .9);

            c.beginPath();
            c.moveTo(px - mw / N, top);
            c.lineTo(px + mw / N, top);
            c.lineTo(px,          top + len);
            c.closePath();
            c.fill();

        }

        /* le tremblement du glitch, par intermittence */
        const g = Math.sin(t * 1.7) > .93 ? 1 : 0;

        if(g){

            c.globalAlpha = .35;

            c.fillStyle = "#ff3af0";
            c.fillRect(-w * 1.3, -h * .55, w * 2.6, h * .12);

            c.fillStyle = "#3affe0";
            c.fillRect(-w * 1.3,  h * .18, w * 2.6, h * .08);

            c.globalAlpha = 1;

        }

        return;

    }


    /* ---------- ECLIPSE : le soleil noir et sa couronne ---------- */
    if(e === "eclipse"){

        /*
        Le corps sert de decoupe : tout ce qui est peint ici est
        rogne par la silhouette. Le rayon utile est donc la
        demi-largeur du corps, pas r.
        */
        const R = Math.max(w, h) * 1.06;

        /* le disque : un trou noir */
        c.globalAlpha = 1;
        c.fillStyle   = "#050208";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* les etoiles que l'eclipse laisse voir */
        for(let i = 0; i < 16; i++){

            const a  = i * 2.39 + .4;
            const rr = (.30 + (i % 5) * .14) * R;

            c.globalAlpha = .12 + .22 * Math.sin(t * 2 + i) * Math.sin(t * 2 + i);
            c.fillStyle   = "#ffffff";

            c.beginPath();
            c.arc(Math.cos(a) * rr, Math.sin(a * 1.3) * rr * .9, R * .018, 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

        /* la chromosphere : l'anneau de feu, sur le bord seulement */
        c.strokeStyle = "rgba(255,130,40,.85)";
        c.lineWidth   = R * .17;
        c.shadowColor = "#ff5f1f";
        c.shadowBlur  = 18;

        c.beginPath();
        c.arc(0, 0, R * .93, 0, Math.PI * 2);
        c.stroke();

        /* les protuberances : des boucles de feu sur le limbe */
        c.globalAlpha = .9;
        c.strokeStyle = "#ffb14a";
        c.lineCap     = "round";

        for(let i = 0; i < 6; i++){

            const a  = i * 1.047 + t * .25;
            const sz = .10 + Math.abs(Math.sin(t * .8 + i)) * .14;

            c.lineWidth = R * .05;

            c.beginPath();

            for(let k = 0; k <= 12; k++){

                const kk = k / 12;
                const aa = a - sz + kk * sz * 2;
                const rr = R * (.88 + Math.sin(kk * Math.PI) * sz * 1.4);

                c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);

            }

            c.stroke();

        }

        c.shadowBlur = 0;

        /* le croissant : la lumiere qui s'echappe d'un cote */
        const slide = Math.sin(t * .35) * .6;

        c.save();
        c.rotate(-.6 + slide);

        const cres = c.createLinearGradient(-R, 0, R, 0);
        cres.addColorStop(0,   "rgba(255,220,140,0)");
        cres.addColorStop(.6,  "rgba(255,200,90,.35)");
        cres.addColorStop(1,   "rgba(255,252,235,1)");

        c.globalAlpha = 1;
        c.strokeStyle = cres;
        c.lineWidth   = R * .19;
        c.shadowColor = "#ffe9a8";
        c.shadowBlur  = 34;

        c.beginPath();
        c.arc(0, 0, R * .93, -1.25, 1.25);
        c.stroke();

        /* la perle : le point le plus vif du croissant */
        c.shadowBlur = 36;
        c.fillStyle  = "#fffdf2";

        c.beginPath();
        c.arc(R * .93, 0, R * .085, 0, Math.PI * 2);
        c.fill();

        c.restore();

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }


    /* ---------- SABLIER : le temps qui s'ecoule dedans ---------- */
    if(e === "sablier"){

        /* le verre : un bleu de nuit tres sombre */
        const glass = c.createLinearGradient(0, -h, 0, h);
        glass.addColorStop(0,  "#1a1533");
        glass.addColorStop(.5, "#0d0a1e");
        glass.addColorStop(1,  "#1a1533");

        c.fillStyle = glass;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* le cycle : trois secondes de haut en bas */
        const k = (t * .33) % 1;

        const neck = h * .06;   /* la taille du col */

        /* --- le sable du haut : il descend --- */
        const topFill = 1 - k;

        c.fillStyle = "#ffd76a";

        c.beginPath();
        c.moveTo(-w * .78, -h * .92);
        c.lineTo(w * .78,  -h * .92);
        c.lineTo(0, -neck);
        c.closePath();
        c.save();
        c.clip();

        const ty = -h * .92 + (1 - topFill) * (h * .92 - neck);

        c.fillStyle = "#ffcf4d";
        c.fillRect(-w, ty, w * 2, h * 2);

        /* la surface se creuse au centre */
        c.fillStyle = "#0d0a1e";
        c.beginPath();
        c.ellipse(0, ty, w * .34, h * .07, 0, 0, Math.PI * 2);
        c.fill();

        c.restore();

        /* --- le sable du bas : il monte en tas --- */
        c.beginPath();
        c.moveTo(-w * .78, h * .92);
        c.lineTo(w * .78,  h * .92);
        c.lineTo(0, neck);
        c.closePath();
        c.save();
        c.clip();

        c.fillStyle = "#ffcf4d";

        const pile = k * h * .86;

        c.beginPath();
        c.moveTo(-w, h * .95);
        c.lineTo(w, h * .95);
        c.lineTo(w, h * .92 - pile * .35);
        c.quadraticCurveTo(0, h * .92 - pile * 1.25, -w, h * .92 - pile * .35);
        c.closePath();
        c.fill();

        c.restore();

        /* --- le filet qui tombe --- */
        c.globalAlpha = .95;
        c.strokeStyle = "#ffe9a8";
        c.lineWidth   = r * .035;
        c.lineCap     = "round";

        c.beginPath();
        c.moveTo(0, -neck);
        c.lineTo(0, h * .9 - k * h * .8);
        c.stroke();

        /* les grains qui rebondissent */
        c.fillStyle = "#fff4c2";

        for(let i = 0; i < 7; i++){
            const kk = ((t * 1.8 + i / 7) % 1);
            c.globalAlpha = 1 - kk * .6;
            c.beginPath();
            c.arc(
                Math.sin(kk * 9 + i) * r * .05,
                -neck + kk * (h * .88 - k * h * .8),
                r * .026, 0, Math.PI * 2
            );
            c.fill();
        }

        c.globalAlpha = 1;

        /* --- les cerclages d'or --- */
        c.strokeStyle = "#e0a93d";
        c.lineWidth   = r * .08;
        c.shadowColor = "#ffd76a";
        c.shadowBlur  = 10;

        [-.92, .92].forEach(sy => {
            c.beginPath();
            c.moveTo(-w * .86, h * sy);
            c.lineTo(w * .86,  h * sy);
            c.stroke();
        });

        /* le col, serti */
        c.beginPath();
        c.moveTo(-w * .22, -neck);
        c.lineTo(w * .22,  -neck);
        c.moveTo(-w * .22, neck);
        c.lineTo(w * .22,  neck);
        c.stroke();

        /* les parois du verre */
        c.shadowBlur  = 0;
        c.globalAlpha = .55;
        c.strokeStyle = "#9fb4e8";
        c.lineWidth   = r * .05;

        [-1, 1].forEach(sg => {
            c.beginPath();
            c.moveTo(sg * w * .78, -h * .92);
            c.lineTo(sg * w * .2,  -neck);
            c.lineTo(sg * w * .2,   neck);
            c.lineTo(sg * w * .78,  h * .92);
            c.stroke();
        });

        /* le reflet vertical sur le verre */
        c.globalAlpha = .3;
        c.fillStyle   = "#e8f0ff";
        c.fillRect(-w * .58, -h * .85, w * .1, h * 1.7);

        c.globalAlpha = 1;

        return;

    }


    /* ---------- KINTSUGI : la ceramique reparee a l'or ---------- */
    if(e === "kintsugi"){

        /* la porcelaine : un blanc casse, tres legerement vert */
        const glaze = c.createLinearGradient(-w * .5, -h, w * .5, h);
        glaze.addColorStop(0,   "#fdfbf6");
        glaze.addColorStop(.55, "#eee9df");
        glaze.addColorStop(1,   "#cfd6cd");

        c.fillStyle = glaze;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* le tressaillage : le fin craquelé du vernis */
        c.globalAlpha = .16;
        c.strokeStyle = "#7a8a86";
        c.lineWidth   = Math.max(.6, r * .012);

        for(let i = 0; i < 16; i++){

            const a = i * .393 + .2;

            c.beginPath();
            c.moveTo(Math.cos(a) * r * .15, Math.sin(a) * r * .15);

            for(let k = 1; k <= 3; k++){
                const kk = k / 3;
                c.lineTo(
                    Math.cos(a + Math.sin(k * 3.1 + i) * .5) * r * kk * 1.3,
                    Math.sin(a + Math.sin(k * 3.1 + i) * .5) * r * kk * 1.3
                );
            }

            c.stroke();

        }

        c.globalAlpha = 1;

        /*
        Les brisures : cinq veines d'or qui partent du centre.
        Elles sont toujours au meme endroit — c'est une cassure,
        pas une animation.
        */
        const seams = [
            {a:-1.9, w:1.00},
            {a:-.55, w:.86},
            {a: .75, w:.94},
            {a: 2.1, w:.78},
            {a: 3.4, w:.90}
        ];

        for(const sm of seams){

            /* l'ombre de la fissure, sous l'or */
            c.strokeStyle = "rgba(90,80,60,.35)";
            c.lineWidth   = r * .085;
            c.lineCap     = "round";
            c.lineJoin    = "round";

            const draw = function(){

                c.beginPath();
                c.moveTo(0, 0);

                for(let k = 1; k <= 5; k++){
                    const kk = k / 5;
                    const aa = sm.a + Math.sin(k * 2.2 + sm.a * 3) * .28;
                    c.lineTo(
                        Math.cos(aa) * r * kk * 1.35 * sm.w,
                        Math.sin(aa) * r * kk * 1.35 * sm.w
                    );
                }

                c.stroke();

            };

            draw();

            /* l'or, par-dessus, un peu plus fin */
            const gold = c.createLinearGradient(
                0, 0,
                Math.cos(sm.a) * r * 1.3,
                Math.sin(sm.a) * r * 1.3
            );
            gold.addColorStop(0,   "#fff3c4");
            gold.addColorStop(.45, "#e8b53d");
            gold.addColorStop(1,   "#a8761a");

            c.strokeStyle = gold;
            c.lineWidth   = r * .055;
            c.shadowColor = "#ffd76a";
            c.shadowBlur  = 12;

            draw();

            c.shadowBlur = 0;

            /* le liseré clair qui court sur l'arete de l'or */
            c.strokeStyle = "rgba(255,250,220,.75)";
            c.lineWidth   = r * .018;

            draw();

        }

        /* les eclats de feuille d'or laisses par le potier */
        for(let i = 0; i < 9; i++){

            const a  = i * 1.4 + .6;
            const rr = (.35 + (i % 4) * .2) * r;

            c.globalAlpha = .5 + .4 * Math.sin(t * 1.5 + i);
            c.fillStyle   = "#f0c44d";

            c.save();
            c.translate(Math.cos(a) * rr, Math.sin(a * 1.2) * rr * .85);
            c.rotate(a);

            c.beginPath();
            c.moveTo(-r * .035, 0);
            c.lineTo(0, -r * .022);
            c.lineTo(r * .035, 0);
            c.lineTo(0, r * .022);
            c.closePath();
            c.fill();

            c.restore();

        }

        /* le vernis : une nappe de lumiere qui glisse */
        c.globalAlpha = 1;

        const sx = Math.sin(t * .55) * w * .55;

        const sheen = c.createLinearGradient(sx - w * .35, -h, sx + w * .35, h);
        sheen.addColorStop(0,  "rgba(255,255,255,0)");
        sheen.addColorStop(.5, "rgba(255,255,255,.35)");
        sheen.addColorStop(1,  "rgba(255,255,255,0)");

        c.fillStyle = sheen;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        return;

    }

    /* ---------- NÉANT : le vide et son oeil ---------- */
    if(e === "neant"){

        /* le fond : le vide absolu */
        c.fillStyle = "#0a0416";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* la nebuleuse au centre */
        const neb = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.2);
        neb.addColorStop(0,   "rgba(150,80,255,.55)");
        neb.addColorStop(.55, "rgba(80,30,150,.22)");
        neb.addColorStop(1,   "rgba(20,5,40,0)");

        c.fillStyle = neb;
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* les etoiles prises dedans */
        for(let i = 0; i < 22; i++){

            const a  = i * 2.39 + t * .12;
            const rr = (.2 + (i % 7) * .13) * r * 1.5;

            c.globalAlpha = .35 + .55 * Math.sin(t * 2 + i);
            c.fillStyle   = i % 4 ? "#ffffff" : "#d8b0ff";

            c.beginPath();
            c.arc(Math.cos(a) * rr, Math.sin(a * 1.2) * rr * .85, r * .028, 0, Math.PI * 2);
            c.fill();

        }

        /* les fissures dorees */
        c.globalAlpha = .85;
        c.strokeStyle = "#ffc65a";
        c.lineCap     = "round";
        c.shadowColor = "#ffb347";
        c.shadowBlur  = 10;

        for(let i = 0; i < 5; i++){

            const a = i * 1.257 + .4;

            c.lineWidth = r * (.05 - i * .006);

            c.beginPath();
            c.moveTo(Math.cos(a) * r * .3, Math.sin(a) * r * .3);

            for(let k = 1; k <= 4; k++){
                const kk = k / 4;
                c.lineTo(
                    Math.cos(a + Math.sin(k * 2.3 + i) * .4) * r * (.3 + kk * .9),
                    Math.sin(a + Math.sin(k * 2.3 + i) * .4) * r * (.3 + kk * .9)
                );
            }

            c.stroke();

        }

        c.shadowBlur = 0;

        /* l'oeil, au centre : c'est lui la signature */
        const gx = Math.sin(t * .7) * w * .12 + (f.eyeX || 0) * w * .10;
        const gy = -h * .16 + Math.cos(t * .5) * h * .05 + (f.eyeY || 0) * r * .06;

        const iris = c.createRadialGradient(gx, gy, r * .05, gx, gy, r * .52);
        iris.addColorStop(0,   "#fff4c2");
        iris.addColorStop(.30, "#ffc65a");
        iris.addColorStop(.70, "#a24bff");
        iris.addColorStop(1,   "#180630");

        c.globalAlpha = 1;
        c.fillStyle   = iris;
        c.shadowColor = "#c86aff";
        c.shadowBlur  = 22;

        c.beginPath();
        c.arc(gx, gy, r * .52, 0, Math.PI * 2);
        c.fill();

        c.shadowBlur = 0;

        /* la pupille en fente, qui se resserre quand il fonce */
        c.fillStyle = "#08010f";
        c.beginPath();
        c.ellipse(gx, gy, r * (.14 - (f.speed || 0) * .06), r * .45, 0, 0, Math.PI * 2);
        c.fill();

        /* le reflet */
        c.globalAlpha = .85;
        c.fillStyle   = "#ffffff";
        c.beginPath();
        c.ellipse(gx - r * .17, gy - r * .22, r * .09, r * .055, -.5, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 1;

        return;

    }

    /* ---------- ABYSSAL : la creature des profondeurs ---------- */
    if(e === "abyssal"){

        /* l'eau profonde */
        c.fillStyle = "#0a3a56";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* les courants */
        c.strokeStyle = "#1d6d92";
        c.lineWidth   = r * .09;
        c.lineCap     = "round";
        c.globalAlpha = .8;

        for(let i = 0; i < 4; i++){

            c.beginPath();

            for(let k = 0; k <= 12; k++){
                const kk = k / 12;
                c.lineTo(
                    -w + kk * w * 2,
                    (i - 1.5) * h * .45 + Math.sin(t * 1.2 + i + kk * 4) * h * .12
                );
            }

            c.stroke();

        }

        /* le banc de plancton lumineux */
        for(let i = 0; i < 16; i++){

            const a  = i * 2.39 + t * .5;
            const rr = (.25 + (i % 5) * .17) * r;

            c.globalAlpha = .4 + .5 * Math.sin(t * 3 + i);
            c.fillStyle   = i % 3 ? "#5fe8ff" : "#7bffca";

            c.beginPath();
            c.arc(Math.cos(a) * rr * 1.6, Math.sin(a * 1.3) * rr * 1.4, r * .045, 0, Math.PI * 2);
            c.fill();

        }

        /* les tentacules qui pendent */
        c.globalAlpha = .85;
        c.strokeStyle = "#2a90b8";
        c.lineWidth   = r * .075;

        for(let i = 0; i < 5; i++){

            const bx = (i - 2) * w * .34;

            c.beginPath();
            c.moveTo(bx, h * .1);

            for(let k = 1; k <= 5; k++){
                const kk = k / 5;
                c.lineTo(bx + Math.sin(t * 2.4 + i + kk * 3) * w * .14, h * (.1 + kk * .95));
            }

            c.stroke();

        }

        /* le leurre : une petite lanterne au-dessus */
        const lx = Math.sin(t * 1.1) * w * .22;
        const ly = -h * 1.02 + Math.sin(t * 1.7) * h * .06;

        c.globalAlpha = .9;
        c.strokeStyle = "#0d3145";
        c.lineWidth   = r * .06;

        c.beginPath();
        c.moveTo(-w * .1, -h * .55);
        c.quadraticCurveTo(0, -h * .95, lx, ly);
        c.stroke();

        const g = c.createRadialGradient(lx, ly, 0, lx, ly, r * .55);
        g.addColorStop(0,   "rgba(255,255,255,.95)");
        g.addColorStop(.35, "rgba(95,232,255,.6)");
        g.addColorStop(1,   "rgba(95,232,255,0)");

        c.globalAlpha = 1;
        c.fillStyle   = g;

        c.beginPath();
        c.arc(lx, ly, r * .55, 0, Math.PI * 2);
        c.fill();

        return;

    }

    /* ---------- NOVA : l'etoile qui explose ---------- */
    if(e === "nova"){

        c.fillStyle = "#2a0a06";
        c.fillRect(-w * 1.3, -h * 1.4, w * 2.6, h * 2.8);

        /* les ondes de choc */
        for(let i = 0; i < 3; i++){

            const kk = (t * .55 + i / 3) % 1;

            c.globalAlpha = (1 - kk) * .8;
            c.strokeStyle = "#ffb347";
            c.lineWidth   = r * .07 * (1 - kk);

            c.beginPath();
            c.arc(0, 0, kk * r * 1.5, 0, Math.PI * 2);
            c.stroke();

        }

        /* les rayons */
        c.lineCap = "round";

        for(let i = 0; i < 6; i++){

            const a  = i * Math.PI / 3 + t * .4;
            const rr = r * (.85 + Math.sin(t * 3 + i) * .25);

            const gr = c.createLinearGradient(0, 0, Math.cos(a) * rr, Math.sin(a) * rr);
            gr.addColorStop(0, "rgba(255,233,168,.7)");
            gr.addColorStop(1, "rgba(255,150,50,0)");

            c.globalAlpha = .8;
            c.strokeStyle = gr;
            c.lineWidth   = r * .10;

            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            c.stroke();

        }

        /* le coeur incandescent */
        const g = c.createRadialGradient(0, 0, 0, 0, 0, r * .55);
        g.addColorStop(0,  "#fffdf2");
        g.addColorStop(.4, "#ffd76a");
        g.addColorStop(1,  "rgba(255,120,40,0)");

        c.globalAlpha = 1;
        c.fillStyle   = g;

        c.beginPath();
        c.arc(0, 0, r * .55, 0, Math.PI * 2);
        c.fill();

        return;

    }



    /* =====================================================
       LES 30 MOTIFS DE LA VAGUE 9

       Regle de dessin : peu de formes, mais nettes. Un motif
       lisible de loin bat toujours un motif charge qui bave
       une fois reduit a 30 pixels sur un telephone.
    ===================================================== */

    /* ---------- DAMIER : l'echiquier penche ---------- */
    if(e === "damier"){

        c.save();
        c.rotate(.42);

        const s = w * .33;

        c.globalAlpha = .92;
        c.fillStyle   = skin.color2;

        for(let i = -5; i <= 5; i++){
            for(let j = -5; j <= 5; j++){
                if(((i + j) & 1) === 0){ continue; }
                c.fillRect(i * s, j * s, s, s);
            }
        }

        c.restore();
        c.globalAlpha = 1;

        return;

    }

    /* ---------- ZEBRE : rayures franches et effilees ---------- */
    if(e === "zebre"){

        c.globalAlpha = .95;
        c.fillStyle   = skin.color2;

        for(let i = 0; i < 6; i++){

            const x  = -w * 1.25 + i * w * .50;
            const ep = w * (.13 + Math.sin(i * 1.9) * .05);
            const pn = (i & 1) ? .22 : -.18;

            c.beginPath();
            c.moveTo(x - ep, -h * 1.5);
            c.quadraticCurveTo(x + pn * w, 0, x - ep * .2, h * 1.5);
            c.lineTo(x + ep * 1.5, h * 1.5);
            c.quadraticCurveTo(x + pn * w + ep * 1.7, 0, x + ep, -h * 1.5);
            c.closePath();
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- LEOPARD : rosettes, pas de simples taches ---------- */
    if(e === "leopard"){

        for(let i = 0; i < 13; i++){

            const px = Math.sin(i * 2.7 + 1.1) * w * .78;
            const py = Math.cos(i * 1.9 + .4) * h * .72;
            const sz = r * (.11 + (i % 3) * .026);

            /* l'anneau sombre */
            c.globalAlpha = .82;
            c.fillStyle   = skin.color2;
            c.beginPath();
            c.ellipse(px, py, sz, sz * .82, i * .7, 0, Math.PI * 2);
            c.fill();

            /* le coeur plus clair : c'est lui qui fait la rosette */
            c.globalAlpha = .55;
            c.fillStyle   = "#c98a3a";
            c.beginPath();
            c.ellipse(px + sz * .12, py - sz * .05, sz * .52, sz * .44, i * .7, 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- MENTHE : pepites de chocolat dans la glace ---------- */
    if(e === "menthe"){

        /* la creme, un peu plus claire au centre */
        c.globalAlpha = .35;
        c.fillStyle   = "#d8fff0";
        c.beginPath();
        c.ellipse(-w * .1, -h * .1, w * .8, h * .7, .3, 0, Math.PI * 2);
        c.fill();

        /* les pepites */
        c.globalAlpha = .95;
        c.fillStyle   = "#241108";

        for(let i = 0; i < 14; i++){

            const px = Math.sin(i * 3.1 + .6) * w * .8;
            const py = Math.cos(i * 2.3 + 1.4) * h * .78;
            const sz = r * (.07 + (i % 3) * .02);

            c.save();
            c.translate(px, py);
            c.rotate(i * .9);
            c.beginPath();
            c.moveTo(-sz, -sz * .6);
            c.lineTo(sz, -sz * .8);
            c.lineTo(sz * .7, sz * .7);
            c.lineTo(-sz * .8, sz * .5);
            c.closePath();
            c.fill();
            c.restore();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CITRON : la tranche d'agrume ---------- */
    if(e === "citron"){

        /* les quartiers */
        for(let i = 0; i < 8; i++){

            const a0 = i * Math.PI / 4 + .11;
            const a1 = a0 + Math.PI / 4 - .22;

            c.globalAlpha = .92;
            c.fillStyle   = (i & 1) ? "#ffe07a" : "#ffd23a";

            c.beginPath();
            c.moveTo(0, 0);
            c.arc(0, 0, r * .82, a0, a1);
            c.closePath();
            c.fill();

        }

        /* la membrane blanche */
        c.globalAlpha = .9;
        c.strokeStyle = "#fffbe8";
        c.lineWidth   = Math.max(1, r * .045);

        for(let i = 0; i < 8; i++){
            const a = i * Math.PI / 4;
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(Math.cos(a) * r * .84, Math.sin(a) * r * .84);
            c.stroke();
        }

        /* l'ecorce */
        c.globalAlpha = 1;
        c.strokeStyle = "#fff4c8";
        c.lineWidth   = r * .09;
        c.beginPath();
        c.arc(0, 0, r * .86, 0, Math.PI * 2);
        c.stroke();

        c.strokeStyle = skin.color2;
        c.lineWidth   = r * .07;
        c.beginPath();
        c.arc(0, 0, r * .95, 0, Math.PI * 2);
        c.stroke();

        return;

    }

    /* ---------- CARAMEL : le filet de sauce ---------- */
    if(e === "caramel"){

        /* la creme du fond */
        c.globalAlpha = 1;
        c.fillStyle   = "#f7e6c6";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        c.globalAlpha = .35;
        c.fillStyle   = "#e0c79a";
        c.beginPath();
        c.ellipse(0, h * .55, w * 1.1, h * .6, 0, 0, Math.PI * 2);
        c.fill();

        /* les rubans de caramel, en diagonale */
        c.globalAlpha = 1;
        c.lineCap  = "round";
        c.lineJoin = "round";

        for(let i = 0; i < 4; i++){

            const y0 = -h * .95 + i * h * .55;

            const ru = c.createLinearGradient(-w, y0 - h * .1, w, y0 + h * .1);
            ru.addColorStop(0,  "#b3600f");
            ru.addColorStop(.5, "#e08a22");
            ru.addColorStop(1,  "#8a4a0a");

            c.strokeStyle = ru;
            c.lineWidth   = r * (.14 - (i & 1) * .035);

            c.beginPath();
            c.moveTo(-w * 1.4, y0);

            for(let k = 1; k <= 4; k++){
                c.quadraticCurveTo(
                    -w * 1.4 + (k - .5) * w * .7, y0 + Math.sin(k * 2.1 + i * 1.6) * h * .30,
                    -w * 1.4 + k * w * .7,        y0 + Math.sin(k * 1.6 + i) * h * .16
                );
            }

            c.stroke();

            /* le reflet sur le ruban */
            c.globalAlpha = .4;
            c.strokeStyle = "#ffd9a0";
            c.lineWidth   = r * .03;
            c.stroke();
            c.globalAlpha = 1;

        }

        /* deux gouttes qui perlent */
        c.fillStyle = "#c9761c";

        for(let i = 0; i < 2; i++){
            const px = (i ? .48 : -.55) * w;
            const py = (i ? .78 : .62) * h + Math.sin(t * 1.2 + i) * h * .03;
            c.beginPath();
            c.ellipse(px, py, r * .07, r * .09, 0, 0, Math.PI * 2);
            c.fill();
        }

        return;

    }

    /* ---------- BOULE A NEIGE : les flocons tombent ---------- */
    if(e === "neige"){

        /* le voile froid du fond */
        c.globalAlpha = .28;
        c.fillStyle   = "#9fd0ff";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* la congere du bas */
        c.globalAlpha = .95;
        c.fillStyle   = "#ffffff";
        c.beginPath();
        c.moveTo(-w * 1.4, h * 1.5);
        c.lineTo(-w * 1.4, h * .42);

        for(let k = 0; k <= 6; k++){
            c.lineTo(-w * 1.4 + k * w * .467, h * (.42 + Math.sin(k * 1.7) * .09));
        }

        c.lineTo(w * 1.4, h * 1.5);
        c.closePath();
        c.fill();

        /* les flocons */
        c.fillStyle = "#ffffff";

        for(let i = 0; i < 16; i++){

            const px = Math.sin(i * 2.9) * w * .95 + Math.sin(t * .7 + i) * w * .07;
            const py = ((i / 16 * 2.4 + t * .14) % 1.9 - .95) * h * 1.2;
            const sz = r * (.035 + (i % 3) * .015);

            c.globalAlpha = .55 + (i % 3) * .15;
            c.beginPath();
            c.arc(px, py, sz, 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CIBLE : les anneaux du stand de tir ---------- */
    if(e === "cible"){

        for(let i = 5; i >= 1; i--){

            c.globalAlpha = .92;
            c.fillStyle   = (i & 1) ? "#f4f4f4" : skin.color2;

            c.beginPath();
            c.arc(0, 0, r * i * .21, 0, Math.PI * 2);
            c.fill();

        }

        /* la mire, qui respire */
        const mire = r * (.42 + Math.sin(t * 1.6) * .05);

        c.globalAlpha = .85;
        c.strokeStyle = "#ffffff";
        c.lineWidth   = Math.max(1, r * .035);
        c.lineCap     = "round";

        for(let k = 0; k < 4; k++){
            const a = k * Math.PI / 2;
            c.beginPath();
            c.moveTo(Math.cos(a) * mire * .55, Math.sin(a) * mire * .55);
            c.lineTo(Math.cos(a) * mire, Math.sin(a) * mire);
            c.stroke();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- POIS : la grille de pastilles ---------- */
    if(e === "pois"){

        for(let i = -3; i <= 3; i++){
            for(let j = -3; j <= 3; j++){

                const px = i * w * .42 + (j & 1 ? w * .21 : 0);
                const py = j * h * .40;
                const sz = r * (.11 + Math.sin(i * 1.3 + j * .9) * .022);

                c.globalAlpha = .9;
                c.fillStyle   = "#fdf6e8";
                c.beginPath();
                c.arc(px, py, sz, 0, Math.PI * 2);
                c.fill();

                c.globalAlpha = .35;
                c.fillStyle   = skin.color2;
                c.beginPath();
                c.arc(px + sz * .18, py + sz * .18, sz * .55, 0, Math.PI * 2);
                c.fill();

            }
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- VAGUE : trois rouleaux empiles ---------- */
    if(e === "vague"){

        const tons = ["#2f7fc0", "#1c568f", "#0d3766"];

        for(let n = 0; n < 3; n++){

            const y = h * (-.05 + n * .34);

            c.globalAlpha = .95;
            c.fillStyle   = tons[n];

            c.beginPath();
            c.moveTo(-w * 1.4, h * 1.6);
            c.lineTo(-w * 1.4, y);

            for(let k = 0; k <= 8; k++){
                c.lineTo(
                    -w * 1.4 + k * w * .35,
                    y + Math.sin(k * .85 + t * .9 + n * 1.4) * h * .10
                );
            }

            c.lineTo(w * 1.4, h * 1.6);
            c.closePath();
            c.fill();

            /* l'ecume sur la crete */
            c.globalAlpha = .7;
            c.fillStyle   = "#eaf8ff";

            for(let k = 0; k <= 8; k += 2){
                const px = -w * 1.4 + k * w * .35;
                const py = y + Math.sin(k * .85 + t * .9 + n * 1.4) * h * .10;
                c.beginPath();
                c.arc(px, py, r * .045, 0, Math.PI * 2);
                c.fill();
            }

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CIRCUIT : les pistes de la carte mere ---------- */
    if(e === "circuit"){

        c.globalAlpha = 1;
        c.fillStyle   = "#06282a";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        const pas = w * .30;

        c.strokeStyle = skin.color;
        c.lineWidth   = Math.max(1, r * .035);
        c.lineCap     = "round";
        c.lineJoin    = "round";
        c.globalAlpha = .85;

        c.shadowBlur  = r * .30;
        c.shadowColor = skin.color;

        for(let i = 0; i < 6; i++){

            const y = -h * 1.1 + i * h * .44;
            const d = (i & 1) ? 1 : -1;

            c.beginPath();
            c.moveTo(-w * 1.4, y);
            c.lineTo(-w * .5 + (i % 3) * pas, y);
            c.lineTo(-w * .5 + (i % 3) * pas + d * pas, y + d * pas);
            c.lineTo(w * 1.4, y + d * pas);
            c.stroke();

        }

        /* les pastilles de soudure, qui clignotent */
        for(let i = 0; i < 7; i++){

            const px = Math.sin(i * 2.4) * w * .8;
            const py = -h * 1.0 + (i % 6) * h * .40;

            c.globalAlpha = .5 + Math.abs(Math.sin(t * 1.8 + i * 1.1)) * .5;
            c.fillStyle   = "#c8fff0";

            c.beginPath();
            c.arc(px, py, r * .055, 0, Math.PI * 2);
            c.fill();

        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- SYNTHWAVE : le soleil et la grille ---------- */
    if(e === "synth"){

        /* le ciel */
        const ciel = c.createLinearGradient(0, -h * 1.4, 0, h * .1);
        ciel.addColorStop(0,  "#2a0a5a");
        ciel.addColorStop(.6, "#7a1a8a");
        ciel.addColorStop(1,  "#ff5fa8");

        c.globalAlpha = 1;
        c.fillStyle   = ciel;
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 1.6);

        /* le soleil, tranche de bandes */
        c.save();
        c.beginPath();
        c.arc(0, -h * .28, r * .62, 0, Math.PI * 2);
        c.clip();

        const sol = c.createLinearGradient(0, -h * .9, 0, h * .35);
        sol.addColorStop(0,  "#fff06a");
        sol.addColorStop(.5, "#ff9a3a");
        sol.addColorStop(1,  "#ff2f8f");

        c.fillStyle = sol;
        c.fillRect(-w, -h, w * 2, h * 2);

        c.fillStyle = "#2a0a5a";

        for(let i = 0; i < 5; i++){
            c.fillRect(-w, -h * .12 + i * h * .17, w * 2, h * (.03 + i * .012));
        }

        c.restore();

        /* la grille en perspective */
        c.globalAlpha = .9;
        c.strokeStyle = "#5fe8ff";
        c.lineWidth   = Math.max(1, r * .028);

        c.shadowBlur  = r * .22;
        c.shadowColor = "#5fe8ff";

        for(let i = 1; i <= 5; i++){
            const y = h * .10 + i * i * h * .055;
            c.beginPath();
            c.moveTo(-w * 1.4, y);
            c.lineTo(w * 1.4, y);
            c.stroke();
        }

        for(let i = -4; i <= 4; i++){
            c.beginPath();
            c.moveTo(i * w * .10, h * .10);
            c.lineTo(i * w * .62, h * 1.6);
            c.stroke();
        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- CAMO : les taches de treillis ---------- */
    if(e === "camo"){

        const tons = ["#4a5a2c", "#6f8046", "#2c3a1c", "#8f9a68"];

        for(let i = 0; i < 16; i++){

            const px = Math.sin(i * 2.7 + .8) * w * .95;
            const py = Math.cos(i * 1.9 + 1.6) * h * .9;
            const sz = r * (.20 + (i % 4) * .06);

            c.globalAlpha = .92;
            c.fillStyle   = tons[i % 4];

            c.beginPath();

            for(let k = 0; k <= 7; k++){
                const a = k / 7 * Math.PI * 2;
                const d = sz * (.7 + Math.abs(Math.sin(k * 2.1 + i)) * .6);
                const x = px + Math.cos(a) * d;
                const y = py + Math.sin(a) * d * .8;
                if(k === 0){ c.moveTo(x, y); }else{ c.lineTo(x, y); }
            }

            c.closePath();
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- TIGRE : les rayures qui remontent ---------- */
    if(e === "tigre"){

        /* le ventre plus clair */
        c.globalAlpha = .5;
        c.fillStyle   = "#ffd8a0";
        c.beginPath();
        c.ellipse(0, h * .42, w * .62, h * .48, 0, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = .95;
        c.fillStyle   = "#1a0e06";

        for(let i = 0; i < 9; i++){

            const cote = i & 1 ? 1 : -1;
            const y    = -h * .95 + Math.floor(i / 2) * h * .42 + (cote > 0 ? h * .19 : 0);
            const lon  = w * (.55 + Math.sin(i * 1.6) * .22);

            c.beginPath();
            c.moveTo(cote * w * 1.2, y);
            c.quadraticCurveTo(cote * (w * 1.2 - lon * .5), y + h * .10, cote * (w * 1.2 - lon), y + h * .04);
            c.quadraticCurveTo(cote * (w * 1.2 - lon * .5), y + h * .18, cote * w * 1.2, y + h * .17);
            c.closePath();
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- MARBRE : les veines dans la pierre ---------- */
    if(e === "marbre"){

        const pierre = c.createLinearGradient(-w, -h, w, h);
        pierre.addColorStop(0,   "#ffffff");
        pierre.addColorStop(.55, "#eceae4");
        pierre.addColorStop(1,   "#c9c6bf");

        c.globalAlpha = 1;
        c.fillStyle   = pierre;
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        c.lineCap = "round";

        for(let i = 0; i < 7; i++){

            const y0 = -h * 1.2 + i * h * .40;

            c.globalAlpha = (i === 2 || i === 5) ? .95 : .55;
            c.strokeStyle = (i === 2 || i === 5) ? "#c9a13a" : "#6f757d";
            c.lineWidth   = Math.max(1.2, r * ((i === 2 || i === 5) ? .050 : .034));

            c.beginPath();
            c.moveTo(-w * 1.4, y0);

            for(let k = 1; k <= 5; k++){
                c.quadraticCurveTo(
                    -w * 1.4 + (k - .5) * w * .56, y0 + Math.sin(k * 2.3 + i * 1.7) * h * .22,
                    -w * 1.4 + k * w * .56,        y0 + Math.sin(k * 1.9 + i) * h * .14
                );
            }

            c.stroke();

            /* les ramifications fines */
            c.globalAlpha = .38;
            c.lineWidth   = Math.max(.8, r * .018);

            for(let k = 0; k < 3; k++){
                const px = -w * .9 + k * w * .8;
                c.beginPath();
                c.moveTo(px, y0);
                c.lineTo(px + w * .22, y0 + h * (i & 1 ? .2 : -.2));
                c.stroke();
            }

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- DENIM : la toile et sa couture ---------- */
    if(e === "denim"){

        c.globalAlpha = 1;
        c.fillStyle   = "#3f6ba8";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* le tissage en diagonale */
        c.globalAlpha = .30;
        c.strokeStyle = "#12233c";
        c.lineWidth   = Math.max(1, r * .022);

        for(let i = -10; i <= 10; i++){
            c.beginPath();
            c.moveTo(i * w * .16 - w, -h * 1.5);
            c.lineTo(i * w * .16 + w, h * 1.5);
            c.stroke();
        }

        c.globalAlpha = .16;
        c.strokeStyle = "#a8c8e8";
        c.lineWidth   = Math.max(.8, r * .014);

        for(let i = -10; i <= 10; i++){
            c.beginPath();
            c.moveTo(i * w * .16 - w, h * 1.5);
            c.lineTo(i * w * .16 + w, -h * 1.5);
            c.stroke();
        }

        /* l'usure claire au centre */
        c.globalAlpha = .22;
        c.fillStyle   = "#a8c8e8";
        c.beginPath();
        c.ellipse(-w * .1, 0, w * .55, h * .62, .2, 0, Math.PI * 2);
        c.fill();

        /* la couture orange */
        c.globalAlpha = .95;
        c.strokeStyle = "#ffb43a";
        c.lineWidth   = Math.max(1, r * .03);
        c.setLineDash([r * .09, r * .07]);

        c.beginPath();
        c.moveTo(-w * .95, -h * .18);
        c.quadraticCurveTo(0, h * .16, w * .95, -h * .18);
        c.stroke();

        c.beginPath();
        c.moveTo(-w * .95, -h * .05);
        c.quadraticCurveTo(0, h * .29, w * .95, -h * .05);
        c.stroke();

        c.setLineDash([]);

        /* le rivet */
        c.globalAlpha = 1;
        c.fillStyle   = "#d8c07a";
        c.beginPath();
        c.arc(w * .62, h * .05, r * .055, 0, Math.PI * 2);
        c.fill();

        return;

    }

    /* ---------- BRIQUE : les plots emboitables ---------- */
    if(e === "brique"){

        for(let i = -2; i <= 2; i++){
            for(let j = -2; j <= 2; j++){

                const px = i * w * .48;
                const py = j * h * .46;
                const sz = r * .16;

                /* l'ombre du plot */
                c.globalAlpha = .30;
                c.fillStyle   = "#000000";
                c.beginPath();
                c.ellipse(px, py + sz * .30, sz, sz * .82, 0, 0, Math.PI * 2);
                c.fill();

                /* le plot */
                c.globalAlpha = .95;
                c.fillStyle   = skin.color;
                c.beginPath();
                c.ellipse(px, py, sz, sz * .82, 0, 0, Math.PI * 2);
                c.fill();

                /* le liseret clair */
                c.globalAlpha = .55;
                c.strokeStyle = "#ffd0d0";
                c.lineWidth   = Math.max(1, r * .02);
                c.beginPath();
                c.ellipse(px, py - sz * .10, sz * .68, sz * .52, 0, Math.PI * 1.05, Math.PI * 1.95);
                c.stroke();

            }
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- FOOTBALL : les panneaux cousus ---------- */
    if(e === "foot"){

        c.globalAlpha = 1;
        c.fillStyle   = "#f6f6f6";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        c.fillStyle   = "#1a1a1a";
        c.strokeStyle = "#1a1a1a";
        c.lineWidth   = Math.max(1, r * .025);
        c.lineJoin    = "round";

        /* le pentagone central */
        c.beginPath();

        for(let k = 0; k < 5; k++){
            const a = -Math.PI / 2 + k * Math.PI * 2 / 5;
            const x = Math.cos(a) * r * .34;
            const y = Math.sin(a) * r * .34;
            if(k === 0){ c.moveTo(x, y); }else{ c.lineTo(x, y); }
        }

        c.closePath();
        c.fill();

        /* les pentagones autour */
        for(let i = 0; i < 5; i++){

            const ang = -Math.PI / 2 + i * Math.PI * 2 / 5 + Math.PI / 5;
            const cx  = Math.cos(ang) * r * 1.00;
            const cy  = Math.sin(ang) * r * 1.00;

            c.beginPath();

            for(let k = 0; k < 5; k++){
                const a = ang + k * Math.PI * 2 / 5;
                const x = cx + Math.cos(a) * r * .26;
                const y = cy + Math.sin(a) * r * .26;
                if(k === 0){ c.moveTo(x, y); }else{ c.lineTo(x, y); }
            }

            c.closePath();
            c.fill();

        }

        /* les coutures */
        c.globalAlpha = .35;
        c.strokeStyle = "#9aa0a8";

        for(let i = 0; i < 5; i++){
            const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
            c.beginPath();
            c.moveTo(Math.cos(a) * r * .34, Math.sin(a) * r * .34);
            c.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
            c.stroke();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- CASSETTE : les bobines tournent ---------- */
    if(e === "cassette"){

        c.globalAlpha = 1;
        c.fillStyle   = "#2a2420";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* l'etiquette */
        c.fillStyle = "#f0e6cc";
        c.fillRect(-w * .95, -h * .78, w * 1.9, h * .46);

        c.fillStyle = "#e05a3a";
        c.fillRect(-w * .95, -h * .78, w * 1.9, h * .10);

        c.fillStyle = "#3a8ac0";
        c.fillRect(-w * .95, -h * .68, w * 1.9, h * .06);

        c.globalAlpha = .5;
        c.strokeStyle = "#8a7a58";
        c.lineWidth   = Math.max(1, r * .018);

        for(let i = 0; i < 2; i++){
            c.beginPath();
            c.moveTo(-w * .82, -h * .52 + i * h * .13);
            c.lineTo(w * (i === 1 ? .20 : .82), -h * .52 + i * h * .13);
            c.stroke();
        }

        /* la fenetre des bobines */
        c.globalAlpha = 1;
        c.fillStyle   = "#0f0d0c";
        c.fillRect(-w * .95, -h * .10, w * 1.9, h * .78);

        for(let n = 0; n < 2; n++){

            const cx = (n ? 1 : -1) * w * .44;
            const cy = h * .29;
            const rr = r * .27;

            c.fillStyle = "#d8ccb0";
            c.beginPath();
            c.arc(cx, cy, rr, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#3a3028";
            c.beginPath();
            c.arc(cx, cy, rr * .42, 0, Math.PI * 2);
            c.fill();

            /* les dents qui tournent */
            c.strokeStyle = "#3a3028";
            c.lineWidth   = Math.max(1, r * .03);

            for(let k = 0; k < 6; k++){
                const a = t * 1.6 * (n ? 1 : -1) + k * Math.PI / 3;
                c.beginPath();
                c.moveTo(cx + Math.cos(a) * rr * .42, cy + Math.sin(a) * rr * .42);
                c.lineTo(cx + Math.cos(a) * rr * .88, cy + Math.sin(a) * rr * .88);
                c.stroke();
            }

        }

        /* la bande magnetique */
        c.strokeStyle = "#5a4a3a";
        c.lineWidth   = Math.max(1, r * .05);
        c.beginPath();
        c.moveTo(-w * .44, h * .02);
        c.lineTo(w * .44, h * .02);
        c.stroke();

        return;

    }

    /* ---------- CARTE : les enseignes du jeu ---------- */
    if(e === "carte"){

        c.globalAlpha = 1;
        c.fillStyle   = "#fbfbf7";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* le cadre */
        c.strokeStyle = "#c9c0ac";
        c.lineWidth   = Math.max(1.5, r * .045);
        c.strokeRect(-w * .95, -h * 1.02, w * 1.90, h * 2.04);

        /* le coeur, au centre */
        const hs = r * .62;

        c.fillStyle = skin.color2;
        c.beginPath();
        c.moveTo(0, hs * .85);
        c.bezierCurveTo(-hs * 1.2, -hs * .10, -hs * .55, -hs * .95, 0, -hs * .30);
        c.bezierCurveTo(hs * .55, -hs * .95, hs * 1.2, -hs * .10, 0, hs * .85);
        c.closePath();
        c.fill();

        /* le pique, en haut a gauche */
        const ps = r * .20;

        c.fillStyle = "#1a1a1a";
        c.save();
        c.translate(-w * .60, -h * .58);
        c.beginPath();
        c.moveTo(0, -ps);
        c.bezierCurveTo(ps * 1.1, ps * .18, ps * .5, ps * .70, 0, ps * .32);
        c.bezierCurveTo(-ps * .5, ps * .70, -ps * 1.1, ps * .18, 0, -ps);
        c.closePath();
        c.fill();
        c.fillRect(-ps * .10, ps * .25, ps * .20, ps * .55);
        c.restore();

        /* le carreau, en bas a droite */
        c.fillStyle = skin.color2;
        c.save();
        c.translate(w * .60, h * .58);
        c.beginPath();
        c.moveTo(0, -ps);
        c.lineTo(ps * .68, 0);
        c.lineTo(0, ps);
        c.lineTo(-ps * .68, 0);
        c.closePath();
        c.fill();
        c.restore();

        return;

    }

    /* ---------- BOUSSOLE : la rose des vents ---------- */
    if(e === "boussole"){

        c.globalAlpha = 1;
        c.fillStyle   = "#e8d8b0";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* le cadran */
        c.strokeStyle = "#4a3a20";
        c.lineWidth   = Math.max(1, r * .05);
        c.beginPath();
        c.arc(0, 0, r * .84, 0, Math.PI * 2);
        c.stroke();

        c.lineWidth = Math.max(1, r * .022);
        c.beginPath();
        c.arc(0, 0, r * .68, 0, Math.PI * 2);
        c.stroke();

        /* les graduations */
        for(let i = 0; i < 16; i++){
            const a = i * Math.PI / 8;
            const d = (i & 3) === 0 ? .58 : .64;
            c.beginPath();
            c.moveTo(Math.cos(a) * r * d, Math.sin(a) * r * d);
            c.lineTo(Math.cos(a) * r * .78, Math.sin(a) * r * .78);
            c.stroke();
        }

        /* l'etoile a quatre branches */
        for(let k = 0; k < 4; k++){

            const a = k * Math.PI / 2 - Math.PI / 2;

            c.fillStyle = (k & 1) ? "#8a6a38" : "#3a2c18";

            c.beginPath();
            c.moveTo(Math.cos(a) * r * .56, Math.sin(a) * r * .56);
            c.lineTo(Math.cos(a + .55) * r * .17, Math.sin(a + .55) * r * .17);
            c.lineTo(Math.cos(a - .55) * r * .17, Math.sin(a - .55) * r * .17);
            c.closePath();
            c.fill();

        }

        /* l'aiguille, qui cherche le nord */
        const na = t * .5 + Math.sin(t * 2.1) * .25;

        c.fillStyle = "#c02a2a";
        c.beginPath();
        c.moveTo(Math.cos(na) * r * .50, Math.sin(na) * r * .50);
        c.lineTo(Math.cos(na + 2.3) * r * .13, Math.sin(na + 2.3) * r * .13);
        c.lineTo(Math.cos(na - 2.3) * r * .13, Math.sin(na - 2.3) * r * .13);
        c.closePath();
        c.fill();

        c.fillStyle = "#2a2018";
        c.beginPath();
        c.arc(0, 0, r * .07, 0, Math.PI * 2);
        c.fill();

        return;

    }

    /* ---------- FLIPPER : les bumpers s'allument ---------- */
    if(e === "flipper"){

        c.globalAlpha = 1;
        c.fillStyle   = "#14204a";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* les rails */
        c.globalAlpha = .5;
        c.strokeStyle = "#5f7ac0";
        c.lineWidth   = Math.max(1, r * .025);

        for(let i = 0; i < 3; i++){
            c.beginPath();
            c.arc(0, h * 1.1, r * (.7 + i * .32), Math.PI * 1.12, Math.PI * 1.88);
            c.stroke();
        }

        /* les bumpers */
        const bump = [
            {x:-.48, y:-.42, col:"#ff4f8b"},
            {x: .46, y:-.30, col:"#3fd8ff"},
            {x:-.10, y: .30, col:"#ffd24a"}
        ];

        for(let i = 0; i < 3; i++){

            const b   = bump[i];
            const px  = b.x * w * 1.4;
            const py  = b.y * h * 1.4;
            const on  = .45 + Math.abs(Math.sin(t * 2.2 + i * 2.1)) * .55;

            c.globalAlpha = on;
            c.shadowBlur  = r * .35;
            c.shadowColor = b.col;

            c.fillStyle = b.col;
            c.beginPath();
            c.arc(px, py, r * .21, 0, Math.PI * 2);
            c.fill();

            c.shadowBlur = 0;

            c.globalAlpha = .9;
            c.fillStyle   = "#ffffff";
            c.beginPath();
            c.arc(px, py, r * .085, 0, Math.PI * 2);
            c.fill();

        }

        /* les petites lampes */
        for(let i = 0; i < 6; i++){
            const a = i * Math.PI / 3 + t * .4;
            c.globalAlpha = .3 + Math.abs(Math.sin(t * 3 + i)) * .6;
            c.fillStyle   = "#ffe89a";
            c.beginPath();
            c.arc(Math.cos(a) * w * .95, Math.sin(a) * h * .9, r * .04, 0, Math.PI * 2);
            c.fill();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- FOUDRE : l'orage enferme ---------- */
    if(e === "foudre"){

        c.globalAlpha = 1;

        const nuit = c.createLinearGradient(0, -h, 0, h);
        nuit.addColorStop(0, "#1c2a58");
        nuit.addColorStop(1, "#080e24");

        c.fillStyle = nuit;
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* l'eclair frappe par a-coups */
        const flash = Math.pow(Math.max(0, Math.sin(t * 2.4)), 6);

        if(flash > .02){
            c.globalAlpha = flash * .35;
            c.fillStyle   = "#cfe4ff";
            c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);
        }

        c.globalAlpha = .35 + flash * .3;
        c.strokeStyle = "#4f9aff";
        c.lineWidth   = Math.max(3, r * .20);
        c.lineCap     = "round";
        c.lineJoin    = "round";

        c.shadowBlur  = r * .5;
        c.shadowColor = "#7fc4ff";

        const zig = [
            [-.30, -1.05], [.12, -.42], [-.14, -.30], [.30, .35], [.02, .30], [-.18, 1.05]
        ];

        c.beginPath();

        for(let i = 0; i < zig.length; i++){
            const x = zig[i][0] * w * 1.3;
            const y = zig[i][1] * h;
            if(i === 0){ c.moveTo(x, y); }else{ c.lineTo(x, y); }
        }

        c.stroke();

        c.globalAlpha = .85 + flash * .15;
        c.strokeStyle = "#f4faff";
        c.lineWidth   = Math.max(2, r * .085);
        c.stroke();

        /* la branche secondaire */
        c.lineWidth = Math.max(1.5, r * .05);
        c.beginPath();
        c.moveTo(-.14 * w * 1.3, -.30 * h);
        c.lineTo(-.62 * w, .05 * h);
        c.lineTo(-.50 * w, .34 * h);
        c.stroke();

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- CRISTAL : les facettes taillees ---------- */
    if(e === "cristal"){

        const N = 9;

        for(let i = 0; i < N; i++){

            const a0 = i / N * Math.PI * 2;
            const a1 = (i + 1) / N * Math.PI * 2;
            const d  = 1.35;

            c.globalAlpha = .20 + ((i * 3) % 5) * .10;
            c.fillStyle   = (i & 1) ? "#ffffff" : "#7fd8ff";

            c.beginPath();
            c.moveTo(-w * .12, -h * .18);
            c.lineTo(Math.cos(a0) * w * d, Math.sin(a0) * h * d);
            c.lineTo(Math.cos(a1) * w * d, Math.sin(a1) * h * d);
            c.closePath();
            c.fill();

        }

        /* les aretes */
        c.globalAlpha = .5;
        c.strokeStyle = "#eaffff";
        c.lineWidth   = Math.max(1, r * .022);

        for(let i = 0; i < N; i++){
            const a = i / N * Math.PI * 2;
            c.beginPath();
            c.moveTo(-w * .12, -h * .18);
            c.lineTo(Math.cos(a) * w * 1.35, Math.sin(a) * h * 1.35);
            c.stroke();
        }

        /* l'eclat qui balaie la taille */
        const bx = Math.sin(t * .9) * w * .55;

        c.globalAlpha = .85;
        c.shadowBlur  = r * .4;
        c.shadowColor = "#ffffff";
        c.strokeStyle = "#ffffff";
        c.lineWidth   = Math.max(1, r * .028);
        c.lineCap     = "round";

        for(let k = 0; k < 2; k++){
            const s = r * (k ? .12 : .22);
            c.beginPath();
            c.moveTo(bx - s, -h * .30);
            c.lineTo(bx + s, -h * .30);
            c.moveTo(bx, -h * .30 - s);
            c.lineTo(bx, -h * .30 + s);
            c.stroke();
        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- SAKURA : la branche en fleurs ---------- */
    if(e === "sakura"){

        const ciel = c.createLinearGradient(0, -h, 0, h);
        ciel.addColorStop(0, "#ffd8e8");
        ciel.addColorStop(1, "#f0a8c4");

        c.globalAlpha = 1;
        c.fillStyle   = ciel;
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* la branche */
        c.strokeStyle = "#5a3a30";
        c.lineWidth   = Math.max(1, r * .06);
        c.lineCap     = "round";

        c.beginPath();
        c.moveTo(-w * 1.3, h * .55);
        c.quadraticCurveTo(-w * .3, h * .10, w * 1.3, -h * .30);
        c.stroke();

        c.lineWidth = Math.max(1, r * .032);
        c.beginPath();
        c.moveTo(-w * .35, h * .26);
        c.lineTo(-w * .05, -h * .18);
        c.moveTo(w * .45, -h * .04);
        c.lineTo(w * .30, -h * .48);
        c.stroke();

        /* les fleurs a cinq petales */
        const fleurs = [[-.62, .40], [-.08, -.20], [.32, -.50], [.78, -.16], [-1.02, .52], [.02, .12]];

        for(let i = 0; i < fleurs.length; i++){

            const px = fleurs[i][0] * w * 1.1;
            const py = fleurs[i][1] * h;
            const sz = r * (.11 + (i % 2) * .035);

            for(let k = 0; k < 5; k++){

                const a = k * Math.PI * 2 / 5 + i * .4;

                c.globalAlpha = .95;
                c.fillStyle   = "#fff0f6";
                c.beginPath();
                c.ellipse(px + Math.cos(a) * sz * .78, py + Math.sin(a) * sz * .78, sz * .58, sz * .44, a, 0, Math.PI * 2);
                c.fill();

            }

            c.fillStyle = "#ff8ab0";
            c.beginPath();
            c.arc(px, py, sz * .30, 0, Math.PI * 2);
            c.fill();

        }

        /* les petales qui tombent */
        c.fillStyle = "#fff0f6";

        for(let i = 0; i < 7; i++){

            const px = Math.sin(i * 2.6) * w * .95 + Math.sin(t * .8 + i) * w * .12;
            const py = ((i / 7 * 2.2 + t * .16) % 2 - 1) * h * 1.2;

            c.globalAlpha = .8;
            c.beginPath();
            c.ellipse(px, py, r * .055, r * .032, t + i, 0, Math.PI * 2);
            c.fill();

        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- GRIFFE : trois entailles ---------- */
    if(e === "griffe"){

        c.globalAlpha = 1;
        c.fillStyle   = "#241a2c";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* le fond, plus sombre au centre */
        c.globalAlpha = .5;
        c.fillStyle   = "#0d0812";
        c.beginPath();
        c.ellipse(0, 0, w * .9, h * .95, 0, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 1;

        for(let i = 0; i < 3; i++){

            const dx  = (i - 1) * w * .42;
            const lon = h * (1.5 - Math.abs(i - 1) * .22);

            /* la plaie */
            c.fillStyle = "#050308";

            c.beginPath();
            c.moveTo(dx - w * .48, -lon * .55);
            c.quadraticCurveTo(dx + w * .02, 0, dx + w * .34, lon * .55);
            c.quadraticCurveTo(dx - w * .06, lon * .48, dx - w * .10, -lon * .52);
            c.closePath();
            c.fill();

            /* la lueur au fond de l'entaille */
            c.globalAlpha = .85 + Math.sin(t * 2.2 + i) * .15;
            c.lineCap     = "round";

            c.shadowBlur  = r * .6;
            c.shadowColor = "#ff3a10";

            c.strokeStyle = "#ff3a14";
            c.lineWidth   = Math.max(2, r * .085);

            c.beginPath();
            c.moveTo(dx - w * .36, -lon * .50);
            c.quadraticCurveTo(dx + w * .02, 0, dx + w * .26, lon * .50);
            c.stroke();

            c.shadowBlur  = r * .3;
            c.strokeStyle = "#ffe0a8";
            c.lineWidth   = Math.max(1, r * .028);
            c.stroke();

            c.shadowBlur  = 0;
            c.globalAlpha = 1;

        }

        return;

    }

    /* ---------- MATRICE : la pluie de code ---------- */
    if(e === "matrice"){

        c.globalAlpha = 1;
        c.fillStyle   = "#04120a";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        const cols = 7;
        const pas  = w * .38;

        c.shadowBlur  = r * .22;
        c.shadowColor = "#3fff8a";

        for(let i = 0; i < cols; i++){

            const px   = -w * 1.15 + i * pas;
            const tete = ((i * .37 + t * .45) % 1.6 - .8) * h * 1.6;

            for(let k = 0; k < 6; k++){

                const py = tete - k * h * .21;

                if(py < -h * 1.5 || py > h * 1.5){ continue; }

                c.globalAlpha = Math.max(0, .95 - k * .17);
                c.fillStyle   = k === 0 ? "#dcffe8" : "#3fe87a";

                /* un glyphe stylise : deux barres qui changent */
                const g = Math.floor(Math.abs(Math.sin(i * 3.1 + k * 1.7 + Math.floor(t * 3)) * 4));

                c.fillRect(px, py, pas * .34, h * .045);

                if(g & 1){ c.fillRect(px, py + h * .07, pas * .22, h * .045); }
                if(g & 2){ c.fillRect(px + pas * .16, py + h * .07, pas * .18, h * .045); }

            }

        }

        c.shadowBlur  = 0;
        c.globalAlpha = 1;

        return;

    }

    /* ---------- OR MASSIF : le metal coule ---------- */
    if(e === "ormassif"){

        const met = c.createLinearGradient(-w, -h, w, h);
        met.addColorStop(0,   "#fff4c0");
        met.addColorStop(.25, "#ffd24a");
        met.addColorStop(.48, "#a86a10");
        met.addColorStop(.62, "#ffe98a");
        met.addColorStop(.85, "#c98a1a");
        met.addColorStop(1,   "#6a4208");

        c.globalAlpha = 1;
        c.fillStyle   = met;
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* la bande de lumiere qui glisse */
        const bx = Math.sin(t * .6) * w * .7;

        const ban = c.createLinearGradient(bx - w * .4, 0, bx + w * .4, 0);
        ban.addColorStop(0,  "rgba(255,255,255,0)");
        ban.addColorStop(.5, "rgba(255,255,255,.55)");
        ban.addColorStop(1,  "rgba(255,255,255,0)");

        c.fillStyle = ban;
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* les aretes sombres qui donnent le poids */
        c.globalAlpha = .35;
        c.strokeStyle = "#5a3a06";
        c.lineWidth   = Math.max(1, r * .03);
        c.lineCap     = "round";

        for(let i = 0; i < 3; i++){
            c.beginPath();
            c.moveTo(-w * 1.3, -h * .55 + i * h * .55);
            c.quadraticCurveTo(0, -h * .30 + i * h * .55, w * 1.3, -h * .62 + i * h * .55);
            c.stroke();
        }

        c.globalAlpha = 1;

        return;

    }

    /* ---------- TROU NOIR : le disque et le vide ---------- */
    if(e === "trounoir"){

        c.globalAlpha = 1;
        c.fillStyle   = "#06030f";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* le disque d'accretion, vu de biais */
        c.save();
        c.rotate(-.35);

        for(let i = 0; i < 2; i++){

            const rr = r * (.80 + i * .30);

            const dis = c.createLinearGradient(-rr, 0, rr, 0);
            dis.addColorStop(0,  "rgba(255,120,40,0)");
            dis.addColorStop(.3, "rgba(255,180,80,.75)");
            dis.addColorStop(.5, "rgba(255,245,220,.95)");
            dis.addColorStop(.7, "rgba(200,120,255,.75)");
            dis.addColorStop(1,  "rgba(120,60,255,0)");

            c.globalAlpha = .95 - i * .35;
            c.strokeStyle = dis;
            c.lineWidth   = r * (.13 - i * .04);

            c.beginPath();
            c.ellipse(0, 0, rr, rr * (.26 + i * .05), t * .15 * (i + 1), 0, Math.PI * 2);
            c.stroke();

        }

        c.restore();

        /* l'horizon : le noir absolu, place sous le visage */
        c.globalAlpha = 1;
        c.fillStyle   = "#000000";
        c.beginPath();
        c.arc(0, h * .42, r * .30, 0, Math.PI * 2);
        c.fill();

        /* le halo juste au bord */
        const halo = c.createRadialGradient(0, h * .42, r * .28, 0, h * .42, r * .46);
        halo.addColorStop(0, "rgba(255,220,180,.85)");
        halo.addColorStop(1, "rgba(255,140,60,0)");

        c.fillStyle = halo;
        c.beginPath();
        c.arc(0, h * .42, r * .46, 0, Math.PI * 2);
        c.fill();

        return;

    }

    /* ---------- PAPILLON : les ailes ouvertes ---------- */
    if(e === "papillon"){

        c.globalAlpha = 1;
        c.fillStyle   = "#1c1440";
        c.fillRect(-w * 1.4, -h * 1.5, w * 2.8, h * 3);

        /* le battement */
        const bat = .82 + Math.sin(t * 1.8) * .18;

        for(let s = -1; s <= 1; s += 2){

            c.save();
            c.scale(s * bat, 1);

            /* l'aile haute */
            const ah = c.createLinearGradient(0, -h * .8, w, h * .1);
            ah.addColorStop(0,  "#7fb0ff");
            ah.addColorStop(.6, "#5a6ae8");
            ah.addColorStop(1,  "#2a1a8a");

            c.fillStyle = ah;
            c.beginPath();
            c.moveTo(w * .05, -h * .10);
            c.quadraticCurveTo(w * .55, -h * 1.25, w * 1.15, -h * .55);
            c.quadraticCurveTo(w * 1.05, -h * .02, w * .08, h * .06);
            c.closePath();
            c.fill();

            /* l'aile basse */
            const ab = c.createLinearGradient(0, h * .1, w, h * .9);
            ab.addColorStop(0, "#5a6ae8");
            ab.addColorStop(1, "#8f3aff");

            c.fillStyle = ab;
            c.beginPath();
            c.moveTo(w * .06, h * .02);
            c.quadraticCurveTo(w * .90, h * .18, w * .78, h * .92);
            c.quadraticCurveTo(w * .34, h * .74, w * .05, h * .16);
            c.closePath();
            c.fill();

            /* les ocelles */
            c.fillStyle = "#0f0a2a";
            c.beginPath();
            c.arc(w * .70, -h * .48, r * .13, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#ffe08a";
            c.beginPath();
            c.arc(w * .70, -h * .48, r * .06, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = "#0f0a2a";
            c.beginPath();
            c.arc(w * .55, h * .48, r * .09, 0, Math.PI * 2);
            c.fill();

            /* le liseret clair du bord */
            c.globalAlpha = .55;
            c.strokeStyle = "#dfe8ff";
            c.lineWidth   = Math.max(1, r * .022);
            c.beginPath();
            c.moveTo(w * .05, -h * .10);
            c.quadraticCurveTo(w * .55, -h * 1.25, w * 1.15, -h * .55);
            c.stroke();

            c.globalAlpha = 1;
            c.restore();

        }

        /* le corps */
        c.fillStyle = "#120c30";
        c.beginPath();
        c.ellipse(0, h * .06, w * .09, h * .52, 0, 0, Math.PI * 2);
        c.fill();

        return;

    }


}


/* =========================================================
   LA VISIERE DU MECA SLIME (remplace les yeux)
========================================================= */

function paintVisor(c, skin, w, h, r, t, f){

    const vy = -h * .20;

    c.fillStyle = "#0d131f";

    c.beginPath();
    c.roundRect
        ? c.roundRect(-w * .62, vy - r * .20, w * 1.24, r * .42, r * .16)
        : c.rect(-w * .62, vy - r * .20, w * 1.24, r * .42);
    c.fill();

    /* la lueur balaie la visiere */
    const sweep = Math.sin(t * 1.8) * w * .40;

    c.save();

    c.beginPath();
    c.rect(-w * .62, vy - r * .20, w * 1.24, r * .42);
    c.clip();

    const g = c.createLinearGradient(sweep - r * .5, 0, sweep + r * .5, 0);

    g.addColorStop(0,  "rgba(84,255,208,0)");
    g.addColorStop(.5, "rgba(84,255,208,.95)");
    g.addColorStop(1,  "rgba(84,255,208,0)");

    c.fillStyle = g;
    c.fillRect(-w * .62, vy - r * .20, w * 1.24, r * .42);

    c.restore();

    /* deux pupilles carrees */
    c.fillStyle   = "#54ffd0";
    c.shadowBlur  = r * .3;
    c.shadowColor = "#54ffd0";

    [-1, 1].forEach(sgn => {
        c.fillRect(sgn * w * .30 - r * .07, vy - r * .07, r * .14, r * .14);
    });

    c.shadowBlur = 0;

}


function loadJSON(key, fallback){

    try{
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    }catch(e){
        return fallback;
    }

}

let ownedSkins  = loadJSON("mimicOwnedSkins", ["cyber"]);
let currentSkin = localStorage.getItem("mimicCurrentSkin") || "cyber";
let totalCoins  = Number(localStorage.getItem("mimicCoins")     || 0);
let bestScore   = Number(localStorage.getItem("mimicBestScore") || 0);

if(!Array.isArray(ownedSkins) || !ownedSkins.length){
    ownedSkins = ["cyber"];
}

/* on nettoie les skins retirés du jeu */
ownedSkins = ownedSkins.filter(id => SKINS.some(sk => sk.id === id));

if(!ownedSkins.length){
    ownedSkins = ["cyber"];
}

if(!SKINS.some(sk => sk.id === currentSkin)){
    currentSkin = "cyber";
}


/*
Les capacites marchent comme des munitions : on en achete
une charge a la fois, et chaque utilisation en consomme une.
Le stock est garde par identifiant : {dash:3, onde:1, ...}
*/
let abilityStock = loadJSON("mimicAbilityStock", null);

if(!abilityStock || typeof abilityStock !== "object" || Array.isArray(abilityStock)){

    abilityStock = {};

    /* reprise des anciennes sauvegardes : une capacite = une charge */
    const old = loadJSON("mimicOwnedAbilities", []);

    if(Array.isArray(old)){
        for(const id of old){
            abilityStock[id] = 1;
        }
    }

}


function abilityCount(id){
    return Math.max(0, abilityStock[id] | 0);
}


function saveGame(){

    try{
        localStorage.setItem("mimicOwnedSkins", JSON.stringify(ownedSkins));
        localStorage.setItem("mimicAbilityStock", JSON.stringify(abilityStock));
        localStorage.setItem("mimicCurrentSkin", currentSkin);
        localStorage.setItem("mimicCoins", totalCoins);
        localStorage.setItem("mimicBestScore", bestScore);
    }catch(e){}

    updateUI();

}


function updateUI(){

    document.getElementById("coins").textContent     = totalCoins;
    document.getElementById("coinText").textContent  = totalCoins.toLocaleString("fr-FR");
    document.getElementById("menuCoins").textContent = totalCoins.toLocaleString("fr-FR");
    document.getElementById("bestScore").textContent = bestScore;
    document.getElementById("finalBest").textContent = bestScore;
    document.getElementById("skinCount").textContent = ownedSkins.length;

    const lv = document.getElementById("lvlNum");
    const lf = document.getElementById("lvlFill");

    if(lv){ lv.textContent = playerLevel(); }
    if(lf){ lf.style.width = (playerLevelProgress() * 100).toFixed(1) + "%"; }

    const dot = document.getElementById("missionDot");

    if(dot){
        dot.classList.toggle("on", missionsLeft() > 0);
    }

    const sdot = document.getElementById("shopDot");

    if(sdot){
        sdot.classList.toggle("on", giftReady());
    }

    const pdot = document.getElementById("passDot");

    if(pdot){
        pdot.classList.toggle("on", passNew());
    }

    lobbySyncSkin();

    document.getElementById("lives").textContent =
        "♥".repeat(Math.max(0,lives)) +
        "♡".repeat(Math.max(0, MAX_LIVES - lives));

}
