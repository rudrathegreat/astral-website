(function () {
    var loadingAnimation = document.querySelector(".loading-content");
    if (!loadingAnimation) return;

    var loadingImage = loadingAnimation.querySelector("img");
    var loadingText = loadingAnimation.querySelector(".loading-text");
    var whiteLoadingText = loadingAnimation.querySelector(".white-loading-text");
    var whiteBackground = loadingAnimation.querySelector(".white-background");
    if (!loadingText) return;

    document.documentElement.classList.add("loading-active");
    document.body.classList.add("loading-active");
    window.scrollTo(0, 0);

    if (typeof lenis !== "undefined" && lenis && typeof lenis.stop === "function") {
        lenis.stop();
    }

    function resetScrollPosition() {
        window.scrollTo(0, 0);

        if (typeof lenis !== "undefined" && lenis && typeof lenis.scrollTo === "function") {
            lenis.scrollTo(0, { immediate: true });
        }
    }

    function completeLoader() {
        resetScrollPosition();
        document.documentElement.classList.remove("loading-active");
        document.body.classList.remove("loading-active");

        if (typeof lenis !== "undefined" && lenis && typeof lenis.start === "function") {
            lenis.start();
        }

        window.dispatchEvent(new CustomEvent("astral:loader-complete"));
    }

    function splitLoadingTextByWord(element) {
        if (!element || element.dataset.loadingTextSplit === "true") return [];

        var originalText = element.textContent.trim();
        if (!originalText) return [];

        var words = originalText.split(/\s+/);
        element.innerHTML = "";

        words.forEach(function (word, index) {
            var mask = document.createElement("span");
            mask.className = "loading-word-mask";

            var content = document.createElement("span");
            content.className = "loading-word-content";
            content.textContent = word;

            mask.appendChild(content);
            element.appendChild(mask);

            if (index < words.length - 1) {
                element.appendChild(document.createTextNode(" "));
            }
        });

        element.dataset.loadingTextSplit = "true";
        return element.querySelectorAll(".loading-word-content");
    }

    var loadingWords = splitLoadingTextByWord(whiteLoadingText);
    var progress = { value: 0 };
    var progressTween = null;

    if (window.gsap) {
        if (loadingWords.length) {
            gsap.set(loadingWords, { y: "130%", opacity: 0 });
        }
        if (whiteLoadingText) {
            whiteLoadingText.classList.add("loading-text-ready");
        }

        progressTween = gsap.to(progress, {
            value: 99,
            duration: 8,
            ease: "power1.out",
            onUpdate: function () {
                loadingText.textContent = Math.floor(progress.value) + "%";
            }
        });
    }

    window.addEventListener('load', function() {
        // Check if device is mobile
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        let finalWidth = "250vw";
        if (isMobile) {
            // Set final width of loading image to 500vw
            finalWidth = "500vw";
        }
        if (window.gsap) {
            if (progressTween) progressTween.kill();

            gsap.to(progress, {
                value: 100,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: function () {
                    loadingText.textContent = Math.floor(progress.value) + "%";
                },
                onComplete: function () {
                    var timeline = gsap.timeline();

                    timeline.to(loadingText, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });

                    if (loadingImage) {
                        timeline.to(loadingImage, {
                            width: finalWidth,
                            duration: 1.3,
                            ease: "power2.in"
                        });
                    }

                    if (loadingWords.length) {
                        timeline.to(loadingWords, {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            stagger: 0.035,
                            ease: "power3.out"
                        });
                    }

                    if (whiteBackground) {
                        timeline.to(whiteBackground, {
                            scaleY: 1,
                            duration: 1,
                            ease: "power2.inOut"
                        });
                    } else {
                        timeline.to({}, { duration: 0.5 });
                    }

                    timeline.to(loadingAnimation, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: function () {
                            loadingAnimation.style.pointerEvents = "none";
                            loadingAnimation.style.display = "none";
                            completeLoader();
                        }
                    }, "+=0.2");
                }
            });
        } else {
            loadingText.textContent = "100%";
            if (loadingImage) {
                loadingImage.style.width = "250vw";
            }
            if (loadingWords.length) {
                loadingWords.forEach(function (word) {
                    word.style.transform = "translateY(0)";
                    word.style.opacity = "1";
                });
            }
            if (whiteLoadingText) {
                whiteLoadingText.classList.add("loading-text-ready");
            }
            if (whiteBackground) {
                whiteBackground.style.transform = "scaleY(1)";
            }
            loadingAnimation.style.opacity = "0";
            loadingAnimation.style.pointerEvents = "none";
            loadingAnimation.style.display = "none";
            completeLoader();
        }
    });
})();
