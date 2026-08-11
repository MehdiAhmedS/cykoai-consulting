// Cykoai — minimal static build. Plain vanilla JS, no dependencies.

(function () {
  "use strict";

  /* ---------- Theme toggle (dark/light) ----------
     The visual crossfade between sun/moon icons is pure CSS, driven by
     [data-theme] on <html> (see the two .icon-sun/.icon-moon rules in
     styles.css) — this just flips the attribute and persists it. The
     initial value is set by a blocking inline script in <head>, before
     first paint, so there's no flash of the wrong theme. */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      themeToggle.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
      try {
        localStorage.setItem("cykoai-theme", next);
      } catch {
        // Storage unavailable (private browsing, etc.) — theme just won't persist.
      }
    });
  }

  /* ---------- Nav: background on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");
  navToggle.addEventListener("click", function () {
    var open = navMobile.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navMobile.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMobile.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Philosophy: scroll-pinned line reveal (no GSAP) ----------
     The "pin" itself is plain CSS (position: sticky inside a 400vh-tall
     wrapper) — this listener just figures out scroll progress through
     that wrapper and toggles which line is active. rAF-throttled so it
     costs at most one class-toggle pass per rendered frame. */
  var philSection = document.querySelector(".philosophy-pin");
  var philLines = document.querySelectorAll(".phil-line");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (philSection && philLines.length && !prefersReducedMotion) {
    var philTicking = false;

    function updatePhilosophy() {
      var rect = philSection.getBoundingClientRect();
      var scrollableDistance = rect.height - window.innerHeight;
      var progress = scrollableDistance > 0 ? Math.min(Math.max(-rect.top / scrollableDistance, 0), 1) : 0;
      var segment = 1 / philLines.length;

      philLines.forEach(function (line, i) {
        var start = i * segment;
        var end = i === philLines.length - 1 ? Infinity : start + segment;
        if (progress < start) {
          line.classList.remove("is-active", "is-past");
        } else if (progress < end) {
          line.classList.add("is-active");
          line.classList.remove("is-past");
        } else {
          line.classList.remove("is-active");
          line.classList.add("is-past");
        }
      });
      philTicking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!philTicking) {
          window.requestAnimationFrame(updatePhilosophy);
          philTicking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updatePhilosophy);
    updatePhilosophy();
  }

  /* ---------- Testimonials rotator ---------- */
  var quotes = [
    {
      quote:
        "Cykoai didn’t just advise us on AI adoption — they sat with our engineers until the system was live, secure, and owned by our own team.",
      name: "Chief Information Officer",
      org: "Global Financial Services Institution",
    },
    {
      quote:
        "They speak the language of the board and the language of the SOC in the same meeting. That’s rare, and it’s exactly what a transformation like ours needed.",
      name: "VP of Enterprise Architecture",
      org: "Multinational Manufacturer",
    },
    {
      quote:
        "The clarity they brought to a genuinely chaotic modernization program was the single biggest factor in us shipping on time.",
      name: "Director of Technology Strategy",
      org: "Federal Agency",
    },
  ];

  var quoteEl = document.getElementById("quote");
  var quoteAuthorEl = document.getElementById("quoteAuthor");
  var dotsWrap = document.getElementById("quoteDots");
  var quoteIndex = 0;
  var quoteTimer = null;
  var quoteWrap = quoteEl ? quoteEl.closest(".quote-wrap") : null;

  function renderQuote(i) {
    var q = quotes[i];
    quoteEl.textContent = "“" + q.quote + "”";
    quoteAuthorEl.querySelector(".name").textContent = q.name;
    quoteAuthorEl.querySelector(".org").textContent = q.org;
    dotsWrap.querySelectorAll("button").forEach(function (dot, idx) {
      dot.classList.toggle("active", idx === i);
    });
  }

  function goToQuote(i) {
    if (!quoteWrap) return;
    quoteWrap.classList.add("fade-out");
    window.setTimeout(function () {
      quoteIndex = i;
      renderQuote(quoteIndex);
      quoteWrap.classList.remove("fade-out");
    }, 250);
  }

  function startQuoteTimer() {
    quoteTimer = window.setInterval(function () {
      goToQuote((quoteIndex + 1) % quotes.length);
    }, 6000);
  }

  if (quoteEl && dotsWrap) {
    quotes.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", function () {
        goToQuote(i);
        window.clearInterval(quoteTimer);
        startQuoteTimer();
      });
      dotsWrap.appendChild(dot);
    });

    var section = quoteWrap.closest("section");
    section.addEventListener("mouseenter", function () {
      window.clearInterval(quoteTimer);
    });
    section.addEventListener("mouseleave", startQuoteTimer);

    startQuoteTimer();
  }

  /* ---------- Contact form (static site: no backend) ----------
     Builds a pre-filled mailto: link from the form fields. Swap this
     handler out for a fetch() to Formspree / Netlify Forms / your own
     API route once you have somewhere to actually deliver submissions. */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "");
      var company = String(data.get("company") || "");
      var email = String(data.get("email") || "");
      var message = String(data.get("message") || "");

      var subject = encodeURIComponent("Inquiry from " + name + (company ? " (" + company + ")" : ""));
      var body = encodeURIComponent(message + "\n\n—\n" + name + "\n" + company + "\n" + email);
      window.location.href = "mailto:info@cykoai.com?subject=" + subject + "&body=" + body;

      status.textContent = "Opening your email client…";
      window.setTimeout(function () {
        status.textContent = "";
      }, 5000);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = "© " + new Date().getFullYear() + " Cykoai Consulting. All rights reserved.";
})();
