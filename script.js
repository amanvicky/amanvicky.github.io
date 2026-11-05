/* amanvicky.github.io — boot sequence, typing, scroll-reveal, stats, scrollspy, stars */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. hero boot sequence ─────────────────────────────────────── */
  var cmds = Array.prototype.slice.call(document.querySelectorAll(".boot-cmd"));
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".boot-block"));
  var typedEl = document.querySelector(".typed");
  var roles = [];
  try { roles = JSON.parse((typedEl && typedEl.getAttribute("data-roles")) || "[]"); } catch (e) {}

  function startRolesTyper() {
    if (!typedEl) return;
    if (reduceMotion || !roles.length) { typedEl.textContent = roles.join(" · "); return; }
    var ri = 0, ci = 0, deleting = false;
    (function tick() {
      var word = roles[ri];
      ci += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, ci);
      var delay = deleting ? 34 : 74;
      if (!deleting && ci === word.length) { deleting = true; delay = 1500; }
      else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 380; }
      setTimeout(tick, delay);
    })();
  }

  if (cmds.length && blocks.length && !reduceMotion) {
    blocks.forEach(function (b) { b.classList.add("boot-hide"); });
    var seq = [
      { kind: "cmd", el: cmds[0] },
      { kind: "block", el: blocks[0] },
      { kind: "cmd", el: cmds[1] },
      { kind: "block", el: blocks[1] },
      { kind: "cmd", el: cmds[2], last: true }
    ];
    var si = 0;
    function typeCmd(step) {
      var text = step.el.getAttribute("data-cmd") || "";
      var i = 0;
      (function t() {
        i += 1;
        step.el.textContent = text.slice(0, i);
        if (i < text.length) setTimeout(t, 36 + Math.random() * 48);
        else setTimeout(next, 240);
      })();
    }
    function next() {
      var step = seq[si++];
      if (!step) { startRolesTyper(); return; }
      if (step.kind === "cmd") typeCmd(step);
      else { step.el.classList.add("boot-on"); setTimeout(next, 220); }
    }
    next();
  } else {
    cmds.forEach(function (el) { el.textContent = el.getAttribute("data-cmd") || ""; });
    startRolesTyper();
  }

  /* ── 2. scroll reveal ──────────────────────────────────────────── */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── 3. live GitHub stats with count-up ────────────────────────── */
  function setStat(name, value) {
    var el = document.querySelector('[data-stat="' + name + '"]');
    if (!el || typeof value !== "number" || !isFinite(value)) return;
    if (reduceMotion) { el.textContent = value.toLocaleString(); return; }
    var start = parseInt(el.textContent.replace(/,/g, ""), 10) || 0;
    var t0 = performance.now(), dur = 900;
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur);
      var v = Math.round(start + (value - start) * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  fetch("https://api.github.com/users/amanvicky")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (u) {
      if (!u) return;
      setStat("repos", u.public_repos);
      setStat("followers", u.followers);
    })
    .catch(function () {});
  fetch("https://api.github.com/users/amanvicky/repos?per_page=100")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (list) {
      if (!Array.isArray(list)) return;
      setStat("stars", list.reduce(function (s, x) { return s + (x.stargazers_count || 0); }, 0));
    })
    .catch(function () {});

  /* ── 4. scrollspy nav ──────────────────────────────────────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var linkMap = {};
  navLinks.forEach(function (a) { linkMap[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("active"); });
        var a = linkMap[entry.target.id];
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["projects", "stack", "about", "contact"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ── 5. back to top ────────────────────────────────────────────── */
  var backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ── 6. live star counts (graceful fallback: stays hidden) ─────── */
  var starsEls = Array.prototype.slice.call(document.querySelectorAll("[data-stars]"));
  if (starsEls.length) {
    starsEls.forEach(function (el) {
      var repo = el.closest("[data-repo]");
      if (!repo) return;
      var name = repo.getAttribute("data-repo");
      var cached = null;
      try { cached = sessionStorage.getItem("gh-stars-" + name); } catch (e) {}
      if (cached !== null) { el.textContent = cached; return; }
      fetch("https://api.github.com/repos/amanvicky/" + encodeURIComponent(name))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || typeof data.stargazers_count !== "number") return;
          if (data.stargazers_count === 0) return; /* nothing to brag about yet */
          var label = "\u2605 " + data.stargazers_count;
          try { sessionStorage.setItem("gh-stars-" + name, label); } catch (e) {}
          el.textContent = label;
        })
        .catch(function () { /* static fallback: element stays empty, hidden by CSS */ });
    });
  }
})();
