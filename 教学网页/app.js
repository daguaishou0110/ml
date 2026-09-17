(() => {
  const data = window.COURSE_DATA;
  if (!data || !data.lessons) {
    document.body.innerHTML =
      "<p style='padding:2rem'>内容未加载，请确认 content.js 与 index.html 在同一目录。</p>";
    return;
  }

  const lessons = data.lessons;
  let currentId = lessons[0].id;

  const landing = document.getElementById("home");
  const shell = document.getElementById("course");
  const navEl = document.getElementById("lesson-nav");
  const headerEl = document.getElementById("lesson-header");
  const bodyEl = document.getElementById("lesson-body");
  const appendixEl = document.getElementById("appendix");
  const prevBtn = document.getElementById("prev-lesson");
  const nextBtn = document.getElementById("next-lesson");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  /** Keep TeX delimiters; escape the rest carefully by not double-escaping. */
  function formatInlineText(text) {
    // Split by \(...\) or $...$ inline math, escape plain parts only
    const parts = [];
    const re = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ math: false, t: text.slice(last, m.index) });
      parts.push({ math: true, t: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ math: false, t: text.slice(last) });
    if (!parts.length) parts.push({ math: false, t: text });
    return parts
      .map((p) => (p.math ? p.t : escapeHtml(p.t).replaceAll("`", "<code>").replace(/<\/?code>/g, (x) => x)))
      .map((chunk, i, arr) => {
        // simple backtick code for non-math segments already escaped
        return chunk;
      })
      .join("");
  }

  function prettyFormatText(text) {
    // escape then restore \( \) \[ \] $$ and simple `code`
    let s = escapeHtml(text);
    // restore backslash-paren math (escapeHtml doesn't touch \)
    // handle `code`
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    return s;
  }

  function normalizeTeX(tex) {
    let t = String(tex).trim();
    // strip wrappers
    t = t.replace(/^\$\$/, "").replace(/\$\$$/, "");
    t = t.replace(/^\\\[/, "").replace(/\\\]$/, "");
    t = t.replace(/^\\\(/, "").replace(/\\\)$/, "");
    // fix accidental double-escaping: \\mathrm -> \mathrm
    while (t.includes("\\\\")) {
      t = t.replaceAll("\\\\", "\\");
    }
    return t;
  }

  function renderFormula(tex) {
    const t = normalizeTeX(tex);
    if (window.katex) {
      try {
        return (
          `<div class="formula-block">` +
          window.katex.renderToString(t, {
            displayMode: true,
            throwOnError: false,
            strict: "ignore",
          }) +
          `</div>`
        );
      } catch (e) {
        return `<div class="formula-block formula-fallback">${escapeHtml(t)}</div>`;
      }
    }
    return `<div class="formula-block">$$${escapeHtml(t)}$$</div>`;
  }

  function buildNav() {
    navEl.innerHTML = lessons
      .map(
        (l) =>
          `<button type="button" data-id="${l.id}" class="${l.id === currentId ? "active" : ""}">` +
          `<span class="num">${String(l.id).padStart(2, "0")}</span>${escapeHtml(l.title)}` +
          `</button>`
      )
      .join("");
  }

  function renderBlocks(blocks) {
    let html = "";
    let listOpen = false;
    const closeList = () => {
      if (listOpen) {
        html += "</ul>";
        listOpen = false;
      }
    };

    for (const b of blocks) {
      if (b.type === "li") {
        if (!listOpen) {
          html += "<ul>";
          listOpen = true;
        }
        html += `<li>${prettyFormatText(b.text)}</li>`;
        continue;
      }
      closeList();
      if (b.type === "p") html += `<p>${prettyFormatText(b.text)}</p>`;
      else if (b.type === "h3") html += `<h3>${prettyFormatText(b.text)}</h3>`;
      else if (b.type === "tip") {
        const tipText = b.text.replace(/^【[^】]+】/, "").trim() || b.text;
        const tipLabelMatch = b.text.match(/^【([^】]+)】/);
        const tipLabel = tipLabelMatch ? tipLabelMatch[1] : "Tips";
        html += `<div class="tip"><strong>${escapeHtml(tipLabel)}</strong> ${prettyFormatText(
          tipText
        )}</div>`;
      } else if (b.type === "formula") html += renderFormula(b.text);
      else if (b.type === "code")
        html += `<pre class="code"><code>${escapeHtml(b.text)}</code></pre>`;
    }
    closeList();
    return html;
  }

  function mountDemo(lessonId) {
    const demos = window.LESSON_DEMOS || {};
    const demo = demos[lessonId];
    if (!demo) return "";
    return `
      <section class="section demo-section" id="lesson-demo">
        <div class="demo-badge">动手实验</div>
        <h2>${escapeHtml(demo.title)}</h2>
        <div class="demo-root" id="demo-root"></div>
      </section>`;
  }

  function typesetMath(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
        strict: "ignore",
      });
    }
  }

  function renderLesson(id) {
    const lesson = lessons.find((l) => l.id === id) || lessons[0];
    currentId = lesson.id;

    headerEl.innerHTML =
      `<p class="eyebrow">第 ${lesson.id} / ${lessons.length} 课</p>` +
      `<h1>${escapeHtml(lesson.title)}</h1>`;

    const sectionsHtml = lesson.sections
      .map(
        (sec) =>
          `<section class="section"><h2>${escapeHtml(sec.title)}</h2>${renderBlocks(
            sec.blocks || []
          )}</section>`
      )
      .join("");

    bodyEl.innerHTML = sectionsHtml + mountDemo(lesson.id);

    const demoRoot = document.getElementById("demo-root");
    const demo = (window.LESSON_DEMOS || {})[lesson.id];
    if (demoRoot && demo && typeof demo.mount === "function") {
      try {
        demo.mount(demoRoot);
      } catch (err) {
        demoRoot.innerHTML = `<pre class="demo-out">演示加载失败：${escapeHtml(
          String(err)
        )}</pre>`;
      }
    }

    if (lesson.id === lessons[lessons.length - 1].id && data.appendix?.length) {
      appendixEl.hidden = false;
      appendixEl.innerHTML =
        `<h2>${escapeHtml(data.appendix[0])}</h2>` +
        data.appendix
          .slice(1)
          .map((t) => `<p>${prettyFormatText(t)}</p>`)
          .join("");
    } else {
      appendixEl.hidden = true;
      appendixEl.innerHTML = "";
    }

    buildNav();
    const idx = lessons.findIndex((l) => l.id === currentId);
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= lessons.length - 1;

    bodyEl.style.animation = "none";
    headerEl.style.animation = "none";
    void bodyEl.offsetWidth;
    bodyEl.style.animation = "";
    headerEl.style.animation = "";

    typesetMath(bodyEl);
    if (!appendixEl.hidden) typesetMath(appendixEl);

    window.scrollTo({ top: shell.offsetTop, behavior: "smooth" });
    sidebar.classList.remove("open");
  }

  function showCourse(id) {
    landing.style.display = "none";
    shell.classList.add("active");
    menuToggle.style.display = "";
    renderLesson(id || lessons[0].id);
    history.replaceState(null, "", "#course");
  }

  function showHome() {
    shell.classList.remove("active");
    landing.style.display = "";
    menuToggle.style.display = "none";
    sidebar.classList.remove("open");
    history.replaceState(null, "", "#home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    renderLesson(Number(btn.dataset.id));
  });

  prevBtn.addEventListener("click", () => {
    const idx = lessons.findIndex((l) => l.id === currentId);
    if (idx > 0) renderLesson(lessons[idx - 1].id);
  });

  nextBtn.addEventListener("click", () => {
    const idx = lessons.findIndex((l) => l.id === currentId);
    if (idx < lessons.length - 1) renderLesson(lessons[idx + 1].id);
  });

  document.getElementById("cta-start").addEventListener("click", (e) => {
    e.preventDefault();
    showCourse(1);
  });
  document.getElementById("nav-start").addEventListener("click", (e) => {
    e.preventDefault();
    showCourse(1);
  });
  document.getElementById("cta-path").addEventListener("click", (e) => {
    e.preventDefault();
    showCourse(1);
  });
  document.getElementById("back-home").addEventListener("click", showHome);

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== menuToggle
    ) {
      sidebar.classList.remove("open");
    }
  });

  if (location.hash === "#course") showCourse(1);
  else menuToggle.style.display = "none";
})();
