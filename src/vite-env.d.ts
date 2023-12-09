/// <reference types="vite/client" />

declare module "*.md" {
  const content: string;
  export default content;
}

interface ImportMeta {
  glob: (pattern: string) => Record<string, () => Promise<any>>;
  globEager: (globPattern: string) => { [key: string]: any };
}
