import { useEffect, useState } from "react";

type ContentType = "poems" | "words";
type SaveState = "idle" | "saving" | "saved" | "error";

interface ContentListItem {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

interface ContentDetailItem extends ContentListItem {
  body: string;
}

interface EditorFormState {
  title: string;
  date: string;
  description: string;
  tags: string;
  body: string;
}

const emptyFormState: EditorFormState = {
  title: "",
  date: "",
  description: "",
  tags: "",
  body: "",
};

const typeLabels: Record<ContentType, string> = {
  poems: "poems",
  words: "words",
};

function toFormState(item: ContentDetailItem): EditorFormState {
  return {
    title: item.title,
    date: item.date,
    description: item.description ?? "",
    tags: item.tags?.join(", ") ?? "",
    body: item.body,
  };
}

function parseTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

const Admin = () => {
  const [contentType, setContentType] = useState<ContentType>("poems");
  const [items, setItems] = useState<ContentListItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorFormState>(emptyFormState);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const loadItems = async (type: ContentType) => {
    setListLoading(true);

    try {
      const response = await fetch(`/api/admin/content?type=${type}`);
      const data = (await response.json()) as {
        items?: ContentListItem[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to load content");
      }

      const loadedItems = data.items ?? [];
      setItems(loadedItems);

      if (loadedItems.length === 0) {
        setSelectedSlug(null);
        setEditorState(emptyFormState);
        setIsCreatingNew(true);
        return;
      }

      setSelectedSlug(loadedItems[0].slug);
      setIsCreatingNew(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load content",
      );
      setItems([]);
      setSelectedSlug(null);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    setSaveState("idle");
    setErrorMessage("");
    setEditorState(emptyFormState);
    setItems([]);
    setSelectedSlug(null);
    setIsCreatingNew(false);
    loadItems(contentType).catch((error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load content",
      );
    });
  }, [contentType]);

  useEffect(() => {
    if (!import.meta.env.DEV || isCreatingNew || !selectedSlug) {
      return;
    }

    const loadDetail = async () => {
      setDetailLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/admin/content/${contentType}/${selectedSlug}`,
        );
        const data = (await response.json()) as {
          item?: ContentDetailItem;
          error?: string;
        };

        if (!response.ok || !data.item) {
          throw new Error(data.error || "Failed to load item");
        }

        setEditorState(toFormState(data.item));
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load item",
        );
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail().catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load item");
      setDetailLoading(false);
    });
  }, [contentType, isCreatingNew, selectedSlug]);

  if (!import.meta.env.DEV) {
    return (
      <div className="admin-shell">
        <h1>admin unavailable</h1>
        <p>This page only exists in local development.</p>
      </div>
    );
  }

  const onFieldChange = (field: keyof EditorFormState, value: string) => {
    setEditorState((current) => ({
      ...current,
      [field]: value,
    }));
    setSaveState("idle");
    setErrorMessage("");
  };

  const selectItem = (slug: string) => {
    setIsCreatingNew(false);
    setSelectedSlug(slug);
    setSaveState("idle");
    setErrorMessage("");
  };

  const startNewItem = () => {
    setIsCreatingNew(true);
    setSelectedSlug(null);
    setEditorState(emptyFormState);
    setSaveState("idle");
    setErrorMessage("");
  };

  const refreshAfterSave = async (type: ContentType, savedSlug: string) => {
    const response = await fetch(`/api/admin/content?type=${type}`);
    const data = (await response.json()) as {
      items?: ContentListItem[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || "Failed to refresh content");
    }

    const loadedItems = data.items ?? [];
    setItems(loadedItems);
    setSelectedSlug(savedSlug);
    setIsCreatingNew(false);
  };

  const submitForm = async () => {
    if (!editorState.title.trim() || !editorState.date.trim() || !editorState.body.trim()) {
      setSaveState("error");
      setErrorMessage("Title, date, and body are required.");
      return;
    }

    setSaveState("saving");
    setErrorMessage("");

    const payload = {
      ...(isCreatingNew ? { type: contentType } : {}),
      title: editorState.title,
      date: editorState.date,
      description: contentType === "words" ? editorState.description : undefined,
      tags: contentType === "words" ? parseTags(editorState.tags) : undefined,
      body: editorState.body,
    };

    try {
      const response = await fetch(
        isCreatingNew
          ? "/api/admin/content"
          : `/api/admin/content/${contentType}/${selectedSlug}`,
        {
          method: isCreatingNew ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as {
        item?: ContentDetailItem;
        error?: string;
      };

      if (!response.ok || !data.item) {
        throw new Error(data.error || "Failed to save");
      }

      await refreshAfterSave(contentType, data.item.slug);
      setEditorState(toFormState(data.item));
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to save");
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1>admin</h1>
        <p className="admin-subtitle">
          Edit local Markdown files for poems and words.
        </p>
      </div>

      <div className="admin-toggle-group" role="tablist" aria-label="Content type">
        {(["poems", "words"] as ContentType[]).map((type) => (
          <button
            key={type}
            type="button"
            className={`admin-toggle ${contentType === type ? "is-active" : ""}`}
            onClick={() => setContentType(type)}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>{contentType}</h2>
            <button type="button" className="admin-button" onClick={startNewItem}>
              New {contentType === "poems" ? "poem" : "word"}
            </button>
          </div>

          {listLoading ? (
            <p>Loading {contentType}…</p>
          ) : items.length === 0 ? (
            <p>No {contentType} yet.</p>
          ) : (
            <ul className="admin-list">
              {items.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    className={`admin-list-item ${
                      !isCreatingNew && selectedSlug === item.slug ? "is-selected" : ""
                    }`}
                    onClick={() => selectItem(item.slug)}
                  >
                    <span className="admin-list-item-title">{item.title}</span>
                    <span className="admin-list-item-date">{item.date}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="admin-editor">
          <div className="admin-editor-header">
            <h2>
              {isCreatingNew
                ? `new ${contentType === "poems" ? "poem" : "word"}`
                : editorState.title || "editor"}
            </h2>
            <div className="admin-status" aria-live="polite">
              {detailLoading && <span>Loading…</span>}
              {!detailLoading && saveState === "saving" && <span>Saving…</span>}
              {!detailLoading && saveState === "saved" && <span>Saved.</span>}
              {!detailLoading && saveState === "error" && errorMessage && (
                <span>{errorMessage}</span>
              )}
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Title</span>
              <input
                value={editorState.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Date</span>
              <input
                type="date"
                value={editorState.date}
                onChange={(event) => onFieldChange("date", event.target.value)}
              />
            </label>

            {contentType === "words" && (
              <>
                <label className="admin-field">
                  <span>Description</span>
                  <input
                    value={editorState.description}
                    onChange={(event) =>
                      onFieldChange("description", event.target.value)
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Tags</span>
                  <input
                    value={editorState.tags}
                    onChange={(event) => onFieldChange("tags", event.target.value)}
                    placeholder="music, notes, archived"
                  />
                </label>
              </>
            )}
          </div>

          <label className="admin-field">
            <span>Body</span>
            <textarea
              className="admin-textarea"
              value={editorState.body}
              onChange={(event) => onFieldChange("body", event.target.value)}
            />
          </label>

          <div className="admin-actions">
            <button type="button" className="admin-button" onClick={submitForm}>
              {isCreatingNew ? "Create" : "Save"}
            </button>

            {isCreatingNew && items.length > 0 && (
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={() => selectItem(items[0].slug)}
              >
                Cancel new
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
