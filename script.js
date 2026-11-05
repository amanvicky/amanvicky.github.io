/* amanvicky.github.io — typing, scroll-reveal, live star counts */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── typing animation for hero roles ───────────────────────────── */
  var typedEl = document.querySelector(".typed");
  if (typedEl) {
    var roles = [];
    try { roles = JSON.parse(typedEl.getAttribute("data-roles")) || []; } catch (e) {}
    if (reduceMotion || !roles.length) {
      typedEl.textContent = roles.join(" · ");
    } else {
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
  }

  /* ── scroll reveal ─────────────────────────────────────────────── */
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

  /* ── live star counts (graceful fallback: stays hidden) ────────── */
  var starsEls = Array.prototype.slice.call(document.querySelectorAll("[data-stars]"));
  if (starsEls.length && !navigator.onLine === false) {
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
