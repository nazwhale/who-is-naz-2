# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## A Second of Your Time: local development

This project needs both the Vite frontend and the Music Place Worker API running.
The local `.env.local` points to `http://localhost:8787`; start that backend in
another terminal (when the sibling repository is checked out):

```sh
cd ../music-place/dry-heart-d174
npm run dev
```

Then run `npm run dev` in this repository and open
`http://localhost:9999/a-second-of-your-time`. Vite proxies `/music-worlds-api`
to `VITE_MUSIC_WORLDS_API_BASE` so local requests don't require production CORS
permissions. The local backend needs its D1 migrations and the world identified
by `VITE_MUSIC_WORLDS_WORLD_ID` in its local data. Production builds continue to
use `VITE_MUSIC_WORLDS_API_BASE` directly.

The microphone route uses the separate `a-second-of-your-time-v1` piece (20 slots,
version 1). The `/v0/a-second-of-your-time` route uses the original world from
`VITE_MUSIC_WORLDS_WORLD_ID` (180 slots, version 0). In the Music Place backend,
apply `migrations/0002_piece_versions.sql` using `npx wrangler d1 migrations apply
music_place_db --local` for local development. Apply it to the remote database
with `--remote` as part of production release before publishing the frontend.
The migration preserves existing world IDs and audio files.

## Shared note grid (v2)

Open `/v2/a-second-of-your-time` for the four-voice, 20-step shared score.
The browser synthesizes notes; shared notes and per-cell revisions live in D1,
separate from the audio pieces. The frontend polls every two seconds and writes
one note per move. Conflicting edits return the current note for retry.
Apply the backend `0003_shared_score.sql` migration before releasing v2.
Run the local API integration check with
`SCORE_TEST_API_BASE=http://localhost:9999/music-worlds-api npm run test:score`.

V2 note cells have permanent up / on-off / down controls, with 44px touch targets
on mobile. Rapid moves queue per cell and display immediately; failed or
conflicting moves revert to the confirmed shared note. Apply the backend
`0004_remember_note_pitch.sql` migration to retain pitches while notes are off.
`npm run test:score` also runs the pure move/queue projection checks without an API.

V2 now displays eight beats vertically, with columns ordered Bass, Tenor, Alto,
Soprano. Playback loops over these eight beats. Migration
`0005_eight_beat_score.sql` sets the active length to eight without deleting later
notes. The updated frontend accepts the previous 20-beat API response, allowing
it to be released before migrating and deploying the backend. Once both are
updated, the API exposes 32 active notes and rejects moves beyond beat eight.
