(function ($) {
    "use strict";
    var windowOn = $(window);

    gsap.registerPlugin(ScrollTrigger);

    
    const titleVideo = document.querySelector('.title-video');

    // ScrollTrigger
    ScrollTrigger.matchMedia({
    
    "(min-width: 1200px)": function () {
        // GSAP Animation
        gsap.to(titleVideo, {
        scrollTrigger: {
            trigger: '.designer',
            start: 'top 70%',
            end: 'bottom -20%',
            scrub: true,
            // markers: true,
        },
        x: '-20%',
        y: '1060px',
        scale: 6,
        width: '1900px',
        height: '200px',
        borderRadius: '0px',
        paddingLeft: '0px',
        ease: 'power1.out',
        });
    },

    "(max-width: 1199px)": function () {
    },
    });

 

})(jQuery);