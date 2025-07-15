//HOME PAGE CODE!!!

    // Mobile menu toggle - Updated for new structure
    const menuToggle = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect for floating elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.2);
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });

  // Enhanced scroll effect with hide/show navbar functionality
  let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class for background effect
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar based on scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down - hide navbar
            navbar.classList.add('hidden');
        } else {
            // Scrolling up - show navbar
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });


    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.text-content, .image-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });

    // Initialize animations on page load
    window.addEventListener('load', () => {
        const textContent = document.querySelector('.text-content');
        const imageContent = document.querySelector('.image-content');
        
        setTimeout(() => {
            textContent.style.opacity = '1';
            textContent.style.transform = 'translateY(0)';
        }, 200);
        
        setTimeout(() => {
            imageContent.style.opacity = '1';
            imageContent.style.transform = 'translateY(0)';
        }, 400);
    });

    // Add hover effects to interactive elements
    document.querySelectorAll('.nav-links a, .shop-btn').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });



    const faders = document.querySelectorAll('.fade-in');

    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(".reveal-text", {
      scrollTrigger: {
        trigger: ".reveal-text",
        start: "top 80%", // when 80% of viewport hits element
        toggleActions: "play none none reverse"
      },
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power3.out"
    });

    document.addEventListener("DOMContentLoaded", () => {
        const paragraph = document.querySelector('.animated-text');
        const words = paragraph.innerText.split(' ');
      
        // Replace paragraph text with individual span-wrapped words
        paragraph.innerHTML = words
          .map((word, i) => `<span class="word" style="transition-delay:${i * 50}ms">${word}</span>`)
          .join(' ');
      
        const wordElements = document.querySelectorAll('.word');
      
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                wordElements.forEach((el, index) => {
                  setTimeout(() => {
                    el.classList.add('visible');
                  }, index * 50); // staggered animation
                });
                observer.disconnect(); // Animate only once
              }
            });
          },
          { threshold: 0.5 }
        );
      
        observer.observe(paragraph);
      });

      window.addEventListener('scroll', () => {
        const container = document.querySelector('.container');
        const bands = document.querySelectorAll('.band');
        const triggerPoint = window.innerHeight * 0.75;
    
        const containerTop = container.getBoundingClientRect().top;
    
        if (containerTop < triggerPoint) {
          bands.forEach(band => band.classList.add('visible'));
        } else {
          bands.forEach(band => band.classList.remove('visible'));
        }
      });


      //FOOTER
      
      function submitEmail() {
        const emailInput = document.getElementById("emailInput");
        const email = emailInput.value.trim();
        if (!email) {
          alert("Please enter your email address.");
          return;
        }
        // Simulate email submission
        alert(`Subscribed with email: ${email}`);
        emailInput.value = "";
      }
      
       // Add some interactive enhancements
       document.addEventListener('DOMContentLoaded', function() {
        const ctaButton = document.querySelector('.ui-cta');
        const marqueeTexts = document.querySelectorAll('.marquee-text');
        
        // Add hover effect to pause marquee
        const marqueeContainer = document.querySelector('.marquee-container');
        marqueeContainer.addEventListener('mouseenter', function() {
            marqueeTexts.forEach(text => {
                text.style.animationPlayState = 'paused';
            });
        });
        
        marqueeContainer.addEventListener('mouseleave', function() {
            marqueeTexts.forEach(text => {
                text.style.animationPlayState = 'running';
            });
        });
        
        // Add click handler for CTA button
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            // Add ripple styles
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: ${e.offsetX - 10}px;
                top: ${e.offsetY - 10}px;
                width: 20px;
                height: 20px;
            `;
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Simulate navigation
            setTimeout(() => {
                alert('Navigating to contact page...');
            }, 300);
        });
    });
    
    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Responsive text size adjustment
    function adjustTextSize() {
        const texts = document.querySelectorAll('.text');
        const viewportWidth = window.innerWidth;
        
        texts.forEach(text => {
            if (viewportWidth < 480) {
                text.style.fontSize = 'clamp(1.2rem, 15vw, 3rem)';
            } else if (viewportWidth < 768) {
                text.style.fontSize = 'clamp(1.5rem, 12vw, 4rem)';
            } else if (viewportWidth < 1024) {
                text.style.fontSize = 'clamp(2rem, 10vw, 6rem)';
            } else {
                text.style.fontSize = 'clamp(3rem, 8vw, 8rem)';
            }
        });
    }
    
    // Adjust on load and resize
    window.addEventListener('load', adjustTextSize);
    window.addEventListener('resize', adjustTextSize);

     document.getElementById('newsletterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const successMessage = document.getElementById('successMessage');
        
        if (email) {
            successMessage.style.display = 'block';
            document.getElementById('emailInput').value = '';
            
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    });


    //PICTURES SECTIONS
    // JavaScript for dynamic image loading and interactions
    class ProductShowcase {
        constructor() {
            this.frames = document.querySelectorAll('.frame');
            this.init();
        }

        init() {
            this.setupEventListeners();
            this.setupImageUpload();
        }

        setupEventListeners() {
            this.frames.forEach(frame => {
                frame.addEventListener('click', (e) => this.handleFrameClick(e));
                frame.addEventListener('mouseenter', (e) => this.handleFrameHover(e));
            });
        }

        setupImageUpload() {
            // Create a hidden file input for image upload
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            this.fileInput = fileInput;

            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.loadImage(e.target.files[0], this.currentFrame);
                }
            });
        }

        handleFrameClick(e) {
            const frame = e.currentTarget;
            this.currentFrame = frame;
            
            // Trigger file input
            this.fileInput.click();
        }

        handleFrameHover(e) {
            const frame = e.currentTarget;
            // Add any hover effects here if needed
        }

        loadImage(file, frame) {
            const reader = new FileReader();
            
            frame.classList.add('loading');
            
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Product image';
                
                img.onload = () => {
                    // Replace placeholder with image
                    frame.innerHTML = '';
                    frame.appendChild(img);
                    frame.classList.remove('loading');
                };
            };
            
            reader.readAsDataURL(file);
        }

        // Method to programmatically set images
        setImage(frameNumber, imageUrl) {
            const frame = document.querySelector(`[data-frame="${frameNumber}"]`);
            if (frame) {
                frame.classList.add('loading');
                
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Product image';
                
                img.onload = () => {
                    frame.innerHTML = '';
                    frame.appendChild(img);
                    frame.classList.remove('loading');
                };
                
                img.onerror = () => {
                    frame.classList.remove('loading');
                    console.error('Failed to load image:', imageUrl);
                };
            }
        }

        // Method to reset a frame to placeholder
        resetFrame(frameNumber) {
            const frame = document.querySelector(`[data-frame="${frameNumber}"]`);
            if (frame) {
                const frameClass = frame.classList.contains('frame-1') ? 'Large Image Bar' : 
                                 frame.classList.contains('frame-2') ? 'Medium Image Bar' : 'Small Image Bar';
                
                const recommendedSize = frame.classList.contains('frame-1') ? '1200x300px' :
                                      frame.classList.contains('frame-2') ? '800x200px' : '600x150px';
                
                frame.innerHTML = `
                    <div class="placeholder">
                        <div class="placeholder-text">
                            ${frameClass}<br>
                            <small>Recommended: ${recommendedSize}</small>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Initialize the showcase when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        window.productShowcase = new ProductShowcase();
        
        // Example of how to use the API programmatically:
         productShowcase.setImage(1, 'images/hands-cleaning-window.jpg');
         productShowcase.setImage(2, 'images/man-servant-doing-chores-around-house.jpg');
         productShowcase.setImage(3, 'images/still-life-cleaning-tools.jpg');
    });

    // Utility functions for external use
    function setProductImage(frameNumber, imageUrl) {
        if (window.productShowcase) {
            window.productShowcase.setImage(frameNumber, imageUrl);
        }
    }

    function resetProductFrame(frameNumber) {
        if (window.productShowcase) {
            window.productShowcase.resetFrame(frameNumber);
        }
    }

    //SERVICES SECTION
    // Function to handle "Learn More" button click
    function learnMore() {
        alert('Learn More About Our Services clicked! This would typically navigate to a services page or open a modal with more information.');
        // In a real implementation, you might navigate to another page:
        // window.location.href = '/services';
    }
    
    // Function to handle service item clicks
    function selectService(serviceName) {
        console.log(`Selected service: ${serviceName}`);
        alert(`You selected: ${serviceName}`);
        // In a real implementation, you might:
        // - Navigate to a specific service page
        // - Open a modal with service details
        // - Highlight the selected service
        // - Load service content dynamically
    }
    
    // Add intersection observer for scroll animations
    document.addEventListener('DOMContentLoaded', function() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);
        
        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    });
    
    // Add hover effects for service items
    document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(243, 156, 18, 0.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });

    /*STATS CONTENT*/
