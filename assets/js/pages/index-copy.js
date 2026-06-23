const whoContent = {
    astrophysics: {
        title: 'Astrophysics',
        ascii: '65 83 84 82 79',
        text: 'Dummy text: students use astronomy as the launch point for asking real research questions, reading scientific plots, and building confidence with unfamiliar ideas.',
        image: 'assets/images/Projects/bhns.jpg',
        alt: 'Astrophysics concept image'
    },
    supercomputing: {
        title: 'Supercomputing',
        ascii: '83 85 80 69 82',
        text: 'Dummy text: students learn how large computers help researchers process simulations, search data, and turn impossible calculations into practical tools.',
        image: 'assets/images/Miscellaneous/Other/ozstar.jpg',
        alt: 'Supercomputing facility image'
    },
    technology: {
        title: 'Technology',
        ascii: '84 69 67 72',
        text: 'Dummy text: students build small tools, test interfaces, and learn how technology turns scientific curiosity into something people can actually use.',
        image: 'assets/images/Miscellaneous/Carl-images/parkes.jpg',
        alt: 'Radio telescope technology image'
    },
    research: {
        title: 'Research',
        ascii: '82 69 83 69 65 82 67 72',
        text: 'Dummy text: students practice asking better questions, comparing evidence, and documenting the steps that turn a vague idea into a credible result.',
        image: 'assets/images/Miscellaneous/Carl-images/research.jpg',
        alt: 'Research workspace image'
    },
    analytics: {
        title: 'Analytics',
        ascii: '65 78 65 76 89 84 73 67 83',
        text: 'Dummy text: students explore datasets, find patterns, and learn how to explain what the numbers mean without losing the human story.',
        image: 'assets/images/Miscellaneous/Other/code.png',
        alt: 'Code and analytics image'
    },
    leadership: {
        title: 'Leadership',
        ascii: '76 69 65 68 69 82',
        text: 'Dummy text: students learn to run meetings, share responsibility, ask for help, and turn a team of curious people into a working research group.',
        image: 'assets/images/Miscellaneous/Other/leadership.jpg',
        alt: 'Leadership concept image'
    }
};

const projectSlides = [
    {
        title: 'Discovering Nanohertz Frequency Gravitational Waves Using Pulsar Timing Arrays',
        year: 'Year: 2024',
        image: 'assets/images/Miscellaneous/Placeholders/bg.jpg',
        link: 'projects/meerkat-pta.html',
        alt: 'Pulsar timing project preview'
    },
    {
        title: 'A.S.T.R.A.L. Branding, Logo Design and Website Development',
        year: 'Year: 2024',
        image: 'assets/images/Projects/website-mockup-horizontal.jpg',
        link: 'projects/astral-case-study.html',
        alt: 'ASTRAL website case study preview'
    },
    {
        title: 'Signal to Noise Calculator Tool',
        year: 'Year: 2024',
        image: 'assets/images/Projects/snrcalc-mockup-horizontal.jpg',
        link: 'projects/snrcalc-case-study.html',
        alt: 'SNRCalc project preview'
    },
    {
        title: 'Solar Angle Interference Calculator',
        year: 'Year: 2025',
        image: 'assets/images/Projects/sun_interference.png',
        link: 'projects/solar_angle.html',
        alt: 'Solar angle project preview'
    }
];

