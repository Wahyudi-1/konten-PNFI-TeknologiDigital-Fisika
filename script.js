// --- 0. SYSTEM LOGIC (Audio & Screen) ---
function playAudioSafe(id) {
    const audio = document.getElementById(id);
    if(audio) { audio.currentTime = 0; audio.play().catch(e => {}); }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    let navBtnId = '';
    if(screenId === 'screen-home') navBtnId = 'btn-nav-home';
    else if(screenId === 'screen-lab') navBtnId = 'btn-nav-lab';
    else if(screenId === 'screen-eval') navBtnId = 'btn-nav-eval';
    if(navBtnId) document.getElementById(navBtnId).classList.add('active');
    
    // Setup initial states
    if(screenId === 'screen-lab') resizeCanvas();
}

function switchLabTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
    playAudioSafe('sfx-click');
}

// --- 1. LAB: SINYAL (ADC/DAC) ---
const canvas = document.getElementById('oscillatorCanvas');
const ctx = canvas.getContext('2d');
let animationId, time = 0, isSampled = false, isPlayingBack = false, sampledPoints = [];

function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; }
window.addEventListener('resize', resizeCanvas);

function animate() {
    if(document.getElementById('screen-lab').classList.contains('active') && document.getElementById('tab-sinyal').classList.contains('active')) {
        const centerY = canvas.height / 2;
        const amplitude = canvas.height / 2.5;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Grid
        ctx.strokeStyle = '#1e293b'; ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.stroke();

        // Analog
        if (!isSampled) time += 0.05;
        ctx.beginPath(); ctx.moveTo(0, centerY);
        ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
        const freq = document.getElementById('freqSlider').value * 0.01;
        for (let x = 0; x < canvas.width; x++) {
            ctx.lineTo(x, centerY + Math.sin(x * freq + time) * amplitude);
        }
        ctx.stroke();

        // Digital Points
        if (isSampled) {
            ctx.fillStyle = '#38bdf8'; ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
            sampledPoints.forEach(p => {
                ctx.beginPath(); ctx.moveTo(p.x, centerY); ctx.lineTo(p.x, p.y); ctx.stroke();
                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
            });
        }

        // DAC Playback
        if (isPlayingBack && sampledPoints.length > 0) {
            ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3; ctx.beginPath();
            ctx.moveTo(0, sampledPoints[0].y);
            for (let i = 0; i < sampledPoints.length - 1; i++) {
                ctx.lineTo(sampledPoints[i+1].x, sampledPoints[i].y);
                ctx.lineTo(sampledPoints[i+1].x, sampledPoints[i+1].y);
            }
            ctx.stroke();
        }
    }
    animationId = requestAnimationFrame(animate);
}

function performADC() {
    isSampled = true; isPlayingBack = false; sampledPoints = [];
    const centerY = canvas.height / 2; const amplitude = canvas.height / 2.5;
    const freq = document.getElementById('freqSlider').value * 0.01;
    const count = parseInt(document.getElementById('rateSlider').value); 
    const step = canvas.width / count;

    for (let x = 0; x <= canvas.width; x += step) {
        sampledPoints.push({ x: x, y: centerY + Math.sin(x * freq + time) * amplitude });
    }
    playAudioSafe('sfx-click');
}
function performDAC() {
    if (!isSampled) return alert("Lakukan ADC terlebih dahulu!");
    isPlayingBack = true;
    playAudioSafe('sfx-success');
}
setTimeout(animate, 100);

// --- 2. LAB: EKSPLORASI BINER (8-Bit) ---
let byteData = [0,0,0,0,0,0,0,0]; // Index 0 is LSB (Value 1), Index 7 is MSB (Value 128)
const bitValues = [1, 2, 4, 8, 16, 32, 64, 128];

function toggle8Bit(index) {
    byteData[index] = byteData[index] === 0 ? 1 : 0;
    const box = document.getElementById(`b${index}`);
    
    if (byteData[index] === 1) { box.classList.add('on'); box.innerText = '1'; } 
    else { box.classList.remove('on'); box.innerText = '0'; }

    update8BitDisplay();
    playAudioSafe('sfx-click');
}

function update8BitDisplay() {
    let total = 0;
    let eq = [];
    for(let i=7; i>=0; i--) {
        if(byteData[i] === 1) {
            total += bitValues[i];
            eq.push(bitValues[i]);
        }
    }
    
    document.getElementById('decResult8').innerText = total;
    document.getElementById('calcEquation8').innerText = eq.length > 0 ? eq.join(" + ") : "0";
    
    // ASCII Logic
    const asciiDisplay = document.getElementById('asciiResult');
    if(total >= 32 && total <= 126) {
        asciiDisplay.innerText = `'${String.fromCharCode(total)}'`;
    } else if (total === 0) { asciiDisplay.innerText = "NULL"; }
    else if (total === 32) { asciiDisplay.innerText = "[SPASI]"; }
    else { asciiDisplay.innerText = "(Karakter tidak terlihat/Sistem)"; }
}

