    (function () {
      var WORDS = ["SANCTUARY", "CANOPY", "WILDLIFE"];
      var wordEl = document.getElementById("cyclingWord");
      var idx = 0;
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion) setInterval(function () {
        idx = (idx + 1) % WORDS.length;
        wordEl.style.opacity = "0";
        wordEl.style.transform = "translateY(40%)";
        setTimeout(function () {
          wordEl.textContent = WORDS[idx];
          wordEl.style.transition = "none";
          wordEl.style.transform = "translateY(-40%)";
          requestAnimationFrame(function () {
            wordEl.style.transition = "opacity 0.35s ease, transform 0.45s ease";
            wordEl.style.opacity = "1";
            wordEl.style.transform = "translateY(0)";
          });
        }, 180);
      }, 2600);

      var choiceLabels = {
        "woodland-cabin": "woodland cabin",
        "guided-walk": "guided walk",
        "night-listening": "night listening"
      };
      var stayChoice = document.getElementById("stayChoice");
      document.querySelectorAll("[data-stay]").forEach(function (el) {
        el.addEventListener("click", function () {
          if (stayChoice) stayChoice.value = el.getAttribute("data-stay");
        });
      });
      var stayForm = document.getElementById("stayForm");
      var stayConfirm = document.getElementById("stayConfirm");
      if (stayForm) {
        stayForm.addEventListener("submit", function (event) {
          if (!stayForm.checkValidity()) return;
          event.preventDefault();
          var data = new FormData(stayForm);
          var choice = choiceLabels[data.get("choice")] || data.get("choice");
          stayConfirm.hidden = false;
          stayConfirm.textContent = "Thank you, " + data.get("name") + ". Your request for a " + choice + " from " + data.get("arrival") + " to " + data.get("departure") + " is noted here. We'll write to " + data.get("email") + ".";
          stayForm.reset();
          if (stayChoice && data.get("choice")) stayChoice.value = data.get("choice");
        });
      }

      // Counters
      var counters = document.querySelectorAll("[data-counter]");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          io.unobserve(el);
          var raw = el.getAttribute("data-counter");
          var suffix = el.getAttribute("data-suffix") || "";
          if (isNaN(Number(raw))) {
            el.textContent = raw + suffix;
            return;
          }
          var target = Number(raw);
          var start = null;
          function tick(now) {
            if (start === null) start = now;
            var p = Math.min((now - start) / 1500, 1);
            el.textContent = Math.floor(p * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target + suffix;
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.35 });
      counters.forEach(function (el) {
        el.textContent = (isNaN(Number(el.getAttribute("data-counter"))) ? "0" : "0") + (el.getAttribute("data-suffix") || "");
        if (isNaN(Number(el.getAttribute("data-counter")))) {
          el.textContent = el.getAttribute("data-counter") + (el.getAttribute("data-suffix") || "");
        }
        io.observe(el);
      });

      // Services pin scroll
      var pin = document.getElementById("servicesPin");
      var sticky = document.getElementById("servicesSticky");
      var layout = document.getElementById("servicesLayout");
      var list = document.getElementById("servicesList");
      var ticking = false;
      function updateServices() {
        if (!pin || !sticky || !layout || !list) return;
        if (window.matchMedia("(max-width: 899px)").matches) {
          pin.style.height = "auto";
          list.style.transform = "none";
          return;
        }
        var stickyH = sticky.offsetHeight;
        var viewportH = list.clientHeight || layout.offsetHeight;
        var maxTravel = Math.max(0, list.scrollHeight - viewportH);
        pin.style.height = stickyH + maxTravel + "px";
        var stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
        var pinTop = pin.getBoundingClientRect().top;
        var raw = stickyTop - pinTop;
        var progress = maxTravel <= 0 ? 0 : Math.min(1, Math.max(0, raw / maxTravel));
        list.style.transform = "translate3d(0, " + (-progress * maxTravel) + "px, 0)";
      }
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          updateServices();
          ticking = false;
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", updateServices);
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(updateServices);
        if (list) ro.observe(list);
        if (layout) ro.observe(layout);
        if (sticky) ro.observe(sticky);
      }
      updateServices();

      // Pause hero animations when offscreen / hidden
      var hero = document.getElementById("hero");
      function syncPause() {
        var visible = document.visibilityState === "visible";
        var rect = hero.getBoundingClientRect();
        var inView = rect.bottom > 0 && rect.top < window.innerHeight;
        hero.classList.toggle("paused", !(visible && inView));
      }
      document.addEventListener("visibilitychange", syncPause);
      window.addEventListener("scroll", syncPause, { passive: true });
      syncPause();

      var navLinks = Array.prototype.slice.call(document.querySelectorAll(".siteNav a"));
      var navSections = navLinks.map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      });
      function syncNav() {
        var current = null;
        navSections.forEach(function (section) {
          if (!section) return;
          if (section.getBoundingClientRect().top <= 140) current = section;
        });
        navLinks.forEach(function (link) {
          var on = current && link.getAttribute("href") === "#" + current.id;
          if (on) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      }
      window.addEventListener("scroll", syncNav, { passive: true });
      syncNav();

      var header = document.querySelector(".siteHeader");
      var navToggle = document.querySelector(".navToggle");
      var siteNav = document.getElementById("siteNav");
      if (header && navToggle && siteNav) {
        function setNavOpen(open) {
          header.classList.toggle("isOpen", open);
          navToggle.setAttribute("aria-expanded", open ? "true" : "false");
          navToggle.querySelector(".visuallyHidden").textContent = open ? "Close menu" : "Menu";
        }
        navToggle.addEventListener("click", function () {
          setNavOpen(!header.classList.contains("isOpen"));
        });
        siteNav.querySelectorAll("a").forEach(function (link) {
          link.addEventListener("click", function () {
            setNavOpen(false);
          });
        });
        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape") setNavOpen(false);
        });
        window.addEventListener("resize", function () {
          if (window.matchMedia("(min-width: 900px)").matches) setNavOpen(false);
        });
      }
    })();