const reviewContent = {
    rudra: {
        name: 'Rudra Sekhri',
        role: 'Student',
        text: 'ASTRAL was such a beneficial experience for me. I learned how research is structured and how to communicate ideas with confidence.',
        image: 'assets/images/cohort/ASTRAL 2024/rudra.jpg',
        alt: 'Rudra Sekhri'
    },
    evie: {
        name: 'Evie Spilias',
        role: 'Student',
        text: 'Dummy review: ASTRAL gave me space to try research in a supportive team, ask questions freely, and build skills I can take into future STEM work.',
        image: 'assets/images/cohort/ASTRAL 2024/evie.jpg',
        alt: 'Evie Spilias'
    },
    hendrik: {
        name: 'Hendrik Combrinck',
        role: 'Student',
        text: 'Dummy review: The program made research feel collaborative and practical. I learned technical skills, but also how to explain work to other people.',
        image: 'assets/images/cohort/ASTRAL 2024/hendrik.png',
        alt: 'Hendrik Combrinck'
    },
    rebecca: {
        name: 'Rebecca Koehne',
        role: 'Student',
        text: 'Dummy review: ASTRAL helped me understand what doing astronomy can look like day to day, from data to teamwork to sharing the final result.',
        image: 'assets/images/cohort/ASTRAL 2024/rebecca.png',
        alt: 'Rebecca Koehne'
    }
};

const whoTabs = document.querySelectorAll('.copy-who-tab');
const whoTitle = document.querySelector('#who-panel-title');
const whoText = document.querySelector('#who-panel-text');
const whoAscii = document.querySelector('#who-ascii');
const whoImage = document.querySelector('#who-panel-image');

whoTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const key = tab.dataset.who;
        const content = whoContent[key];

        if (!content) {
            return;
        }

        whoTabs.forEach((item) => {
            item.classList.toggle('active', item === tab);
            item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
        });

        whoTitle.textContent = content.title;
        whoText.textContent = content.text;
        whoAscii.textContent = content.ascii;
        whoImage.src = content.image;
        whoImage.alt = content.alt;
    });
});

let activeProject = 0;
const projectYear = document.querySelector('#project-year');
const projectTitle = document.querySelector('#project-title');
const projectImage = document.querySelector('#project-image');
const projectLink = document.querySelector('#project-link');

function renderProject() {
    const project = projectSlides[activeProject];

    projectYear.textContent = project.year;
    projectTitle.textContent = project.title;
    projectImage.src = project.image;
    projectImage.alt = project.alt;
    projectLink.href = project.link;
}

document.querySelectorAll('[data-project-direction]').forEach((button) => {
    button.addEventListener('click', () => {
        const direction = button.dataset.projectDirection;
        activeProject = direction === 'next'
            ? (activeProject + 1) % projectSlides.length
            : (activeProject - 1 + projectSlides.length) % projectSlides.length;

        renderProject();
    });
});

const reviewRows = document.querySelectorAll('.copy-review-row');
const reviewRole = document.querySelector('#review-role');
const reviewName = document.querySelector('#review-name');
const reviewText = document.querySelector('#review-text');
const reviewImage = document.querySelector('#review-image');
const reviewModal = document.querySelector('[data-review-modal]');
const modalReviewRole = document.querySelector('#modal-review-role');
const modalReviewName = document.querySelector('#modal-review-name');
const modalReviewText = document.querySelector('#modal-review-text');
const modalReviewImage = document.querySelector('#modal-review-image');
const modalCloseButton = document.querySelector('.copy-review-close');

function renderReview(review) {
    reviewRole.textContent = review.role;
    reviewName.textContent = review.name;
    reviewText.textContent = review.text;
    reviewImage.src = review.image;
    reviewImage.alt = review.alt;
}

function openReviewModal(review) {
    modalReviewRole.textContent = review.role;
    modalReviewName.textContent = review.name;
    modalReviewText.textContent = review.text;
    modalReviewImage.src = review.image;
    modalReviewImage.alt = review.alt;
    reviewModal.hidden = false;
}

function closeReviewModal() {
    reviewModal.hidden = true;
}

reviewRows.forEach((row) => {
    row.addEventListener('click', () => {
        const review = reviewContent[row.dataset.review];

        if (!review) {
            return;
        }

        reviewRows.forEach((item) => item.classList.toggle('active', item === row));
        renderReview(review);
        openReviewModal(review);
    });
});

modalCloseButton.addEventListener('click', closeReviewModal);

reviewModal.addEventListener('click', (event) => {
    if (event.target === reviewModal) {
        closeReviewModal();
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !reviewModal.hidden) {
        closeReviewModal();
    }
});
