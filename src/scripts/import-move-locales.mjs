#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const localeNames = {
    de: "Deutsch",
    en: "English",
    es: "Español",
    "es-mx": "Español (Latinoamérica)",
    fr: "Français",
    hi: "हिन्दी",
    id: "Bahasa Indonesia",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    "pt-br": "Português (Brasil)",
    ru: "Русский",
    th: "ไทย",
    tr: "Türkçe",
    "zh-tw": "繁體中文"
};

// PvPoke and the Pokemon GO Game Master occasionally use different semantic IDs
// for the same move. Keep these explicit so a source change is reviewable.
const moveAliases = {
    AEGISLASH_CHARGE_AIR_SLASH: "AIR_SLASH",
    AEGISLASH_CHARGE_PSYCHO_CUT: "PSYCHO_CUT",
    FUTURE_SIGHT: "FUTURESIGHT",
    GULP_MISSILE_ARROKUDA: "GULP_MISSILE_GULPING",
    GULP_MISSILE_PIKACHU: "GULP_MISSILE_GORGING",
    PYRO_BALL: "PYROBALL",
    TECHNO_BLAST_DOUSE: "TECHNO_BLAST_WATER"
};

function fail(message) {
    console.error(`Move locale import failed: ${message}`);
    process.exit(1);
}

function readJson(path) {
    try {
        return JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
        fail(`could not read ${path}: ${error.message}`);
    }
}

function gitValue(repository, args, fallback) {
    try {
        return execFileSync("git", ["-C", repository, ...args], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"]
        }).trim();
    } catch {
        return fallback;
    }
}

function sortObject(object) {
    return Object.fromEntries(
        Object.entries(object).sort(([left], [right]) => left.localeCompare(right))
    );
}

function normalizedMoveId(proto) {
    return proto.replace(/_FAST$/, "");
}

const sourceRoot = process.argv[2] ? resolve(process.argv[2]) : null;

if (!sourceRoot) {
    fail("pass a local pogo-data-api checkout as the first argument");
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "../..");
const gameMasterPath = join(projectRoot, "src/data/gamemaster.json");
const outputDirectory = join(projectRoot, "src/data/locales/moves");
const sourceDataDirectory = join(sourceRoot, "data/v1");
const sourceMoves = readJson(join(sourceDataDirectory, "moves.json"));
const sourceTypes = readJson(join(sourceDataDirectory, "types.json"));
const gameMaster = readJson(gameMasterPath);

if (!Array.isArray(sourceMoves) || !Array.isArray(sourceTypes)) {
    fail("the source moves.json and types.json files must be arrays");
}

if (!Array.isArray(gameMaster.moves)) {
    fail("PvPoke gamemaster.json does not contain a moves array");
}

const sourceCommit = gitValue(sourceRoot, ["rev-parse", "HEAD"], "unknown");
const sourceCommitDate = gitValue(sourceRoot, ["show", "-s", "--format=%cI", "HEAD"], "unknown");
const sourceRepository = gitValue(
    sourceRoot,
    ["remote", "get-url", "origin"],
    "https://github.com/WatWowMap/pogo-data-api"
);
const sourceChanges = gitValue(
    sourceRoot,
    ["status", "--porcelain", "--", "data/v1/moves.json", "data/v1/types.json", "data/v1/translations"],
    "unknown"
);

if (sourceCommit === "unknown" || sourceCommitDate === "unknown") {
    fail("the source directory must be a Git checkout so its exact revision can be recorded");
}

if (sourceChanges === "unknown" || sourceChanges.length > 0) {
    fail("the source move/type/translation files must have no uncommitted changes");
}

const typeIdsByName = new Map(
    sourceTypes.map((type) => [type.typeName.toLowerCase(), type.typeId])
);
const currentMoveIds = new Set(gameMaster.moves.map((move) => move.moveId));
const outputIndex = {
    schemaVersion: 1,
    defaultLocale: "en",
    source: {
        repository: sourceRepository,
        commit: sourceCommit,
        commitDate: sourceCommitDate,
        rawMoveRecords: sourceMoves.length
    },
    currentPvPokeMoveCount: currentMoveIds.size,
    locales: []
};
const localeDocuments = new Map();

