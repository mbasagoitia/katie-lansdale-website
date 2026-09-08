import composer from "./documents/composer";
import work from "./documents/work";
import album from "./documents/album";
import recording from "./documents/recording";
import product from "./documents/product";
import page from "./documents/page";
import siteSettings from "./documents/siteSettings";

import { type SchemaTypeDefinition } from 'sanity'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    composer,
    work,
    album,
    recording,
    product,
    page,
    siteSettings
  ],
}
