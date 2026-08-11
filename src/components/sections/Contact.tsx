"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASS =
  "w-full rounded-2xl border border-border bg-white/[0.03] px-5 py-4 text-[0.95rem] text-ink placeholder:text-ink-faint outline-none transition-colors duration-300 focus:border-white/25 focus:bg-white/[0.05]";

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
        throw new Error(json.error ?? "Something went wrong.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="relative py-32 md:py-44">
      <div className="ambient-glow left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 bg-gold/[0.08]" />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:px-10 lg:grid-cols-2">
        <div>
          <Reveal>
            <SectionLabel index="06">Get in touch</SectionLabel>
          </Reveal>
          <h2 className="mt-8 font-display font-medium leading-[1.02] tracking-[-0.02em] text-[clamp(2.5rem,5.5vw,4.5rem)]">
            <SplitText className="text-ink">
              Let&rsquo;s shape what&rsquo;s next.
            </SplitText>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
              Tell us where your organization is headed, and where it feels
              stuck. We typically respond within one business day.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-col gap-1">
              <a
                href="mailto:info@cykoai.com"
                data-cursor="link"
                className="w-fit text-[1.1rem] text-ink underline decoration-border-strong underline-offset-4 transition-colors hover:text-gold"
              >
                info@cykoai.com
              </a>
              <span className="text-[0.85rem] text-ink-faint">
                For press and partnerships, same address.
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <form onSubmit={handleSubmit} className="glass flex flex-col gap-4 rounded-3xl p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                name="name"
                required
                placeholder="Full name"
                className={FIELD_CLASS}
              />
              <input
                name="company"
                required
                placeholder="Company"
                className={FIELD_CLASS}
              />
            </div>
            <input
              type="email"
              name="email"
              required
              placeholder="Work email"
              className={FIELD_CLASS}
            />
            <textarea
              name="message"
              required
              rows={4}
              placeholder="What are you trying to solve?"
              className={`${FIELD_CLASS} resize-none`}
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <MagneticButton
                type="submit"
                disabled={status === "submitting"}
                variant="solid"
                size="md"
                className="w-fit"
              >
                {status === "submitting" ? "Sending…" : "Send message"}
              </MagneticButton>

              <motion.span
                initial={false}
                animate={{ opacity: status === "success" || status === "error" ? 1 : 0 }}
                className={`text-[0.85rem] ${
                  status === "success" ? "text-gold-light" : "text-red-400"
                }`}
              >
                {status === "success" && "Thanks — we'll be in touch shortly."}
                {status === "error" && error}
              </motion.span>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
