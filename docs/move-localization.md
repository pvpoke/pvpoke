# Pokemon GO move localization

PvPoke serves move names from static, versioned JSON files in
`src/data/locales/moves`. The browser never calls an external API.

Users can change move language from the main navigation menu or from the
Settings page. The menu writes only the `language` property through
`data/languageCookie.php`, preserving all other saved preferences, and reloads
the current page so every move name is updated together.

## Source and update process

The generated files use the static JSON snapshot from
[`WatWowMap/pogo-data-api`](https://github.com/WatWowMap/pogo-data-api). That
repository uses
[`Pogo-Data-Generator`](https://github.com/WatWowMap/Pogo-Data-Generator), which
builds move metadata and translations from Pokemon GO client text and Game
Master data. The exact source commit is stored in every generated file and in
`index.json`. The independently mined APK and remote text snapshots in
[`PokeMiners/pogo_assets`](https://github.com/PokeMiners/pogo_assets/tree/master/Texts)
are useful for auditing individual strings.

To update the snapshot:

```bash
git clone --depth 1 https://github.com/WatWowMap/pogo-data-api.git /tmp/pogo-data-api
node src/scripts/import-move-locales.mjs /tmp/pogo-data-api
node src/scripts/validate-move-locales.mjs
```

Commit the resulting JSON changes together. No npm packages are required.

The importer:

1. maps numeric Pokemon GO move IDs to PvPoke semantic IDs;
2. normalizes fast-move IDs and documented PvPoke aliases;
3. resolves client text references and rejects unsafe/unresolved placeholders;
4. derives Hidden Power type variants and Adventure Effect `+` variants;
5. includes source moves that PvPoke does not use yet, so announced or future
   moves can already be available locally;
6. guarantees a name for every move in PvPoke's current Game Master, with an
   explicit English fallback list in the JSON metadata; and
7. exits with an error if the expected source structure is missing or invalid.

No third-party source can guarantee names for moves that have not appeared in
Pokemon GO data yet. Re-run the importer when upstream client/Game Master data
changes, review the recorded fallbacks, and commit the new snapshot.

Pokemon names and text are owned by their respective rights holders. Review
upstream source terms before redistributing generated assets.
