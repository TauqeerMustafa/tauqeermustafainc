(function ($) {
  "use strict";
  var windowOn = $(window);

  /*-----------------------------------------------------------------------------------

        Template Name: Monas - Personal Portfolio HTML Template.
        Author: themewolfs
        Support: themewolfs@gmail.com
        Description: Personal Portfolio HTML Template.
        Version: 1.0
        Developer: Soukhin khan (https://github.com/Soukhinkhan)

    -----------------------------------------------------------------------------------

      /*======================================
        Preloader activation
        ========================================*/

  handleQuantityButtons();

  $(document.body).on("updated_cart_totals", function () {
    handleQuantityButtons();
  });

  function resourcesHubMasonry() {
    var $grid = $(".resources-hub__masonry");
    $grid.masonry({
      itemSelector: ".col-item",
      columnWidth: ".col-lg-4",
      horizontalOrder: false,
      isAnimated: true,
      // percentPosition: true,
    });

    $grid.masonry("reloadItems");
    $grid.masonry("layout");

    // layout Masonry after each image loads
    $grid.imagesLoaded().progress(function () {
      $grid.masonry("layout");
    });
  }

  resourcesHubMasonry();

  $(window).on("load", function (event) {
    $("#preloader").delay(1000).fadeOut(500);

    $(".odometer").waypoint(
      function (direction) {
        if (direction === "down") {
          let countNumber = $(this.element).attr("data-count");
          $(this.element).html(countNumber);
        }
      },
      {
        offset: "80%",
      }
    );
  });

  // hover reveal start
  const hoveritem = document.querySelectorAll(".rr-hover-reveal-item");

  function moveImage(e, hoveritem, index) {
    const item = hoveritem.getBoundingClientRect();
    const x = e.clientX - item.x;
    const y = e.clientY - item.y;
    if (hoveritem.children[index]) {
      hoveritem.children[index].style.transform = `translate(${x}px, ${y}px)`;
    }
  }
  hoveritem.forEach((item, i) => {
    item.addEventListener("mousemove", (e) => {
      setInterval(moveImage(e, item, 1), 50);
    });
  });
  // hover reveal end

  $(".preloader-close").on("click", function () {
    $("#preloader").delay(0).fadeOut(500);

    $(".odometer").waypoint(
      function (direction) {
        if (direction === "down") {
          let countNumber = $(this.element).attr("data-count");
          $(this.element).html(countNumber);
        }
      },
      {
        offset: "80%",
      }
    );
  });

  //GSAP START

  // Check if any elements with the class ".end" exist
  if (document.querySelector(".end")) {
    // 31. Folks animation
    let endTl = gsap.timeline({
      repeat: -1,
      delay: 0.5,
      scrollTrigger: {
        trigger: ".end",
        start: "bottom 100%-=50px",
      },
    });

    gsap.set(".end", {
      opacity: 0,
    });

    gsap.to(".end", {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".end",
        start: "bottom 100%-=50px",
        once: true,
      },
    });

    let mySplitText = new SplitText(".end", {
      type: "words,chars",
    });
    let chars = mySplitText.chars;
    let endGradient = chroma.scale([
      "#F9D371",
      "#F47340",
      "#EF2F88",
      "#8843F2",
    ]);

    endTl.to(chars, {
      duration: 0.5,
      scaleY: 0.6,
      ease: "power3.out",
      stagger: 0.04,
      transformOrigin: "center bottom",
    });
    endTl.to(
      chars,
      {
        yPercent: -20,
        ease: "elastic",
        stagger: 0.03,
        duration: 0.8,
      },
      0.5
    );
    endTl.to(
      chars,
      {
        scaleY: 1,
        ease: "elastic.out(2.5, 0.2)",
        stagger: 0.03,
        duration: 1.5,
      },
      0.5
    );
    endTl.to(
      chars,
      {
        color: (i, el, arr) => {
          return endGradient(i / arr.length).hex();
        },
        ease: "power2.out",
        stagger: 0.03,
        duration: 0.3,
      },
      0.5
    );
    endTl.to(
      chars,
      {
        yPercent: 0,
        ease: "back",
        stagger: 0.03,
        duration: 0.8,
      },
      0.7
    );
    endTl.to(chars, {
      color: "#FFDA59",
      duration: 1.4,
      stagger: 0.05,
    });
  }

  /////////////////////////////////////////////////////

  //return img gsap
  gsap.registerPlugin(ScrollTrigger);

  let revealContainers = document.querySelectorAll(".return");

  revealContainers.forEach((container) => {
    let image = container.querySelector("img");
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        toggleActions: "restart none none reset",
      },
    });

    tl.set(container, { autoAlpha: 1 });
    tl.from(container, 1.5, {
      xPercent: -100,
      ease: Power2.out,
    });
    tl.from(image, 1.5, {
      xPercent: 100,
      scale: 1.3,
      delay: -1.5,
      ease: Power2.out,
    });
  });

  //GSAP smooth animation
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);

  if ($("#smooth-wrapper").length && $("#smooth-content").length) {
    gsap.config({
      nullTargetWarn: false,
    });

    let smoother = ScrollSmoother.create({
      smooth: 0.5,
      effects: true,
      smoothTouch: false,
      normalizeScroll: false,
      ignoreMobileResize: true,
    });
  }

  //GSAP title animation
  if ($(".rr_title_anim").length > 0) {
    let splitTitleLines = gsap.utils.toArray(".rr_title_anim");
    splitTitleLines.forEach((splitTextLine) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: splitTextLine,
          start: "top 90%",
          end: "bottom 60%",
          scrub: false,
          markers: false,
          toggleActions: "play none none reverse",
        },
      });

      const itemSplitted = new SplitText(splitTextLine, {
        type: "words, lines",
      });
      gsap.set(splitTextLine, { perspective: 400 });
      itemSplitted.split({ type: "lines" });
      tl.from(itemSplitted.lines, {
        duration: 1,
        delay: 0.3,
        opacity: 0,
        rotationX: -80,
        force3D: true,
        transformOrigin: "top center -50",
        stagger: 0.1,
      });
    });
  }

  //split-text animation
  let heroes = document.querySelectorAll(".hero");

  heroes.forEach((hero) => {
    let split = new SplitText(hero.querySelector("._split_text"), {
        type: "chars, words",
      }),
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top bottom",
          toggleActions: "play none none reverse",
          onEnter: () => {
            tl.timeScale(2.3);
          },

          onLeaveBack: () => {
            tl.timeScale(2.3).reverse();
          },
        },
      });
    tl.to(hero.querySelector(".sup_hero"), {
      opacity: 1,
      x: -50,
      ease: "back",
    }).from(split.chars, {
      opacity: 0,
      y: 50,
      rotation: 1,
      duration: 2,
      ease: "back",
      stagger: 0.05,
    });
  });
  //split-text animation end

  //fade-top gsap animation
  if ($(".fade-wrapper").length > 0) {
    $(".fade-wrapper").each(function () {
      var section = $(this);
      var fadeItems = section.find(".fade-top");

      fadeItems.each(function (index, element) {
        var delay = index * 0.15;

        gsap.set(element, {
          opacity: 0,
          y: 100,
        });

        ScrollTrigger.create({
          trigger: element,
          start: "top 100%",
          end: "bottom 60%",
          toggleActions: "play none none reverse",
          scrub: 0.5,
          onEnter: function () {
            gsap.to(element, {
              opacity: 1,
              y: 0,
              duration: 1,
              delay: delay,
            });
          },
          once: true,
        });
      });
    });
  }

  //GSAP END

  /*======================================
   Data Css js
   ========================================*/
  $("[data-background]").each(function () {
    $(this).css(
      "background-image",
      "url( " + $(this).attr("data-background") + "  )"
    );
  });

  $("[data-width]").each(function () {
    $(this).css("width", $(this).attr("data-width"));
  });

  $("[data-bg-color]").each(function () {
    $(this).css("background-color", $(this).attr("data-bg-color"));
  });

  /*======================================
      Mobile Menu Js
      ========================================*/
  $("#mobile-menu").meanmenu({
    meanMenuContainer: ".mobile-menu",
    meanScreenWidth: "1199",
    meanExpand: ['<i class="fa-regular fa-angle-right"></i>'],
  });
  $("#mobile-menu-2").meanmenu({
    meanMenuContainer: ".mobile-menu",
    meanScreenWidth: "5000",
    meanExpand: ['<i class="fa-regular fa-angle-right"></i>'],
  });

  /*======================================
      Sidebar Toggle
      ========================================*/
  $(".offcanvas__close,.offcanvas__overlay").on("click", function () {
    $(".offcanvas__area").removeClass("info-open");
    $(".offcanvas__overlay").removeClass("overlay-open");
  });
  // Scroll to bottom then close navbar
  $(window).scroll(function () {
    if ($("body").scrollTop() > 0 || $("html").scrollTop() > 0) {
      $(".offcanvas__area").removeClass("info-open");
      $(".offcanvas__overlay").removeClass("overlay-open");
    }
  });
  $(".sidebar__toggle").on("click", function () {
    $(".offcanvas__area").addClass("info-open");
    $(".offcanvas__overlay").addClass("overlay-open");
  });

  /*======================================
      Body overlay Js
      ========================================*/
  $(".body-overlay").on("click", function () {
    $(".offcanvas__area").removeClass("opened");
    $(".body-overlay").removeClass("opened");
  });

  /*======================================
      Sticky Header Js
      ========================================*/

  $(window).scroll(function () {
    if ($(this).scrollTop() > 250) {
      $("#header-sticky").addClass("rs-sticky");
    } else {
      $("#header-sticky").removeClass("rs-sticky");
    }
  });

  /*======================================
      MagnificPopup image view
      ========================================*/
  $(".popup-image").magnificPopup({
    type: "image",
    gallery: {
      enabled: true,
    },
  });

  /*======================================
      MagnificPopup video view
      ========================================*/
  $(".popup-video").magnificPopup({
    type: "iframe",
  });

  /*======================================
      Wow Js
      ========================================*/
  if ($(".wow").length) {
    var wow = new WOW({
      boxClass: "wow", // animated element css class (default is wow)
      animateClass: "animated", // animation css class (default is animated)
      offset: 0, // distance to the element when triggering the animation (default is 0)
      mobile: false, // trigger animations on mobile devices (default is true)
      live: true, // act on asynchronously loaded content (default is true)
    });
    wow.init();
  }

  /*======================================
      Button scroll up js
      ========================================*/

  /*======================================
    One Page Scroll Js
    ========================================*/
  // /*** Scroll Nav */
  // var link = $('.mean-nav ul li a');

  // link.on('click', function(e) {
  //     var target = $($(this).attr('href'));
  //     $('html, body').animate({
  //         scrollTop: target.offset().top - 76
  //     }, 600);
  //     $(this).parent().addClass('active');
  //     e.preventDefault();
  // });

  // $(window).on('scroll', function(){
  //     scrNav();
  // });

  // function scrNav() {
  //     var sTop = $(window).scrollTop();
  //     $('section').each(function() {
  //         var id = $(this).attr('id'),
  //             offset = $(this).offset().top-1,
  //             height = $(this).height();
  //         if(sTop >= offset && sTop < offset + height) {
  //             link.parent().removeClass('active');
  //             $('.main-menu').find('[href="#' + id + '"]').parent().addClass('active');
  //         }
  //     });
  // }
  // scrNav();

  /*======================================
    Smoth animatio Js
    ========================================*/
  $(document).on("click", ".smoth-animation", function (event) {
    event.preventDefault();
    $("html, body").animate(
      {
        scrollTop: $($.attr(this, "href")).offset().top - 50,
      },
      300
    );
  });

  /*======================================
      All Swiper Slide
    ========================================*/

  $(".grid").isotope({
    itemSelector: ".grid-item",
    percentPosition: true,
    masonry: {
      columnWidth: 1,
    },
  });

  //count
  function handleQuantityButtons() {
    $(".count-wrap .minus").click(function () {
      var input = $(this).closest(".count-wrap").find("input.qty");
      var currentValue = parseInt(input.val());
      if (currentValue > 1) {
        input.val(currentValue - 1).change();
      }
    });

    $(".count-wrap .plus").click(function () {
      var input = $(this).closest(".count-wrap").find("input.qty");
      var currentValue = parseInt(input.val());
      input.val(currentValue + 1).change();
    });
  }
  // Easy Pie Chart
  const piechart = document.querySelectorAll(".piechart");
  piechart.forEach(function (el) {
    const waypoint = new Waypoint({
      element: el,
      handler: function () {
        const easyPieChart = new EasyPieChart(el, {
          scaleColor: "transparent",
          lineWidth: 10,
          lineCap: "round",
          trackColor: " rgba(255, 255, 255, 0.3)",
          barColor: "#fff",
          size: 150,
          rotate: 0,
          animate: 1000,
          onStep: function (value) {
            this.el.querySelector("span").textContent = Math.round(value);
          },
          onStop: function (value, to) {
            this.el.querySelector("span").textContent = Math.round(to);
          },
        });
        this.destroy();
      },
      offset: "80%",
      triggerOnce: true,
    });
  });

  // Project Style3
  if ($(".slider_hover__item li").length) {
    $(".slider_hover__item li").each(function () {
      let self = $(this);

      self.on("mouseenter", function () {
        console.log($(this));
        $(".slider_hover__item li").removeClass("active");
        $(this).addClass("active");
      });
    });
  }

  $(".col-custom").on("click", function () {
    $("#features-item-thumb").removeClass().addClass($(this).attr("rel"));
    $(this).addClass("active").siblings().removeClass("active");
  });

  // Popup Search Box
  $(function () {
    $("#popup-search-box").removeClass("toggled");

    $(".dl-search-icon").on("click", function (e) {
      e.stopPropagation();
      $("#popup-search-box").toggleClass("toggled");
      $("#popup-search").focus();
    });

    $("#popup-search-box input").on("click", function (e) {
      e.stopPropagation();
    });

    $("#popup-search-box, body").on("click", function () {
      $("#popup-search-box").removeClass("toggled");
    });
  });

  // $('.lan-select select, .nice-select-select select').niceSelect();
  $(
    ".take-appointment-3__form-input-select select, .lan-select select, .nice-select-select select"
  ).niceSelect();
  $("#datepicker").datepicker({
    dateFormat: "mm/dd/yy",
  });

  $("#getting-started").countdown("2025/01/01", function (event) {
    $(this).html(
      event.strftime(
        " <div><span>%D</span></div>  <div><span>%H</span></div> <div><span>%M</span></div> <div><span>%S</span></div>"
      )
    );
  });

  /*** lastNobullet */
  function lastNobullet() {
    var lastElement = false;
    $(".footer__copyright-menu ul li, .last_item_not_horizental_bar .col-lg-4")
      .each(function () {
        if (lastElement && lastElement.offset().top != $(this).offset().top) {
          $(lastElement).addClass("no_bullet");
        } else {
          $(lastElement).removeClass("no_bullet");
        }
        lastElement = $(this);
      })
      .last()
      .addClass("no_bullet");
  }
  lastNobullet();

  $(window).resize(function () {
    lastNobullet();
  });

  $("#contact__form").submit(function (event) {
    event.preventDefault();
    var form = $(this);
    $(".loading-form").show();

    setTimeout(function () {
      $.ajax({
        type: form.attr("method"),
        url: form.attr("action"),
        data: form.serialize(),
      })
        .done(function (data) {
          $(".loading-form").hide();
          $(".contact__form").append(
            '<p class="success-message mt-3 mb-0">Your message has been sent successfully.</p>'
          );
        })
        .fail(function (data) {
          $(".loading-form").hide();
          $(".contact__form").append(
            '<p class="error-message mt-3 mb-0">Something went wrong. Please try again later.</p>'
          );
        });
    }, 1000);
  });

  $("#showlogin").on("click", function () {
    $("#checkout-login").slideToggle(400);
  });
  $("#showcoupon").on("click", function () {
    $("#checkout_coupon").slideToggle(400);
  });

  // Custom Cursor
  $("body").append('<div class="mt-cursor"></div>');
  var cursor = $(".mt-cursor"),
    linksCursor = $("a, .swiper-nav, button, .cursor-effect"),
    crossCursor = $(".cross-cursor");

  $(window).on("mousemove", function (e) {
    cursor.css({
      transform:
        "translate(" + (e.clientX - 15) + "px," + (e.clientY - 15) + "px)",
      visibility: "inherit",
    });
  });

  // Page Scroll Percentage
  function scrollTopPercentage() {
    const scrollPercentage = () => {
      const scrollTopPos = document.documentElement.scrollTop;
      const calcHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollValue = Math.round((scrollTopPos / calcHeight) * 100);
      const scrollElementWrap = $("#scroll-percentage");

      scrollElementWrap.css(
        "background",
        `conic-gradient( var(--rr-theme-primary2) ${scrollValue}%, var(--rr-common-white) ${scrollValue}%)`
      );

      // ScrollProgress
      if (scrollTopPos > 100) {
        scrollElementWrap.addClass("active");
      } else {
        scrollElementWrap.removeClass("active");
      }

      if (scrollValue < 96) {
        $("#scroll-percentage-value").text(`${scrollValue}%`);
      } else {
        $("#scroll-percentage-value").html(
          '<i class="fa-sharp fa-regular fa-arrow-up-long"></i>'
        );
      }
    };
    window.onscroll = scrollPercentage;
    window.onload = scrollPercentage;

    // Back to Top
    function scrollToTop() {
      document.documentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    $("#scroll-percentage").on("click", scrollToTop);
  }

  scrollTopPercentage();

  // slider js -----------
  $(document).ready(function () {
    function sliderAnimations(elements) {
      var animationEndEvents =
        "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
      elements.each(function () {
        var $this = $(this);
        var $animationDelay = $this.data("delay");
        var $animationDuration = $this.data("duration");
        var $animationType = "pixfix-animation " + $this.data("animation");
        $this.css({
          "animation-delay": $animationDelay,
          "-webkit-animation-delay": $animationDelay,
          "animation-duration": $animationDuration,
        });
        $this.addClass($animationType).one(animationEndEvents, function () {
          $this.removeClass($animationType);
        });
      });
    }
    var sliderOptions = {
      speed: 1500,
      autoplay: {
        delay: 7000,
      },
      disableOnInteraction: false,
      initialSlide: 0,
      parallax: false,
      mousewheel: false,
      loop: true,
      grabCursor: true,
      navigation: {
        nextEl: ".slider-arrow .slider-next",
        prevEl: ".slider-arrow .slider-prev",
      },
    };
    sliderOptions.on = {
      slideChangeTransitionStart: function () {
        var swiper = this;
        var animatingElements = $(swiper.slides[swiper.activeIndex]).find(
          "[data-animation]"
        );
        sliderAnimations(animatingElements);
      },

      resize: function () {
        this.update();
      },
    };

    var swiper = new Swiper(".banner-4__active", sliderOptions);
  });

  // Progress Item 7
  document.addEventListener("DOMContentLoaded", () => {
    const progressItems = document.querySelectorAll(".progress-7__item");
    const progressBox = document.querySelector(".progress-7__box");

    if (progressItems && progressBox) {
      // Define colors for each step
      const colors = ["#36F165"];

      window.addEventListener("scroll", () => {
        let activeIndex = -1;

        progressItems.forEach((item, index) => {
          const rect = item.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight / 2 && rect.bottom > 0;

          if (isInView) {
            item.classList.add("active");
            activeIndex = index;
          } else {
            item.classList.remove("active");
          }
        });

        if (activeIndex >= 0) {
          const activeItem = progressItems[activeIndex];
          const boxRect = progressBox.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();

          // Calculate the height for the progress line
          const newHeight = itemRect.top + itemRect.height / 1 - boxRect.top;

          // Update the progress line height and color
          progressBox.style.setProperty("--line-height", `${newHeight}px`);
          progressBox.style.setProperty(
            "--line-color",
            colors[activeIndex] || "#36F165"
          );
        } else {
          // Reset the line height when no item is active
          progressBox.style.setProperty("--line-height", `0px`);
        }
      });
    }
  });

  // Register GSAP plugins
  var device_width = window.screen.width;

  // Pin Active
  var pin_fixed = document.querySelector(".pin-element");
  if (pin_fixed && device_width > 1199) {
    gsap.to(".pin-element", {
      scrollTrigger: {
        trigger: ".pin-area",
        pin: ".pin-element",
        start: "top top",
        end: "bottom 60%",
        pinSpacing: false,
      },
    });
  }

  var pin_fixed = document.querySelector(".pin-element_2");
  if (pin_fixed && device_width > 1199) {
    gsap.to(".pin-element_2", {
      scrollTrigger: {
        trigger: ".pin-area-2",
        pin: ".pin-element_2",
        start: "top top",
        end: "bottom botttom",
        pinSpacing: false,
      },
    });
  }
  var lates_update__item = document.querySelectorAll(".lates-update__item");
  var counter = 0;

  if (device_width > 1199) {
    lates_update__item.forEach((gallery) => {
      gsap.to(gallery, {
        scrollTrigger: {
          trigger: gallery,
          pin: gallery,
          pinSpacing: false,
          start: "top 80px",
          delay: 1,
        },
      });
    });
  }

  //Faizar title H1 hero title animation/////////////////////////////////////
  if ($(".rr-title-animation").length > 0) {
    // 25. Title Animation
    let char_come = gsap.utils.toArray(".rr-title-animation");

    gsap.matchMedia().add("(min-width: 768px)", () => {
      char_come.forEach((splitTextLine) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: splitTextLine,
            start: "top 95%",
            end: "bottom 60%",
            scrub: false,
            markers: false,
            toggleActions: "play none none none",
          },
        });

        const itemSplitted = new SplitText(splitTextLine, {
          type: "chars, words",
        });

        gsap.set(splitTextLine, { perspective: 300 });

        itemSplitted.split({ type: "chars, words" });

        tl.from(itemSplitted.chars, {
          duration: 1.2,
          delay: 1,
          x: 100,
          autoAlpha: 0,
          stagger: 0.07,
        });
      });
    });
  }

  // faizen isotope js blog10
  var $grid = $(".grid").isotope({
    // options
  });
  // filter items on button click
  $(".blog10__filter").on("click", "button", function () {
    var filterValue = $(this).attr("data-filter");
    $grid.isotope({ filter: filterValue });
  });

  $(".blog10__filter button").on("click", function (event) {
    $(this).siblings(".active").removeClass("active");
    $(this).addClass("active");
    event.preventDefault();
  });

  // Faizen Designer video GSAP scroll animation start///////////////////////
  function initAnimation() {
    if (window.innerWidth > 991) {
      let imageTl_8 = gsap.timeline({
        scrollTrigger: {
          trigger: ".portfolio__big",
          endTrigger: ".service1__area",
          start: "top top+=85",
          pin: true,
          markers: false,
          scrub: 1,
          pinSpacing: true,
          end: "top bottom-=200",
        },
      });
      imageTl_8.to(".portfolio__big-inner", {
        width: "100%",
        borderRadius: "0px",
      });
    }
  }

  initAnimation();

  window.addEventListener("resize", () => {
    initAnimation();
  });
  // Faizen Designer video GSAP scroll animation end////////////////////////

  document.querySelectorAll(".img_anim_reveal").forEach((e) => {
    let t = e.querySelector("img"),
      o = gsap.timeline({
        scrollTrigger: {
          trigger: e,
          start: "top 70%",
        },
      });
    o.set(e, {
      autoAlpha: 1,
    }),
      o.from(e, 1.5, {
        xPercent: -200,
        ease: Power2.out,
      }),
      o.from(t, 1.5, {
        xPercent: 100,
        scale: 1.3,
        delay: -1.5,
        ease: Power2.out,
      });
  });
  document.querySelectorAll(".img_anim_reveal-2").forEach((e) => {
    let t = e.querySelector("img"),
      o = gsap.timeline({
        scrollTrigger: {
          trigger: e,
          start: "top 70%",
        },
      });
    o.set(e, {
      autoAlpha: 1,
    }),
      o.from(e, 1.5, {
        xPercent: 220,
        ease: Power2.out,
      }),
      o.from(t, 1.5, {
        xPercent: 100,
        scale: 1.2,
        delay: -1.5,
        ease: Power2.out,
      });
  });

  /* portfolio animation start */
  gsap.set(".tp-portfolio-bg-text", {
    x: "25%",
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".tp-portfolio-bg-text-animation",
        start: "-500 0%",
        end: "bottom -10%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    .to(".tp-portfolio-bg-text", {
      x: "-45%",
    });

  // jarallax js
  $(".jarallax").jarallax({
    speed: 0.2,
  });

  // counter js
  jQuery(document).ready(function ($) {
    $(".counter").counterUp({
      delay: 10,
      time: 1200,
    });
  });

  //////// counter h2 start /////////

  // project panel start
  gsap.registerPlugin(ScrollTrigger);

  if (window.innerWidth > 768) {
    let projectPanels = document.querySelectorAll(".project-panel");

    projectPanels.forEach((section) => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          pin: section,
          scrub: 1,
          start: "top 10%",
          end: "bottom 95%",
          endTrigger: ".project-panel-area",
          pinSpacing: false,
          markers: false,
        },
      });
    });
  } else {
    console.log("Scroll animation is disabled for mobile devices.");
  }
  // project panel end

  // Team Hover Js
  function Team_animation() {
    var active_bg = $(".team-section-2__wrapper .active-bg");
    var element = $(".team-section-2__wrapper .current");
    $(".team-section-2__wrapper .team-section-2__item").on(
      "mouseenter",
      function () {
        var e = $(this);
        activeTeam(active_bg, e);
      }
    );
    $(".team-section-2__wrapper").on("mouseleave", function () {
      element = $(".team-section-2__wrapper .current");
      activeTeam(active_bg, element);
      element.closest(".team-section-2__item").siblings().removeClass("mleave");
    });
    activeTeam(active_bg, element);
  }
  Team_animation();

  function activeTeam(active_bg, e) {
    if (!e.length) {
      return false;
    }
    var topOff = e.offset().top;
    var height = e.outerHeight();
    var menuTop = $(".team-section-2__wrapper").offset().top;
    e.closest(".team-section-2__item").removeClass("mleave");
    e.closest(".team-section-2__item").siblings().addClass("mleave");
    active_bg.css({
      top: topOff - menuTop + "px",
      height: height + "px",
    });
  }

  $(".team-section-2__wrapper .team-section-2__item").on("click", function () {
    $(".team-section-2__wrapper .team-section-2__item").removeClass("current");
    $(this).addClass("current");
  });
  // End Team Hover Js

  //////// counter h2 start /////////

  document.querySelectorAll(".img_anim_reveal-3").forEach((e) => {
    let t = e.querySelector("img"),
      o = gsap.timeline({
        scrollTrigger: {
          trigger: e,
          start: "top 70%",
        },
      });
    o.set(e, {
      autoAlpha: 1,
    }),
      o.from(e, 1.5, {
        xPercent: -100,
        ease: Power2.out,
      }),
      o.from(t, 1.5, {
        xPercent: 100,
        scale: 1.5,
        delay: -2.9,
        ease: Power2.out,
      });
  });

  //////// counter h2 end /////////

  /////////////////////////////// Hero animation ////////////////////////////////////

  gsap.registerPlugin(ScrollTrigger);

  const titleVideo = document.querySelector(".title-video");

  // ScrollTrigger
  ScrollTrigger.matchMedia({
    "(min-width: 1200px)": function () {
      // GSAP Animation
      gsap.to(titleVideo, {
        scrollTrigger: {
          trigger: ".brand",
          start: "top 50%",
          end: "top 0%",
          scrub: true,
        },
        x: "100%",
        y: "750px",
        scale: 4,
        width: "500px",
        height: "200px",
        borderRadius: "0px",
        paddingLeft: "10px",
        ease: "power1.out",
      });
    },

    "(max-width: 1199px)": function () {},
  });

  var hoverBtns = gsap.utils.toArray(".tp-hover-btn-wrapper");

  const hoverBtnItem = gsap.utils.toArray(".tp-hover-btn-item");
  hoverBtns.forEach((btn, i) => {
    $(btn).mousemove(function (e) {
      callParallax(e);
    });

    function callParallax(e) {
      parallaxIt(e, hoverBtnItem[i], 80);
    }

    function parallaxIt(e, target, movement) {
      var $this = $(btn);
      var relX = e.pageX - $this.offset().left;
      var relY = e.pageY - $this.offset().top;

      gsap.to(target, 0.5, {
        x: ((relX - $this.width() / 2) / $this.width()) * movement,
        y: ((relY - $this.height() / 2) / $this.height()) * movement,
        ease: Power2.easeOut,
      });
    }
    $(btn).mouseleave(function (e) {
      gsap.to(hoverBtnItem[i], 0.5, {
        x: 0,
        y: 0,
        ease: Power2.easeOut,
      });
    });
  });

  //tp-btn-trigger-2
  if ($(".tp-btn-trigger-2").length > 0) {
    gsap.set(".tp-btn-bounce-2", {
      y: -100,
      opacity: 0,
    });
    var mybtn = gsap.utils.toArray(".tp-btn-bounce-2");
    mybtn.forEach((btn) => {
      var $this = $(btn);
      gsap.to(btn, {
        scrollTrigger: {
          trigger: $this.closest(".tp-btn-trigger-2"),
          start: "top bottom",
          markers: false,
        },
        duration: 1,
        ease: "bounce.out",
        y: 0,
        opacity: 1,
      });
    });
  }

  // button hover animation
  $(".tp-hover-btn").on("mouseenter", function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;

    $(this).find(".tp-btn-circle-dot").css({
      top: y,
      left: x,
    });
  });

  $(".tp-hover-btn").on("mouseout", function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;

    $(this).find(".tp-btn-circle-dot").css({
      top: y,
      left: x,
    });
  });

  //montoya animation
  var heroCaptionParallax = gsap.to("#hero-caption.parallax-scroll-caption", {
    duration: 1,
    yPercent: 5,
    opacity: 0.5,
    ease: Linear.easeNone,
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: () => `+=${$("#hero").outerHeight()}`,
      scrub: true,
    },
  });

  //monas js===================================================================

  // brand slider
  var swiper = new Swiper(".h1-brand__slider", {
    slidesPerView: "auto",
    spaceBetween: 30,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
  });
  // all slider
  var swiper = new Swiper(".all-brand__slider", {
    slidesPerView: "auto",
    spaceBetween: 30,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
  });
  var swiper = new Swiper(".h1-service-slider", {
    slidesPerView: "auto",
    spaceBetween: 30,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
  });

  // service slider
  var swiper = new Swiper(".h1-service__slider", {
    slidesPerView: "auto",
    spaceBetween: 0,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
  });
  // testimonials  slider
  var swiper = new Swiper(".h1-test__slider", {
    slidesPerView: 1,
    spaceBetween: 50,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
  });

  var swiper = new Swiper(".h3-test__slider", {
    slidesPerView: 1,
    spaceBetween: 50,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
  });

  // about2 slider
  var swiper = new Swiper(".h1-about2__slider", {
    slidesPerView: 5,
    spaceBetween: 30,
    centeredSlides: true,
    freemode: true,
    centeredSlides: true,
    loop: true,
    speed: 3000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      575: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      767: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 5,
      },
    },
  });

  //progress bar<script>
  document.addEventListener("DOMContentLoaded", function () {
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return rect.top <= window.innerHeight && rect.bottom >= 0;
    }

    function animateProgressBar(bar) {
      const fill = bar.querySelector(".progress_fill");
      const label = bar.querySelector(".progress_label");
      const targetPercent = parseInt(bar.getAttribute("data-target"));

      let current = 0;
      const duration = 2000;
      const stepTime = Math.floor(duration / targetPercent);

      fill.style.width = "0%";
      label.textContent = "0%";

      setTimeout(() => {
        fill.style.width = targetPercent + "%";
      }, 50);

      const counter = setInterval(() => {
        if (current <= targetPercent) {
          label.textContent = current + "%";
          current++;
        } else {
          clearInterval(counter);
        }
      }, stepTime);
    }

    function onScroll() {
      const bars = document.querySelectorAll(".progress_bar");

      bars.forEach((bar) => {
        if (isInViewport(bar) && !bar.classList.contains("animated")) {
          animateProgressBar(bar);
          bar.classList.add("animated"); // So it only animates once
        }
      });
    }

    window.addEventListener("scroll", onScroll);
    window.addEventListener("load", onScroll);
  });

  var $grid = $(".grid").imagesLoaded(function () {
    $(".grid").isotope({
      itemSelector: ".grid-item",
      percentPosition: true,
      masonry: {
        // use outer width of grid-sizer for columnWidth
        columnWidth: 1,
      },
    });
    $(".portfolio-filter").on("click", "button", function () {
      var filterValue = $(this).attr("data-filter");
      $grid.isotope({ filter: filterValue });
    });
  });

  // GSAP Fade Animation
  let fadeArray_items = document.querySelectorAll(".fade-anim");
  if (fadeArray_items.length > 0) {
    const fadeArray = gsap.utils.toArray(".fade-anim");
    fadeArray.forEach((item, i) => {
      var fade_direction = "bottom";
      var onscroll_value = 1;
      var duration_value = 1.15;
      var fade_offset = 50;
      var delay_value = 0.15;
      var ease_value = "power2.out";
      if (item.getAttribute("data-offset")) {
        fade_offset = item.getAttribute("data-offset");
      }
      if (item.getAttribute("data-duration")) {
        duration_value = item.getAttribute("data-duration");
      }
      if (item.getAttribute("data-direction")) {
        fade_direction = item.getAttribute("data-direction");
      }
      if (item.getAttribute("data-on-scroll")) {
        onscroll_value = item.getAttribute("data-on-scroll");
      }
      if (item.getAttribute("data-delay")) {
        delay_value = item.getAttribute("data-delay");
      }
      if (item.getAttribute("data-ease")) {
        ease_value = item.getAttribute("data-ease");
      }
      let animation_settings = {
        opacity: 0,
        ease: ease_value,
        duration: duration_value,
        delay: delay_value,
      };
      if (fade_direction == "top") {
        animation_settings["y"] = -fade_offset;
      }
      if (fade_direction == "left") {
        animation_settings["x"] = -fade_offset;
      }
      if (fade_direction == "bottom") {
        animation_settings["y"] = fade_offset;
      }
      if (fade_direction == "right") {
        animation_settings["x"] = fade_offset;
      }
      if (onscroll_value == 1) {
        animation_settings["scrollTrigger"] = {
          trigger: item,
          start: "top 85%",
        };
      }
      gsap.from(item, animation_settings);
    });
  }

  // Text Splitting Wave
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
  if ($(".banner-big-text").length > 0) {
    gsap.registerPlugin(ScrollTrigger);

    // Ensure initial opacity is 0
    gsap.set(".banner-big-text", { opacity: 0 });

    // Fade in the text on scroll
    ScrollTrigger.create({
      trigger: ".banner-big-text",
      start: "top 80%",
      onEnter: () => {
        gsap.to(".banner-big-text", {
          opacity: 1,
          duration: 1,
          ease: "power1.out",
        });

        // Start animation once SplitText is applied
        let mySplitText = new SplitText(".banner-big-text", {
          type: "words,chars",
        });
        let chars = mySplitText.chars;
        let endGradient = chroma.scale([
          "#FFF",
          "#FFF",
          "#FFF",
          "#FFF",
          "#FFF",
        ]);

        let cta = gsap.timeline({ repeat: -1 });

        cta.to(chars, {
          duration: 0.5,
          scaleY: 0.6,
          ease: "power1.out",
          stagger: 0.04,
          transformOrigin: "center bottom",
        });
        cta.to(
          chars,
          {
            yPercent: -20,
            ease: "elastic",
            stagger: 0.03,
            duration: 0.8,
          },
          0.5
        );
        cta.to(
          chars,
          {
            scaleY: 1,
            ease: "elastic.out",
            stagger: 0.03,
            duration: 1.5,
          },
          0.5
        );
        cta.to(
          chars,
          {
            color: (i, el, arr) => endGradient(i / arr.length).hex(),
            ease: "power1.out",
            stagger: 0.03,
            duration: 0.3,
          },
          0.5
        );
        cta.to(
          chars,
          {
            yPercent: 0,
            ease: "back",
            stagger: 0.03,
            duration: 0.8,
          },
          0.7
        );
        cta.to(chars, {
          color: "#fff",
          duration: 1.4,
          stagger: 0.05,
        });
      },
    });
  }

  let mm = gsap.matchMedia();

  mm.add("(min-width: 1024px)", () => {
    var pin_list = document.querySelectorAll(".section-item");
    pin_list.forEach((item) => {
      console.log(item);
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          markers: false,
          pin: true,
          pinSpacing: false,
          start: "bottom bottom",
          end: "bottom -=500",
        },
      });
    });
  });

  // Image Filter Animation
  const filters = {
    _1: document.querySelector(".image-filter._1"),
    _5: document.querySelector(".image-filter._5"),
    _6: document.querySelector(".image-filter._6"),
    _7: document.querySelector(".image-filter._7"),
  };

  function runImageFilterAnimation() {
    // Reset all filters to 0 opacity
    Object.values(filters).forEach((el) => {
      if (el) el.style.opacity = 0;
    });

    // Step 1: Show _1
    setTimeout(() => {
      if (filters._1) filters._1.style.opacity = 1;
    }, 0);

    // Step 2: Switch to _5
    setTimeout(() => {
      if (filters._1) filters._1.style.opacity = 0;
      if (filters._5) filters._5.style.opacity = 1;
    }, 1050);

    // Step 3: Switch to _6
    setTimeout(() => {
      if (filters._5) filters._5.style.opacity = 0;
      if (filters._6) filters._6.style.opacity = 1;
    }, 4000);

    // Step 4: Switch to _7
    setTimeout(() => {
      if (filters._6) filters._6.style.opacity = 0;
      if (filters._7) filters._7.style.opacity = 1;
    }, 5000);

    // Step 5: Hide all again before restart
    setTimeout(() => {
      Object.values(filters).forEach((el) => {
        if (el) el.style.opacity = 0;
      });
    }, 6000);

    // Loop the animation again after full duration
    setTimeout(runImageFilterAnimation, 7000); // Total cycle = 7s
  }

  runImageFilterAnimation();

  //   Sticky Title Image Animation
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.body.offsetHeight;
    const maxScroll = docHeight - windowHeight;
    const scrollProgress = Math.min(scrollTop / maxScroll, 1); // Clamp 0 to 1

    const image1 = document.querySelector(".sticky-title__image.is-1");
    const image2 = document.querySelector(".sticky-title__image.is-2");
    const image3 = document.querySelector(".sticky-title__image.is-3");

    if (image1 && image2 && image3) {
      // Interpolate Y values from 0% to final %
      image1.style.transform = `translateY(${lerp(0, -450, scrollProgress)}%)`;
      image2.style.transform = `translateY(${lerp(0, -600, scrollProgress)}%)`;
      image3.style.transform = `translateY(${lerp(0, -520, scrollProgress)}%)`;
    }
  });

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }
 
// Hover Reveal Animation
const hoverBox = document.querySelector(".hover-image");

if (hoverBox) {
  const hoverInner = hoverBox.querySelector(".hover-image__inner");
  const hoverImg = hoverBox.querySelector(".hover-image__img");

  document.querySelectorAll(".image-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      const imgUrl = card.dataset.img;
      hoverImg.style.backgroundImage = `url(${imgUrl})`;

      gsap.set(hoverBox, { opacity: 1 });
      gsap.fromTo(hoverInner, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "power4.out" });
      gsap.fromTo(hoverImg, { scale: 1.4 }, { scale: 1, duration: 0.5, ease: "power4.out" });
    });

    card.addEventListener("mousemove", (e) => {
      gsap.to(hoverBox, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power3.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(hoverBox, {
        opacity: 0,
        duration: 0.3
      });
    });
  });
}  



})(jQuery);
