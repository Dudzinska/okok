const exerciseDatabase = {
    calecialo: [
        { name: "Pajacyki", benefit: "Pajacyki to świetne ćwiczenie cardio, które angażuje całe ciało. Poprawia wydolność sercowo-naczyniową, wzmacnia nogi i ramiona oraz pomaga spalać kalorie." },
        { name: "Burpees", benefit: "Burpees to intensywne ćwiczenie wielostawowe. Buduje siłę, wytrzymałość i koordynację, angażując mięśnie klatki piersiowej, ramion, brzucha i nóg." },
        { name: "Wspinaczka górska (Mountain Climbers)", benefit: "Dynamiczne ćwiczenie wzmacniające mięśnie brzucha, ramion i nóg. Doskonale podkręca metabolizm i poprawia stabilizację centralną." },
        { name: "Przysiady z wyskokiem", benefit: "Rozwijają siłę eksplozywną nóg i pośladków. Zwiększają tętno, co sprzyja spalaniu tkanki tłuszczowej." }
    ],
    klatka: [
        { name: "Pompki klasyczne", benefit: "Klasyczne ćwiczenie budujące siłę klatki piersiowej, barków i tricepsów. Wzmacnia również mięśnie głębokie brzucha (core)." },
        { name: "Pompki diamentowe", benefit: "Skupiają się bardziej na tricepsach i wewnętrznej części klatki piersiowej. Wymagają większej stabilizacji i siły ramion." },
        { name: "Rozpiętki na podłodze", benefit: "Izolują mięśnie piersiowe, pomagając w ich rozciągnięciu i kształtowaniu. Zmniejszają napięcie w barkach." },
        { name: "Pompki szerokie", benefit: "Angażują zewnętrzną część klatki piersiowej i barki, pozwalając na szerszy zakres ruchu i lepsze rozciągnięcie mięśni." }
    ],
    plecy: [
        { name: "Unoszenie tułowia w leżeniu (Supermany)", benefit: "Wzmacnia dolny odcinek kręgosłupa (prostowniki grzbietu) oraz pośladki. Pomaga w utrzymaniu prawidłowej postawy ciała." },
        { name: "Przyciąganie łopatek w leżeniu", benefit: "Aktywuje mięśnie równoległoboczne i czworoboczne. Pomaga niwelować skutki siedzącego trybu życia, otwierając klatkę piersiową." },
        { name: "Deska tyłem (Reverse Plank)", benefit: "Wzmacnia tylną taśmę mięśniową: plecy, pośladki i uda. Poprawia stabilizację barków." },
        { name: "Ukłon japoński", benefit: "Rozciąga mięśnie grzbietu i kręgosłup, przynosząc ulgę w bólach pleców i relaksując napięte mięśnie." }
    ],
    nogi: [
        { name: "Przysiady klasyczne", benefit: "Królowie ćwiczeń na nogi. Wzmacniają czworogłowe uda, dwugłowe i pośladki. Poprawiają mobilność stawów biodrowych i skokowych." },
        { name: "Wykroki", benefit: "Świetne na równowagę i koordynację. Angażują każdą nogę z osobna, wyrównując dysproporcje siłowe i mocno pracując nad pośladkami." },
        { name: "Wspięcia na palce", benefit: "Izolują mięśnie łydki. Wzmacniają staw skokowy, co jest kluczowe dla biegaczy i osób aktywnych fizycznie." },
        { name: "Przysiady bułgarskie", benefit: "Intensywne ćwiczenie na jedną nogę. Buduje siłę i masę mięśniową ud oraz pośladków, wymagając przy tym dużej stabilizacji." }
    ],
    ramiona: [
        { name: "Dipy na krześle", benefit: "Skuteczne ćwiczenie na tricepsy. Można je wykonać wszędzie, a doskonale ujędrnia tylną część ramion." },
        { name: "Krążenia ramion", benefit: "Rozgrzewają staw barkowy i wzmacniają mięśnie naramienne. Poprawiają mobilność i ukrwienie obręczy barkowej." },
        { name: "Pompki na kolanach", benefit: "Lżejsza wersja pompek, idealna do budowania siły ramion i klatki piersiowej dla osób początkujących." },
        { name: "Boksowanie cienia", benefit: "Cardio dla ramion. Wzmacnia wytrzymałość mięśniową barków i ramion, poprawiając jednocześnie szybkość i koordynację." }
    ],
    brzuch: [
        { name: "Deska (Plank)", benefit: "Fundamentalne ćwiczenie izometryczne. Wzmacnia całe 'centrum' (core), stabilizując kręgosłup i poprawiając postawę." },
        { name: "Brzuszki (Crunches)", benefit: "Skupiają się na mięśniu prostym brzucha ('sześciopaku'). Pomagają wzmocnić przednią ścianę brzuszną." },
        { name: "Nożyce", benefit: "Angażują dolne partie mięśni brzucha. Wymagają utrzymania stabilnego odcinka lędźwiowego, co dodatkowo wzmacnia core." },
        { name: "Russian Twist", benefit: "Wzmacnia mięśnie skośne brzucha. Poprawia mobilność kręgosłupa w rotacji i wysmukla talię." }
    ]
};

