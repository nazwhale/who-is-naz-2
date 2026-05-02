import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import Markdown from "vite-plugin-md";
import sitemap from "vite-plugin-sitemap";
import fs from "fs";
import path from "path";
import frontMatter from "front-matter";

type ContentType = "poems" | "words";

interface AdminListItem {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

interface AdminDetailItem extends AdminListItem {
  body: string;
}

interface ParsedMarkdownFile {
  slug: string;
  body: string;
  attributes: Record<string, unknown>;
}

function getArticleSlugs() {
  const directoryPath = path.resolve(__dirname, "src/blog-posts");
  const files = fs.readdirSync(directoryPath);

  const fileNames = files.map((file) => {
    const withoutExtension = file.replace(".md", "");
    return `/articles/${withoutExtension}`;
  });

  return fileNames;
}

function getPoemSlugs() {
  const directoryPath = path.resolve(__dirname, "src/Poems");

  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".md"))
    .map((file) => `/poems/${file.replace(".md", "")}`);
}

function getContentDirectory(type: ContentType) {
  return type === "poems"
    ? path.resolve(__dirname, "src/Poems")
    : path.resolve(__dirname, "src/blog-posts");
}

function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isLocalRequest(hostHeader: string | undefined) {
  if (!hostHeader) {
    return false;
  }

  const host = hostHeader.split(":")[0];
  return host === "localhost" || host === "127.0.0.1";
}

function isValidType(value: string | null): value is ContentType {
  return value === "poems" || value === "words";
}

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

function formatValue(value: string | string[]) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    return `\n${value.map((item) => `  - ${item}`).join("\n")}`;
  }

  if (value === "") {
    return '""';
  }

  return JSON.stringify(value);
}

function serializeMarkdownFile(
  type: ContentType,
  fields: {
    title: string;
    date: string;
    body: string;
    description?: string;
    tags?: string[];
  },
  extraAttributes: Record<string, unknown> = {},
) {
  const orderedAttributes: Record<string, unknown> =
    type === "poems"
      ? {
          title: fields.title,
          date: fields.date,
        }
      : {
          title: fields.title,
          date: fields.date,
          description: fields.description ?? "",
          tags: fields.tags ?? [],
        };

  const frontMatterKeys = Object.keys(orderedAttributes);
  const remainingKeys = Object.keys(extraAttributes).filter(
    (key) => !frontMatterKeys.includes(key),
  );

  const lines = [
    "---",
    ...frontMatterKeys.map(
      (key) =>
        `${key}: ${formatValue(
          orderedAttributes[key] as string | string[],
        )}`,
    ),
    ...remainingKeys.map(
      (key) =>
        `${key}: ${formatValue(extraAttributes[key] as string | string[])}`,
    ),
    "---",
    "",
    fields.body.replace(/^\n+/, ""),
  ];

  return `${lines.join("\n").replace(/\s+$/, "")}\n`;
}

