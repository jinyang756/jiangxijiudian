// Fixed: Cannot find type definition file for 'vite/client'
// /// <reference types="vite/client" />

interface ImportMetaEnv {
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}