let currentWorkout = [];
let currentExerciseIndex = 0;
let isPaused = false;
let timerInterval = null;
let secondsElapsed = 0;
let recognition = null;
let isSpeaking = false;

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pl-PL';
        utterance.rate = 1.0; 
        utterance.pitch = 1.0;
        
        isSpeaking = true;
        utterance.onend = function() {
            isSpeaking = false;
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'pl-PL';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                const command = lastResult[0].transcript.trim().toLowerCase();
                console.log('Rozpoznano komendę:', command);
                processVoiceCommand(command);
            }
        };

        recognition.onerror = function(event) {
            console.error('Błąd rozpoznawania mowy:', event.error);
        };

        recognition.onend = function() {
            if (document.getElementById('workout-view') && !document.getElementById('workout-view').classList.contains('hidden')) {
                try {
                    recognition.start();
                } catch(e) {
                    console.error('Błąd ponownego uruchomienia rozpoznawania mowy:', e);
                }
            }
        };

        try {
            recognition.start();
            console.log('Rozpoznawanie mowy uruchomione.');
        } catch(e) {
            console.error('Błąd startu rozpoznawania mowy:', e);
        }
    } else {
        alert('Twoja przeglądarka nie obsługuje rozpoznawania mowy (Web Speech API).');
        console.warn('Web Speech API nie jest dostępne w tej przeglądarce.');
    }
}

function processVoiceCommand(command) {
    if (command.includes('następne') || command.includes('dalej')) {
        nextExercise();
    } else if (command.includes('przerwa') || command.includes('stop') || command.includes('pauza')) {
        togglePause(true);
    } else if (command.includes('koniec przerwy') || command.includes('start') || command.includes('wznów')) {
        togglePause(false);
    } else if (command.includes('korzyści') || command.includes('zdrowie') || command.includes('opis')) {
        showBenefits();
    } else if (command.includes('powrót') || command.includes('wyjdź') || command.includes('koniec treningu')) {
        quitWorkout();
    }
}

function startWorkout() {
    const studioModal = document.getElementById('studio-modal');
    
    let selectedBodyPart = 'calecialo'; 
    let selectedLevel = 'poczatkujacy'; 
    
    const bodyBtns = document.querySelectorAll('.studio-body-btn.selected');
    if (bodyBtns.length > 0) {
        selectedBodyPart = bodyBtns[0].getAttribute('data-body');
    }
    
    const levelCards = document.querySelectorAll('.studio-level-card.selected');
    if (levelCards.length > 0) {
        selectedLevel = levelCards[0].getAttribute('data-level');
    }

    let exerciseTime = 20; 
    if (selectedLevel === 'poczatkujacy') exerciseTime = 20;
    else if (selectedLevel === 'srednio') exerciseTime = 35;
    else if (selectedLevel === 'zaawansowany') exerciseTime = 60;

    currentWorkout = (exerciseDatabase[selectedBodyPart] || exerciseDatabase['calecialo']).map(ex => ({...ex, exerciseTime}));
    currentExerciseIndex = 0;
    
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('more-sections').classList.add('hidden');
    if (studioModal) studioModal.classList.add('hidden');
    
    const workoutView = document.getElementById('workout-view');
    workoutView.classList.remove('hidden');

    secondsElapsed = 0;
    isPaused = false;
    
    loadExercise(currentExerciseIndex);
    startTimer();
    initVoiceRecognition();
    
    speak("Witamy w L'Atelier Fitness. Rozpoczynamy trening. Pierwsze ćwiczenie to " + currentWorkout[currentExerciseIndex].name);
}

function loadExercise(index) {
    const prevBtn = document.getElementById('prev-exercise-btn');
    if (index >= currentWorkout.length) {
        finishWorkout();
        return;
    } else {
        if (prevBtn) prevBtn.disabled = (index === 0);
    }
    const exercise = currentWorkout[index];
    document.getElementById('exercise-title').textContent = exercise.name;
    document.getElementById('benefits-text').textContent = exercise.benefit;
    
    const minutes = Math.floor(exercise.exerciseTime / 60);
    const seconds = exercise.exerciseTime % 60;
    document.getElementById('workout-timer').textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        
    document.getElementById('benefits-box').classList.add('hidden');
    
    const video = document.getElementById('workout-video');
    video.currentTime = 0;
    if (!isPaused) {
        video.play().catch(e => {});
    }
    secondsElapsed = 0;
}

