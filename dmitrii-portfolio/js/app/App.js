import { hook, hooks, qsa } from "../core/dom.js";
import { ViewportObserver } from "../core/ViewportObserver.js";
import { createAppStore } from "./createAppStore.js";

import { ThemeService } from "../features/theme/ThemeService.js";
import { ThemeToggle } from "../features/theme/ThemeToggle.js";
import { BrandMark } from "../features/brand/BrandMark.js";
import { KineticTitle } from "../features/text/KineticTitle.js";
import { RoleTicker } from "../features/text/RoleTicker.js";

import { ScrollService } from "../features/scroll/ScrollService.js";
import { HeaderScrollState } from "../features/scroll/HeaderScrollState.js";
import { ScrollProgress } from "../features/scroll/ScrollProgress.js";
import { ScrollTopButton } from "../features/scroll/ScrollTopButton.js";
import { RevealOnScroll } from "../features/scroll/RevealOnScroll.js";
import { ScrollSpy } from "../features/nav/ScrollSpy.js";
import { NavLinks } from "../features/nav/NavLinks.js";
import { MobileMenu } from "../features/nav/MobileMenu.js";

import { HeroBackdrop } from "../features/hero/HeroBackdrop.js";
import { VideoCarousel } from "../features/media/VideoCarousel.js";
import { VideoCatalog } from "../features/media/catalog/VideoCatalog.js";
import { Theater } from "../features/theater/Theater.js";
import { TheaterPlayer } from "../features/theater/TheaterPlayer.js";
import { TheaterPlaylist } from "../features/theater/TheaterPlaylist.js";
import { TheaterLauncher } from "../features/theater/TheaterLauncher.js";

import { RadarChart } from "../features/telemetry/RadarChart.js";
import { PidChart } from "../features/telemetry/PidChart.js";
import { SpectrumChart } from "../features/telemetry/SpectrumChart.js";
import { TelemetrySimulation } from "../features/telemetry/TelemetrySimulation.js";

import { ScadaWindow } from "../features/scada/ScadaWindow.js";
import { ScadaController } from "../features/scada/ScadaController.js";

import { GalleryGrid } from "../features/gallery/GalleryGrid.js";
import { Lightbox } from "../features/gallery/Lightbox.js";
import { bindLightboxTriggers } from "../features/gallery/LightboxTriggers.js";

import { Accordion } from "../features/dossier/Accordion.js";
import { Tabs } from "../features/dossier/Tabs.js";

import { Toast } from "../features/ui/Toast.js";
import { CopyToClipboard } from "../features/ui/CopyToClipboard.js";
import { RequestForm } from "../features/request/RequestForm.js";
import { FormAssembly } from "../features/request/FormAssembly.js";

import { FlagBackdrop } from "../features/footer/FlagBackdrop.js";
import { LocalClock } from "../features/footer/LocalClock.js";
import { FlapBoard } from "../features/footer/FlapBoard.js";
import { renderCurrentYear } from "../features/footer/CurrentYear.js";

import { ROLE_PHRASES } from "../data/roles.js";
import { SCENE_NAMES } from "../data/scenes.js";
import { GALLERY_ITEMS } from "../data/gallery.js";
import { HERO_VIDEOS } from "../data/heroVideos.js";
import { RADAR_AXES, RADAR_BASELINE, RADAR_SCENARIOS } from "../data/radar.js";
import { CONTACT } from "../data/contact.js";
import { REQUEST_CONFIG } from "../data/request.js";

/**
 * Composition root. Creates shared services once, wires each feature with
 * exactly the elements and services it needs (dependency injection), and
 * keeps references so everything can be torn down with destroy().
 * A missing element disables only its own feature — never the whole page.
 */
export class App {
  #store = createAppStore();
  #viewport = new ViewportObserver({ threshold: 0.02 });
  #scroll = new ScrollService();
  #theme = new ThemeService(this.#store);
  #toast = new Toast(hook("toast"));
  #clipboard = new CopyToClipboard(this.#toast);
  #abort = new AbortController();
  #components = [];
  #disposers = [];

  start() {
    this.#disposers.push(this.#theme.start(), this.#scroll.start());

    this.#initHeader();
    this.#initNavigation();
    this.#initHero();
    this.#initTelemetry();
    this.#initScada();
    this.#initGallery();
    this.#initDossier();
    this.#initRequest();
    this.#initFooter();
    this.#initUtilities();
    return this;
  }

  destroy() {
    this.#components.splice(0).forEach((component) => component.destroy());
    this.#disposers.splice(0).forEach((dispose) => dispose?.());
    this.#abort.abort();
    this.#viewport.disconnect();
  }

