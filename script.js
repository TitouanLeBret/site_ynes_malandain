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
        if (window.scrollY > 120) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    const originalCards = Array.from(document.querySelectorAll('.testimonial-card'));
    const N = originalCards.length;

    // Clone for infinite loop
    originalCards.slice().reverse().forEach(card => {
        let clone = card.cloneNode(true);
        track.insertBefore(clone, track.firstChild);
    });
    originalCards.forEach(card => {
        let clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    let cards = Array.from(document.querySelectorAll('.testimonial-card'));
    let currentIndex = N + 1; // Middle item
    let isTransitioning = false;

    // Add explicit click selection for each card
    cards.forEach((card, i) => {
        card.addEventListener('click', () => {
            if (isTransitioning || i === currentIndex) return;
            currentIndex = i;
            updateCarousel();
        });
    });

    function updateCarousel(instant = false) {
        if (instant) {
            cards.forEach(c => c.style.transition = 'none');
        }

        cards.forEach(c => c.classList.remove('main-card'));
        cards[currentIndex].classList.add('main-card');
        
        track.style.scrollBehavior = instant ? 'auto' : 'smooth';
        
        // Use scrollLeft directly avoiding window jump!
        const targetCard = cards[currentIndex];
        const scrollPos = targetCard.offsetLeft - track.clientWidth / 2 + targetCard.clientWidth / 2;
        
        track.scrollLeft = scrollPos;

        if (instant) {
            // Force reflow so the browser renders before restoring transitions
            void track.offsetWidth;
            cards.forEach(c => c.style.transition = '');
        }
    }

    // Initialize instantly
    updateCarousel(true);

    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    nextBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateCarousel();
        setTimeout(() => {
            if (currentIndex >= 2 * N) {
                currentIndex -= N;
                updateCarousel(true);
            }
            isTransitioning = false;
        }, 500);
    });

    prevBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateCarousel();
        setTimeout(() => {
            if (currentIndex < N) {
                currentIndex += N;
                updateCarousel(true);
            }
            isTransitioning = false;
        }, 500);
    });

    // Handle scroll snapping loops via trackpad
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
                updateCarousel(true); 
                
                if (currentIndex >= 2 * N) {
                    currentIndex -= N;
                    updateCarousel(true);
                } else if (currentIndex < N) {
                    currentIndex += N;
                    updateCarousel(true);
                }
            }
        }, 150);
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