function finishWorkout() {
    stopTimer();
    document.getElementById('workout-view').classList.add('hidden');

    const completeView = document.getElementById('workout-complete-view');
    if (completeView) {
        completeView.classList.remove('hidden');
        speak("To były wszystkie ćwiczenia. Gratulacje! Trening zakończony.");
        startConfetti();
    }
}

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#e09ca6', '#6dc77a', '#b48a78', '#f8f8f8', '#ffd700'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 6.28,
            spin: Math.random() * 0.2 - 0.1
        });
    }

    function draw() {
        const completeView = document.getElementById('workout-complete-view');
        if (!completeView || completeView.classList.contains('hidden')) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.y += p.speed;
            p.angle += p.spin;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();

            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(draw);
    }

    draw();
}

function nextExercise() {
    currentExerciseIndex++;
    if (currentExerciseIndex < currentWorkout.length) {
        loadExercise(currentExerciseIndex);
        speak("Następne ćwiczenie: " + currentWorkout[currentExerciseIndex].name);
    } else {
        finishWorkout();
    }
}

function prevExercise() {
    if (currentExerciseIndex > 0) {
        currentExerciseIndex--;
        loadExercise(currentExerciseIndex);
        speak("Poprzednie ćwiczenie: " + currentWorkout[currentExerciseIndex].name);
    }
}

function togglePause(shouldPause) {
    const video = document.getElementById('workout-video');
    const overlay = document.getElementById('video-overlay');
    
    if (shouldPause === undefined) {
        shouldPause = !isPaused;
    }

    isPaused = shouldPause;
    
    if (isPaused) {
        video.pause();
        overlay.classList.remove('hidden');
        speak("Przerwa.");
    } else {
        video.play().catch(e => {});
        overlay.classList.add('hidden');
        speak("Wracamy do ćwiczeń.");
    }
}

function showBenefits() {
    const benefitsBox = document.getElementById('benefits-box');
    if (benefitsBox.classList.contains('hidden')) {
        benefitsBox.classList.remove('hidden');
        speak(currentWorkout[currentExerciseIndex].benefit);
    } else {
        benefitsBox.classList.add('hidden');
    }
}

function quitWorkout() {
    speak("Koniec treningu. Do zobaczenia następnym razem.");
    
    if (recognition) {
        recognition.stop();
    }
    stopTimer();
    
    document.getElementById('workout-view').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('workout-complete-view').classList.add('hidden');

    const video = document.getElementById('workout-video');
    video.pause();
}