for (const [locale, localeName] of Object.entries(localeNames)) {
    const sourceTranslations = readJson(
        join(sourceDataDirectory, "translations", locale, "moves.json")
    );
    const typeTranslations = readJson(
        join(sourceDataDirectory, "translations", locale, "types.json")
    );
    const moves = {};

    if (Array.isArray(sourceTranslations) || Array.isArray(typeTranslations)) {
        fail(`${locale} move/type translations must be JSON objects`);
    }

    function resolveMoveReferences(translation) {
        return translation.replace(/<<move_name_(\d+)>>/g, (reference, moveId) => {
            const referencedTranslation = sourceTranslations[`move_${Number(moveId)}`];

            if (typeof referencedTranslation !== "string") {
                fail(`${locale} contains an unresolved move reference: ${reference}`);
            }

            return referencedTranslation;
        });
    }

    const referencedPlusTranslation = Object.values(sourceTranslations).find((translation) =>
        typeof translation === "string" && /^<<move_name_\d+>>/.test(translation)
    );
    const plusSuffix = referencedPlusTranslation
        ? referencedPlusTranslation.replace(/^<<move_name_\d+>>/, "")
        : "+";

    // Prefer the real fast-move record when an old base record shares its proto.
    const orderedSourceMoves = [...sourceMoves].sort((left, right) =>
        Number(left.fast) - Number(right.fast)
    );

    for (const sourceMove of orderedSourceMoves) {
        if (typeof sourceMove.proto !== "string") {
            continue;
        }

        const translation = sourceTranslations[`move_${sourceMove.moveId}`];

        if (typeof translation !== "string" || translation.length === 0) {
            continue;
        }

        const moveId = normalizedMoveId(sourceMove.proto);
        const resolvedTranslation = resolveMoveReferences(translation);

        if (/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(resolvedTranslation)) {
            fail(`${locale} contains unsafe text for ${moveId}`);
        }

        moves[moveId] = resolvedTranslation;
    }

    for (const [alias, sourceMoveId] of Object.entries(moveAliases)) {
        if (moves[sourceMoveId]) {
            moves[alias] = moves[sourceMoveId];
        }
    }

    // PvPoke splits Hidden Power by type, while Pokemon GO exposes one move ID.
    for (const move of gameMaster.moves.filter((entry) => entry.moveId.startsWith("HIDDEN_POWER_"))) {
        const typeId = typeIdsByName.get(move.type);
        const translatedType = typeTranslations[`poke_type_${typeId}`];

        if (move.moveId === "HIDDEN_POWER_NORMAL" && moves.HIDDEN_POWER) {
            moves[move.moveId] = moves.HIDDEN_POWER;
        } else if (moves.HIDDEN_POWER && translatedType) {
            moves[move.moveId] = `${moves.HIDDEN_POWER} (${translatedType})`;
        }
    }

    // Adventure Effects use the localized base move name plus the in-game suffix.
    for (const move of gameMaster.moves.filter((entry) => entry.moveId.endsWith("_PLUS"))) {
        const baseMoveId = move.moveId.slice(0, -"_PLUS".length);

        if (moves[baseMoveId]) {
            moves[move.moveId] = `${moves[baseMoveId]}${plusSuffix}`;
        }
    }

    const fallbackMoveIds = [];

    // Every generated locale is complete for the current PvPoke Game Master.
    // English PvPoke names are the safe fallback for speculative/custom entries.
    for (const move of gameMaster.moves) {
        if (!moves[move.moveId]) {
            moves[move.moveId] = move.name;
            fallbackMoveIds.push(move.moveId);
        }
    }

    // Keep existing English spelling and punctuation stable throughout PvPoke.
    if (locale === "en") {
        for (const move of gameMaster.moves) {
            moves[move.moveId] = move.name;
        }
        fallbackMoveIds.length = 0;
    }

    const localeDocument = {
        _meta: {
            schemaVersion: 1,
            locale,
            sourceCommit,
            currentPvPokeMoveCount: currentMoveIds.size,
            nativeCurrentMoveCount: currentMoveIds.size - fallbackMoveIds.length,
            fallbackMoveIds
        },
        moves: sortObject(moves)
    };

    localeDocuments.set(locale, localeDocument);

    outputIndex.locales.push({
        code: locale,
        name: localeName,
        file: `${locale}.json`,
        availableMoveCount: Object.keys(moves).length,
        nativeCurrentMoveCount: currentMoveIds.size - fallbackMoveIds.length,
        fallbackMoveIds
    });
}

// Write only after every source file has passed validation, avoiding a partial update.
mkdirSync(outputDirectory, { recursive: true });

for (const [locale, localeDocument] of localeDocuments) {
    writeFileSync(
        join(outputDirectory, `${locale}.json`),
        `${JSON.stringify(localeDocument, null, 2)}\n`,
        "utf8"
    );
}

writeFileSync(
    join(outputDirectory, "index.json"),
    `${JSON.stringify(outputIndex, null, 2)}\n`,
    "utf8"
);

console.log(
    `Generated ${outputIndex.locales.length} locales for ${currentMoveIds.size} current PvPoke moves from ${sourceCommit}.`
);

for (const locale of outputIndex.locales) {
    if (locale.fallbackMoveIds.length > 0) {
        console.log(`${locale.code}: English fallback for ${locale.fallbackMoveIds.join(", ")}`);
    }
}
