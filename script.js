document.addEventListener('DOMContentLoaded', function() {
    const screens = document.querySelectorAll('.screen');
    const dateInput = document.getElementById('dateInput');
    const connectBtn = document.getElementById('connectBtn');
    const errorMsg = document.getElementById('errorMsg');
    
    // Правильная дата
    const correctDate = '22112006';
    
    let currentScreen = 0;
    let isAnimating = false;
    let mobileNav = null;
    let touchStartY = 0;
    let touchStartX = 0;

    function init() {
        showScreen(0);
        setupMusic();
        setupMobileNavigation();
        
        console.log('Всего экранов:', screens.length);
    }
    
    function showScreen(index) {
        if (isAnimating || index < 0 || index >= screens.length) return;
        
        isAnimating = true;
        
        // Скрываем текущий экран
        screens[currentScreen].classList.remove('active');
        
        // Показываем новый экран
        screens[index].classList.add('active');
        currentScreen = index;
        
        // Показываем навигацию только НЕ на первом экране
        if (mobileNav) {
            if (index === 0) {
                mobileNav.style.display = 'none';
            } else {
                mobileNav.style.display = 'flex';
            }
        }
        
        updateNavDots();
        
        // Сбрасываем флаг анимации после перехода
        setTimeout(() => {
            isAnimating = false;
        }, 500);
        
        console.log('Переключено на экран:', index);
    }
    
    function nextScreen() {
        if (currentScreen < screens.length - 1) {
            showScreen(currentScreen + 1);
        }
    }
    
    function prevScreen() {
        if (currentScreen > 0) {
            showScreen(currentScreen - 1);
        }
    }
    
    function setupMobileNavigation() {
        // Создаем навигацию сразу, но скрываем до ввода пароля
        createMobileNav();
        
        // Обработчики для мобильных устройств
        document.addEventListener('touchstart', function(e) {
            if (currentScreen === 0) return;
            
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (currentScreen === 0 || isAnimating) return;
            
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const diffY = touchStartY - touchEndY;
            const diffX = touchStartX - touchEndX;
            
            // Определяем направление свайпа
            const isVerticalSwipe = Math.abs(diffY) > Math.abs(diffX);
            
            if (isVerticalSwipe) {
                // Вертикальный свайп - навигация между экранами
                if (diffY > 80) { // Свайп вверх
                    nextScreen();
                } else if (diffY < -80) { // Свайп вниз
                    prevScreen();
                }
            }
        }, { passive: true });
        
        // Для ПК оставляем колесо мыши
        window.addEventListener('wheel', function(e) {
            if (isAnimating || currentScreen === 0) return;
            
            if (e.deltaY > 50) {
                nextScreen();
            } else if (e.deltaY < -50) {
                prevScreen();
            }
        }, { passive: true });
    }
    
    // Обработчик кнопки подключения
    connectBtn.addEventListener('click', function() {
        const enteredDate = dateInput.value.trim();
        
        if (enteredDate === correctDate) {
            showScreen(1);
            // Показываем навигацию после успешного входа
            if (mobileNav) {
                mobileNav.style.display = 'flex';
            }
        } else {
            errorMsg.textContent = "> ОШИБКА: НЕВЕРНЫЙ КЛЮЧ ДОСТУПА";
            errorMsg.style.display = 'block';
            
            dateInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                dateInput.style.animation = '';
            }, 500);
        }
    });
    
    // Также разрешаем ввод по Enter
    dateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            connectBtn.click();
        }
    });
    
    function createMobileNav() {
        const navHTML = `
            <div class="mobile-nav" style="display: none;">
                <button class="nav-btn prev-btn" aria-label="Предыдущий экран">↑</button>
                <div class="nav-dots"></div>
                <button class="nav-btn next-btn" aria-label="Следующий экран">↓</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', navHTML);
        
        mobileNav = document.querySelector('.mobile-nav');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const dotsContainer = document.querySelector('.nav-dots');
        
        // Создаем точки-индикаторы
        for (let i = 1; i < screens.length; i++) {
            const dot = document.createElement('span');
            dot.className = `nav-dot ${i === 1 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Перейти к экрану ${i}`);
            
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showScreen(i);
            });
            
            dotsContainer.appendChild(dot);
        }
        
        // Обработчики для кнопок
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            prevScreen();
        });
        
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            nextScreen();
        });
        
        updateNavDots();
    }
    
    function updateNavDots() {
        if (!mobileNav) return;
        
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', (i + 1) === currentScreen);
        });
    }
    
    // Функция для управления музыкой
    function setupMusic() {
        const musicToggle = document.getElementById('musicToggle');
        const backgroundMusic = document.getElementById('backgroundMusic');
        
        let musicPlaying = false;
        
        // Функция для переключения музыки
        function toggleMusic() {
            if (musicPlaying) {
                backgroundMusic.pause();
                musicToggle.textContent = '🔇';
                musicPlaying = false;
            } else {
                backgroundMusic.play().then(() => {
                    musicToggle.textContent = '🔊';
                    musicPlaying = true;
                }).catch(error => {
                    console.log('Ошибка воспроизведения музыки:', error);
                    musicToggle.textContent = '❌';
                    musicToggle.title = 'Ошибка воспроизведения музыки';
                });
            }
        }
        
        // Обработчик клика для кнопки музыки
        musicToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMusic();
        });
        
        // Автоматически показываем кнопку музыки
        musicToggle.style.display = 'flex';
    }
    
    init();
});