function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (!isPaused) {
            secondsElapsed++;
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    document.getElementById('workout-timer').textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

document.addEventListener('DOMContentLoaded', function() {
    const darkToggle = document.getElementById('darkmode-toggle');
    if (darkToggle) {
        if (localStorage.getItem('atelier-darkmode') === 'true') {
            document.body.classList.add('dark-mode');
            darkToggle.checked = true;
        }
        darkToggle.addEventListener('change', function() {
            if (darkToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('atelier-darkmode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('atelier-darkmode', 'false');
            }
        });
    }

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close-btn');
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', function() {
            settingsModal.classList.remove('hidden');
        });
    }
    if (settingsClose && settingsModal) {
        settingsClose.addEventListener('click', function() {
            settingsModal.classList.add('hidden');
        });
    }
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            const moreSections = document.getElementById('more-sections');
            const mainPage = document.getElementById('main-page');
            if (moreSections && mainPage) {
                moreSections.classList.add('hidden');
                mainPage.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    const buttons = document.querySelectorAll('.button-main, .button-secondary');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            btn.classList.add('pressed');
        });
        btn.addEventListener('mouseup', function() {
            btn.classList.remove('pressed');
        });
        btn.addEventListener('mouseleave', function() {
            btn.classList.remove('pressed');
        });
    });

    const bmiBtn = document.getElementById('bmi-btn');
    const bmiModal = document.getElementById('bmi-modal');
    const bmiClose = document.getElementById('bmi-modal-close');
    const bmiForm = document.getElementById('bmi-form');
    const bmiResult = document.getElementById('bmi-result');
    if (bmiBtn && bmiModal) {
        bmiBtn.addEventListener('click', function() {
            bmiModal.classList.remove('hidden');
        });
    }
    if (bmiClose && bmiModal) {
        bmiClose.addEventListener('click', function() {
            bmiModal.classList.add('hidden');
            if(bmiResult) {
                bmiResult.style.display = 'none';
                bmiResult.innerHTML = '';
            }
        });
    }
    if (bmiModal) {
        bmiModal.addEventListener('click', function(e) {
            if (e.target === bmiModal) {
                bmiModal.classList.add('hidden');
                if(bmiResult) {
                    bmiResult.style.display = 'none';
                    bmiResult.innerHTML = '';
                }
            }
        });
    }
    if (bmiForm && bmiResult) {
        bmiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const weight = parseFloat(document.getElementById('bmi-weight').value);
            const heightCm = parseFloat(document.getElementById('bmi-height').value);
            if (!weight || !heightCm || heightCm < 100 || weight < 20) {
                bmiResult.textContent = 'Podaj poprawne dane.';
                bmiResult.style.display = 'block';
                return;
            }
            const heightM = heightCm / 100;
            const bmi = weight / (heightM * heightM);
            let desc = '';
            if (bmi < 18.5) desc = 'Niedowaga';
            else if (bmi < 25) desc = 'Prawidłowa masa ciała';
            else if (bmi < 30) desc = 'Nadwaga';
            else desc = 'Otyłość';
            bmiResult.innerHTML = `Twoje BMI: <b>${bmi.toFixed(1)}</b><br><span style="color:#b48a78;">${desc}</span>`;
            bmiResult.style.display = 'block';
        });
    }

    const studioBtn = document.getElementById('studio-btn');
    const studioModal = document.getElementById('studio-modal');
    const studioClose = document.getElementById('studio-modal-close');
    const navStudioLink = document.getElementById('nav-studio-link');

    function openStudio() {
        if(studioModal) studioModal.classList.remove('hidden');
    }

    if (studioBtn) studioBtn.addEventListener('click', openStudio);
    if (navStudioLink) {
        navStudioLink.addEventListener('click', function(e) {
            e.preventDefault();
            openStudio();
        });
    }

    if (studioClose && studioModal) {
        studioClose.addEventListener('click', function() {
            studioModal.classList.add('hidden');
        });
    }
    if (studioModal) {
        studioModal.addEventListener('click', function(e) {
            if (e.target === studioModal) {
                studioModal.classList.add('hidden');
            }
        });
    }

    const levelCards = document.querySelectorAll('.studio-level-card');
    levelCards.forEach(function(card) {
        card.addEventListener('click', function() {
            levelCards.forEach(function(c) {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
        });
    });

    const bodyBtns = document.querySelectorAll('.studio-body-btn');
    bodyBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            bodyBtns.forEach(function(b) {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
        });
    });

    const startWorkoutBtn = document.getElementById('start-workout-btn');
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', startWorkout);
    }
    
    const nextExerciseBtn = document.getElementById('next-exercise-btn');
    if (nextExerciseBtn) {
        nextExerciseBtn.addEventListener('click', nextExercise);
    }

    const prevExerciseBtn = document.getElementById('prev-exercise-btn');
    if (prevExerciseBtn) {
        prevExerciseBtn.addEventListener('click', prevExercise);
    }
    
    const benefitsBtn = document.getElementById('benefits-btn');
    if (benefitsBtn) {
        benefitsBtn.addEventListener('click', showBenefits);
    }
    
    const quitWorkoutBtn = document.getElementById('quit-workout-btn');
    if (quitWorkoutBtn) {
        quitWorkoutBtn.addEventListener('click', quitWorkout);
    }

    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.addEventListener('click', function() {
            togglePause();
        });
    }

    const navAboutLink = document.getElementById('nav-about-link');
    
    function openAbout() {
        const moreSections = document.getElementById('more-sections');
        const mainPage = document.getElementById('main-page');
        if (moreSections && mainPage) {
            moreSections.classList.remove('hidden');
            mainPage.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (navAboutLink) {
        navAboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            openAbout();
        });
    }

    const contactBtn = document.getElementById('contact-message-btn');
    const contactModal = document.getElementById('contact-modal');
    const contactClose = document.getElementById('contact-modal-close');
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-form-success');
    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', function() {
            contactModal.classList.remove('hidden');
        });
    }
    if (contactClose && contactModal) {
        contactClose.addEventListener('click', function() {
            contactModal.classList.add('hidden');
            if(contactSuccess) contactSuccess.style.display = 'none';
        });
    }
    if (contactModal) {
        contactModal.addEventListener('click', function(e) {
            if (e.target === contactModal) {
                contactModal.classList.add('hidden');
                if(contactSuccess) contactSuccess.style.display = 'none';
            }
        });
    }
    if (contactForm && contactSuccess) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            contactSuccess.style.display = 'block';
            setTimeout(function(){
                contactModal.classList.add('hidden');
                contactSuccess.style.display = 'none';
                contactForm.reset();
            }, 1800);
        });
    }

    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', function() {
            quitWorkout();
        });
    }
});