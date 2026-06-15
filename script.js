// --- STATE MANAGEMENT ---
const state = {
    and: { a: 0, b: 0 },
    or: { a: 0, b: 0 },
    not: { a: 0 },
    nand: { a: 0, b: 0 },
    nor: { a: 0, b: 0 },
    xor: { a: 0, b: 0 },
    xnor: { a: 0, b: 0 },
    case: { a: 0, b: 0, c: 0 } // a=Dry, b=Water, c=Manual
};

// --- INISIALISASI ---
window.onload = function() {
    ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].forEach(type => updateGate(type));
    updateCaseStudy();
};

// --- LOGIC GATES BASIC ---
function toggle(type, input) {
    state[type][input] = state[type][input] === 0 ? 1 : 0;
    
    const btn = document.getElementById(`sw-${type}-${input}`);
    btn.classList.toggle('active', state[type][input] === 1);
    
    updateGate(type);
}

function updateGate(type) {
    const a = state[type].a;
    const b = state[type].b || 0; 
    let res = 0;

    switch(type) {
        case 'and': res = (a && b) ? 1 : 0; break;
        case 'or':  res = (a || b) ? 1 : 0; break;
        case 'not': res = (!a) ? 1 : 0; break;
        case 'nand': res = !(a && b) ? 1 : 0; break;
        case 'nor': res = !(a || b) ? 1 : 0; break;
        case 'xor': res = (a ^ b) ? 1 : 0; break;
        case 'xnor': res = (a === b) ? 1 : 0; break;
    }

    setWireColor(`w-${type}-a`, a);
    if(type !== 'not') setWireColor(`w-${type}-b`, b);
    setWireColor(`w-${type}-out`, res);

    const bulb = document.getElementById(`bulb-${type}`);
    if(res === 1) {
        bulb.classList.add('on');
        bulb.innerText = "1";
    } else {
        bulb.classList.remove('on');
        bulb.innerText = "0";
    }
}

// --- CASE STUDY LOGIC ---
function toggleCase(input) {
    state.case[input] = state.case[input] === 0 ? 1 : 0;
    
    const box = document.getElementById(`cs-sensor-${input}`);
    box.classList.toggle('active', state.case[input] === 1);

    updateCaseStudy();
}

function updateCaseStudy() {
    const a = state.case.a; // Kering
    const b = state.case.b; // Air Penuh
    const c = state.case.c; // Manual
    
    const andResult = (a && b) ? 1 : 0;
    const finalResult = (andResult || c) ? 1 : 0;

    setWireColor('cs-w-a', a);
    setWireColor('cs-w-b', b);
    setWireColor('cs-w-c', c);
    
    setWireColor('cs-w-and', andResult);
    setWireColor('cs-w-final', finalResult);

    const sprinkler = document.getElementById('cs-sprinkler');
    const status = document.getElementById('cs-status');

    if(finalResult) {
        sprinkler.classList.add('active');
        status.innerText = "MENYIRAM";
        status.style.color = "var(--wire-on)";
    } else {
        sprinkler.classList.remove('active');
        status.innerText = "MATI";
        status.style.color = "#94a3b8";
    }
}

// --- HELPER ---
function setWireColor(id, isActive) {
    const el = document.getElementById(id);
    if(isActive) {
        el.classList.add('wire-on');
        el.classList.remove('wire-off-state');
    } else {
        el.classList.remove('wire-on');
        el.classList.add('wire-off-state');
    }
}
