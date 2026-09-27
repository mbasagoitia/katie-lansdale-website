import { definePlugin } from "sanity";
import {BasketIcon} from "@sanity/icons";
import AddMusicTool from "../components/AddMusicTool/AddMusicTool";

export const addMusicTool = definePlugin(() => ({
  name: "add-music-tool",

  tools: [
    {
      name: "music-store",
      title: "Music Store",
      icon: BasketIcon,
      component: AddMusicTool,
    },
  ],
}));
