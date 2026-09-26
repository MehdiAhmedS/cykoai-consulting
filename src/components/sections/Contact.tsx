"use client";

import { useState } from "react";
import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { site } from "@/content/site";

const { label, heading, body, email, note, form: copy } = site.contact;

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASS =
  "w-full rounded-xs border border-n300 bg-white px-4 py-3 text-[0.95rem] text-windsor placeholder:text-n500 outline-none transition-[border-color,box-shadow] duration-200 focus:border-driftwood focus:shadow-[0_0_0_3px_rgba(173,135,82,0.25)]";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? copy.error);
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : copy.error);
    }
  }

  return (
    <section
      id="contact"
      data-tone="light"
      className="relative bg-white py-[clamp(88px,14vh,150px)]"
    >
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-16 px-[clamp(20px,4vw,56px)] lg:grid-cols-2">
        <div>
          <Reveal>
            <MonoLabel tick>{label.text}</MonoLabel>
          </Reveal>
          <h2 className="mt-8 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-windsor">
            <SplitText>{heading.text}</SplitText>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-[1.05rem] leading-[1.7] text-n500">
              {body.text}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-col gap-1">
              <a
                href={`mailto:${email}`}
                className="w-fit text-[1.1rem] text-windsor underline decoration-driftwood underline-offset-4 transition-colors duration-250 hover:text-driftwood-deep"
              >
                {email}
              </a>
              <span className="text-[0.85rem] text-n500">
                {note.text}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-sm border border-n150 bg-white p-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                name="name"
                required
                placeholder={copy.name}
                className={FIELD_CLASS}
              />
              <input
                name="company"
                required
                placeholder={copy.company}
                className={FIELD_CLASS}
              />
            </div>
            <input
              type="email"
              name="email"
              required
              placeholder={copy.email}
              className={FIELD_CLASS}
            />
            <textarea
              name="message"
              required
              rows={4}
              placeholder={copy.message}
              className={`${FIELD_CLASS} resize-none`}
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <Button
                type="submit"
                disabled={status === "submitting"}
                variant="solid"
                className="w-fit"
              >
                {status === "submitting" ? copy.sending : copy.submit}
              </Button>

              <span
                role="status"
                className={`text-[0.85rem] transition-opacity duration-200 ${
                  status === "success" || status === "error"
                    ? "opacity-100"
                    : "opacity-0"
                } ${status === "error" ? "text-rose" : "text-driftwood-deep"}`}
              >
                {status === "success" && copy.success}
                {status === "error" && error}
              </span>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
