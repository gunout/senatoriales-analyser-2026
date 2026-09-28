#!/usr/bin/env node
/**
 * Fusionne les sources sénatoriales 2026 + NosParlementaires + élus 2020 + élus 2026
 * Usage : node merge.js
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// ---------- UTILITAIRES ----------
function readCSV(filename, delim = ';') {
    const full = path.join(DIR, filename);
    if (!fs.existsSync(full)) {
        console.warn(`⚠ Fichier absent : ${filename}`);
        return [];
    }
    let content = fs.readFileSync(full, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = splitLine(lines[0], delim).map(norm);
    return lines.slice(1).map(l => {
        const cells = splitLine(l, delim);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (cells[i] || '').trim(); });
        return obj;
    });
}

function splitLine(line, delim) {
    const res = [];
    let curr = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQ && line[i + 1] === '"') { curr += '"'; i++; }
            else inQ = !inQ;
        } else if (ch === delim && !inQ) {
            res.push(curr); curr = '';
        } else {
            curr += ch;
        }
    }
    res.push(curr);
    return res;
}

function norm(h) {
    return h.replace(/"/g, '')
        .replace(/’/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function toInt(v) {
    if (!v) return 0;
    return parseInt(String(v).replace(/[\s\u00A0\u202F]/g, ''), 10) || 0;
}

function pad2(n) { return String(n).padStart(2, '0'); }

function normalizeDeptCode(raw) {
    if (raw === null || raw === undefined) return '';
    let s = String(raw).trim();
    if (!s) return '';
    if (/^2[ab]$/i.test(s)) return s.toUpperCase();
    if (!/^\d+$/.test(s)) return s.toUpperCase();
    const n = parseInt(s, 10);
    if (n >= 1 && n <= 95) return pad2(n);
    return String(n);
}

// ---------- LECTURE ----------
console.log('📖 Lecture des CSV…');

const maj = readCSV('senatoriales-2026-candidatures-individuelles-scrutin-majoritaire.csv', ';');
const prop = readCSV('senatoriales-2026-candidatures-listes-scrutin-proportionnel.csv', ';');
const inscrits = readCSV('referentiel-des-bureaux-de-vote-sen2026csv.csv', ';');
const senateursNP = readCSV('senateurs.csv', ',');
const scrutinsNP = readCSV('scrutins_senat.csv', ',');
const votesNP = readCSV('votes_senat.csv', ',');
const elus2020 = readCSV('senatoriales-2020-elus.csv', ';');
const elus2026 = readCSV('senatoriales-2026-elus.csv', ';');

console.log(`  Candidats 2026 (maj.)   : ${maj.length}`);
console.log(`  Colistiers 2026 (prop.) : ${prop.length}`);
console.log(`  Inscrits                : ${inscrits.length}`);
console.log(`  Sénateurs NP            : ${senateursNP.length}`);
console.log(`  Scrutins NP             : ${scrutinsNP.length}`);
console.log(`  Votes NP                : ${votesNP.length}`);
console.log(`  Élus 2020               : ${elus2020.length}`);
console.log(`  Élus 2026               : ${elus2026.length}`);

// ---------- INSCRITS ----------
const inscritsByCode = new Map();
inscrits.forEach(r => {
    const code = normalizeDeptCode(r['code circonscription']);
    const nb = toInt(r["nombre d'inscrits"] || r['nombre d’inscrits']);
    if (code) inscritsByCode.set(code, nb);
});

// ---------- NOSPARLEMENTAIRES ----------
const senateursBySlug = new Map();
senateursNP.forEach(r => {
    const slug = r.slug;
    if (!slug || slug === 'slug') return;
    senateursBySlug.set(slug, {
        slug,
        prenom: r.first_name || '',
        nom: r.last_name || '',
        nomComplet: r.full_name || '',
        groupe: r.group_short || '',
        groupeLabel: r.group_label || '',
        codeDepartement: normalizeDeptCode(r.department_code),
        departement: r.department_label || '',
        enMandat: (r.active || '').toLowerCase() === 'true'
    });
});

const scrutinsById = new Map();
scrutinsNP.forEach(r => {
    const id = r.id;
    if (!id || id === 'id') return;
    scrutinsById.set(id, {
        id,
        date: r.date || '',
        titre: r.title || '',
        dossier: r.dossier_ref || '',
        votants: toInt(r.votants),
        exprimes: toInt(r.suffrages_exprimes),
        pour: toInt(r.pour),
        contre: toInt(r.contre),
        url: r.url || ''
    });
});

const votesBySlug = new Map();
votesNP.forEach(r => {
    const slug = r.senator_slug;
    if (!slug || slug === 'senator_slug') return;
    if (!votesBySlug.has(slug)) votesBySlug.set(slug, []);
    votesBySlug.get(slug).push({
        scrutinId: r.scrutin_id,
        position: r.position || '',
        statut: r.statut || ''
    });
});

console.log('\n🔗 Jointures en cours…');

senateursBySlug.forEach(s => {
    const votes = votesBySlug.get(s.slug) || [];
    s.nbVotes = votes.length;
    s.votesPour = votes.filter(v => v.position === 'POUR').length;
    s.votesContre = votes.filter(v => v.position === 'CONTRE').length;
    s.votesAbstention = votes.filter(v => v.position === 'ABSTENTION').length;
    s.votesNonVotant = votes.filter(v => v.position === 'NONVOTANT').length;
});

const senateursByDept = new Map();
senateursBySlug.forEach(s => {
    const code = s.codeDepartement;
    if (!code) return;
    if (!senateursByDept.has(code)) senateursByDept.set(code, []);
    senateursByDept.get(code).push(s);
});

// ---------- ÉLUS 2020 ----------
const elus2020ByCode = new Map();
elus2020.forEach(r => {
    const code = normalizeDeptCode(r['code']);
    if (!code) return;
    if (!elus2020ByCode.has(code)) elus2020ByCode.set(code, []);
    elus2020ByCode.get(code).push({
        civilite: r.civilite || '',
        nom: r.nom || '',
        prenom: r.prenom || '',
        dateNaissance: r['date_naissance'] || '',
        statut: r.statut || '',
        reelu: (r.reelu || '').toLowerCase() === 'true'
    });
});

console.log(`  elus2020ByCode : ${elus2020ByCode.size} départements`);

// ---------- ÉLUS 2026 ----------
const elus2026ByCode = new Map();
elus2026.forEach(r => {
    const code = normalizeDeptCode(r['code']);
    if (!code) return;
    if (!elus2026ByCode.has(code)) elus2026ByCode.set(code, []);
    elus2026ByCode.get(code).push({
        nom: r.nom || '',
        prenom: r.prenom || '',
        sexe: r.sexe || '',
        codeNuance: r.codeNuance || '',
        sortant: (r.sortant || '').toUpperCase() === 'OUI',
        tour: r.tour || ''
    });
});

console.log(`  elus2026ByCode : ${elus2026ByCode.size} départements`);

// ---------- CONSTRUCTION CIRCONSCRIPTIONS ----------
const circoMap = new Map();

function ensureCirco(code, nom, type) {
    const key = normalizeDeptCode(code);
    if (!circoMap.has(key)) {
        circoMap.set(key, {
            code: key,
            nom,
            type,
            inscrits: inscritsByCode.get(key) || null,
            candidats: [],
            listes: [],
            senateurs: senateursByDept.get(key) || [],
            elus2020: elus2020ByCode.get(key) || [],
            elus2026: elus2026ByCode.get(key) || []
        });
    } else {
        const e = circoMap.get(key);
        if (!e.nom && nom) e.nom = nom;
    }
    return circoMap.get(key);
}

maj.forEach(r => {
    const code = r['code circonscription'];
    if (!code) return;
    const c = ensureCirco(code, r['libelle circonscription'], 'majoritaire');
    c.candidats.push({
        numeroDepot: r['n° depot'] || '',
        sexe: r['sexe du candidat'] || '',
        nom: r['nom du candidat'] || '',
        prenom: r['prenom du candidat'] || '',
        naissance: r['date de naissance du candidat'] || '',
        codeNuance: r['code nuance'] || '',
        nuance: r['nuance du candidat'] || '',
        profession: r.profession || '',
        sortant: (r.sortant || '').toUpperCase() === 'OUI',
        remplacant: {
            sexe: r['sexe remplacant'] || '',
            nom: r['nom remplacant'] || '',
            prenom: r['prenom remplacant'] || '',
            naissance: r['date de naissance remplacant'] || ''
        }
    });
});

prop.forEach(r => {
    const code = r['code circonscription'];
    if (!code) return;
    const c = ensureCirco(code, r.circonscription, 'proportionnel');
    const numDepot = r['n° depot'] || '';
    let liste = c.listes.find(l => l.numeroDepot === numDepot);
    if (!liste) {
        liste = {
            numeroDepot: numDepot,
            libelleAbrege: r['libelle abrege de liste'] || '',
            libelle: r['libelle de la liste'] || '',
            codeNuance: r['code nuance de liste'] || '',
            nuance: r['nuance de liste'] || '',
            membres: []
        };
        c.listes.push(liste);
    }
    liste.membres.push({
        ordre: toInt(r.ordre),
        teteListe: (r['tete de liste'] || '').toUpperCase() === 'OUI',
        sexe: r.sexe || '',
        nom: r['nom sur le bulletin de vote'] || '',
        prenom: r['prenom sur le bulletin de vote'] || '',
        naissance: r['date de naissance'] || '',
        profession: r.profession || '',
        sortant: (r.sortant || '').toUpperCase() === 'OUI'
    });
});

circoMap.forEach(c => {
    c.candidats.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
    c.listes.forEach(l => l.membres.sort((a, b) => a.ordre - b.ordre));
    c.listes.sort((a, b) => (a.libelle || '').localeCompare(b.libelle || ''));

    const candidats2026 = new Set();
    c.candidats.forEach(x => candidats2026.add(`${x.nom}|${x.prenom}`.toUpperCase()));
    c.listes.forEach(l => l.membres.forEach(m => candidats2026.add(`${m.nom}|${m.prenom}`.toUpperCase())));

    c.elus2020.forEach(e => {
        e.candidat2026 = candidats2026.has(`${e.nom}|${e.prenom}`.toUpperCase());
    });
});

const circonscriptions = Array.from(circoMap.values())
    .sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }));

// ---------- STATS ----------
const totalInscrits = circonscriptions.reduce((s, c) => s + (c.inscrits || 0), 0);
const nbActifs = [...senateursBySlug.values()].filter(s => s.enMandat).length;

const elus2020ParStatut = {};
elus2020.forEach(e => {
    const s = e.statut || 'Inconnu';
    elus2020ParStatut[s] = (elus2020ParStatut[s] || 0) + 1;
});

let elus2020Candidats2026 = 0;
circonscriptions.forEach(c => c.elus2020.forEach(e => { if (e.candidat2026) elus2020Candidats2026++; }));

const elus2026ParNuance = {};
elus2026.forEach(e => {
    const n = e.codeNuance || 'DIV';
    elus2026ParNuance[n] = (elus2026ParNuance[n] || 0) + 1;
});

const elus2026ParTour = {};
elus2026.forEach(e => {
    const t = e.tour || 'Inconnu';
    elus2026ParTour[t] = (elus2026ParTour[t] || 0) + 1;
});

const candidats2026ParNuance = {};
circonscriptions.forEach(c => {
    c.candidats.forEach(x => {
        const n = x.codeNuance || 'DIV';
        candidats2026ParNuance[n] = (candidats2026ParNuance[n] || 0) + 1;
    });
    c.listes.forEach(l => {
        const n = l.codeNuance || 'DIV';
        candidats2026ParNuance[n] = (candidats2026ParNuance[n] || 0) + (l.membres.length || 0);
    });
});

const stats = {
    circonscriptionsTotal: circonscriptions.length,
    circonscriptionsMajoritaire: circonscriptions.filter(c => c.type === 'majoritaire').length,
    circonscriptionsProportionnel: circonscriptions.filter(c => c.type === 'proportionnel').length,
    candidatsMajoritaire: maj.length,
    listesProportionnel: circonscriptions.reduce((s, c) => s + c.listes.length, 0),
    colistiersProportionnel: prop.length,
    grandsElecteursTotal: totalInscrits,
    senateursNPTotal: senateursBySlug.size,
    senateursNPEnMandat: nbActifs,
    scrutinsNPTotal: scrutinsById.size,
    votesNPTotal: votesNP.length,
    elus2020Total: elus2020.length,
    elus2020Reelus: elus2020.filter(e => (e.reelu || '').toLowerCase() === 'true').length,
    elus2020Nouveaux: elus2020.filter(e => (e.reelu || '').toLowerCase() !== 'true').length,
    elus2020ParStatut,
    elus2020Candidats2026,
    elus2026Total: elus2026.length,
    elus2026Sortants: elus2026.filter(e => (e.sortant || '').toUpperCase() === 'OUI').length,
    elus2026ParNuance,
    elus2026ParTour,
    candidats2026ParNuance,
    genereLe: new Date().toISOString()
};

// ---------- SORTIE ----------
const output = {
    meta: {
        titre: 'Sénatoriales 2026 — Données fusionnées',
        source: 'data.gouv.fr + NosParlementaires + Sénat (2020, 2026)',
        licence: 'Licence Ouverte 2.0 (Etalab)',
        genereLe: stats.genereLe
    },
    stats,
    circonscriptions,
    scrutinsSenat: Array.from(scrutinsById.values()),
    senateurs: Array.from(senateursBySlug.values())
};

const outPath = path.join(DIR, 'senatoriales-2026.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

const sizeMo = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
console.log(`\n✅ Fichier généré : ${outPath}`);
console.log(`   Taille : ${sizeMo} Mo`);
console.log(`   Circonscriptions : ${stats.circonscriptionsTotal}`);
console.log(`   Candidats (maj.) : ${stats.candidatsMajoritaire}`);
console.log(`   Listes (prop.)   : ${stats.listesProportionnel}`);
console.log(`   Colistiers       : ${stats.colistiersProportionnel}`);
console.log(`   Grands électeurs : ${stats.grandsElecteursTotal.toLocaleString('fr-FR')}`);
console.log(`   Sénateurs NP     : ${stats.senateursNPTotal} (${stats.senateursNPEnMandat} en mandat)`);
console.log(`   Élus 2020        : ${stats.elus2020Total} (${stats.elus2020Reelus} réélus, ${stats.elus2020Nouveaux} nouveaux)`);
console.log(`   Élus 2026        : ${stats.elus2026Total} (${stats.elus2026Sortants} sortants réélus)`);
console.log('\n   Élus 2026 par nuance :');
Object.entries(elus2026ParNuance).sort((a, b) => b[1] - a[1])
    .forEach(([n, c]) => console.log(`     ${n.padEnd(8)} : ${c}`));
console.log('\n   Élus 2026 par tour :');
Object.entries(elus2026ParTour).sort((a, b) => b[1] - a[1])
    .forEach(([t, c]) => console.log(`     ${t.padEnd(12)} : ${c}`));