// Intersection Observer for triggering animations
        const observerOptions2 = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer2 = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statItem = entry.target;
                    const delay = parseInt(statItem.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        statItem.classList.add('animate');
                        
                        // Start counter animation
                        const numberElement = statItem.querySelector('.stat-number');
                        const target = parseInt(numberElement.dataset.target);
                        animateCounter(numberElement, target);
                    }, delay);
                    
                    observer2.unobserve(statItem);
                }
            });
        }, observerOptions);

        // Counter animation function
        function animateCounter(element, target) {
            element.classList.add('counting');
            
            const duration = 2000; // 2 seconds
            const steps = 60;
            const increment = target / steps;
            const stepDuration = duration / steps;
            
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Format the number based on its size
                let displayValue;
                if (target >= 1000000) {
                    if (target >= 25000000) {
                        displayValue = Math.floor(current / 1000000) + 'M+';
                    } else {
                        displayValue = Math.floor(current / 1000000) + 'M+';
                    }
                } else if (target >= 1000) {
                    displayValue = Math.floor(current / 1000) + 'K+';
                } else if (target = 100) {
                    displayValue =   Math.floor(current) + '%';
                } 
                
                element.textContent = displayValue;
            }, stepDuration);
        }

        // Initialize observers
        document.addEventListener('DOMContentLoaded', () => {
            const statItems = document.querySelectorAll('.stat-item');
            statItems.forEach(item => observer2.observe(item));
        });

        //SERVIVE IMAGES
        class ProductSlider {
            constructor() {
                this.currentSlide = 0;
                this.totalSlides = 5;
                this.autoPlayInterval = null;
                this.autoPlayDelay = 4000; // 4 seconds
                this.isPlaying = true;
                
                this.carousel = document.getElementById('carousel');
                this.progressBar = document.getElementById('progressBar');
                this.pagination = document.getElementById('pagination');
                
                this.init();
            }

            init() {
                this.createPagination();
                this.updateSlider();
                this.startAutoPlay();
                this.addTouchSupport();
                this.addKeyboardSupport();
            }

            createPagination() {
                for (let i = 0; i < this.totalSlides; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    dot.addEventListener('click', () => this.goToSlide(i));
                    this.pagination.appendChild(dot);
                }
            }

            updateSlider() {
                const translateX = -this.currentSlide * 100;
                this.carousel.style.transform = `translateX(${translateX}%)`;
                
                const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
                this.progressBar.style.width = `${progress}%`;
                
                document.querySelectorAll('.dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === this.currentSlide);
                });
            }

            nextSlide() {
                this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                this.updateSlider();
                this.resetAutoPlay();
            }

            prevSlide() {
                this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
                this.updateSlider();
                this.resetAutoPlay();
            }

            goToSlide(index) {
                this.currentSlide = index;
                this.updateSlider();
                this.resetAutoPlay();
            }

            startAutoPlay() {
                if (this.isPlaying) {
                    this.autoPlayInterval = setInterval(() => {
                        this.nextSlide();
                    }, this.autoPlayDelay);
                }
            }

            stopAutoPlay() {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                    this.autoPlayInterval = null;
                }
            }

            resetAutoPlay() {
                this.stopAutoPlay();
                this.startAutoPlay();
            }

            addTouchSupport() {
                let startX = 0;
                let endX = 0;
                
                this.carousel.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    this.stopAutoPlay();
                });
                
                this.carousel.addEventListener('touchmove', (e) => {
                    endX = e.touches[0].clientX;
                });
                
                this.carousel.addEventListener('touchend', () => {
                    const threshold = 50;
                    const diff = startX - endX;
                    
                    if (Math.abs(diff) > threshold) {
                        if (diff > 0) {
                            this.nextSlide();
                        } else {
                            this.prevSlide();
                        }
                    } else {
                        this.startAutoPlay();
                    }
                });
            }

            addKeyboardSupport() {
                document.addEventListener('keydown', (e) => {
                    switch(e.key) {
                        case 'ArrowLeft':
                            this.prevSlide();
                            break;
                        case 'ArrowRight':
                            this.nextSlide();
                            break;
                        case ' ':
                            e.preventDefault();
                            this.toggleAutoPlay();
                            break;
                    }
                });
            }

            toggleAutoPlay() {
                this.isPlaying = !this.isPlaying;
                if (this.isPlaying) {
                    this.startAutoPlay();
                } else {
                    this.stopAutoPlay();
                }
            }
        }

        // Global functions for navigation
        let slider;

        function nextSlide() {
            slider.nextSlide();
        }

        function prevSlide() {
            slider.prevSlide();
        }

        function learnMore() {
            alert('Learn More button clicked!');
            // Add your learn more functionality here
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', () => {
            slider = new ProductSlider();
            
            // Pause on hover
            const carouselWrapper = document.querySelector('.carousel-wrapper');
            carouselWrapper.addEventListener('mouseenter', () => slider.stopAutoPlay());
            carouselWrapper.addEventListener('mouseleave', () => slider.startAutoPlay());

            // Fade-in animation observer
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.fade-in').forEach(el => {
                observer.observe(el);
            });
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                slider?.stopAutoPlay();
            } else {
                slider?.startAutoPlay();
            }
        });