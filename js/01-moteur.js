"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");

let W = 0, H = 0, dpr = 1, unit = 1, topBound = 100;

/* Zones réservées à l'interface */
const TOP_UI    = 78;
const BOTTOM_UI = 8;

function resize(){

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    /*
    visualViewport donne la zone vraiment visible : sur
    iPhone, innerHeight compte aussi ce qui passe sous les
    barres de Safari, et le bas du jeu se retrouve cache.
    */
    const vv = window.visualViewport;

    W = Math.round(vv ? vv.width  : innerWidth);
    H = Math.round(vv ? vv.height : innerHeight);

    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /*
    Toutes les tailles et vitesses sont
    multipliées par "unit" : le jeu se comporte
    pareil sur un petit téléphone et sur un écran PC.
    */
    unit = Math.max(.65, Math.min(1.45, Math.min(W, H) / 720));

    /*
    On mesure la barre d'infos plutôt que de deviner :
    ça gère l'encoche des iPhone toute seule.
    */
    const ui = document.getElementById("gameUI");

    /*
    On s'arrête au HAUT de la barre d'infos, pas en dessous :
    sinon sur téléphone toute la bande du haut est perdue.
    Le bandeau ne bloque pas les clics (pointer-events:none)
    et il est semi-transparent, donc on voit le slime dessous.
    */
    topBound = ui
        ? ui.getBoundingClientRect().top
        : 12;
}

function onViewportChange(){
    resize();
    ambient  = [];
    lobbyArt = null;
    floorCache = null;
    checkOrientation();
}

addEventListener("resize", onViewportChange);

/* Safari fait glisser ses barres : la zone visible change sans "resize" */
if(window.visualViewport){
    window.visualViewport.addEventListener("resize", onViewportChange);
    window.visualViewport.addEventListener("scroll", onViewportChange);
}
addEventListener("orientationchange", resize);
resize();


/* =========================================================
   HASARD À GRAINE

   En duel, les deux téléphones doivent générer exactement
   le même terrain. On remplace donc le hasard du navigateur
   par un générateur déterministe : même graine = même partie.
========================================================= */

let rngState = 1;

function seedRandom(seed){
    rngState  = (seed >>> 0) || 1;
    wallState = ((seed >>> 0) ^ 0x9E3779B9) || 2;
    fxState   = (Date.now() ^ 0x85EBCA6B) >>> 0 || 3;
}

function mulberry(get, set){

    let v = get();

    v = v + 0x6D2B79F5 | 0;

    set(v);

    let t = Math.imul(v ^ v >>> 15, 1 | v);

    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;

    return ((t ^ t >>> 14) >>> 0) / 4294967296;

}

/* flux général du jeu */
function rnd(){
    return mulberry(() => rngState, v => rngState = v);
}

/* flux réservé au terrain : il n'est consommé qu'à des moments
   identiques sur les deux téléphones, donc les blocs sont les mêmes */
let wallState = 1;

function wrnd(){
    return mulberry(() => wallState, v => wallState = v);
}

/* flux purement visuel : il ne doit surtout pas polluer les autres */
let fxState = 1;

function vrnd(){
    return mulberry(() => fxState, v => fxState = v);
}


/* =========================================================
   AUDIO  (un seul AudioContext pour toute la partie)
========================================================= */

let audioCtx = null;

function ensureAudio(){

    if(audioCtx){

        if(audioCtx.state === "suspended"){
            audioCtx.resume();
        }

        return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;

    if(!AC){
        return;
    }

    try{
        audioCtx = new AC();
    }catch(e){
        audioCtx = null;
    }

}

addEventListener("pointerdown", ensureAudio, {passive:true});
addEventListener("keydown",     ensureAudio);


function sound(freq = 500, duration = .08, type = "sine", volume = .05){

    if(!audioCtx || audioCtx.state !== "running"){
        return;
    }

    const now = audioCtx.currentTime;

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type            = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + .03);

    osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
    };

}


