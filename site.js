/* McCannics site — local UI only. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function setScrollPad() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    document.documentElement.style.scrollPaddingTop = header.offsetHeight + "px";
  }
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
    toggle.addEventListener("click", function () { setMenu(!menuOpen, false); });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false, false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) { e.preventDefault(); setMenu(false, true); }
  });
  document.addEventListener("click", function (e) {
    if (!menuOpen || !mobileNav || !toggle) return;
    if (mobileNav.contains(e.target) || toggle.contains(e.target)) return;
    setMenu(false, false);
  });

  /* Contact form — local confirmation only */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var params = new URLSearchParams(window.location.search);
    var topic = params.get("topic") || params.get("category") || "";
    var topicField = document.getElementById("contact-topic");
    var messageField = document.getElementById("contact-message");
    if (topic && topicField) {
      var match = Array.prototype.slice.call(topicField.options).find(function (o) {
        return o.value.toLowerCase() === topic.toLowerCase() || o.textContent.toLowerCase().indexOf(topic.toLowerCase()) !== -1;
      });
      if (match) topicField.value = match.value;
      else {
        var opt = document.createElement("option");
        opt.value = topic;
        opt.textContent = topic;
        topicField.appendChild(opt);
        topicField.value = topic;
      }
    }
    if (topic && messageField && !messageField.value) {
      messageField.value = "Enquiry about: " + topic.replace(/[-_]/g, " ");
    }
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("contact-name") || {}).value || "";
      var phone = (document.getElementById("contact-phone") || {}).value || "";
      var email = (document.getElementById("contact-email") || {}).value || "";
      var msg = (document.getElementById("contact-message") || {}).value || "";
      var digits = (phone.match(/\d/g) || []).length;
      var ok = name.trim() && digits >= 6 && email.indexOf("@") !== -1 && email.indexOf(".") !== -1 && msg.trim();
      var err = document.getElementById("contact-error");
      var done = document.getElementById("contact-done");
      if (!ok) {
        if (err) { err.hidden = false; err.textContent = "Please fill name, phone (6+ digits), email and message."; }
        return;
      }
      if (err) err.hidden = true;
      contactForm.hidden = true;
      if (done) {
        done.hidden = false;
        var h = done.querySelector("[data-done-title]");
        if (h) h.focus();
      }
    });
  }

  setScrollPad();
  window.addEventListener("resize", setScrollPad);
  window.addEventListener("load", setScrollPad);
})();
