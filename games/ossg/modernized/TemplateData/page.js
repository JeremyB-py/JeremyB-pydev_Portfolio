// Page behaviour for the WebGL player: sizing, loading, the play gate,
// the controls dialog and links between the two editions.
(function () {
  "use strict";

  var OSSG = window.OSSG;
  var params = new URLSearchParams(location.search);
  var edition = String(OSSG.edition || "").toLowerCase() === "archival" ? "archival" : "modernized";
  var isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  // The game's cameras and UI hold up from 4:3 to about 2.17:1 (a phone held
  // sideways), so fill the stage anywhere in that range and letterbox outside it.
  var MIN_ASPECT = 4 / 3;
  var MAX_ASPECT = 2.17;

  var $ = function (selector) { return document.querySelector(selector); };
  var stage = $("#stage");
  var canvas = $("#unity-canvas");
  var instance = null;

  document.body.dataset.edition = edition;
  if (params.get("embed") === "1") document.body.classList.add("embed");

  var EDITIONS = {
    archival: {
      badge: "2018 original",
      line: "Archival build · v0.7b (2018), gameplay unchanged",
      other: { path: "../modernized/", label: "Play the modernized version" }
    },
    modernized: {
      badge: "Modernized",
      line: "Modernized build · Unity 6, gamepad and touch support",
      other: { path: "../archival/", label: "Play the 2018 original" }
    }
  };
  var info = EDITIONS[edition];
  document.querySelectorAll(".edition-line").forEach(function (el) { el.textContent = info.line; });
  $(".badge").textContent = info.badge;

  // Controls table. Gamepad column is hidden for the archival build.
  var CONTROLS = {
    archival: [
      ["Move", "A D / ← →"],
      ["Jump", "W"],
      ["Drop through a shelf", "S"],
      ["Pick up", "E"],
      ["Drop carried items", "Q"],
      ["Reel items in (hold)", "R"],
      ["Reset to spawn", "`"],
      ["Pause / close menu", "Esc"]
    ],
    modernized: [
      ["Move", "A D / ← →", "Left stick / D-pad"],
      ["Jump", "W / ↑ / Space", "A"],
      ["Drop through a shelf", "S / ↓", "Down"],
      ["Pick up", "E", "X"],
      ["Drop carried items", "Q", "Y"],
      ["Reel items in (hold)", "R", "RT / RB"],
      ["Reset to spawn (costs time)", "`", "View / Select"],
      ["Pause", "Esc / P", "Menu / Start"]
    ]
  };

  function keys(text) {
    // "A D / ← →" -> <kbd>A</kbd><kbd>D</kbd> / <kbd>←</kbd><kbd>→</kbd>
    return text.split(" / ").map(function (group) {
      return group.split(" ").map(function (k) {
        var kbd = document.createElement("kbd");
        kbd.textContent = k;
        return kbd.outerHTML;
      }).join("");
    }).join(" <span class=\"hint\">or</span> ");
  }

  var body = $("#controls-body");
  CONTROLS[edition].forEach(function (row) {
    var tr = document.createElement("tr");
    var action = document.createElement("td");
    action.textContent = row[0];
    tr.appendChild(action);
    var keyboard = document.createElement("td");
    keyboard.innerHTML = keys(row[1]);
    tr.appendChild(keyboard);
    var pad = document.createElement("td");
    pad.className = "modern-only";
    pad.textContent = row[2] || "";
    tr.appendChild(pad);
    body.appendChild(tr);
  });

  function fit() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (w / h > MAX_ASPECT) w = Math.floor(h * MAX_ASPECT);
    else if (w / h < MIN_ASPECT) h = Math.floor(w / MIN_ASPECT);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
  fit();

  // Portrait hint on phones.
  var rotate = $("#rotate");
  function checkOrientation() {
    rotate.hidden = !(isTouch && window.innerHeight > window.innerWidth);
  }
  window.addEventListener("resize", checkOrientation);
  checkOrientation();

  // Controls dialog.
  var dialog = $("#controls");
  function openControls() {
    dialog.hidden = false;
    $("#controls-close").focus();
  }
  function closeControls() {
    dialog.hidden = true;
    canvas.focus();
  }
  $("#controls-button").addEventListener("click", openControls);
  $("#controls-close").addEventListener("click", closeControls);
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeControls(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !dialog.hidden) {
      e.stopPropagation();
      closeControls();
    }
  }, true);

  // Fullscreen, where the browser supports it (not iPhone Safari).
  var fullscreenButton = $("#fullscreen-button");
  var canFullscreen = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  if (!canFullscreen) fullscreenButton.hidden = true;
  fullscreenButton.addEventListener("click", function () {
    if (instance) instance.SetFullscreen(1);
  });

  // Link to the other edition only when it is deployed next to this one.
  var other = $("#other-edition");
  fetch(info.other.path, { method: "HEAD" }).then(function (res) {
    if (!res.ok) return;
    other.href = info.other.path + location.search;
    other.textContent = info.other.label;
    other.hidden = false;
  }).catch(function () {});

  // Loading.
  var loader = $("#loader");
  var fill = $(".progress-fill");
  var bar = $(".progress");
  var label = $(".progress-label");

  function showError(message) {
    loader.hidden = true;
    $("#start").hidden = true;
    $("#error").hidden = false;
    $(".error-message").textContent = String(message);
  }

  function showBanner(message, type) {
    if (type === "error") showError(message);
    else console.warn(message);
  }

  var config = OSSG.config;
  config.showBanner = showBanner;
  // Tells the modernized build whether to show on-screen controls (the archival
  // build ignores it). Many desktop browsers claim touch support, so Unity's own
  // check is not enough.
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  config.arguments = (config.arguments || []).concat([coarse ? "-pointer=coarse" : "-pointer=fine"]);
  // Cap the render resolution on very dense screens; the art is not that detailed.
  config.devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  var script = document.createElement("script");
  script.src = OSSG.loaderUrl;
  script.onerror = function () { showError("The game files could not be downloaded."); };
  script.onload = function () {
    createUnityInstance(canvas, config, function (progress) {
      var pct = Math.round(progress * 100);
      fill.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", pct);
      label.textContent = pct < 90 ? "Loading… " + pct + "%" : "Starting…";
    }).then(function (unityInstance) {
      instance = unityInstance;
      loader.hidden = true;
      if (params.get("autoplay") === "1") {
        canvas.focus();
      } else {
        showStart();
      }
    }).catch(showError);
  };
  document.body.appendChild(script);

  // Browsers only allow sound after a click, and an embedded page needs a
  // click to get keyboard focus, so ask for one explicitly.
  function showStart() {
    var start = $("#start");
    var embedded = document.body.classList.contains("embed");
    start.querySelector(".hint").textContent = isTouch
      ? "Sound on. Buttons appear on screen during a level."
      : "Sound on. Press Esc to pause." + (embedded ? "" : " Controls are listed below the game.");
    start.hidden = false;
    var play = $("#play-button");
    play.focus();
    play.addEventListener("click", function () {
      start.hidden = true;
      canvas.focus();
    }, { once: true });
  }

  // Clicking the game gives it keyboard focus (important inside an iframe).
  canvas.addEventListener("pointerdown", function () { canvas.focus(); });
})();
