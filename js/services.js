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

        // Add scroll animation effects
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections for animation
        document.querySelectorAll('.service-card, .solution-card, .service-box').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });



        
    //MENU BAR 
     const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        const closeMenu = document.getElementById('closeMenu');
        const menuLinks = document.querySelectorAll('.menu-nav a');

       function openMenu() {
         mobileMenu.classList.add('active');
         menuOverlay.classList.add('active');
         hamburger.classList.add('active');
         hamburger.setAttribute('aria-expanded', 'true');
         document.body.style.overflow = 'hidden';
        }

       function closeMenuFunc() {
         mobileMenu.classList.remove('active');
         menuOverlay.classList.remove('active');
         hamburger.classList.remove('active');
         hamburger.setAttribute('aria-expanded', 'false');
         document.body.style.overflow = '';
        }

        // Open menu
        hamburger.addEventListener('click', openMenu);

        // Close menu
        closeMenu.addEventListener('click', closeMenuFunc);
        menuOverlay.addEventListener('click', closeMenuFunc);

        // Close menu when clicking on a link
        menuLinks.forEach(link => {
            link.addEventListener('click', closeMenuFunc);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMenuFunc();
            }
        });