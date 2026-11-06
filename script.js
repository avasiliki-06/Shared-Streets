// Reveal sections as they enter the viewport.
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal, .stat").forEach(el => revealObserver.observe(el));

    // Reading progress line.
    const progressBar = document.querySelector(".scroll-progress span");
    let scrollTicking = false;
    function updateScrollEffects() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      progressBar.style.transform = `scaleX(${progress})`;

      // Keeps the hero photograph atmospheric.
      const heroImage = document.querySelector(".hero img");
      if (heroImage && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        heroImage.style.transform = `translateY(${window.scrollY * 0.12}px) scale(1.04)`;
      }
      scrollTicking = false;
    }
    window.addEventListener("scroll", () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollEffects);
        scrollTicking = true;
      }
    }, { passive: true });
    updateScrollEffects();

    // Count-up animation for the campaign's three key figures.
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target);
        const duration = 1100;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.round(target * eased);
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.7 });
    document.querySelectorAll(".count").forEach(el => countObserver.observe(el));

    // Highlight the current section in the navigation.
    const navLinks = [...document.querySelectorAll(".nav a")];
    const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.toggle(
            "active", link.getAttribute("href") === `#${entry.target.id}`
          ));
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));




    // Orange bird cursor. The arrow follows the pointer; its soft wake appears only during movement and fades while idle.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const layer = document.createElement("div");
      layer.className = "flight-cursor-layer";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML = '<svg class="flight-trail" aria-hidden="true"><path></path></svg><svg class="flight-arrow" viewBox="0 0 24 20" aria-hidden="true"><path d="M23 10 C17.5 8.7 11.5 4.7 2 1.5 C5.1 5.2 7.2 7.8 9.4 10 C7.2 12.2 5.1 14.8 2 18.5 C11.5 15.3 17.5 11.3 23 10 Z" /></svg>';
      document.body.append(layer);
      const trail = layer.querySelector(".flight-trail path");
      const arrow = layer.querySelector(".flight-arrow");
      let last = null, fadeTimer = null, clearTimer = null;
      let history = [];
      const drawTrail = () => {
        if (history.length < 2) { trail.setAttribute("d", ""); return; }
        const pts = history.slice(-14);
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i=0; i<pts.length-1; i++) {
          const a=pts[Math.max(0,i-1)], b=pts[i], c=pts[i+1], e=pts[Math.min(pts.length-1,i+2)];
          d += ` C ${(b.x+(c.x-a.x)/6).toFixed(1)} ${(b.y+(c.y-a.y)/6).toFixed(1)}, ${(c.x-(e.x-b.x)/6).toFixed(1)} ${(c.y-(e.y-b.y)/6).toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
        }
        trail.setAttribute("d", d);
      };
      document.addEventListener("pointermove", event => {
        if (event.pointerType !== "mouse") return;
        const point={x:event.clientX,y:event.clientY};
        layer.classList.add("is-moving");
        document.body.classList.add("flight-visible");
        if (last) {
          const dx=point.x-last.x, dy=point.y-last.y;
          const distance=Math.hypot(dx,dy);
          if (distance>1.5) {
            history.push(last);
            if (history.length>14) history.shift();
            const angle=Math.atan2(dy,dx)*180/Math.PI;
            arrow.style.transform=`translate(${point.x-12}px,${point.y-10}px) rotate(${angle}deg)`;
            drawTrail();
          }
        } else {
          arrow.style.transform=`translate(${point.x-12}px,${point.y-10}px)`;
        }
        last=point;
        clearTimeout(fadeTimer); clearTimeout(clearTimer);
        fadeTimer=setTimeout(()=>layer.classList.remove("is-moving"),260);
        clearTimer=setTimeout(()=>{history=[];trail.setAttribute("d","");},1150);
      });
      document.addEventListener("pointerleave",()=>{
        document.body.classList.remove("flight-visible");
        layer.classList.remove("is-moving");
        history=[]; last=null; trail.setAttribute("d","");
        clearTimeout(fadeTimer); clearTimeout(clearTimer);
      });
    }

    // Guided client walkthrough: image focus, explanation and progress move together.
    const tourSteps = {
      crosswalk:[
        {k:"01 / LOCATION",t:"HERE: THE CROSSWALK",c:"The intervention sits directly on the pedestrian crossing — where people already move through this intersection.",w:"It reaches pedestrians in the exact space the campaign is asking the city to make safer.",f:[73,72,29,30]},
        {k:"02 / MESSAGE",t:"THIS: THE QUESTION",c:"“WHO IS THE STREET FOR?” is printed across the crossing, not placed beside it.",w:"The message becomes part of the pedestrian route. The question and the issue meet in the same place.",f:[73,64,20,24]},
        {k:"03 / DESIGN",t:"THIS: THE CROSSWALK",c:"The campaign works with the existing crosswalk markings and interrupts a familiar street signal.",w:"People recognize the crossing instantly; the unexpected message makes them look again.",f:[75,78,27,19]},
        {k:"04 / BIG PICTURE",t:"THIS: THE WHOLE JUNCTION",c:"The aerial view shows pedestrian routes, vehicle movement and the campaign intervention together.",w:"The location makes the conflict over shared street space visible without needing a long explanation.",f:[70,68,38,40]}
      ],
      subway:[
        {k:"01 / LOCATION",t:"HERE: THE PLATFORM WALL",c:"The installation faces people waiting on the subway platform, inside the transit system itself.",w:"A natural waiting moment gives riders time to notice and read the campaign.",f:[75,49,51,41]},
        {k:"02 / MESSAGE",t:"THIS: THE HEADLINE",c:"“MAKE ROOM TO MOVE” is the first read: oversized, short and visible across the tracks.",w:"The headline is readable at a distance and lands before the supporting information.",f:[56,51,19,39]},
        {k:"03 / DATA VISUALIZATION",t:"THIS: THE CITY AS A BAR GRAPH",c:"Look at the building shapes across the wall graphic. Their varied heights create a skyline that also reads like a bar graph, turning the city itself into a visual form of data.",w:"The visualization connects the campaign to the built environment and makes the data feel like part of the city, rather than a separate chart.",f:[67,58,23,18]},
        {k:"04 / EVIDENCE + CLIENT",t:"THIS: THE STATISTIC AND SDG 11",c:"The 50.5% figure anchors the message in Toronto CMA commuting data, while the official Goal 11 mark identifies the campaign’s UN Sustainable Development Goal connection.",w:"The statistic gives the message local evidence; the official mark makes the client and campaign purpose clear.",f:[61,47,40,25]}
      ]
    };
    document.querySelectorAll(".guided-case").forEach(card=>{
      const steps=tourSteps[card.dataset.tour];let current=0;
      const stage=card.querySelector(".guided-stage"),title=card.querySelector(".guided-title"),copy=card.querySelector(".guided-copy"),why=card.querySelector(".guided-reason"),count=card.querySelector(".guided-step-count"),kicker=card.querySelector(".guided-step-kicker"),fill=card.querySelector(".guided-progress-fill"),marker=card.querySelector(".guided-marker"),focus=card.querySelector(".guided-focus"),prev=card.querySelector(".guided-prev"),next=card.querySelector(".guided-next"),dots=[...card.querySelectorAll(".guided-dots button")];
      const cursor=card.querySelector(".guided-cursor");
      stage.addEventListener("pointermove",event=>{if(event.pointerType!=="mouse")return;const r=stage.getBoundingClientRect();cursor.style.left=(event.clientX-r.left)+"px";cursor.style.top=(event.clientY-r.top)+"px";stage.classList.add("cursor-active");});
      stage.addEventListener("pointerleave",()=>stage.classList.remove("cursor-active"));
      function showStep(index){current=Math.max(0,Math.min(index,steps.length-1));const s=steps[current];title.textContent=s.t;copy.textContent=s.c;why.textContent=s.w;kicker.textContent=s.k;count.textContent=`${current+1}/4`;fill.style.width=`${(current+1)*25}%`;dots.forEach((d,i)=>d.classList.toggle("is-current",i===current));prev.disabled=current===0;next.textContent=current===3?"RESTART WALKTHROUGH ↺":`NEXT: ${steps[current+1].k} →`;const [x,y,w,h]=s.f;focus.style.left=`${x}%`;focus.style.top=`${y}%`;focus.style.width=`${w}%`;focus.style.height=`${h}%`;marker.style.left=`${x}%`;marker.style.top=`${y}%`;marker.textContent=String(current+1).padStart(2,"0");stage.classList.add("has-focus");}
      prev.addEventListener("click",()=>showStep(current-1));next.addEventListener("click",()=>showStep(current===3?0:current+1));dots.forEach((d,i)=>d.addEventListener("click",()=>showStep(i)));showStep(0);
    });
    // Pause the moving ticker when the page is not visible.
    document.addEventListener("visibilitychange", () => {
      document.querySelectorAll(".ticker-track").forEach(track => {
        track.style.animationPlayState = document.hidden ? "paused" : "running";
      });
    });

    // Full-screen image viewing for campaign installations and graphics.
    const lightbox = document.getElementById("image-lightbox");
    const lightboxImage = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-active");
      lightboxImage.src = "";
    };
    document.querySelectorAll(".image-open").forEach(button => {
      button.addEventListener("click", () => {
        const img = button.querySelector("img");
        const caption = button.closest("figure")?.querySelector("figcaption")?.innerText || img.alt;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = caption;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-active");
        lightbox.querySelector(".lightbox-close").focus();
      });
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
