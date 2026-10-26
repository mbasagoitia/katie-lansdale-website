# Local preview generation

This is the one-off preview generator. It makes an
audio MP3 or video MP4 preview that is 30 seconds long by default, including a
one-second fade in and fade out. The generated file is then uploaded through
the **custom preview** control in Sanity; the Studio saves it to Supabase.

## One-time setup

Install FFmpeg on the computer that will make previews:

```sh
brew install ffmpeg
```

## Generate a batch

1. Copy `scripts/preview-manifest.example.json` to `preview-manifest.json`.
   That local file is intentionally ignored by Git.
2. Replace each sample `input` with the path to the original audio or video
   file. Adjust `startSeconds` if a preview should begin somewhere other than
   the beginning.
3. Generate the files:

   ```sh
   npm run generate:previews -- --manifest ./preview-manifest.json
   ```

The output defaults to `tmp/generated-previews`. Once generated, publish the
full Bach batch and the two video previews to Supabase and their matching Sanity
records with:

```sh
npm run publish:generated-previews
```

The publishing script also restores the Bach album's 28-track, disc-order
listing and adds the Bach Toccata and Fugue video to the Music Library. It does
not create a sales listing for that new video; it remains available to list from
the Studio whenever its price and sales details are ready.

Use `--dry-run` to verify the manifest first, or `--output-dir <folder>` to
place the output elsewhere.
