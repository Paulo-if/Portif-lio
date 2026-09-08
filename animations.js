gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && window.gsap) {
  gsap.defaults({ duration: 0.6, ease: "power2.out" });

  gsap.context(() => {
    const heroText = document.querySelector("#hero-title text");
    const textLength = heroText.getComputedTextLength();

    gsap.set(heroText, { strokeDasharray: textLength, strokeDashoffset: textLength });

    const heroTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    heroTimeline
      .to(heroText, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
      .from(".hero h1", { y: 26, autoAlpha: 0, duration: 0.7 }, "-=0.5")
      .from(".hero .subtitle", { y: 18, autoAlpha: 0, duration: 0.6 }, "-=0.35")
      .from(".hero .hero-btn", { y: 14, autoAlpha: 0, scale: 0.92, duration: 0.55 }, "-=0.3");

    function revealOnEnter(selector, trigger, start, initial = {}, end = {}) {
      gsap.set(selector, { autoAlpha: 0, ...initial });
      ScrollTrigger.create({
        trigger,
        start,
        once: true,
        onEnter: () => {
          const toVars = { autoAlpha: 1, duration: 0.6, ease: "power2.out", overwrite: true };
          if (initial.stagger) toVars.stagger = initial.stagger;
          gsap.to(selector, { ...toVars, ...end });
        }
      });
    }

    gsap.utils.toArray("section .title").forEach((title) => {
      revealOnEnter(title, title, "top 88%", { y: 28 }, { y: 0 });
    });

    revealOnEnter(".about .profile", ".about-me", "top 80%", { y: 32 }, { y: 0 });
    revealOnEnter(".about .description", ".about-me", "top 80%", { y: 32 }, { y: 0 });
    revealOnEnter(".service-card", ".services", "top 80%", { y: 36, scale: 0.9, stagger: 0.08 }, { y: 0, scale: 1 });
    revealOnEnter(".skill-group h2", ".skill-groups", "top 85%", { y: 18, stagger: 0.08 }, { y: 0 });
    revealOnEnter(".skill-box", ".skill-groups", "top 80%", { scale: 0.9, stagger: 0.04 }, { scale: 1 });
    revealOnEnter(".projects .card", ".projects", "top 80%", { y: 36, stagger: 0.08 }, { y: 0 });
    revealOnEnter(".contact-box", ".contact-box", "top 85%", { y: 32 }, { y: 0 });
    revealOnEnter("footer .container", "footer", "top 95%", { y: 24 }, { y: 0 });

    gsap.to(".service-icon", {
      scale: 1.04,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.35
    });

    gsap.to("#scroll-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
    });

    gsap.to("header", {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      ease: "none",
      scrollTrigger: { start: "top top", end: 400, scrub: 0.3 }
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
  });
}