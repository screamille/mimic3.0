/* =========================================================
   ETAT DU JEU
========================================================= */

const player = {
    x:0,
    y:0,
    r:15,
    invincible:0
};

/*
Ta trace : uniquement les points où tu bougeais vraiment.
Un arrêt n'ajoute aucun point — les mimics ne peuvent donc
pas venir se poser là où tu t'es arrêté.
*/
let trace       = [];   /* {x,y,d} : d = distance parcourue depuis le début */
let traceLength = 0;

let prevPlayerX = 0, prevPlayerY = 0;
let playerVX    = 0, playerVY    = 0;

/* animation du slime joueur */
const pfx = {
    angle:0,
    speed:0,
    shear:0,
    wave:0,
    jiggle:0,
    eyeX:0,
    eyeY:0,
    blink:3,
    drip:0
};
let mimics    = [];
let solids    = [];   /* blocs solides */
let orbs      = [];   /* orbes violettes : bloquent les mimics */
let coins     = [];
let hearts    = [];
let archers   = [];   /* tourelles fixes, en haut et en bas */
let blobs     = [];   /* les slimes du MARAIS */
let puddles   = [];   /* les flaques de bave : mortelles au contact */
let logs      = [];   /* les rondins : solides, et habités */
let crawlers  = [];   /* ce qui en sort */
let gloutons  = [];   /* les monstres du PAYS DES BONBONS */
let anguilles = [];   /* les ANGUILLES des ABYSSES */
let lanternes = [];   /* les LANTERNES des ABYSSES */
let bulles    = [];   /* bulles qui remontent, decor */
let abyssTimer = 0;
let candies   = [];   /* friandises décoratives au sol */
let guimauves = [];   /* les GUIMAUVES du PAYS DES BONBONS */
let guimauveTimer = 0;
let boss      = null; /* L'OEIL DU NÉANT */
let voidCleared = false;  /* l'OEIL a-t-il ete brise cette partie ? */
let bossShots = [];
let bossBeams = [];

let gloutonTimer = 0;
let portal    = null; /* le portail du niveau 35 */
let warp      = null; /* animation d'aspiration en cours */
let zone      = "cyber";  /* "cyber" ou "marais" */
let blobTimer = 0;
let balls     = [];   /* boules de slime en vol */
let slimes    = [];   /* petits slimes éclos, éphémères */
let particles = [];
let trails    = [];

let playing   = false;
let paused    = false;

let gameTime  = 0;
let score     = 0;
let level     = 1;
let levelTimer= 0;
let orbTimer  = 0;
let coinTimer = 0;
let heartTimer= 0;

let lives = 3;
const MAX_LIVES   = 3;
const TRACE_STEP = 7;       /* espacement minimum entre 2 points de trace */
const TRACE_KEEP = 3400;    /* longueur de trace conservée, en px */
const INVINCIBLE  = 1.3;    /* secondes d'invincibilité après un coup */
const MAX_MIMICS  = 5;      /* ennemis simultanés au maximum */
/*
Un niveau dure 12 secondes. Dix niveaux par monde, c'est
donc DEUX MINUTES chacun — de quoi voir tout ce qu'un monde
a a offrir sans que ca traine. Les deux mondes a boss, eux,
gardent leur duree : c'est l'usure du boss qui commande, et
le compte de niveaux ne sert que de filet de securite.
*/
const ELITE_LEVEL  = 8;     /* niveau d'apparition du TRAQUEUR NOIR */
const PORTAL_LEVEL = 10;    /* portail vers LE MARAIS */
const CANDY_LEVEL  = 20;    /* portail vers LE PAYS DES BONBONS */
const MAX_GLOUTONS = 2;     /* gloutons présents en même temps */
const MAX_GUIMAUVES = 2;    /* guimauves présentes en même temps */
const ABYSS_LEVEL   = 30;   /* portail vers LES ABYSSES */
const VOID_LEVEL    = 40;   /* portail vers LE NÉANT */
const DESERT_LEVEL  = 55;  /* portail vers LE DÉSERT DE VERRE */
const FORGE_LEVEL   = 65;  /* portail vers LA FORGE */
const BIBLIO_LEVEL  = 75;  /* portail vers LA BIBLIOTHÈQUE */
const CLOCK_LEVEL   = 85;  /* portail vers L'HORLOGE */
const MIMIC_LEVEL   = 95;  /* portail vers LE COULOIR : LE MIMIC t'attend */
const BACK_LEVEL    = 115;  /* portail vers LES COULISSES      */
const SCENE_LEVEL   = 125;  /* portail vers LA SCÈNE           */
const ATELIER_LEVEL = 135;  /* portail vers L'ATELIER          */
const GRENIER_LEVEL = 145;  /* portail vers LE GRENIER         */
const OMBRE_LEVEL   = 155;  /* portail vers LE THÉÂTRE D'OMBRES */
const MAX_ANGUILLES = 3;    /* anguilles simultanées */
const MAX_LANTERNES = 3;    /* lanternes simultanées */

