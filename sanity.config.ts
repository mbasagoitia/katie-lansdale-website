"use client";

/**
 * This configuration is used for the Sanity Studio mounted at
 * /app/studio/[[...tool]]/page.tsx
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

import { addMusicTool } from "./sanity/tools/addMusicTool";

export default defineConfig({
  basePath: "/studio",

  projectId,
  dataset,

  schema,

  plugins: [
    structureTool({ structure }),

    visionTool({
      defaultApiVersion: apiVersion,
    }),

    addMusicTool(),
  ],
});