/* =========================================================
   AMBIANCE SONORE

   Pas de mélodie : des accords très lents qui se recouvrent,
   filtrés et joués bas. On doit l'entendre sans y penser.
========================================================= */

const AMBIENCE = {

    cyber:{
        /* nappe aérienne, tierce mineure ouverte */
        chords:[
            [110, 164.81, 246.94, 329.63],
            [98,  146.83, 220,    293.66],
            [123.47, 185, 246.94, 369.99],
            [87.31, 130.81, 196,  261.63]
        ],
        cutoff:1100,
        vol:.020,
        hold:7.5
    },

    marais:{
        /* nappe grave et terreuse */
        chords:[
            [73.42, 110, 146.83, 220],
            [65.41, 98,  130.81, 196],
            [82.41, 123.47, 164.81, 246.94],
            [61.74, 92.5, 123.47, 185]
        ],
        cutoff:700,
        vol:.024,
        hold:9
    }

};

let musicOn    = localStorage.getItem("mimicMusic") !== "0";
let chordNext  = 0;
let chordIndex = 0;


/* une voix de nappe : montée et descente très douces */
function padVoice(freq, at, hold, vol, cutoff, detune){

    if(!audioCtx){
        return;
    }

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();

    osc.type = "sine";

    osc.frequency.value = freq;
    osc.detune.value    = detune || 0;

    filt.type            = "lowpass";
    filt.frequency.value = cutoff;
    filt.Q.value         = .4;

    const rise = hold * .38;
    const fall = hold * .55;

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(vol, at + rise);
    gain.gain.setValueAtTime(vol, at + hold - fall);
    gain.gain.exponentialRampToValueAtTime(.0001, at + hold);

    osc.connect(gain);
    gain.connect(filt);
    filt.connect(audioCtx.destination);

    osc.start(at);
    osc.stop(at + hold + .1);

    osc.onended = () => {
        try{ osc.disconnect(); gain.disconnect(); filt.disconnect(); }catch(e){}
    };

}



/* =========================================================
   MUSIQUE DU MENU — FUTURE GARAGE

   Tout est synthetise en direct : aucun fichier audio, donc
   rien a heberger et rien a telecharger. Nappes filtrees,
   sub-basse, 2-step feutre, grosse reverb et un voile de
   vinyle par-dessus.

   Elle ne tourne que dans les menus. Des qu'une partie
   commence, on repasse sur les nappes d'ambiance.
========================================================= */

const FG = {
    bpm:132,

    /* un accord toutes les deux mesures */
    chords:[
        {pad:[220, 261.63, 329.63, 392],    sub:55},     /* Am7  */
        {pad:[174.61, 261.63, 349.23, 440], sub:43.65},  /* Fmaj7 */
        {pad:[196, 293.66, 392, 493.88],    sub:49},     /* G     */
        {pad:[164.81, 246.94, 329.63, 392], sub:41.2}    /* Em7   */
    ],

    /* pas de 1 a 16 dans la mesure */
    kick:[0, 10],
    snare:[4, 12],
    hat:[2, 3, 6, 7, 10, 11, 14, 15]
};

let fgBus     = null;   /* entree seche + reverb   */
let fgWet     = null;
let fgCrackle = null;
let fgNoise   = null;   /* buffer de bruit partage */
let fgStep    = 0;
let fgNext    = 0;
let fgOn      = false;


function fgNoiseBuffer(){

    if(fgNoise){
        return fgNoise;
    }

    const len = audioCtx.sampleRate * 2;

    fgNoise = audioCtx.createBuffer(1, len, audioCtx.sampleRate);

    const d = fgNoise.getChannelData(0);

    for(let i = 0; i < len; i++){
        d[i] = Math.random() * 2 - 1;
    }

    return fgNoise;
}


/* reverb fabriquee a la volee : bruit qui decroit */
function fgReverbBuffer(seconds, decay){

    const len = Math.floor(audioCtx.sampleRate * seconds);
    const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);

    for(let ch = 0; ch < 2; ch++){

        const d = buf.getChannelData(ch);

        for(let i = 0; i < len; i++){
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }

    }

    return buf;
}