  /** Instantiate + mount a component only if its root exists. */
  #use(root, factory) {
    if (!root) return null;
    try {
      const component = factory(root).mount();
      this.#components.push(component);
      return component;
    } catch (error) {
      console.error("[App] feature failed to start:", error);
      return null;
    }
  }

  #initHeader() {
    this.#use(hook("site-header"), (root) => new HeaderScrollState(root, this.#scroll));
    this.#use(hook("theme-toggle"), (root) => new ThemeToggle(root, this.#theme, this.#store));
    this.#use(hook("brand"), (root) => new BrandMark(root, { name: hook("brand-name"), hint: hook("brand-hint"), letters: hooks("brand-letter") }));
  }

  #initNavigation() {
    const sections = ["overview", "telemetry", "gallery", "dossier", "contact", "request"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const spy = new ScrollSpy(sections, this.#store, this.#scroll);
    this.#disposers.push(spy.start());

    this.#use(document.querySelector(".site-nav"), (root) =>
      new NavLinks(root, { links: qsa("[data-nav]"), indicator: hook("nav-indicator"), spy, store: this.#store }),
    );
    this.#use(hook("menu-toggle"), (root) => new MobileMenu(root, hook("mobile-drawer")));
    this.#use(hook("scroll-top"), (root) =>
      new ScrollTopButton(root, { ring: hook("scroll-ring"), scroll: this.#scroll, onNavigate: () => spy.navigateTo("overview") }),
    );
  }

  #initHero() {
    this.#use(hook("kinetic-title"), (root) => new KineticTitle(root));
    this.#use(hook("role-ticker"), (root) =>
      new RoleTicker(root, { text: hook("role-ticker-text"), phrases: ROLE_PHRASES, viewport: this.#viewport }),
    );
    this.#use(hook("hero"), (root) =>
      new HeroBackdrop(root, {
        canvas: hook("raster-canvas"),
        slides: hooks("hero-slide"),
        buttons: qsa("[data-scene]"),
        status: hook("scene-status"),
        statusText: hook("scene-status-text"),
        sceneNames: SCENE_NAMES,
        store: this.#store,
        viewport: this.#viewport,
      }),
    );
    this.#initReel();
  }

  /**
   * Hero video reel + theater mode. Clips are discovered asynchronously
   * (VideoCatalog), so both are wired once the catalog has loaded.
   */
  async #initReel() {
    const reel = this.#use(hook("hero-media"), (root) =>
      new VideoCarousel(root, {
        videos: hooks("reel-video"),
        fallback: hook("reel-fallback"),
        iris: hook("reel-iris"),
        segments: hook("reel-segments"),
        title: hook("reel-title"),
        counter: hook("reel-counter"),
        viewport: this.#viewport,
      }),
    );

    const clips = await new VideoCatalog(HERO_VIDEOS).load();
    reel?.setClips(clips, HERO_VIDEOS.fallback);
    this.#initTheater(reel, clips);
  }

  /** Theater mode, launched from the hero media frame (hover 5 s or click). */
  #initTheater(reel, clips) {
    const theaterRoot = hook("theater");
    const theaterVideo = hook("theater-video");
    if (!theaterRoot || !theaterVideo) return;

    let launcher = null;
    const theater = this.#use(theaterRoot, (root) =>
      new Theater(root, {
        playlist: new TheaterPlaylist(clips, GALLERY_ITEMS),
        player: new TheaterPlayer(theaterVideo, {
          controls: hook("theater-controls"),
          play: hook("theater-play"),
          playIcon: hook("theater-play-icon"),
          progress: hook("theater-progress"),
          fill: hook("theater-progress-fill"),
          time: hook("theater-time"),
        }),
        background: [hook("page-flow"), hook("site-header")].filter(Boolean),
        elements: {
          stage: hook("theater-stage"),
          image: hook("theater-image"),
          title: hook("theater-title"),
          caption: hook("theater-caption"),
          counter: hook("theater-counter"),
          rail: hook("theater-rail"),
          close: hook("theater-close"),
          backdrop: hook("theater-backdrop"),
          prev: hook("theater-prev"),
          next: hook("theater-next"),
        },
        hooks: {
          onOpen: () => reel?.suspend(),
          onClose: () => reel?.resume(),
          sourceRect: () => launcher?.screenRect ?? null,
        },
      }),
    );
    if (!theater) return;

    launcher = this.#use(hook("hero-media"), (root) =>
      new TheaterLauncher(root, {
        label: hook("dwell-text"),
        onLaunch: (from) =>
          theater.open({
            from,
            index: reel?.clips.length ? reel.index : 0,
            time: reel?.activeVideo?.currentTime ?? 0,
          }),
      }),
    );
  }

  #initTelemetry() {
    const radar = new RadarChart(
      {
        grid: hook("radar-grid"),
        baseline: hook("radar-baseline"),
        shape: hook("radar-shape"),
        nodes: hook("radar-nodes"),
        labels: hook("radar-labels"),
        scenarioTag: hook("radar-scenario"),
        peak: hook("radar-peak"),
      },
      { axes: RADAR_AXES, baseline: RADAR_BASELINE, scenarios: RADAR_SCENARIOS },
    );
    const pid = new PidChart({
      outer: hook("pid-outer"),
      inner: hook("pid-inner"),
      area: hook("pid-area"),
      marker: hook("pid-marker"),
      meta: hook("pid-meta"),
      mode: hook("pid-mode"),
    });
    const spectrum = new SpectrumChart({
      group: hook("spectrum-bars"),
      peak: hook("spectrum-peak"),
      latency: hook("spectrum-latency"),
    });

    this.#use(document.getElementById("telemetry"), (root) =>
      new TelemetrySimulation(root, {
        charts: { radar, pid, spectrum },
        panels: { radar: hook("radar-panel"), pid: hook("pid-panel"), spectrum: hook("spectrum-panel") },
        controls: {
          toggle: hook("sim-toggle"),
          toggleText: hook("sim-toggle-text"),
          resample: hook("sim-resample"),
          counter: hook("sim-cycle"),
        },
        store: this.#store,
        viewport: this.#viewport,
      }),
    );
  }

  #initScada() {
    const root = hook("scada-window");
    this.#use(root, (element) =>
      new ScadaWindow(element, {
        dragHandle: hook("scada-drag"),
        resizeGrip: hook("scada-resize"),
        dock: hook("widget-dock"),
        openButtons: hooks("open-widget"),
        minimize: hook("scada-minimize"),
        maximize: hook("scada-maximize"),
        close: hook("scada-close"),
        store: this.#store,
      }),
    );
    this.#use(root, (element) =>
      new ScadaController(element, {
        store: this.#store,
        log: hook("scada-log"),
        inputs: {
          pumpButton: hook("scada-pump"),
          esdButton: hook("scada-esd"),
          disturbButton: hook("scada-disturb"),
          setpointInput: hook("scada-sp"),
          unitPump: hook("scada-unit-pump"),
          unitValve: hook("scada-unit-valve"),
          unitGateway: hook("scada-unit-gateway"),
        },
        view: {
          pumpButton: hook("scada-pump"),
          pumpText: hook("scada-pump-text"),
          esdButton: hook("scada-esd"),
          esdText: hook("scada-esd-text"),
          mode: hook("scada-mode"),
          dot: hook("scada-dot"),
          unitPump: hook("scada-unit-pump"),
          unitValve: hook("scada-unit-valve"),
          unitGateway: hook("scada-unit-gateway"),
          flows: hooks("scada-flow"),
          pumpStat: hook("scada-pump-stat"),
          valveStat: hook("scada-valve-stat"),
          tempStat: hook("scada-temp-stat"),
          esdStat: hook("scada-esd-stat"),
          pvReadout: hook("scada-pv"),
          setpointText: hook("scada-sp-text"),
          setpointInput: hook("scada-sp"),
          setpointLine: hook("scada-sp-line"),
          trendLine: hook("scada-trend-line"),
          trendArea: hook("scada-trend-area"),
        },
      }),
    );
  }

  #initGallery() {
    const lightbox = this.#use(hook("lightbox"), (root) =>
      new Lightbox(root, {
        items: GALLERY_ITEMS,
        elements: {
          image: hook("lightbox-image"),
          title: hook("lightbox-title"),
          description: hook("lightbox-desc"),
          counter: hook("lightbox-counter"),
          strip: hook("lightbox-strip"),
          prev: hook("lightbox-prev"),
          next: hook("lightbox-next"),
          close: hook("lightbox-close"),
          mono: hook("lightbox-mono"),
        },
      }),
    );
    if (!lightbox) return;

    this.#use(hook("gallery-grid"), (root) =>
      new GalleryGrid(root, { items: GALLERY_ITEMS, onOpen: (index) => lightbox.open(index), counter: hook("gallery-count") }),
    );
    bindLightboxTriggers(qsa("[data-open-lightbox]"), lightbox, this.#abort.signal);
  }

  #initDossier() {
    this.#use(hook("accordion"), (root) => new Accordion(root));
    this.#use(hook("tabs"), (root) => new Tabs(root, qsa("[data-pane]")));
  }

  #initRequest() {
    this.#use(hook("request-card"), (root) => new FormAssembly(root, { isDark: () => this.#store.get("theme") === "dark" }));
    this.#use(hook("request-form"), (root) =>
      new RequestForm(root, {
        config: REQUEST_CONFIG,
        clipboard: this.#clipboard,
        ui: {
          status: hook("request-status"),
          submit: hook("request-submit"),
          success: hook("request-success"),
          successText: hook("request-success-text"),
          copyButton: hook("request-copy"),
          resetButton: hook("request-reset"),
          counter: hook("request-counter"),
        },
      }),
    );
  }

  #initFooter() {
    this.#use(hook("flag-backdrop"), (root) =>
      new FlagBackdrop(root, { video: hook("flag-video"), observeTarget: hook("site-footer"), viewport: this.#viewport }),
    );
    this.#use(hook("flap-board"), (root) => new FlapBoard(root, { viewport: this.#viewport }));
    this.#use(hook("local-clock"), (root) => new LocalClock(root, { timeZone: CONTACT.timeZone, viewport: this.#viewport }));
    renderCurrentYear(hook("current-year"));
  }

  #initUtilities() {
    this.#use(hook("scroll-progress"), (root) => new ScrollProgress(root, this.#scroll));
    this.#clipboard.bind(qsa("[data-copy]"), this.#abort.signal);
    this.#disposers.push(new RevealOnScroll(qsa(".reveal")).start());
  }
}
