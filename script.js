document.addEventListener('DOMContentLoaded', () => {
    const quizContainer = document.getElementById('quiz-container');
    const nextButton = document.getElementById('next-button');
    const submitButton = document.getElementById('submit-button');
    const retryButton = document.getElementById('retry-button');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const resultsContainer = document.getElementById('results');

	console.log("Salut, lume!");
	
	let currentSetQuestionNumber = 0;
    let currentQuestionIndex = 0;
    let correctCount = 0;
    let timer = 0;
    let interval;
    let totalQuestionsPerSet = 3;
    let wrongAnswers = [];
	
    const data = [
        {
            "intrebare": "Care este capitala Franței?",
            "optiuni": ["Paris", "Londra", "Berlin", "Madrid"],
            "raspuns_corect": ["Paris"]
        },
        {
            "intrebare": "Care este rezultatul lui 2+2?",
            "optiuni": ["3", "4", "5", "6"],
            "raspuns_corect": ["4"]
        },
        {
            "intrebare": "Alege fructele.",
            "optiuni": ["Măr", "Pâine", "Carne", "Pară"],
            "raspuns_corect": ["Măr", "Pară"]
        },
        {
            "intrebare": "Nu alege nimic.",
            "optiuni": ["Option1", "Option2", "Option3", "Option4"],
            "raspuns_corect": []
        }
        // Adaugă mai multe întrebări aici
    ];

    const numOptionsToShow = 4; // Setează numărul de opțiuni de afișat

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function initializeQuiz() {
		console.log("initializeQuiz:", currentQuestionIndex);
		currentSetQuestionNumber = 0;
		timerDisplay.textContent = `Timp: 00:00`;
        shuffle(data);
        currentQuestionIndex = 0;
        correctCount = 0;
        timer = 0;
        wrongAnswers = [];

        clearInterval(interval);
        startTimer();
        showQuestion(currentQuestionIndex);
        updateScore();

        quizContainer.style.display = 'block';
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
        retryButton.style.display = 'none';
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
    }

    function updateScore() {
		console.log("updateScore1:", currentQuestionIndex);
        currentSetQuestionNumber = currentSetQuestionNumber + 1;
        scoreDisplay.textContent = `Scor: ${correctCount}/${currentSetQuestionNumber}/${totalQuestionsPerSet}`;
    }

    function startTimer() {
        interval = setInterval(() => {
            timer++;
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            timerDisplay.textContent = `Timp: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (timer >= 3599) { // 59:59 in seconds
                clearInterval(interval);
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(interval);
    }

    function showQuestion(index) {
        quizContainer.innerHTML = '';
        const item = data[index];

        if (item.raspuns_corect.length > numOptionsToShow) {
            alert('Error!');
            return;
        }

        const selectedOptions = [...item.raspuns_corect];
        const remainingOptions = item.optiuni.filter(option => !selectedOptions.includes(option));
        shuffle(remainingOptions);

        while (selectedOptions.length < numOptionsToShow && remainingOptions.length > 0) {
            selectedOptions.push(remainingOptions.pop());
        }

        if (selectedOptions.length < numOptionsToShow) {
            alert('Nu există suficiente opțiuni disponibile!');
            return;
        }

        shuffle(selectedOptions);

        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';

        const questionTitle = document.createElement('h3');
        questionTitle.textContent = item.intrebare;
        questionDiv.appendChild(questionTitle);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        selectedOptions.forEach(option => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `question${index}`;
            input.value = option;
            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            optionsDiv.appendChild(label);
        });

        questionDiv.appendChild(optionsDiv);
        quizContainer.appendChild(questionDiv);
    }

    nextButton.addEventListener('click', () => {
		console.log("nextButton1:", currentQuestionIndex);
        const selectedOptions = document.querySelectorAll(`input[name="question${currentQuestionIndex}"]:checked`);
        const selectedValues = Array.from(selectedOptions).map(option => option.value);
        const correctAnswers = data[currentQuestionIndex].raspuns_corect;

        if (JSON.stringify(selectedValues.sort()) === JSON.stringify(correctAnswers.sort())) {
            correctCount++;
        } else {
            wrongAnswers.push({
                intrebare: data[currentQuestionIndex].intrebare,
                raspuns_corect: correctAnswers,
                raspuns_gresit: selectedValues,
                optiuni: Array.from(document.querySelectorAll(`input[name="question${currentQuestionIndex}"]`)).map(input => input.value)
            });
        }

        currentQuestionIndex++;

        if (currentQuestionIndex % totalQuestionsPerSet === 0 || currentQuestionIndex === data.length) {
			stopTimer();
            nextButton.style.display = 'none';
            submitButton.style.display = 'block';
		    currentSetQuestionNumber = totalQuestionsPerSet - 1;
        } else {
            showQuestion(currentQuestionIndex);
        }

        updateScore();
		console.log("nextButton2:", currentQuestionIndex);
    });

    submitButton.addEventListener('click', () => {
        const finalScoreText = `Ai răspuns corect la ${correctCount} din ${currentQuestionIndex} întrebări.`;
		resultsContainer.innerHTML = `<p style="text-align: center;">${finalScoreText}</p>`;
        if (wrongAnswers.length > 0) {
            wrongAnswers.forEach(wrongAnswer => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                const questionTitle = document.createElement('h4');
                questionTitle.textContent = wrongAnswer.intrebare;
                resultItem.appendChild(questionTitle);

                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'result-options';

                wrongAnswer.optiuni.forEach(option => {
                    const label = document.createElement('label');
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.disabled = true;
                    input.checked = wrongAnswer.raspuns_gresit.includes(option);

                    const symbol = document.createElement('span');
                    if (wrongAnswer.raspuns_corect.includes(option)) {
                        symbol.textContent = ' ✔️';
                        symbol.style.color = 'green';
                    } else if (wrongAnswer.raspuns_gresit.includes(option)) {
                        symbol.textContent = ' ❌';
                        symbol.style.color = 'red';
                    } else {
                        symbol.textContent = '';
                    }

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(option));
                    label.appendChild(symbol);
                    optionsDiv.appendChild(label);
                });

                resultItem.appendChild(optionsDiv);
                resultsContainer.appendChild(resultItem);
            });
        }

        quizContainer.style.display = 'none';
        submitButton.style.display = 'none';
        retryButton.style.display = 'block';

        resultsContainer.style.display = 'block';
    });

    retryButton.addEventListener('click', initializeQuiz);

    initializeQuiz();
});