function fgBuild(){

    if(fgBus || !audioCtx){
        return;
    }

    fgBus = audioCtx.createGain();
    fgBus.gain.value = 0;

    /* la queue de reverb */
    const conv = audioCtx.createConvolver();
    conv.buffer = fgReverbBuffer(3.2, 2.6);

    fgWet = audioCtx.createGain();
    fgWet.gain.value = .55;

    /* un peu de mou dans les aigus, c'est le style */
    const tone = audioCtx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 5200;
    tone.Q.value = .5;

    fgBus.connect(tone);
    tone.connect(audioCtx.destination);

    fgBus.connect(conv);
    conv.connect(fgWet);
    fgWet.connect(audioCtx.destination);

}


/* --- les instruments --- */

function fgPad(freqs, at, hold, vol){

    freqs.forEach((f, i) => {

        const osc  = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filt = audioCtx.createBiquadFilter();

        osc.type  = "triangle";
        osc2.type = "sine";

        osc.frequency.value  = f;
        osc2.frequency.value = f;

        /* les deux voix se desaccordent : ca respire */
        osc.detune.value  = i % 2 ? 6 : -6;
        osc2.detune.value = i % 2 ? -11 : 11;

        filt.type = "lowpass";
        filt.Q.value = .7;

        /* le filtre s'ouvre puis se referme sur la duree */
        filt.frequency.setValueAtTime(600, at);
        filt.frequency.linearRampToValueAtTime(2100, at + hold * .45);
        filt.frequency.linearRampToValueAtTime(700, at + hold);

        const v = vol * (i === 0 ? 1 : .62 - i * .09);

        gain.gain.setValueAtTime(.0001, at);
        gain.gain.linearRampToValueAtTime(v, at + hold * .32);
        gain.gain.setValueAtTime(v, at + hold * .60);
        gain.gain.exponentialRampToValueAtTime(.0001, at + hold);

        osc.connect(filt);
        osc2.connect(filt);
        filt.connect(gain);
        gain.connect(fgBus);

        osc.start(at);  osc.stop(at + hold + .1);
        osc2.start(at); osc2.stop(at + hold + .1);

        osc.onended = () => {
            try{ osc.disconnect(); osc2.disconnect(); filt.disconnect(); gain.disconnect(); }catch(e){}
        };

    });

}


function fgSub(freq, at, hold){

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();

    osc.type = "sine";

    osc.frequency.setValueAtTime(freq * 1.4, at);
    osc.frequency.exponentialRampToValueAtTime(freq, at + .07);

    filt.type = "lowpass";
    filt.frequency.value = 260;

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(.10, at + .02);
    gain.gain.setValueAtTime(.10, at + hold * .5);
    gain.gain.exponentialRampToValueAtTime(.0001, at + hold);

    osc.connect(filt);
    filt.connect(gain);
    gain.connect(fgBus);

    osc.start(at);
    osc.stop(at + hold + .05);

    osc.onended = () => {
        try{ osc.disconnect(); filt.disconnect(); gain.disconnect(); }catch(e){}
    };

}


function fgKick(at){

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";

    osc.frequency.setValueAtTime(150, at);
    osc.frequency.exponentialRampToValueAtTime(44, at + .11);

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(.13, at + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, at + .30);

    osc.connect(gain);
    gain.connect(fgBus);

    osc.start(at);
    osc.stop(at + .34);

    osc.onended = () => {
        try{ osc.disconnect(); gain.disconnect(); }catch(e){}
    };

}


function fgNoiseHit(at, freq, q, dur, vol, type){

    const src  = audioCtx.createBufferSource();
    const filt = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    src.buffer = fgNoiseBuffer();
    src.loop   = true;

    filt.type = type;
    filt.frequency.value = freq;
    filt.Q.value = q;

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(vol, at + .004);
    gain.gain.exponentialRampToValueAtTime(.0001, at + dur);

    src.connect(filt);
    filt.connect(gain);
    gain.connect(fgBus);

    src.start(at);
    src.stop(at + dur + .05);

    src.onended = () => {
        try{ src.disconnect(); filt.disconnect(); gain.disconnect(); }catch(e){}
    };

}


