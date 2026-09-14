# Preview generator worker

This small Node service runs FFmpeg outside the website and Studio. It creates a
30-second MP3 or MP4 preview from a private full recording, with a short fade
in and fade out, then stores the result in the matching public preview bucket.

## Railway deployment

1. Create a Railway service from this GitHub repository. Set its **Root
   Directory** to `workers/preview-generator`. Railway will detect the
   Dockerfile there.
2. In the service Variables tab, add:

   ```text
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your Supabase secret key
   PREVIEW_WORKER_SHARED_SECRET=a long random secret shared with the website
   ```

3. Generate a public domain and set the Railway healthcheck path to `/health`.
4. In the website host's environment (and in local `.env.local`), add:

   ```text
   PREVIEW_WORKER_URL=https://your-service.up.railway.app
   PREVIEW_WORKER_SHARED_SECRET=the same long random secret
   ```

5. Apply `supabase/migrations/20260911_create_preview_jobs.sql` in the
   Supabase SQL editor, then redeploy the website so it receives the two new
   environment variables.

Full recordings remain in private buckets. The worker uses the Supabase secret
key only on Railway; it is never sent to the Studio browser.
