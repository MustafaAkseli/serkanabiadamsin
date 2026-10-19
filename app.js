(() => {
  "use strict";
  const config = window.BIRTHDAY_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const body = document.body;
  let launched = false;
  let bootReady = false;
  let bootVersion = 0;
  let musicPlaying = false;
  let musicPending = false;
  let musicVersion = 0;
  let audioErrorShown = false;
  let toastTimer;
  let calm = motionPreference.matches;

  // textContent keeps future personal messages as text, not executable markup.
  document.querySelectorAll("[data-content]").forEach((element) => {
    const value = config[element.dataset.content];
    if (typeof value === "string") element.textContent = value;
  });
  if (typeof config.terminalName === "string") $("terminal-name").textContent = config.terminalName;
  if (Array.isArray(config.message) && config.message.length) {
    $("message-paragraphs").replaceChildren(...config.message.map(text => {
      const p = document.createElement("p"); p.textContent = String(text); return p;
    }));
  }
  const portrait = $("portrait");
  portrait.addEventListener("error", () => {
    if (portrait.dataset.fallback) { portrait.hidden = true; return; }
    portrait.dataset.fallback = "true";
    portrait.src = "./assets/portrait-placeholder.svg";
    portrait.alt = "Serkan Abi'nin fotoğrafı için SA harfli yer tutucu";
    $("portrait-caption").textContent = "İYİ Kİ VARSIN, ABİ.";
    $("portrait-caption").hidden = false;
  });
  if (config.portrait) portrait.src = config.portrait;
  if (config.portraitAlt) portrait.alt = config.portraitAlt;
  if (config.portraitPosition) portrait.style.objectPosition = config.portraitPosition;
  if (typeof config.portraitCaption === "string") {
    $("portrait-caption").textContent = config.portraitCaption;
    $("portrait-caption").hidden = !config.portraitCaption;
  }
  const memoryPhoto = $("memory-photo");
  memoryPhoto.addEventListener("error", () => {
    memoryPhoto.hidden = true;
    $("memory-fallback").hidden = false;
  });
  if (config.memoryPhoto) memoryPhoto.src = config.memoryPhoto;
  if (config.memoryPhotoAlt) memoryPhoto.alt = config.memoryPhotoAlt;
  if (config.music?.label) $("track-label").textContent = config.music.label;
  const audio = window.BirthdayAudio ? new window.BirthdayAudio(config.music) : null;
  const canvas = $("confetti");
  let context = null;
  try { context = canvas.getContext("2d"); } catch (_) {}
  let confettiFrame;
  let lastBurst = -Infinity;

  function announce(text) { $("announcer").textContent = text; }
  function toast(text) {
    clearTimeout(toastTimer);
    $("toast").textContent = text;
    $("toast").hidden = false;
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 4200);
  }
  function startMusic() {
    if (musicPlaying || musicPending) return;
    const version = ++musicVersion;
    musicPending = true;
    if (!audio) { musicPending = false; return; }
    // Initial call is directly inside the launch gesture, before any await.
    audio.play().then(success => {
      if (version !== musicVersion) return;
      musicPending = false;
      musicPlaying = success;
      body.classList.toggle("is-playing", success);
      if (!success && !audioErrorShown) {
        audioErrorShown = true;
        toast("Müzik başlayamadı; ekrana tekrar dokununca yeniden denenecek.");
      } else if (success && audio.fallbackUsed) {
        $("track-label").textContent = "ORIGINAL HOUSE LOOP · 120 BPM";
      }
    }).catch(() => {
      if (version !== musicVersion) return;
      musicPending = false; musicPlaying = false; audio.stop();
      body.classList.remove("is-playing");
    });
  }
  if (audio) audio.onInterrupted = () => {
    musicPlaying = false; musicPending = false;
    audio.stop(); body.classList.remove("is-playing");
  };

  function clearConfetti() {
    cancelAnimationFrame(confettiFrame);
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
  }
  function applyMotionPreference() {
    calm = motionPreference.matches;
    document.documentElement.classList.toggle("is-calm", calm);
    body.classList.toggle("is-calm", calm);
    if (calm) {
      clearConfetti();
      if (!launched) finishBoot();
    }
  }
  if (motionPreference.addEventListener) motionPreference.addEventListener("change", applyMotionPreference);
  else if (motionPreference.addListener) motionPreference.addListener(applyMotionPreference);

  function burst() {
    if (calm || !context || document.hidden || performance.now() - lastBurst < 900) return;
    lastBurst = performance.now();
    clearConfetti();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * ratio; canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const colors = ["#d5fb79", "#ecabd2", "#c4d4f5", "#efeedd", "#d6b980"];
    const particles = Array.from({length: width < 600 ? 65 : 105}, (_, i) => ({
      x: i % 2 ? width * 0.08 : width * 0.92, y: height * 0.62,
      vx: (i % 2 ? 1 : -1) * (2 + Math.random() * 6), vy: -7 - Math.random() * 7,
      rotation: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.13,
      size: 4 + Math.random() * 5, color: colors[i % colors.length]
    }));
    const started = performance.now(); let previous = started;
    function draw(now) {
      if (calm || document.hidden) { clearConfetti(); return; }
      const elapsed = now - started;
      const delta = Math.min((now - previous) / 16.67, 2); previous = now;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = Math.max(0, Math.min(1, (3800 - elapsed) / 650));
      particles.forEach(p => {
        p.x += p.vx * delta; p.y += p.vy * delta; p.vy += 0.16 * delta;
        p.vx *= Math.pow(0.995, delta); p.rotation += p.spin * delta;
        context.save(); context.translate(p.x, p.y); context.rotate(p.rotation);
        context.fillStyle = p.color; context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.48); context.restore();
      });
      if (elapsed < 3800) confettiFrame = requestAnimationFrame(draw);
      else clearConfetti();
    }
    confettiFrame = requestAnimationFrame(draw);
  }

  function finishBoot() {
    ++bootVersion;
    bootReady = true;
    $("typed-command").textContent = "./birthday.sh --for=serkan";
    document.querySelectorAll("[data-log]").forEach(line => line.classList.add("visible"));
    $("cursor").hidden = true;
    $("boot-status").textContent = "Hazır. Başlatmak için dokun.";
    $("launch-label").textContent = "Sürprizi başlat";
    $("launch").disabled = false;
  }
  async function runBoot() {
    const version = ++bootVersion;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const command = "./birthday.sh --for=serkan";
    await delay(500);
    for (let i = 1; i <= command.length; i++) {
      if (version !== bootVersion) return;
      $("typed-command").textContent = command.slice(0, i);
      await delay(40);
    }
    for (const line of document.querySelectorAll("[data-log]")) {
      await delay(470);
      if (version !== bootVersion) return;
      line.classList.add("visible");
    }
    // Let the final line register before accepting any launch interaction.
    await delay(700);
    if (version === bootVersion) {
      finishBoot(); announce("Sürpriz hazır. Sürprizi başlat düğmesine dokunabilirsin.");
    }
  }
  function launch() {
    if (launched || !bootReady) return;
    launched = true;
    ++bootVersion;
    startMusic();
    body.dataset.screen = "party";
    $("intro").setAttribute("aria-hidden", "true");
    $("birthday-title").focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: "instant"});
    announce("İyi ki doğdun Serkan Abi! Kutlama başladı.");
    burst();
  }
  $("launch").addEventListener("click", launch);
  document.addEventListener("keydown", event => {
    if (event.key === "Enter" && bootReady && !launched && !event.repeat &&
      !event.target.closest("button,a,input,textarea,select,[contenteditable]")) {
      event.preventDefault(); launch();
    }
    if (launched && !musicPlaying && !musicPending) startMusic();
  });
  // Resume after a browser/OS interruption on the next interaction, no extra UI.
  document.addEventListener("pointerdown", () => {
    if (launched && !musicPlaying && !musicPending) startMusic();
  }, {passive: true});
  $("confetti-button").addEventListener("click", () => {
    burst(); toast("Birlikte nice güzel yaşlara, abi! ✳");
  });
  $("wish-button").addEventListener("click", () => {
    $("wish-status").textContent = "Dileğin sende kalsın. Umarım hepsi gerçek olur, abi. ✳";
    $("wish-button").firstChild.textContent = "İyi ki varsın, abi ";
    burst(); announce("Dileğin sende kalsın. Umarım hepsi gerçek olur, abi.");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearConfetti();
    else if (launched && !musicPlaying && !musicPending) startMusic();
  });
  window.addEventListener("pagehide", () => {
    ++musicVersion; musicPlaying = false; musicPending = false;
    audio?.stop(); clearConfetti();
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted && launched) startMusic();
  });
  window.addEventListener("resize", clearConfetti, {passive: true});
  applyMotionPreference();
  if (!calm) runBoot();
  window.birthdayReady = true;
})();
