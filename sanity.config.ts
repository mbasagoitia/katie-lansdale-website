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
import {DeleteMusicDocumentAction} from "./sanity/documentActions";

export default defineConfig({
  basePath: "/studio",

  projectId,
  dataset,

  schema,

  document: {
    actions: (previousActions, context) => ["composer", "work", "recording", "album", "product"].includes(context.schemaType)
      ? previousActions.map((action) => action.action === "delete" ? DeleteMusicDocumentAction : action)
      : previousActions,
  },

  plugins: [
    addMusicTool(),

    structureTool({ structure, title: "Edit site" }),

    visionTool({
      defaultApiVersion: apiVersion,
    }),
  ],
});