/* le voile de vinyle, en continu */
function fgStartCrackle(){

    if(fgCrackle || !audioCtx){
        return;
    }

    const src  = audioCtx.createBufferSource();
    const filt = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    src.buffer = fgNoiseBuffer();
    src.loop   = true;

    filt.type = "highpass";
    filt.frequency.value = 2600;

    gain.gain.value = .008;

    src.connect(filt);
    filt.connect(gain);
    gain.connect(fgBus);

    src.start();

    fgCrackle = {src:src, filt:filt, gain:gain};

}


function fgStopCrackle(){

    if(!fgCrackle){
        return;
    }

    try{
        fgCrackle.src.stop();
        fgCrackle.src.disconnect();
        fgCrackle.filt.disconnect();
        fgCrackle.gain.disconnect();
    }catch(e){}

    fgCrackle = null;

}


/* --- le sequenceur --- */

function fgUpdate(){

    if(!audioCtx || audioCtx.state !== "running"){
        return;
    }

    fgBuild();

    const now = audioCtx.currentTime;

    /* la boucle doit-elle tourner ? */
    const want = musicOn && !playing;

    if(want !== fgOn){

        fgOn = want;

        fgBus.gain.cancelScheduledValues(now);
        fgBus.gain.setValueAtTime(fgBus.gain.value, now);
        fgBus.gain.linearRampToValueAtTime(want ? 1 : 0, now + (want ? 1.2 : .6));

        if(want){
            fgStartCrackle();
            fgStep = 0;
            fgNext = now + .12;
        }else{
            setTimeout(fgStopCrackle, 700);
        }

    }

    if(!fgOn){
        return;
    }

    const beat = 60 / FG.bpm;
    const step = beat / 4;

    if(fgNext < now){
        fgNext = now + .05;
    }

    /* on programme un peu en avance pour ne jamais bégayer */
    while(fgNext < now + .35){

        const i    = fgStep % 16;
        const bar  = Math.floor(fgStep / 16);
        const ch   = FG.chords[Math.floor(bar / 2) % FG.chords.length];

        /* le swing : les temps pairs arrivent un poil en retard */
        const at = fgNext + (i % 2 ? step * .16 : 0);

        if(i === 0 && bar % 2 === 0){
            fgPad(ch.pad, at, beat * 8, .026);
        }

        if(FG.kick.indexOf(i) >= 0){
            fgKick(at);
            fgSub(ch.sub, at, i === 0 ? beat * 1.6 : beat * .9);
        }

        if(FG.snare.indexOf(i) >= 0){
            fgNoiseHit(at, 1900, 1.1, .16, .045, "bandpass");
            fgNoiseHit(at, 320,  1.6, .09, .030, "bandpass");
        }

        if(FG.hat.indexOf(i) >= 0){
            fgNoiseHit(at, 8200, .8, i % 2 ? .022 : .04, i % 2 ? .012 : .020, "highpass");
        }

        fgStep++;
        fgNext += step;

    }

}



/* =========================================================
   MUSIQUE DU MONDE 1 — sombre et cinematique

   Uniquement dans la zone "cyber" (le monde galaxie).
   Le marais et le pays des bonbons gardent leurs nappes.

   Trois etages : un bourdon grave qui respire, un motif
   pince de quatre notes en mineur qui tourne en boucle,
   et une frappe sourde toutes les deux mesures. Le tout
   passe dans une grande reverbe.
========================================================= */

const W1 = {

    bpm:84,

    /* la basse : une note par mesure */
    bass:[55, 55, 49, 43.65],           /* La, La, Sol, Fa */

    /* le motif pince, en 16e ; null = silence */
    motif:[
        440, null, 523.25, null, 659.25, null, 523.25, null,
        493.88, null, 440, null, 392, null, 440, null
    ],

    /* la nappe d'accords, une par mesure */
    pads:[
        [110, 164.81, 220, 329.63],     /* Lam    */
        [110, 164.81, 220, 329.63],
        [98,  146.83, 196, 293.66],     /* Sol    */
        [87.31, 130.81, 174.61, 261.63] /* Fa     */
    ]
};

