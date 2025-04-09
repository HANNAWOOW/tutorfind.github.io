console.log("Сайт запущен!");

// Анимация при наведении на кнопки
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    });

    button.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
});

// Переключение вкладок и поиск
document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.category-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            document.getElementById(category).classList.add('active');
        });
    });

    const searchInput = document.querySelector('.search-subject input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const subjects = document.querySelectorAll('.subject-card');

            subjects.forEach(subject => {
                const title = subject.querySelector('h3').textContent.toLowerCase();
                subject.style.display = title.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // --- Отзывы ---
    const form = document.getElementById("reviewForm");
    const container = document.getElementById("reviewsContainer");

    const savedReviews = JSON.parse(localStorage.getItem("reviews")) || [];

    savedReviews.forEach(addReviewToPage);

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const reviewText = document.getElementById("reviewText").value.trim();
        const date = new Date().toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        if (!username || !reviewText) return;

        const review = { username, text: reviewText, date };
        savedReviews.push(review);
        localStorage.setItem("reviews", JSON.stringify(savedReviews));

        addReviewToPage(review);
        form.reset();
    });

    function addReviewToPage({ username, text, date }) {
        const card = document.createElement("div");
        card.className = "review-card";
        card.innerHTML = `
            <div class="review-header">
                <img src="images/review-user1.jpg" alt="${username}" class="review-avatar">
                <div class="review-user">
                    <h3>${username}</h3>
                    <div class="review-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                </div>
            </div>
            <div class="review-content">
                <p>${text}</p>
            </div>
            <div class="review-footer">
                <span class="review-date">${date}</span>
                <span class="review-subject">Общий</span>
            </div>
        `;
        container.appendChild(card);
    }
});
// Обработка формы отзыва
document.getElementById('addReviewForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const review = document.getElementById('review').value;
    const rating = document.querySelector('.star.active')?.getAttribute('data-rating') || 0;
    
    // Здесь можно добавить отправку данных на сервер
    console.log({name, review, rating});
    alert('Спасибо за ваш отзыв!');
    this.reset();
});

// Обработка рейтинга звездами
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
        const stars = document.querySelectorAll('.star');
        
        stars.forEach((s, index) => {
            s.classList.toggle('active', index < rating);
        });
    });
});
// Открытие модального окна
document.getElementById('openReviewFormBtn').addEventListener('click', function() {
    document.getElementById('reviewModal').style.display = 'flex';
});

// Закрытие модального окна
document.getElementById('closeReviewModalBtn').addEventListener('click', function() {
    document.getElementById('reviewModal').style.display = 'none';
});

// Обработка отправки отзыва
document.getElementById('reviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const author = document.getElementById('reviewAuthor').value;
    const rating = parseInt(document.getElementById('reviewRating').value);
    const text = document.getElementById('reviewText').value;
    
    if (!author || !rating || !text) {
        alert('Заполните все поля!');
        return;
    }
    
    const newReview = {
        author: author,
        rating: rating,
        date: new Date().toLocaleDateString('ru-RU'),
        text: text
    };
    
    // Добавляем отзыв к репетитору
    const tutor = tutorsData.find(t => t.id === tutorId);
    tutor.reviews.unshift(newReview);
    tutor.reviewsCount++;
    
    // Обновляем рейтинг
    updateTutorRating(tutor);
    
    // Обновляем список отзывов
    renderReviews(tutor.reviews);
    
    // Закрываем модальное окно и очищаем форму
    document.getElementById('reviewModal').style.display = 'none';
    this.reset();
    document.getElementById('reviewRating').value = 0;
    resetRatingStars();
    
    alert('Спасибо за отзыв!');
});

// Выбор рейтинга звездами
document.querySelectorAll('#ratingStars i').forEach(star => {
    star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        document.getElementById('reviewRating').value = rating;
        
        // Подсвечиваем звезды
        document.querySelectorAll('#ratingStars i').forEach((s, i) => {
            if (i < rating) {
                s.classList.remove('far');
                s.classList.add('fas');
            } else {
                s.classList.remove('fas');
                s.classList.add('far');
            }
        });
    });
});

// Сброс звезд рейтинга
function resetRatingStars() {
    document.querySelectorAll('#ratingStars i').forEach(star => {
        star.classList.remove('fas');
        star.classList.add('far');
    });
}
// Переключение между ежемесячными и ежегодными тарифами
document.getElementById('billing-toggle').addEventListener('change', function() {
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const annuallyPrices = document.querySelectorAll('.price.annually');
    
    monthlyPrices.forEach(price => price.classList.toggle('hidden'));
    annuallyPrices.forEach(price => price.classList.toggle('hidden'));
});
