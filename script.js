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
            isTransitioning = true;
            currentIndex = i;
            updateCarousel();

            // Boucle infinie invisible après l'animation
            setTimeout(() => {
                if (currentIndex >= 2 * N) {
                    currentIndex -= N;
                    updateCarousel(true);
                } else if (currentIndex < N) {
                    currentIndex += N;
                    updateCarousel(true);
                }
                isTransitioning = false;
            }, 500);
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
                const dist = Math.abs(card.getBoundingClientRect().left - track.getBoundingClientRect().left - track.clientWidth / 2 + card.clientWidth / 2);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestId = i;
                }
            });
            if (closestId !== currentIndex) {
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
    if (phone) {
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

    // Initialisation d'EmailJS avec une fonction anonyme pour la robustesse (vous remplacerez ces identifiants)
    if (typeof emailjs !== 'undefined') {
        emailjs.init("VOTRE_CLE_PUBLIQUE_EMAILJS");
    }

    if (rdvForm) {
        rdvForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = rdvForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = "ENVOI EN COURS...";

            const formData = new FormData(rdvForm);

            const rawDate = formData.get('user_date');

            const prenom = formData.get('user_prenom');
            const nom = formData.get('user_nom');
            const service = formData.get('user_service');

            let calLink = "";
            let formattedDate = "Non précisée";

            if (rawDate) {
                const dateObj = new Date(rawDate);
                const pad = (n) => (n < 10 ? '0' + n : n);
                const YYYY = dateObj.getFullYear();
                const MM = pad(dateObj.getMonth() + 1);
                const DD = pad(dateObj.getDate());
                const HH = pad(dateObj.getHours());
                const MIN = pad(dateObj.getMinutes());
                const startDate = `${YYYY}${MM}${DD}T${HH}${MIN}00`;

                // Durée de la réunion = 1 heure
                const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
                const endHH = pad(endObj.getHours());
                const endDate = `${YYYY}${MM}${DD}T${endHH}${MIN}00`;

                // Création du lien Google Calendar seulement si la date est fournie
                calLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=RDV+Yn%C3%A8s+Malandain+-+${encodeURIComponent(prenom)}+${encodeURIComponent(nom)}&details=Prestation:+${encodeURIComponent(service)}&dates=${startDate}/${endDate}`;
                formattedDate = dateObj.toLocaleString('fr-FR');
            }

            const templateParams = {
                user_prenom: prenom,
                user_nom: nom,
                user_email: formData.get('user_email'),
                user_phone: formData.get('user_phone'),
                user_service: service,
                user_date: formattedDate,
                message: formData.get('message'),
                calendar_link: calLink
            };

            // Exécution finale
            emailjs.send("VOTRE_SERVICE_ID", "VOTRE_TEMPLATE_ID", templateParams)
                .then(() => {
                    alert('Merci pour votre demande ! Un e-mail a été envoyé à Ynès, et vous recevrez bientôt une confirmation.');
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                        rdvForm.reset();
                        btn.textContent = originalText;
                    }, 300);
                })
                .catch((error) => {
                    alert("Une erreur est survenue lors de l'envoi de votre demande via EmailJS. Vérifiez vos clés API ou réessayez plus tard.");
                    console.error("Erreur EmailJS détaillée :", error);
                    btn.textContent = originalText;
                });
        });
    }
});
