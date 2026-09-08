import { definePlugin } from "sanity";
import AddMusicTool from "../components/AddMusicTool/AddMusicTool";

export const addMusicTool = definePlugin(() => ({
  name: "add-music-tool",

  tools: [
    {
      name: "add-music",
      title: "Add Music",
      component: AddMusicTool,
    },
  ],
}));