let w1Bus  = null;
let w1Step = 0;
let w1Next = 0;
let w1On   = false;


function w1Build(){

    if(w1Bus || !audioCtx){
        return;
    }

    w1Bus = audioCtx.createGain();
    w1Bus.gain.value = 0;

    const conv = audioCtx.createConvolver();
    conv.buffer = fgReverbBuffer(4.2, 2.2);

    const wet = audioCtx.createGain();
    wet.gain.value = .5;

    const tone = audioCtx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 4200;

    w1Bus.connect(tone);
    tone.connect(audioCtx.destination);

    w1Bus.connect(conv);
    conv.connect(wet);
    wet.connect(audioCtx.destination);

}


/* le bourdon grave */
function w1Bass(freq, at, hold){

    const osc  = audioCtx.createOscillator();
    const sub  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();

    osc.type = "sawtooth";
    sub.type = "sine";

    osc.frequency.value = freq;
    sub.frequency.value = freq / 2;

    osc.detune.value = -7;

    filt.type = "lowpass";
    filt.Q.value = 1.1;

    /* le filtre respire sur toute la mesure */
    filt.frequency.setValueAtTime(180, at);
    filt.frequency.linearRampToValueAtTime(620, at + hold * .45);
    filt.frequency.linearRampToValueAtTime(200, at + hold);

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(.055, at + hold * .18);
    gain.gain.setValueAtTime(.055, at + hold * .62);
    gain.gain.exponentialRampToValueAtTime(.0001, at + hold);

    osc.connect(filt);
    sub.connect(filt);
    filt.connect(gain);
    gain.connect(w1Bus);

    osc.start(at); osc.stop(at + hold + .1);
    sub.start(at); sub.stop(at + hold + .1);

    osc.onended = () => {
        try{ osc.disconnect(); sub.disconnect(); filt.disconnect(); gain.disconnect(); }catch(e){}
    };

}


/* la note pincee du motif */
function w1Pluck(freq, at, vol){

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.value = freq;

    filt.type = "lowpass";
    filt.frequency.setValueAtTime(3200, at);
    filt.frequency.exponentialRampToValueAtTime(700, at + .5);

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(vol, at + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, at + .75);

    osc.connect(filt);
    filt.connect(gain);
    gain.connect(w1Bus);

    osc.start(at);
    osc.stop(at + .8);

    osc.onended = () => {
        try{ osc.disconnect(); filt.disconnect(); gain.disconnect(); }catch(e){}
    };

}


/* la nappe d'accords, tres en retrait */
function w1Pad(freqs, at, hold){

    freqs.forEach((f, i) => {

        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filt = audioCtx.createBiquadFilter();

        osc.type = i % 2 ? "sine" : "triangle";
        osc.frequency.value = f;
        osc.detune.value = i % 2 ? 5 : -5;

        filt.type = "lowpass";
        filt.frequency.value = 900 + i * 180;

        const v = .012 * (1 - i * .16);

        gain.gain.setValueAtTime(.0001, at);
        gain.gain.linearRampToValueAtTime(v, at + hold * .35);
        gain.gain.setValueAtTime(v, at + hold * .6);
        gain.gain.exponentialRampToValueAtTime(.0001, at + hold);

        osc.connect(filt);
        filt.connect(gain);
        gain.connect(w1Bus);

        osc.start(at);
        osc.stop(at + hold + .1);

        osc.onended = () => {
            try{ osc.disconnect(); filt.disconnect(); gain.disconnect(); }catch(e){}
        };

    });

}