function parseMarkdownFile(type: ContentType, slug: string): ParsedMarkdownFile {
  const filePath = path.join(getContentDirectory(type), `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { attributes, body } = frontMatter<Record<string, unknown>>(raw);

  return {
    slug,
    body,
    attributes,
  };
}

function toListItem(type: ContentType, file: ParsedMarkdownFile): AdminListItem {
  return {
    slug: file.slug,
    title: String(file.attributes.title ?? "Untitled"),
    date: String(file.attributes.date ?? ""),
    ...(type === "words"
      ? {
          description: String(file.attributes.description ?? ""),
          tags: Array.isArray(file.attributes.tags)
            ? file.attributes.tags.map(String)
            : [],
        }
      : {}),
  };
}

function toDetailItem(type: ContentType, file: ParsedMarkdownFile): AdminDetailItem {
  return {
    ...toListItem(type, file),
    body: file.body,
  };
}

async function readJsonBody(req: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(
  res: ViteDevServer["middlewares"] extends never ? never : Parameters<ViteDevServer["middlewares"]["handle"]>[2],
  statusCode: number,
  body: unknown,
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function adminContentPlugin(): Plugin {
  return {
    name: "admin-content-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/admin/content", async (req, res) => {
        if (!isLocalRequest(req.headers.host)) {
          sendJson(res, 403, { error: "Local access only" });
          return;
        }

        const requestUrl = new URL(req.url || "/", "http://localhost");
        const pathname = requestUrl.pathname.replace(/^\/+/, "");
        const segments = pathname.split("/").filter(Boolean);
        const method = req.method || "GET";

        try {
          if (method === "GET" && segments.length === 0) {
            const type = requestUrl.searchParams.get("type");

            if (!isValidType(type)) {
              sendJson(res, 400, { error: "Invalid content type" });
              return;
            }

            const directory = getContentDirectory(type);
            const items = fs
              .readdirSync(directory)
              .filter((file) => file.endsWith(".md"))
              .map((file) => file.replace(".md", ""))
              .map((slug) => parseMarkdownFile(type, slug))
              .map((file) => toListItem(type, file))
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              );

            sendJson(res, 200, { items });
            return;
          }

          if (method === "GET" && segments.length === 2) {
            const [type, slug] = segments;

            if (!isValidType(type) || !isValidSlug(slug)) {
              sendJson(res, 400, { error: "Invalid request" });
              return;
            }

            const filePath = path.join(getContentDirectory(type), `${slug}.md`);

            if (!fs.existsSync(filePath)) {
              sendJson(res, 404, { error: "Content not found" });
              return;
            }

            sendJson(res, 200, {
              item: toDetailItem(type, parseMarkdownFile(type, slug)),
            });
            return;
          }

          if (method === "POST" && segments.length === 0) {
            const payload = (await readJsonBody(req)) as Record<string, unknown>;
            const type = String(payload.type ?? "");
            const title = String(payload.title ?? "").trim();
            const date = String(payload.date ?? "").trim();
            const body = String(payload.body ?? "");
            const description = String(payload.description ?? "").trim();
            const tags = Array.isArray(payload.tags)
              ? payload.tags.map(String)
              : [];

            if (!isValidType(type) || !title || !date || !body.trim()) {
              sendJson(res, 400, { error: "Missing required fields" });
              return;
            }

            const slug = slugifyTitle(title);

            if (!slug || !isValidSlug(slug)) {
              sendJson(res, 400, { error: "Could not generate a valid slug" });
              return;
            }

            const filePath = path.join(getContentDirectory(type), `${slug}.md`);

            if (fs.existsSync(filePath)) {
              sendJson(res, 409, { error: "A file with that title already exists" });
              return;
            }

            const content = serializeMarkdownFile(
              type,
              {
                title,
                date,
                body,
                description,
                tags,
              },
            );

            fs.writeFileSync(filePath, content, "utf8");
            server.ws.send({ type: "full-reload" });

            sendJson(res, 201, {
              item: toDetailItem(type, parseMarkdownFile(type, slug)),
            });
            return;
          }

          if (method === "PUT" && segments.length === 2) {
            const [type, slug] = segments;

            if (!isValidType(type) || !isValidSlug(slug)) {
              sendJson(res, 400, { error: "Invalid request" });
              return;
            }

            const filePath = path.join(getContentDirectory(type), `${slug}.md`);

            if (!fs.existsSync(filePath)) {
              sendJson(res, 404, { error: "Content not found" });
              return;
            }

            const payload = (await readJsonBody(req)) as Record<string, unknown>;
            const title = String(payload.title ?? "").trim();
            const date = String(payload.date ?? "").trim();
            const body = String(payload.body ?? "");
            const description = String(payload.description ?? "").trim();
            const tags = Array.isArray(payload.tags)
              ? payload.tags.map(String)
              : [];

            if (!title || !date || !body.trim()) {
              sendJson(res, 400, { error: "Missing required fields" });
              return;
            }

            const existingFile = parseMarkdownFile(type, slug);
            const content = serializeMarkdownFile(
              type,
              {
                title,
                date,
                body,
                description,
                tags,
              },
              existingFile.attributes,
            );

            fs.writeFileSync(filePath, content, "utf8");
            server.ws.send({ type: "full-reload" });

            sendJson(res, 200, {
              item: toDetailItem(type, parseMarkdownFile(type, slug)),
            });
            return;
          }

          sendJson(res, 404, { error: "Not found" });
        } catch (error) {
          console.error(error);
          sendJson(res, 500, { error: "Admin content request failed" });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 9999 },
  plugins: [
    react(),
    adminContentPlugin(),
    Markdown(),
    sitemap({
      hostname: "https://www.whoisnaz.com",
      dynamicRoutes: ["/", "/articles", "/poems", ...getArticleSlugs(), ...getPoemSlugs()],
      priority: 0.7,
      generateRobotsTxt: true,
      robots: [{ userAgent: "*", allow: "/" }],
    }),
  ],
  assetsInclude: ["**/*.md"],
});
