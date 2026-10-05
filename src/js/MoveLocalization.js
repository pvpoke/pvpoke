// Localizes move display names from versioned JSON files bundled with PvPoke.
var MoveLocalization = (function () {
    var translationCache = {};

    function normalizeLocale(locale) {
        var supportedLocales = typeof moveLocales !== "undefined" ? moveLocales : ["en"];
        locale = typeof locale === "string" ? locale.toLowerCase() : "en";
        return supportedLocales.indexOf(locale) > -1 ? locale : "en";
    }

    function apply(moves, translations) {
        if (!Array.isArray(moves) || !translations || !translations.moves) {
            return;
        }

        moves.forEach(function (move) {
            if (translations.moves[move.moveId]) {
                move.name = translations.moves[move.moveId];
            }
        });
    }

    function loadAndApply(moves, locale, callback) {
        locale = normalizeLocale(locale);
        document.documentElement.lang = locale;

        if (locale === "en") {
            callback();
            return;
        }

        if (translationCache[locale]) {
            apply(moves, translationCache[locale]);
            callback();
            return;
        }

        $.ajax({
            dataType: "json",
            url: webRoot + "data/locales/moves/" + locale + ".json?v=" + siteVersion,
            mimeType: "application/json"
        }).done(function (translations) {
            translationCache[locale] = translations;
            apply(moves, translations);
        }).fail(function (request, error) {
            console.warn("Could not load move translations for " + locale + "; using English.", error);
        }).always(callback);
    }

    function applyLoaded(moves, locale) {
        locale = normalizeLocale(locale);

        if (translationCache[locale]) {
            apply(moves, translationCache[locale]);
        }
    }

    return {
        apply: apply,
        applyLoaded: applyLoaded,
        loadAndApply: loadAndApply,
        normalizeLocale: normalizeLocale
    };
})();