/* la frappe sourde */
function w1Hit(at){

    /* le coup */
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, at);
    osc.frequency.exponentialRampToValueAtTime(38, at + .18);

    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(.11, at + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, at + .55);

    osc.connect(gain);
    gain.connect(w1Bus);

    osc.start(at);
    osc.stop(at + .6);

    osc.onended = () => {
        try{ osc.disconnect(); gain.disconnect(); }catch(e){}
    };

    /* le souffle qui l'accompagne */
    const src  = audioCtx.createBufferSource();
    const filt = audioCtx.createBiquadFilter();
    const ng   = audioCtx.createGain();

    src.buffer = fgNoiseBuffer();
    src.loop   = true;

    filt.type = "lowpass";
    filt.frequency.setValueAtTime(2600, at);
    filt.frequency.exponentialRampToValueAtTime(300, at + .7);

    ng.gain.setValueAtTime(.0001, at);
    ng.gain.linearRampToValueAtTime(.03, at + .01);
    ng.gain.exponentialRampToValueAtTime(.0001, at + .8);

    src.connect(filt);
    filt.connect(ng);
    ng.connect(w1Bus);

    src.start(at);
    src.stop(at + .85);

    src.onended = () => {
        try{ src.disconnect(); filt.disconnect(); ng.disconnect(); }catch(e){}
    };

}


function w1Update(){

    if(!audioCtx || audioCtx.state !== "running"){
        return;
    }

    w1Build();

    const now = audioCtx.currentTime;

    /* elle ne tourne qu'en partie, et seulement dans le monde 1 */
    const want = musicOn && playing && zone === "cyber";

    if(want !== w1On){

        w1On = want;

        w1Bus.gain.cancelScheduledValues(now);
        w1Bus.gain.setValueAtTime(w1Bus.gain.value, now);
        w1Bus.gain.linearRampToValueAtTime(want ? 1 : 0, now + (want ? 1.6 : .8));

        if(want){
            w1Step = 0;
            w1Next = now + .15;
        }

    }

    if(!w1On){
        return;
    }

    const beat = 60 / W1.bpm;
    const step = beat / 4;
    const bar  = beat * 4;

    if(w1Next < now){
        w1Next = now + .05;
    }

    while(w1Next < now + .4){

        const i = w1Step % 16;
        const b = Math.floor(w1Step / 16) % 4;

        if(i === 0){
            w1Bass(W1.bass[b], w1Next, bar);
            w1Pad(W1.pads[b], w1Next, bar);
        }

        /* la frappe toutes les deux mesures */
        if(i === 0 && b % 2 === 0){
            w1Hit(w1Next);
        }

        const note = W1.motif[i];

        if(note){
            /* la derniere mesure passe une octave au-dessus */
            w1Pluck(b === 3 ? note * 2 : note, w1Next, i === 0 ? .05 : .034);
        }

        w1Step++;
        w1Next += step;

    }

}


function updateMusic(){

    fgUpdate();
    w1Update();

    if(!musicOn || !audioCtx || audioCtx.state !== "running" || !playing){
        return;
    }

    /* le monde 1 a sa propre piste : pas de nappe par-dessus */
    if(zone === "cyber"){
        return;
    }

    const a = AMBIENCE.marais;

    const now = audioCtx.currentTime;

    if(chordNext < now){
        chordNext = now + .2;
    }

    /* les accords se chevauchent : la nappe ne retombe jamais */
    if(chordNext < now + .5){

        const chord = a.chords[chordIndex % a.chords.length];

        chord.forEach((f, i) => {

            padVoice(
                f,
                chordNext,
                a.hold,
                a.vol * (i === 0 ? 1.1 : .8 - i * .1),
                a.cutoff,
                (i % 2 ? 4 : -4)
            );

        });

        chordIndex++;
        chordNext += a.hold * .62;

    }

}


function setMusic(on){

    musicOn = on;

    try{ localStorage.setItem("mimicMusic", on ? "1" : "0"); }catch(e){}

    const btn = document.getElementById("soundButton");

    if(btn){
        btn.textContent = on ? "🔊" : "🔇";
    }

}


