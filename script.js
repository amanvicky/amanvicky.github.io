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

  /* ── 7. interactive terminal (ctrl+k / nav button) ─────────────── */
  var overlay = document.getElementById("termOverlay");
  var out = document.getElementById("termOut");
  var input = document.getElementById("termInput");
  var REPOS = {
    "1": "Genesis-Business-Decoding-Engine", genesis: "Genesis-Business-Decoding-Engine",
    "2": "leyp", leyp: "leyp",
    "3": "Open-Broadcast", openbroadcast: "Open-Broadcast", broadcast: "Open-Broadcast",
    "4": "Gazester", gazester: "Gazester",
    "5": "Skill-God-Mode", godmode: "Skill-God-Mode", "god mode": "Skill-God-Mode",
    "6": "Human-Typer", humantyper: "Human-Typer",
    analyzer: "Insta-followers-analyzer",
    profile: "amanvicky",
    portfolio: "amanvicky.github.io"
  };
  var FEATURED = ["Genesis-Business-Decoding-Engine", "leyp", "Open-Broadcast", "Gazester", "Skill-God-Mode", "Human-Typer"];
  var queue = [], pumping = false;

  function print(text, cls) {
    queue.push({ text: text, cls: cls || "" });
    if (!pumping) pump();
  }
  function pump() {
    pumping = true;
    (function nextLine() {
      var item = queue.shift();
      if (!item) { pumping = false; return; }
      var div = document.createElement("div");
      div.className = "term-line " + item.cls;
      div.textContent = item.text;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
      setTimeout(nextLine, reduceMotion ? 0 : 26);
    })();
  }
  function openRepo(key) {
    var name = REPOS[key.toLowerCase()];
    if (!name) { print("no such repo: " + key + " — try 'projects'", "t-err"); return; }
    print("opening github.com/amanvicky/" + name + " ...", "t-ok");
    window.open("https://github.com/amanvicky/" + name, "_blank", "noopener");
  }
  var COMMANDS = {
    help: function () {
      print("available commands:", "t-dim");
      print("  whoami            who am I");
      print("  projects          featured projects");
      print("  open <n|name>     open a repo on github (1-6 or genesis/leyp/...)");
      print("  stack             the stack, grouped");
      print("  stats             live github numbers");
      print("  journey           2022 -> now");
      print("  contact           how to reach me");
      print("  goto <section>    scroll the page (projects/stack/about/contact)");
      print("  clear · exit      housekeeping");
      print("  sudo hire aman    try it", "t-dim");
    },
    whoami: function () {
      print("Aman. I make agents and CV tools.");
      print("Genesis, leyp and GOD MODE are the big ones. 'projects' for the rest.", "t-dim");
    },
    projects: function () {
      print("featured projects:", "t-dim");
      print("  1  Genesis        venture due-diligence by a team of agents");
      print("  2  leyp           job application copilot, human-approved");
      print("  3  OpenBroadcast  CPU-only real-time gaze correction");
      print("  4  Gazester       CNN-warping gaze correction");
      print("  5  GOD MODE       dev squads + red teams in one skill file");
      print("  6  Human-Typer    human-like typing for Windows");
      print("run: open <number>", "t-dim");
    },
    stack: function () {
      print("ai_agents   : multi-agent · tool use · OpenAI/Anthropic/Mistral/Ollama");
      print("languages   : Python · TypeScript · SQL · Bash · HCL");
      print("web         : Next.js · React · FastAPI · Flask · Prisma");
      print("devops      : Docker · Kubernetes · Terraform · Jenkins · AWS");
      print("cv          : MediaPipe · OpenCV · TensorFlow · ONNX");
    },
    stats: function () {
      fetch("https://api.github.com/users/amanvicky")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (u) {
          if (!u) { print("github api is not answering right now.", "t-err"); return; }
          print("public repos: " + u.public_repos + " · followers: " + u.followers, "t-ok");
          print("everything links to source — see 'projects'", "t-dim");
        })
        .catch(function () { print("network says no.", "t-err"); });
    },
    journey: function () {
      print("2022    devops foundations — jenkins · terraform · k8s · aws");
      print("2023-25 python + data — 100 sql projects, automation tooling");
      print("2026    agentic AI — genesis · leyp · god mode · cv tools");
      print("now     shipping weekly · open to opportunities", "t-ok");
    },
    contact: function () {
      print("github   : https://github.com/amanvicky");
      print("linkedin : https://www.linkedin.com/in/aman-elugam/");
      print("(or run: sudo hire aman)", "t-dim");
    },
    clear: function () { out.textContent = ""; },
    exit: function () { closeTerm(); },
    sudo: function (args) {
      if (args.trim().toLowerCase() === "hire aman") {
        print("[sudo] permission granted.", "t-ok");
        print("opening linkedin — let's talk.", "t-ok");
        setTimeout(function () {
          window.open("https://www.linkedin.com/in/aman-elugam/", "_blank", "noopener");
        }, 700);
      } else {
        print("sudo: did you mean 'sudo hire aman'?", "t-err");
      }
    },
    goto: function (args) {
      var id = args.trim().toLowerCase();
      var s = document.getElementById(id);
      if (!s) { print("sections: projects · stack · about · contact", "t-err"); return; }
      closeTerm();
      document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };
  COMMANDS.ls = COMMANDS.projects;
  COMMANDS.socials = COMMANDS.contact;
  COMMANDS.repos = COMMANDS.projects;

  function runLine(raw) {
    var line = raw.trim();
    print("visitor@amanvicky:~$ " + line, "t-in");
    if (!line) return;
    var space = line.indexOf(" ");
    var cmd = (space === -1 ? line : line.slice(0, space)).toLowerCase();
    var args = space === -1 ? "" : line.slice(space + 1);
    if (cmd === "open") { openRepo(args || ""); return; }
    var fn = COMMANDS[cmd];
    if (fn) fn(args);
    else print("command not found: " + cmd + " — try 'help'", "t-err");
  }

  function openTerm() {
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (!out.textContent) {
      print("amanvicky.github.io terminal — v1.0", "t-dim");
      print("type 'help' to see what this can do.", "t-dim");
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function closeTerm() {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    input.blur();
  }
  var termBtn = document.getElementById("termBtn");
  if (termBtn) termBtn.addEventListener("click", openTerm);
  var hintBtn = document.querySelector("[data-open-terminal]");
  if (hintBtn) hintBtn.addEventListener("click", openTerm);
  var termClose = document.getElementById("termClose");
  if (termClose) termClose.addEventListener("click", closeTerm);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeTerm(); });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      overlay.classList.contains("hidden") ? openTerm() : closeTerm();
    }
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) closeTerm();
  });
  var history = [], hIndex = -1;
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var v = input.value;
      if (v.trim()) { history.unshift(v); hIndex = -1; }
      input.value = "";
      runLine(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIndex < history.length - 1) { hIndex += 1; input.value = history[hIndex]; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIndex > 0) { hIndex -= 1; input.value = history[hIndex]; }
      else { hIndex = -1; input.value = ""; }
    }
  });
})();
