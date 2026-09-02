#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "../..");
const localeDirectory = join(projectRoot, "src/data/locales/moves");
const gameMaster = readJson(join(projectRoot, "src/data/gamemaster.json"));
const index = readJson(join(localeDirectory, "index.json"));
const currentMoveIds = new Set(gameMaster.moves.map((move) => move.moveId));
const localeCodes = new Set();

assert(index.schemaVersion === 1, "Unsupported move locale index schema");
assert(index.defaultLocale === "en", "English must remain the safe default locale");
assert(index.currentPvPokeMoveCount === currentMoveIds.size, "Stale current move count in index.json");
assert(Array.isArray(index.locales) && index.locales.length > 0, "No locales listed in index.json");

for (const locale of index.locales) {
    assert(!localeCodes.has(locale.code), `Duplicate locale ${locale.code}`);
    localeCodes.add(locale.code);

    const document = readJson(join(localeDirectory, locale.file));
    assert(document._meta.schemaVersion === 1, `Unsupported schema for ${locale.code}`);
    assert(document._meta.locale === locale.code, `Locale metadata mismatch for ${locale.code}`);
    assert(document._meta.sourceCommit === index.source.commit, `Source commit mismatch for ${locale.code}`);
    assert(document.moves && !Array.isArray(document.moves), `Missing move dictionary for ${locale.code}`);
    assert(Object.keys(document.moves).length === locale.availableMoveCount, `Move count mismatch for ${locale.code}`);

    for (const [moveId, moveName] of Object.entries(document.moves)) {
        assert(
            typeof moveName === "string" && !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(moveName),
            `${locale.code} contains unsafe text for ${moveId}`
        );
    }

    for (const move of gameMaster.moves) {
        assert(
            typeof document.moves[move.moveId] === "string" && document.moves[move.moveId].length > 0,
            `${locale.code} is missing ${move.moveId}`
        );

        if (locale.code === "en") {
            assert(document.moves[move.moveId] === move.name, `English name changed for ${move.moveId}`);
        }
    }
}

assert(localeCodes.has(index.defaultLocale), "The default locale file is not listed");
console.log(`Validated ${localeCodes.size} locales against ${currentMoveIds.size} current PvPoke moves.`);