/*
Le carillon des pièces : deux notes qui montent, tout en
douceur. L'ancien bip carré était agressif.
*/
function coinChime(){

    if(!audioCtx || audioCtx.state !== "running"){
        return;
    }

    const now = audioCtx.currentTime;

    [[1318.51, 0], [1975.53, .07]].forEach(([f, d], i) => {

        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type            = "sine";
        osc.frequency.value = f;

        const at = now + d;

        gain.gain.setValueAtTime(.0001, at);
        gain.gain.linearRampToValueAtTime(i ? .028 : .036, at + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .28);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(at);
        osc.stop(at + .32);

        osc.onended = () => {
            try{ osc.disconnect(); gain.disconnect(); }catch(e){}
        };

    });

}


/* =========================================================
   ENTREES
========================================================= */

const keys = {
    up:false,
    down:false,
    left:false,
    right:false
};

const keyMap = {
    ArrowUp:"up",    w:"up",    W:"up",    z:"up",    Z:"up",
    ArrowDown:"down",s:"down",  S:"down",
    ArrowLeft:"left",a:"left",  A:"left",  q:"left",  Q:"left",
    ArrowRight:"right",d:"right",D:"right"
};

addEventListener("keydown", e => {

    const k = keyMap[e.key];

    if(k){
        e.preventDefault();
        keys[k] = true;
        return;
    }

    if(e.key === "p" || e.key === "P" || e.key === "Escape"){
        e.preventDefault();
        togglePause();
    }

    /* espace ou maj : dash au clavier */
    if(e.key === " " || e.key === "Shift"){

        e.preventDefault();

        if(playing){
            tryDash();
        }

    }

});

addEventListener("keyup", e => {

    const k = keyMap[e.key];

    if(k){
        e.preventDefault();
        keys[k] = false;
    }

});


/* --- Joystick virtuel : on pose le doigt où on veut --- */

const stick = {
    active:false,
    id:null,
    ox:0, oy:0,
    x:0,  y:0,
    dx:0, dy:0,
    mag:0
};

function stickRadius(){
    return 62 * unit;
}

function stickUpdate(px, py){

    let dx = px - stick.ox;
    let dy = py - stick.oy;

    const dist = Math.hypot(dx, dy);
    const dead = 6 * unit;
    const max  = stickRadius();

    if(dist < dead){
        stick.dx = 0;
        stick.dy = 0;
        stick.mag = 0;
    }else{
        stick.dx = dx / dist;
        stick.dy = dy / dist;
        stick.mag = Math.min(1, (dist - dead) / (max - dead));
    }

    const clamped = Math.min(dist, max);

    stick.x = stick.ox + (dist ? dx / dist * clamped : 0);
    stick.y = stick.oy + (dist ? dy / dist * clamped : 0);

}

function stickReset(){
    stick.active = false;
    stick.id     = null;
    stick.dx = stick.dy = stick.mag = 0;
}

canvas.addEventListener("pointerdown", e => {

    if(!playing || paused){
        return;
    }

    e.preventDefault();

    stick.active = true;
    stick.id     = e.pointerId;
    stick.ox = stick.x = e.clientX;
    stick.oy = stick.y = e.clientY;

    stick.dx = stick.dy = stick.mag = 0;

    if(canvas.setPointerCapture){
        try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
    }

});

canvas.addEventListener("pointermove", e => {

    if(!stick.active || e.pointerId !== stick.id){
        return;
    }

    e.preventDefault();

    stickUpdate(e.clientX, e.clientY);

});

["pointerup","pointercancel","pointerleave"].forEach(evt => {

    canvas.addEventListener(evt, e => {

        if(e.pointerId === stick.id){
            stickReset();
        }

    });

});


function inputVector(){

    let dx = 0, dy = 0;

    if(keys.up)    dy--;
    if(keys.down)  dy++;
    if(keys.left)  dx--;
    if(keys.right) dx++;

    if(dx || dy){

        const len = Math.hypot(dx, dy);

        return {dx: dx/len, dy: dy/len, mag: 1};
    }

    if(stick.active && stick.mag > 0){
        return {dx: stick.dx, dy: stick.dy, mag: stick.mag};
    }

    return {dx:0, dy:0, mag:0};

}
