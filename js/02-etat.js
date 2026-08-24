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
let candies   = [];   /* friandises décoratives au sol */
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
const ELITE_LEVEL  = 25;    /* niveau d'apparition du TRAQUEUR NOIR */
const PORTAL_LEVEL = 20;    /* portail vers LE MARAIS */
const CANDY_LEVEL  = 40;    /* portail vers LE PAYS DES BONBONS */
const MAX_GLOUTONS = 4;     /* gloutons présents en même temps */
const MAX_BLOBS    = 4;     /* slimes du marais présents en même temps */
const START_SOLIDS = 9;     /* blocs présents dès le début */
const MAX_SOLIDS   = 18;    /* blocs au maximum sur le terrain */
const WALL_LEVEL   = 30;    /* à partir d'ici, le terrain se referme encore */
const MAX_SOLIDS_2 = 27;    /* blocs au maximum après le niveau 30 */

const ARCHER_LEVEL    = 15; /* niveau d'apparition des archers */
const ARCHER_INTERVAL = 20; /* secondes entre deux tirs, par archer */
const SLIME_LIFE      = 5;  /* secondes avant décomposition d'un slime */

let lastFrame = 0;
let hudShown  = true;
