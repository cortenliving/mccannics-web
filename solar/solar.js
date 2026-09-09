/* Mc Cannics Solar — local UI only. No network calls. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function setScrollPad() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    document.documentElement.style.scrollPaddingTop = header.offsetHeight + "px";
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var menuOpen = false;

  function setMenu(open, returnFocus) {
    menuOpen = open;
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    var iconOpen = toggle.querySelector("[data-icon-open]");
    var iconClose = toggle.querySelector("[data-icon-close]");
    if (iconOpen) iconOpen.hidden = open;
    if (iconClose) iconClose.hidden = !open;
    if (open) {
      var first = mobileNav.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      setMenu(!menuOpen, false);
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, false);
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) {
      e.preventDefault();
      setMenu(false, true);
    }
  });

  document.addEventListener("click", function (e) {
    if (!menuOpen || !mobileNav || !toggle) return;
    if (mobileNav.contains(e.target) || toggle.contains(e.target)) return;
    setMenu(false, false);
  });

  /* ---------- Estimator ---------- */
  var billRange = document.getElementById("bill-range");
  var billVal = document.getElementById("bill-val");
  var saveVal = document.getElementById("save-val");
  var sizeVal = document.getElementById("size-val");
  var sizeNote = document.getElementById("size-note");
  var battButtons = document.querySelectorAll("[data-battery-toggle]");
  var withBattery = false;

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function formatNzd(n) {
    return "$" + Math.round(n).toLocaleString("en-NZ");
  }

  function formatKw(n) {
    return round1(n).toFixed(1) + " kW";
  }

  function estimate(monthly, battery) {
    var annual = monthly * 12;
    if (battery) {
      return {
        saving: Math.round(annual * 0.78),
        kw: clamp(round1(monthly / 48), 4, 20),
        note: true
      };
    }
    return {
      saving: Math.round(annual * 0.55),
      kw: clamp(round1(monthly / 55), 3, 15),
      note: false
    };
  }

  function paintEstimator() {
    if (!billRange) return;
    var monthly = Number(billRange.value);
    var result = estimate(monthly, withBattery);
    var min = Number(billRange.min);
    var max = Number(billRange.max);
    var pct = ((monthly - min) / (max - min)) * 100;
    billRange.style.setProperty("--pct", pct + "%");
    billRange.setAttribute("aria-valuenow", String(monthly));
    billRange.setAttribute("aria-valuetext", formatNzd(monthly));
    if (billVal) billVal.textContent = formatNzd(monthly);
    if (saveVal) saveVal.textContent = formatNzd(result.saving);
    if (sizeVal) sizeVal.textContent = formatKw(result.kw);
    if (sizeNote) sizeNote.hidden = !result.note;
  }

  battButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      withBattery = btn.getAttribute("data-battery-toggle") === "yes";
      battButtons.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("is-pressed", on);
      });
      paintEstimator();
    });
  });

  if (billRange) {
    billRange.addEventListener("input", paintEstimator);
    paintEstimator();
  }

  var estimateCta = document.getElementById("estimate-cta");
  if (estimateCta) {
    estimateCta.addEventListener("click", function (e) {
      e.preventDefault();
      var monthly = billRange ? Number(billRange.value) : 280;
      prefillQuote(monthly, withBattery ? "Yes" : "No");
      if (menuOpen) setMenu(false, false);
      scrollToId("quote");
    });
  }

  /* ---------- Tabs ---------- */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  var tabPanels = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));

  function activateTab(name, scrollSolutions) {
    tabButtons.forEach(function (btn) {
      var on = btn.getAttribute("data-tab") === name;
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      btn.classList.toggle("is-on", on);
    });
    tabPanels.forEach(function (panel) {
      var on = panel.getAttribute("data-panel") === name;
      panel.hidden = !on;
    });
    if (scrollSolutions) scrollToId("solutions");
  }

  tabButtons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      activateTab(btn.getAttribute("data-tab"), false);
    });
    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = tabButtons[(index + 1) % tabButtons.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
      } else if (e.key === "Home") {
        next = tabButtons[0];
      } else if (e.key === "End") {
        next = tabButtons[tabButtons.length - 1];
      }
      if (next) {
        e.preventDefault();
        activateTab(next.getAttribute("data-tab"), false);
        next.focus();
      }
    });
  });

  function goCommercial(e) {
    if (e) e.preventDefault();
    activateTab("commercial", false);
    if (menuOpen) setMenu(false, false);
    scrollToId("solutions");
    if (history.replaceState) {
      history.replaceState(null, "", "#commercial");
    }
  }

  document.querySelectorAll('a[href="#commercial"]').forEach(function (link) {
    link.addEventListener("click", goCommercial);
  });

  document.querySelectorAll('a[href="#solutions"]').forEach(function (link) {
    link.addEventListener("click", function () {
      activateTab("home", false);
      if (menuOpen) setMenu(false, false);
    });
  });

  if (location.hash === "#commercial") {
    activateTab("commercial", false);
  }

  window.addEventListener("hashchange", function () {
    if (location.hash === "#commercial") activateTab("commercial", false);
  });

  /* ---------- FAQ accordion ---------- */
  var faqButtons = Array.prototype.slice.call(document.querySelectorAll("[data-faq-btn]"));

  function setFaq(btn, open) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.hidden = !open;
    var icon = btn.querySelector("[data-faq-icon]");
    if (icon) icon.classList.toggle("is-open", open);
  }

  faqButtons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      var wasOpen = btn.getAttribute("aria-expanded") === "true";
      faqButtons.forEach(function (other) {
        setFaq(other, false);
      });
      if (!wasOpen) setFaq(btn, true);
    });
    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowDown") next = faqButtons[(index + 1) % faqButtons.length];
      else if (e.key === "ArrowUp") next = faqButtons[(index - 1 + faqButtons.length) % faqButtons.length];
      else if (e.key === "Home") next = faqButtons[0];
      else if (e.key === "End") next = faqButtons[faqButtons.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
      }
    });
  });

  /* ---------- Quote wizard ---------- */
  var form = document.getElementById("quote-form");
  var step = 1;
  var fromEstimator = false;

  function readQuote() {
    function checked(name) {
      var el = form ? form.querySelector('input[name="' + name + '"]:checked') : null;
      return el ? el.value : "";
    }
    return {
      powering: checked("powering"),
      region: checked("region"),
      town: (document.getElementById("quote-town") || {}).value
        ? document.getElementById("quote-town").value.trim()
        : "",
      bill: (document.getElementById("quote-bill") || {}).value
        ? document.getElementById("quote-bill").value.trim()
        : "",
      battery: checked("battery"),
      name: (document.getElementById("quote-name") || {}).value
        ? document.getElementById("quote-name").value.trim()
        : "",
      phone: (document.getElementById("quote-phone") || {}).value
        ? document.getElementById("quote-phone").value.trim()
        : "",
      email: (document.getElementById("quote-email") || {}).value
        ? document.getElementById("quote-email").value.trim()
        : "",
      time: checked("time")
    };
  }

  function phoneDigits(value) {
    return (value.match(/\d/g) || []).length;
  }

  function emailOk(value) {
    return value.indexOf("@") !== -1 && value.indexOf(".") !== -1;
  }

  function billOk(value) {
    if (value === "") return false;
    var n = Number(value);
    return Number.isFinite(n) && n > 0;
  }

  function stepValid(n) {
    var data = readQuote();
    if (n === 1) return data.powering !== "";
    if (n === 2) return data.region !== "" && data.town !== "";
    if (n === 3) return billOk(data.bill) && data.battery !== "";
    if (n === 4) {
      return (
        data.name !== "" &&
        phoneDigits(data.phone) >= 6 &&
        emailOk(data.email) &&
        data.time !== ""
      );
    }
    return false;
  }

  function updateNextState() {
    var next = document.getElementById("next-btn");
    if (!next) return;
    var ok = stepValid(step);
    next.disabled = !ok;
    next.setAttribute("aria-disabled", ok ? "false" : "true");
  }

  function showStep(n, focus) {
    step = n;
    document.querySelectorAll("[data-step]").forEach(function (el) {
      el.hidden = Number(el.getAttribute("data-step")) !== n;
    });
    var progress = document.getElementById("progress-text");
    if (progress) progress.textContent = "Step " + n + " of 4.";
    var bar = document.getElementById("progress-bar");
    if (bar) {
      bar.setAttribute("aria-valuenow", String(n));
      bar.setAttribute("aria-valuetext", "Step " + n + " of 4.");
    }
    var fill = document.getElementById("progress-fill");
    if (fill) fill.style.width = (n / 4) * 100 + "%";
    var back = document.getElementById("back-btn");
    if (back) back.disabled = n === 1;
    var next = document.getElementById("next-btn");
    if (next) next.textContent = "Next";
    updateNextState();
    if (focus) {
      var title = document.querySelector('[data-step="' + n + '"] .step-title');
      if (title) title.focus();
    }
  }

  function prefillQuote(monthly, battery) {
    var done = document.getElementById("quote-done");
    if (done && !done.hidden) resetQuote(false);
    var billInput = document.getElementById("quote-bill");
    if (billInput) billInput.value = String(monthly);
    if (form) {
      var radio = form.querySelector('input[name="battery"][value="' + battery + '"]');
      if (radio) radio.checked = true;
    }
    fromEstimator = true;
    var note = document.getElementById("bill-prefill-note");
    if (note) note.hidden = false;
    updateNextState();
  }

  function formatBill(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return value;
    return formatNzd(n);
  }

  function showDone() {
    var data = readQuote();
    var list = document.getElementById("quote-summary");
    if (list) {
      var rows = [
        ["What we are powering", data.powering],
        ["Where", data.region],
        ["Town or suburb", data.town],
        ["Monthly bill", formatBill(data.bill)],
        ["Battery", data.battery],
        ["Name", data.name],
        ["Phone", data.phone],
        ["Email", data.email],
        ["Best time", data.time]
      ];
      list.innerHTML = "";
      rows.forEach(function (row) {
        var dt = document.createElement("dt");
        dt.textContent = row[0];
        var dd = document.createElement("dd");
        dd.textContent = row[1];
        list.appendChild(dt);
        list.appendChild(dd);
      });
    }
    document.querySelectorAll("[data-step]").forEach(function (el) {
      el.hidden = true;
    });
    var controls = document.getElementById("quote-controls");
    var progressWrap = document.getElementById("quote-progress");
    if (controls) controls.hidden = true;
    if (progressWrap) progressWrap.hidden = true;
    var done = document.getElementById("quote-done");
    if (done) {
      done.hidden = false;
      var heading = document.getElementById("quote-done-title");
      if (heading) heading.focus();
    }
  }

  function resetQuote(focus) {
    if (form) form.reset();
    fromEstimator = false;
    var note = document.getElementById("bill-prefill-note");
    if (note) note.hidden = true;
    var done = document.getElementById("quote-done");
    if (done) done.hidden = true;
    var controls = document.getElementById("quote-controls");
    var progressWrap = document.getElementById("quote-progress");
    if (controls) controls.hidden = false;
    if (progressWrap) progressWrap.hidden = false;
    showStep(1, focus);
  }

  window.McQuote = { prefill: prefillQuote };

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
    form.addEventListener("input", function (e) {
      if (e.target && e.target.id === "quote-bill") {
        fromEstimator = false;
        var note = document.getElementById("bill-prefill-note");
        if (note) note.hidden = true;
      }
      updateNextState();
    });
    form.addEventListener("change", updateNextState);

    var nextBtn = document.getElementById("next-btn");
    var backBtn = document.getElementById("back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (step > 1) showStep(step - 1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!stepValid(step)) return;
        if (step < 4) showStep(step + 1, true);
        else showDone();
      });
    }
    var again = document.getElementById("quote-again");
    if (again) {
      again.addEventListener("click", function () {
        resetQuote(true);
      });
    }
    showStep(1, false);
  }

  /* ---------- Header offset ---------- */
  setScrollPad();
  window.addEventListener("resize", setScrollPad);
  window.addEventListener("load", setScrollPad);
})();