// --- 3. LAB: ARITMATIKA BINER ---
function calcBinary() {
    const str1 = document.getElementById('binNum1').value;
    const str2 = document.getElementById('binNum2').value;
    const op = document.getElementById('binOp').value;
    
    if(!str1 || !str2) return;

    const val1 = parseInt(str1, 2);
    const val2 = parseInt(str2, 2);
    let resDec = 0;

    try {
        switch(op) {
            case '+': resDec = val1 + val2; break;
            case '-': resDec = val1 - val2; break;
            case '*': resDec = val1 * val2; break;
            case '/': 
                if(val2 === 0) throw "DivZero";
                resDec = Math.floor(val1 / val2); 
                break;
        }
        
        if(resDec < 0) {
            document.getElementById('binResText').innerText = "Angka Negatif";
            document.getElementById('binResDec').innerText = `(Desimal: ${resDec})`;
            playAudioSafe('sfx-error');
        } else {
            document.getElementById('binResText').innerText = resDec.toString(2);
            document.getElementById('binResDec').innerText = `(Desimal: ${resDec})`;
            playAudioSafe('sfx-success');
        }
    } catch (e) {
        document.getElementById('binResText').innerText = "ERROR";
        document.getElementById('binResDec').innerText = "Pembagian dengan Nol!";
        playAudioSafe('sfx-error');
    }
}

// --- 4. LAB: GERBANG LOGIKA ---
let logicA = 0;
let logicB = 0;

function toggleLogic(inputName) {
    if(inputName === 'A') {
        logicA = logicA === 0 ? 1 : 0;
        const btn = document.getElementById('btnLogicA');
        btn.innerText = logicA;
        logicA ? btn.classList.add('on') : btn.classList.remove('on');
    } else {
        logicB = logicB === 0 ? 1 : 0;
        const btn = document.getElementById('btnLogicB');
        btn.innerText = logicB;
        logicB ? btn.classList.add('on') : btn.classList.remove('on');
    }
    playAudioSafe('sfx-click');
    evalLogic();
}

function evalLogic() {
    const gate = document.getElementById('gateSelect').value;
    document.getElementById('gateNameDisplay').innerText = gate;
    
    // Hide/Show Input B for NOT gate
    const boxB = document.getElementById('boxLogicB');
    if(gate === 'NOT') {
        boxB.style.display = 'none';
    } else {
        boxB.style.display = 'block';
    }

    let outY = 0;
    let desc = "";

    switch(gate) {
        case 'AND': 
            outY = (logicA === 1 && logicB === 1) ? 1 : 0; 
            desc = "Output 1 <strong>HANYA JIKA</strong> semua input bernilai 1.";
            break;
        case 'OR': 
            outY = (logicA === 1 || logicB === 1) ? 1 : 0; 
            desc = "Output 1 jika <strong>MINIMAL SALAH SATU</strong> input bernilai 1.";
            break;
        case 'NOT': 
            outY = logicA === 1 ? 0 : 1; 
            desc = "Membalik keadaan. Jika input 1, output 0 (dan sebaliknya).";
            break;
        case 'NAND': 
            outY = !(logicA === 1 && logicB === 1) ? 1 : 0; 
            desc = "Kebalikan AND. Output 0 <strong>HANYA JIKA</strong> semua input 1.";
            break;
        case 'NOR': 
            outY = !(logicA === 1 || logicB === 1) ? 1 : 0; 
            desc = "Kebalikan OR. Output 1 <strong>HANYA JIKA</strong> semua input 0.";
            break;
        case 'XOR': 
            outY = (logicA !== logicB) ? 1 : 0; 
            desc = "Eksklusif OR. Output 1 jika input <strong>BERBEDA</strong> (satu 1, satu 0).";
            break;
    }

    const outBtn = document.getElementById('outLogicY');
    outBtn.innerText = outY;
    if(outY === 1) outBtn.classList.add('on');
    else outBtn.classList.remove('on');

    document.getElementById('gateDescTitle').innerText = `Karakteristik Gerbang ${gate}`;
    document.getElementById('gateDescText').innerHTML = desc;
}

// --- 5. EVALUASI (QUIZ) ---
let answers = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null };

function selectAnswer(questionId, btnElement, isCorrect) {
    const container = document.getElementById(questionId);
    container.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
    btnElement.classList.add('selected');
    answers[questionId] = isCorrect;
    playAudioSafe('sfx-click');
}

function submitQuiz() {
    const keys = Object.keys(answers);
    let answeredCount = 0;
    keys.forEach(k => { if(answers[k] !== null) answeredCount++; });

    if(answeredCount < 6) {
        alert("Harap jawab ke-6 pertanyaan terlebih dahulu!");
        return;
    }

    let score = 0;
    keys.forEach(q => {
        if(answers[q]) score++;
        const container = document.getElementById(q);
        container.querySelectorAll('.quiz-option').forEach(opt => {
            if(opt.classList.contains('selected')) {
                opt.classList.add(answers[q] ? 'correct' : 'wrong');
            }
        });
    });

    const resBox = document.getElementById('quiz-result');
    resBox.style.display = 'block';
    if(score === 6) {
        resBox.style.background = "rgba(74, 222, 128, 0.1)";
        resBox.style.borderColor = "var(--digital-color)";
        document.getElementById('result-title').innerText = "Luar Biasa! 🎉";
        document.getElementById('result-text').innerText = "Nilai Sempurna! Kamu telah menguasai sistem Biner, Aritmatika, dan Logika Komputer!";
        playAudioSafe('sfx-success');
    } else {
        resBox.style.background = "rgba(245, 158, 11, 0.1)";
        resBox.style.borderColor = "var(--warning)";
        document.getElementById('result-title').innerText = "Tetap Semangat! 💪";
        document.getElementById('result-text').innerText = `Kamu menjawab benar ${score} dari 6 soal. Pelajari kembali materi di Lab Maya.`;
    }
}

function resetQuiz() {
    answers = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null };
    document.getElementById('quiz-result').style.display = 'none';
    Object.keys(answers).forEach(q => {
        document.getElementById(q).querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'wrong');
        });
    });
    playAudioSafe('sfx-click');
}

// Initialize Logic Gate on load
evalLogic();
