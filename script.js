document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('testimonial-track');
    const controls = document.querySelector('.carousel-controls');
    
    // Generate carousel buttons
    controls.innerHTML = `
        <button class="btn-nav-arrow prev-btn">&larr;</button>
        <button class="btn-nav-arrow dark next-btn">&rarr;</button>
    `;

    // Sticky Header Logic
    const mainHeader = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    const originalCards = Array.from(document.querySelectorAll('.testimonial-card'));
    const N = originalCards.length;

    // To make it infinite, duplicate the entire set of cards before and after
    // Prepend a set (in reverse to maintain DOM order when using insertBefore)
    originalCards.slice().reverse().forEach(card => {
        let clone = card.cloneNode(true);
        clone.classList.remove('main-card');
        track.insertBefore(clone, track.firstChild);
    });
    // Append a set
    originalCards.forEach(card => {
        let clone = card.cloneNode(true);
        clone.classList.remove('main-card');
        track.appendChild(clone);
    });

    let cards = Array.from(document.querySelectorAll('.testimonial-card'));
    // Start at the middle set, specifically the center card (N + 1)
    let currentIndex = N + 1; 
    let isTransitioning = false;

    function updateCarousel(instant = false) {
        cards.forEach(c => c.classList.remove('main-card'));
        cards[currentIndex].classList.add('main-card');
        
        track.style.scrollBehavior = instant ? 'auto' : 'smooth';

        cards[currentIndex].scrollIntoView({ 
            behavior: instant ? 'auto' : 'smooth', 
            block: 'nearest', 
            inline: 'center' 
        });
    }

    // Initialize without animation
    setTimeout(() => {
        updateCarousel(true);
    }, 100);

    window.addEventListener('resize', () => {
         updateCarousel(true);
    });

    nextBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        
        currentIndex++;
        updateCarousel();

        setTimeout(() => {
            if (currentIndex >= 2 * N) {
                currentIndex = currentIndex - N;
                updateCarousel(true);
            }
            isTransitioning = false;
        }, 500); // Wait for smooth scroll to finish
    });

    prevBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;

        currentIndex--;
        updateCarousel();

        setTimeout(() => {
            if (currentIndex < N) {
                currentIndex = currentIndex + N;
                updateCarousel(true);
            }
            isTransitioning = false;
        }, 500);
    });

    // Trackpad Scroll Sync for Infinite loop
    let scrollTimeout;
    track.addEventListener('scroll', () => {
        if (isTransitioning) return;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            let closestId = currentIndex;
            let closestDist = Infinity;
            cards.forEach((card, i) => {
                const dist = Math.abs(card.getBoundingClientRect().left - track.getBoundingClientRect().left - track.clientWidth/2 + card.clientWidth/2);
                if(dist < closestDist) {
                    closestDist = dist;
                    closestId = i;
                }
            });
            if(closestId !== currentIndex) {
                currentIndex = closestId;
                updateCarousel(true); // purely visual update of the class
                
                // Jump logic if needed
                if (currentIndex >= 2 * N) {
                    setTimeout(() => { currentIndex = currentIndex - N; updateCarousel(true); }, 50);
                } else if (currentIndex < N) {
                    setTimeout(() => { currentIndex = currentIndex + N; updateCarousel(true); }, 50);
                }
            }
        }, 100);
    });

    // Hanging Phone Interaction
    const phone = document.getElementById('hanging-phone');
    if(phone) {
        phone.addEventListener('mouseover', () => {
            phone.style.animationDuration = '1.5s';
        });
        phone.addEventListener('mouseout', () => {
            phone.style.animationDuration = '4s';
        });
    }

    // Modal RDV Logic
    const modal = document.getElementById('rdv-modal');
    const closeBtn = document.querySelector('.modal-close');
    const rdvForm = document.getElementById('rdv-form');

    // Attach to all elements that trigger a RDV or open contact
    document.querySelectorAll('a').forEach(btn => {
        if (btn.textContent.includes('JE PRENDS RDV') || btn.textContent.includes('ME CONTACTER')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
            });
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    });

    if (rdvForm) {
        rdvForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Merci pour votre demande ! Ynès vous contactera très prochainement.');
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                rdvForm.reset();
            }, 300);
        });
    }
});
