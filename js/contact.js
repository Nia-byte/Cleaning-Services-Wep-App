
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
        