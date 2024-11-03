// script.js

let scenarios = [];
let currentScenarioIndex = 0;
let totalScore = 0;
let lives = 3;

// Функция для загрузки сценариев из JSON-файла
function loadScenarios() {
    fetch('scenarios.json')
        .then(response => response.json())
        .then(data => {
            scenarios = data.scenarios;
            shuffleArray(scenarios);
            updateLives();
            showScenario();
        })
        .catch(error => console.error('Ошибка загрузки сценариев:', error));
}

// Функция для перемешивания массива сценариев
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Функция для перемешивания вариантов ответов
function shuffleOptions(options) {
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
}

// Функция для обновления отображения жизней
function updateLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = ''; // Очистка контейнера
    for (let i = 0; i < lives; i++) {
        const heartImg = document.createElement('img');
        heartImg.src = 'heart.png';
        heartImg.alt = 'Жизнь';
        heartImg.classList.add('heart-icon');
        livesContainer.appendChild(heartImg);
    }
}

// Функция для отображения текущего сценария
function showScenario() {
    if (currentScenarioIndex >= scenarios.length) {
        if (lives > 0) {
            showWinScreen();
        } else {
            showGameOver();
        }
        return;
    }

    const scenario = scenarios[currentScenarioIndex];
    const dialogueContainer = document.getElementById('dialogue');
    const optionsContainer = document.getElementById('options');
    const explanationContainer = document.getElementById('explanation');
    const nextButton = document.getElementById('next-button');

    // Очистка предыдущего контента
    dialogueContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    explanationContainer.innerHTML = '';
    nextButton.style.display = 'none';

    // Отображение типа сценария
    const typeHeader = document.createElement('h2');
    typeHeader.textContent = `Тип сценария: ${scenario.type}`;
    dialogueContainer.appendChild(typeHeader);

    // Отображение диалога
    scenario.dialogue.forEach(line => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${line.speaker}:</strong> ${line.text}`;
        dialogueContainer.appendChild(p);
    });

    let optionButtons = {};

    // Перемешивание вариантов ответов
    shuffleOptions(scenario.options);

    // Отображение вариантов ответов
    scenario.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.addEventListener('click', () => selectOption(option, button, optionButtons, scenario));
        optionsContainer.appendChild(button);
        optionButtons[option.id] = button;
    });
}

// Функция обработки выбора пользователя
function selectOption(option, button, optionButtons, scenario) {
    const optionsButtons = document.querySelectorAll('#options button');
    optionsButtons.forEach(btn => btn.disabled = true); // Блокировка кнопок

    // Обновление счёта
    totalScore += option.score;
    document.getElementById('score-value').textContent = totalScore;

    // Если ответ неправильный, отнимаем жизнь
    if (option.score === 0) {
        lives--;
        updateLives();
    }

    const explanationContainer = document.getElementById('explanation');
    explanationContainer.innerHTML = '';

    if (option.isCorrect) {
        // Правильный ответ
        button.classList.add('correct-answer');
        explanationContainer.innerHTML = `<p><strong>Объяснение:</strong> ${option.explanation}</p>`;
    } else {
        // Неправильный или частично правильный ответ
        if (option.isPartial) {
            button.classList.add('partial-answer');
        } else {
            button.classList.add('wrong-answer');
        }

        // Найдите правильный ответ
        const correctOption = scenario.options.find(opt => opt.isCorrect);
        const correctButton = optionButtons[correctOption.id];
        correctButton.classList.add('correct-answer');

        // Показать объяснения
        explanationContainer.innerHTML = `
            <p><strong>Ваш ответ:</strong> ${option.explanation}</p>
            <p><strong>Правильный ответ:</strong> ${correctOption.explanation}</p>
        `;
    }

    // Проверяем, закончились ли жизни
    if (lives <= 0) {
        showGameOver();
        return;
    }

    // Показ кнопки "Следующий сценарий"
    const nextButton = document.getElementById('next-button');
    nextButton.style.display = 'block';
    nextButton.onclick = () => {
        currentScenarioIndex++;
        showScenario();
    };
}

// Функция отображения экрана победы
function showWinScreen() {
    const gameContainer = document.getElementById('game-container');
    const endScreen = document.getElementById('end-screen');
    gameContainer.style.display = 'none';
    endScreen.style.display = 'block';
    endScreen.innerHTML = `
        <h1>Поздравляем! Вы выиграли!</h1>
        <p>Ваш итоговый счёт: ${totalScore}</p>
    `;

    const continueButton = document.createElement('button');
    continueButton.textContent = 'Продолжить играть';
    continueButton.addEventListener('click', startEndlessMode);
    endScreen.appendChild(continueButton);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Начать заново';
    restartButton.addEventListener('click', restartGame);
    endScreen.appendChild(restartButton);
}

// Функция запуска бесконечного режима
function startEndlessMode() {
    shuffleArray(scenarios);
    currentScenarioIndex = 0;

    const gameContainer = document.getElementById('game-container');
    const endScreen = document.getElementById('end-screen');
    endScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    showScenario();
}

// Функция отображения экрана окончания игры
function showGameOver() {
    const gameContainer = document.getElementById('game-container');
    const endScreen = document.getElementById('end-screen');
    gameContainer.style.display = 'none';
    endScreen.style.display = 'block';
    endScreen.innerHTML = `
        <h1>Игра окончена!</h1>
        <p>Ваш итоговый счёт: ${totalScore}</p>
    `;

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Начать заново';
    restartButton.addEventListener('click', restartGame);
    endScreen.appendChild(restartButton);
}

// Функция перезапуска игры
function restartGame() {
    currentScenarioIndex = 0;
    totalScore = 0;
    lives = 3;
    document.getElementById('score-value').textContent = totalScore;
    updateLives();
    shuffleArray(scenarios);

    const gameContainer = document.getElementById('game-container');
    const endScreen = document.getElementById('end-screen');
    endScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    showScenario();
}

// Загрузка сценариев при загрузке страницы
window.onload = loadScenarios;