/* la carte des mondes : elle sert au HUD et a la progression */
const WORLDS = [
    {zone:"cyber",  n:1, name:"L'ESPACE",            from:1,           to:PORTAL_LEVEL, col:"#55d9ff"},
    {zone:"marais", n:2, name:"LE MARAIS",           from:PORTAL_LEVEL, to:CANDY_LEVEL, col:"#8fe04a"},
    {zone:"bonbon", n:3, name:"LE PAYS DES BONBONS", from:CANDY_LEVEL,  to:ABYSS_LEVEL, col:"#ff8fc4"},
    {zone:"abysse", n:4, name:"LES ABYSSES",         from:ABYSS_LEVEL,  to:VOID_LEVEL,  col:"#2fe0ff"},
    {zone:"neant",   n:5, name:"LE NÉANT",             from:VOID_LEVEL,   to:DESERT_LEVEL, col:"#c86aff"},
    {zone:"desert",  n:6, name:"LE DÉSERT DE VERRE",   from:DESERT_LEVEL, to:FORGE_LEVEL,  col:"#ffd76a"},
    {zone:"forge",   n:7, name:"LA FORGE",             from:FORGE_LEVEL,  to:BIBLIO_LEVEL, col:"#ff7a2a"},
    {zone:"biblio",  n:8, name:"LA BIBLIOTHÈQUE",      from:BIBLIO_LEVEL, to:CLOCK_LEVEL,  col:"#b06cff"},
    {zone:"horloge", n:9, name:"L'HORLOGE",            from:CLOCK_LEVEL,  to:MIMIC_LEVEL,  col:"#9fe9ff"},
    {zone:"couloir",  n:10, name:"LE COULOIR",           from:MIMIC_LEVEL,   to:BACK_LEVEL,    col:"#b06cff"},
    {zone:"coulisses",n:11, name:"LES COULISSES",        from:BACK_LEVEL,    to:SCENE_LEVEL,   col:"#8f6cff"},
    {zone:"scene",    n:12, name:"LA SCÈNE",             from:SCENE_LEVEL,   to:ATELIER_LEVEL, col:"#ffd76a"},
    {zone:"atelier",  n:13, name:"L'ATELIER",            from:ATELIER_LEVEL, to:GRENIER_LEVEL, col:"#6ad0ff"},
    {zone:"grenier",  n:14, name:"LE GRENIER",           from:GRENIER_LEVEL, to:OMBRE_LEVEL,   col:"#ff9a5c"},
    {zone:"ombres",   n:15, name:"LE THÉÂTRE D\u2019OMBRES", from:OMBRE_LEVEL, to:null,        col:"#c86aff"}
];


/*
La teinte du voile quand le portail t'aspire : une version
tres sombre de la couleur du monde d'arrivee.
*/
const WARP_VEIL = {
    marais:  "#103014",
    bonbon:  "#781446",
    abysse:  "#06283a",
    neant:   "#1a0733",
    desert:  "#3a2a08",
    forge:   "#3a1405",
    biblio:  "#24104a",
    horloge: "#0b2436",
    couloir:   "#1a0730",
    coulisses: "#140a26",
    scene:     "#3a2c08",
    atelier:   "#06222e",
    grenier:   "#2e1608",
    ombres:    "#120520"
};
const MAX_BLOBS    = 4;     /* slimes du marais présents en même temps */
const START_SOLIDS = 9;     /* blocs présents dès le début */
const MAX_SOLIDS   = 18;    /* blocs au maximum sur le terrain */
const WALL_LEVEL   = 15;    /* à partir d'ici, le terrain se referme encore */
const MAX_SOLIDS_2 = 27;    /* blocs au maximum après le niveau 30 */

const ARCHER_LEVEL    = 15; /* niveau d'apparition des archers */
const ARCHER_INTERVAL = 20; /* secondes entre deux tirs, par archer */
const SLIME_LIFE      = 5;  /* secondes avant décomposition d'un slime */

let lastFrame = 0;
let hudShown  = false;
