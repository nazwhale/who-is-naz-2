/// <reference types="vite/client" />

declare module "*.md" {
  const content: string;
  export default content;
}

interface ImportMeta {
  globEager: (globPattern: string) => { [key: string]: any };
}
