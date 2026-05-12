import { useEffect, useMemo, useState } from "react";

type InvoiceLineItem = {
  id: string;
  description: string;
  amount: string;
};

type InvoiceFormState = {
  invoiceDate: string;
  recipient: string;
  fromName: string;
  fromPhone: string;
  fromEmail: string;
  serviceDescription: string;
  services: InvoiceLineItem[];
  bankName: string;
  bankSortCode: string;
  bankAccountNumber: string;
};

const STORAGE_KEY = "whoisnaz.invoice-form";

const emptyService = (): InvoiceLineItem => ({
  id: crypto.randomUUID(),
  description: "",
  amount: "",
});

const defaultState: InvoiceFormState = {
  invoiceDate: new Date().toISOString().slice(0, 10),
  recipient: "",
  fromName: "",
  fromPhone: "",
  fromEmail: "",
  serviceDescription: "",
  services: [emptyService()],
  bankName: "",
  bankSortCode: "",
  bankAccountNumber: "",
};

const pdfEscape = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const toPdfBytes = (value: string) => {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }

  return bytes;
};

const sanitiseFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const parseCurrency = (value: string) => {
  const numeric = Number(value.replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const formatCurrency = (value: string) => {
  const numeric = parseCurrency(value);

  if (numeric === null) {
    return value.trim();
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(numeric);
};

const wrapText = (value: string, maxChars: number) => {
  if (!value.trim()) {
    return [""];
  }

  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxChars) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (word.length <= maxChars) {
      currentLine = word;
      return;
    }

    for (let index = 0; index < word.length; index += maxChars) {
      const slice = word.slice(index, index + maxChars);

      if (slice.length === maxChars) {
        lines.push(slice);
      } else {
        currentLine = slice;
      }
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
};

const splitCommaLines = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const createPdf = (state: InvoiceFormState) => {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  const bottomMargin = 60;
  const pages: string[][] = [[]];
  let pageIndex = 0;
  let cursorY = pageHeight - margin;

  const currentPage = () => pages[pageIndex];

  const ensureSpace = (heightNeeded: number) => {
    if (cursorY - heightNeeded < bottomMargin) {
      pages.push([]);
      pageIndex += 1;
      cursorY = pageHeight - margin;
    }
  };

  const drawText = (
    text: string,
    x: number,
    y: number,
    fontSize = 12,
    font = "F1",
  ) => {
    currentPage().push(
      `BT /${font} ${fontSize} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET`,
    );
  };

  const drawWrappedText = (
    text: string,
    x: number,
    fontSize = 12,
    maxChars = 70,
    gapAfter = 0,
  ) => {
    const lines = wrapText(text, maxChars);
    ensureSpace(lines.length * lineHeight + gapAfter);

    lines.forEach((line) => {
      drawText(line, x, cursorY, fontSize);
      cursorY -= lineHeight;
    });

    cursorY -= gapAfter;
  };

  const drawRule = (offset = 10) => {
    ensureSpace(offset + 8);
    const y = cursorY - offset;
    currentPage().push(
      `${margin.toFixed(2)} ${y.toFixed(2)} m ${(pageWidth - margin).toFixed(2)} ${y.toFixed(2)} l S`,
    );
    cursorY = y - 16;
  };

  const recipientLines = splitCommaLines(state.recipient);
  const fromLines = [
    state.fromName.trim(),
    state.fromPhone.trim(),
    state.fromEmail.trim(),
  ].filter(Boolean);
  const bankLines = [
    state.bankName.trim(),
    state.bankSortCode.trim() ? `Sort code: ${state.bankSortCode.trim()}` : "",
    state.bankAccountNumber.trim()
      ? `Account number: ${state.bankAccountNumber.trim()}`
      : "",
  ].filter(Boolean);
  const totalAmount = state.services.reduce((sum, item) => {
    const amount = parseCurrency(item.amount);
    return amount === null ? sum : sum + amount;
  }, 0);

  drawText("Invoice", margin, cursorY, 24, "F2");
  cursorY -= 32;

  drawText(
    `Invoice date: ${state.invoiceDate || new Date().toISOString().slice(0, 10)}`,
    margin,
    cursorY,
  );
  cursorY -= 28;

  drawText("Billed to", margin, cursorY, 13, "F2");
  drawText("From", margin + contentWidth / 2, cursorY, 13, "F2");
  cursorY -= 18;

  const blockHeight =
    Math.max(recipientLines.length, fromLines.length, 1) * lineHeight + 12;
  ensureSpace(blockHeight);

  recipientLines.forEach((line, index) => {
    drawText(line, margin, cursorY - index * lineHeight);
  });

  fromLines.forEach((line, index) => {
    drawText(line, margin + contentWidth / 2, cursorY - index * lineHeight);
  });

  cursorY -= blockHeight;
  drawRule(0);

  if (state.serviceDescription.trim()) {
    drawText("Description of services", margin, cursorY, 13, "F2");
    cursorY -= 18;
    drawWrappedText(state.serviceDescription.trim(), margin, 12, 78, 12);
  }

  drawText("Services provided", margin, cursorY, 13, "F2");
  cursorY -= 20;

  drawText("Description", margin, cursorY, 11, "F2");
  drawText("Amount", pageWidth - margin - 60, cursorY, 11, "F2");
  cursorY -= 14;
  drawRule(0);

  state.services
    .filter((item) => item.description.trim() || item.amount.trim())
    .forEach((item) => {
      const descriptionLines = wrapText(item.description.trim() || "-", 64);
      const amountText = item.amount.trim() ? formatCurrency(item.amount) : "-";
      const rowHeight = descriptionLines.length * lineHeight + 8;

      ensureSpace(rowHeight + 12);

      descriptionLines.forEach((line, index) => {
        drawText(line, margin, cursorY - index * lineHeight);
      });

      drawText(amountText, pageWidth - margin - 60, cursorY, 12);
      cursorY -= rowHeight;
      drawRule(0);
    });

  drawText("Total", pageWidth - margin - 110, cursorY, 12, "F2");
  drawText(
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(totalAmount),
    pageWidth - margin - 60,
    cursorY,
    12,
    "F2",
  );
  cursorY -= 28;

  if (bankLines.length > 0) {
    drawText("Bank details", margin, cursorY, 13, "F2");
    cursorY -= 18;
    bankLines.forEach((line) => {
      ensureSpace(lineHeight);
      drawText(line, margin, cursorY);
      cursorY -= lineHeight;
    });
  }

  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds = pages.map((_, index) => 3 + index * 2);
  const contentObjectIds = pages.map((_, index) => 4 + index * 2);

  objects.push(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  );

  pages.forEach((commands, index) => {
    const pageObjectId = pageObjectIds[index];
    const contentObjectId = contentObjectIds[index];

    objects[pageObjectId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;

    const stream = commands.join("\n");
    objects[contentObjectId - 1] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([toPdfBytes(pdf)], { type: "application/pdf" });
};

const InvoiceRoute = () => {
  const [formState, setFormState] = useState<InvoiceFormState>(defaultState);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute("content") ?? null;

    if (robotsMeta) {
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else {
      const createdMeta = document.createElement("meta");
      createdMeta.name = "robots";
      createdMeta.content = "noindex, nofollow";
      document.head.appendChild(createdMeta);
    }

    const previousTitle = document.title;
    document.title = "Invoice";

    try {
      const savedState = window.localStorage.getItem(STORAGE_KEY);

      if (savedState) {
        const parsedState = JSON.parse(savedState) as Partial<InvoiceFormState>;
        setFormState({
          ...defaultState,
          ...parsedState,
          services:
            parsedState.services && parsedState.services.length > 0
              ? parsedState.services.map((item) => ({
                  ...item,
                  id: item.id || crypto.randomUUID(),
                }))
              : [emptyService()],
        });
      }
    } catch (error) {
      console.error("Could not load saved invoice form", error);
    } finally {
      setLoadedFromStorage(true);
    }

    return () => {
      document.title = previousTitle;

      if (robotsMeta) {
        if (previousRobots) {
          robotsMeta.setAttribute("content", previousRobots);
        } else {
          robotsMeta.removeAttribute("content");
        }
      } else {
        document
          .querySelector('meta[name="robots"][content="noindex, nofollow"]')
          ?.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!loadedFromStorage) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  }, [formState, loadedFromStorage]);

  const updateField = <K extends keyof InvoiceFormState>(
    field: K,
    value: InvoiceFormState[K],
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateService = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string,
  ) => {
    setFormState((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service,
      ),
    }));
  };

  const addService = () => {
    setFormState((current) => ({
      ...current,
      services: [...current.services, emptyService()],
    }));
  };

  const removeService = (id: string) => {
    setFormState((current) => ({
      ...current,
      services:
        current.services.length === 1
          ? [emptyService()]
          : current.services.filter((service) => service.id !== id),
    }));
  };

  const total = useMemo(
    () =>
      formState.services.reduce((sum, service) => {
        const amount = parseCurrency(service.amount);
        return amount === null ? sum : sum + amount;
      }, 0),
    [formState.services],
  );

  const recipientLines = splitCommaLines(formState.recipient);
  const fromLines = [
    formState.fromName.trim(),
    formState.fromPhone.trim(),
    formState.fromEmail.trim(),
  ].filter(Boolean);

  const downloadPdf = () => {
    const blob = createPdf(formState);
    const recipientSlug = sanitiseFileName(recipientLines[0] || "invoice");
    const dateSlug = formState.invoiceDate || new Date().toISOString().slice(0, 10);
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `${dateSlug}-${recipientSlug}-invoice.pdf`;
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  };

  return (
    <div className="invoice-route-shell">
      <div className="invoice-route-header">
        <div>
          <p className="invoice-kicker">Private invoice maker</p>
          <h1 className="invoice-title">Invoice</h1>
          <p className="invoice-subtitle">
            Your details stay in this browser via local storage and prefill next time.
          </p>
        </div>
        <button className="invoice-download-button" type="button" onClick={downloadPdf}>
          Download PDF
        </button>
      </div>

      <div className="invoice-route-grid">
        <section className="invoice-panel">
          <h2 className="invoice-panel-title">Invoice details</h2>

          <label className="invoice-field">
            <span>Invoice date</span>
            <input
              type="date"
              value={formState.invoiceDate}
              onChange={(event) => updateField("invoiceDate", event.target.value)}
            />
          </label>

          <label className="invoice-field">
            <span>Recipient</span>
            <textarea
              rows={4}
              placeholder="Example Studio Ltd, Sample House, 42 Demo Road, Testtown, AB1 2CD"
              value={formState.recipient}
              onChange={(event) => updateField("recipient", event.target.value)}
            />
          </label>

          <div className="invoice-field-group">
            <label className="invoice-field">
              <span>From name</span>
              <input
                type="text"
                placeholder="Alex Example"
                value={formState.fromName}
                onChange={(event) => updateField("fromName", event.target.value)}
              />
            </label>

            <label className="invoice-field">
              <span>From phone</span>
              <input
                type="text"
                placeholder="07123 456789"
                value={formState.fromPhone}
                onChange={(event) => updateField("fromPhone", event.target.value)}
              />
            </label>

            <label className="invoice-field">
              <span>From email</span>
              <input
                type="email"
                placeholder="alex@examplemail.com"
                value={formState.fromEmail}
                onChange={(event) => updateField("fromEmail", event.target.value)}
              />
            </label>
          </div>

          <label className="invoice-field">
            <span>Description of services</span>
            <textarea
              rows={4}
              placeholder="Project planning, delivery, and advisory support for the agreed engagement."
              value={formState.serviceDescription}
              onChange={(event) =>
                updateField("serviceDescription", event.target.value)
              }
            />
          </label>

          <div className="invoice-services-section">
            <div className="invoice-services-header">
              <h3>Services provided</h3>
              <button type="button" className="invoice-secondary-button" onClick={addService}>
                Add service
              </button>
            </div>

            {formState.services.map((service, index) => (
              <div key={service.id} className="invoice-service-row">
                <label className="invoice-field invoice-service-description">
                  <span>Description</span>
                  <input
                    type="text"
                    placeholder="Strategy workshop and delivery support"
                    value={service.description}
                    onChange={(event) =>
                      updateService(service.id, "description", event.target.value)
                    }
                  />
                </label>

                <label className="invoice-field invoice-service-amount">
                  <span>Amount</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="500.00"
                    value={service.amount}
                    onChange={(event) =>
                      updateService(service.id, "amount", event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="invoice-remove-button"
                  onClick={() => removeService(service.id)}
                  aria-label={`Remove service ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="invoice-field-group">
            <label className="invoice-field">
              <span>Bank name</span>
              <input
                type="text"
                placeholder="Example Bank"
                value={formState.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
              />
            </label>

            <label className="invoice-field">
              <span>Sort code</span>
              <input
                type="text"
                placeholder="10-20-30"
                value={formState.bankSortCode}
                onChange={(event) => updateField("bankSortCode", event.target.value)}
              />
            </label>

            <label className="invoice-field">
              <span>Account number</span>
              <input
                type="text"
                placeholder="12345678"
                value={formState.bankAccountNumber}
                onChange={(event) =>
                  updateField("bankAccountNumber", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <section className="invoice-preview-panel">
          <div className="invoice-preview-sheet">
            <div className="invoice-preview-top">
              <div>
                <p className="invoice-preview-kicker">Invoice</p>
                <h2>Invoice</h2>
              </div>
              <p className="invoice-preview-date">
                <span>Invoice date</span>
                <strong>{formState.invoiceDate || "Not set"}</strong>
              </p>
            </div>

            <div className="invoice-preview-addresses">
              <div>
                <h3>Billed to</h3>
                {recipientLines.length > 0 ? (
                  recipientLines.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p className="invoice-placeholder">Recipient details will appear here.</p>
                )}
              </div>

              <div>
                <h3>From</h3>
                {fromLines.length > 0 ? (
                  fromLines.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p className="invoice-placeholder">Sender details will appear here.</p>
                )}
              </div>
            </div>

            <div className="invoice-preview-block">
              <h3>Description of services</h3>
              <p>
                {formState.serviceDescription.trim() || "Add an overall description of the work."}
              </p>
            </div>

            <div className="invoice-preview-block">
              <div className="invoice-preview-table-head">
                <h3>Services provided</h3>
                <p className="invoice-total-pill">
                  Total{" "}
                  <strong>
                    {new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: "GBP",
                    }).format(total)}
                  </strong>
                </p>
              </div>

              <div className="invoice-preview-table">
                <div className="invoice-preview-table-row invoice-preview-table-labels">
                  <span>Description</span>
                  <span>Amount</span>
                </div>

                {formState.services.some(
                  (service) => service.description.trim() || service.amount.trim(),
                ) ? (
                  formState.services.map((service) => (
                    <div key={service.id} className="invoice-preview-table-row">
                      <span>{service.description.trim() || "Untitled service"}</span>
                      <strong>{service.amount.trim() ? formatCurrency(service.amount) : "-"}</strong>
                    </div>
                  ))
                ) : (
                  <div className="invoice-preview-table-row">
                    <span className="invoice-placeholder">Your service lines will show here.</span>
                    <strong>-</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-preview-block">
              <h3>Bank details</h3>
              {formState.bankName || formState.bankSortCode || formState.bankAccountNumber ? (
                <>
                  {formState.bankName ? <p>{formState.bankName}</p> : null}
                  {formState.bankSortCode ? <p>Sort code: {formState.bankSortCode}</p> : null}
                  {formState.bankAccountNumber ? (
                    <p>Account number: {formState.bankAccountNumber}</p>
                  ) : null}
                </>
              ) : (
                <p className="invoice-placeholder">Bank details will appear here.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InvoiceRoute;
