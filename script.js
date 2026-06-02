// Global Variables
let formulaDisplay = document.getElementById('formulaDisplay');
let smartFormulaDisplay = document.getElementById('smartFormulaDisplay');
let resultDisplay = document.getElementById('resultDisplay');
let inputCounter = document.getElementById('inputCounter');
let historyList = document.getElementById('historyList');
let themeToggle = document.getElementById('themeToggle');

let formula = '';
let result = '0';
let inputCount = 0;
let calculationHistory = [];
let angleMode = 'deg'; // 'deg' or 'rad'
let currentTab = 'basic';

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
}

themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<span class="theme-icon">☀️</span>' : '<span class="theme-icon">🌙</span>';
});

// Tab Management
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    currentTab = tabName;
}

// Angle Mode Management
function setAngleMode(mode) {
    angleMode = mode;
    document.querySelectorAll('.angle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-angle="${mode}"]`).classList.add('active');
}

// Keyboard Event Listener
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    const key = event.key;

    // Numbers (0-9)
    if (key >= '0' && key <= '9') {
        event.preventDefault();
        appendNumber(key);
        highlightButton(key);
    }
    // Decimal point
    else if (key === '.') {
        event.preventDefault();
        appendNumber('.');
        highlightButton(key);
    }
    // Operators
    else if (key === '+') {
        event.preventDefault();
        appendOperator('+');
        highlightButton('+');
    }
    else if (key === '-') {
        event.preventDefault();
        appendOperator('-');
        highlightButton('-');
    }
    else if (key === '*') {
        event.preventDefault();
        appendOperator('*');
        highlightButton('*');
    }
    else if (key === '/') {
        event.preventDefault();
        appendOperator('/');
        highlightButton('/');
    }
    else if (key === '%') {
        event.preventDefault();
        appendOperator('%');
        highlightButton('%');
    }
    else if (key === '^') {
        event.preventDefault();
        appendOperator('^');
        highlightButton('^');
    }
    // Brackets
    else if (key === '(') {
        event.preventDefault();
        appendChar('(');
        highlightButton('(');
    }
    else if (key === ')') {
        event.preventDefault();
        appendChar(')');
        highlightButton(')');
    }
    // Enter or = for calculation
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
        highlightButton('=');
    }
    // Backspace for delete
    else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
        highlightButton('Backspace');
    }
    // Escape for clear
    else if (key === 'Escape') {
        event.preventDefault();
        clearDisplay();
        highlightButton('Escape');
    }
}

function highlightButton(key) {
    let button = null;
    const allButtons = document.querySelectorAll('.btn');
    
    for (let btn of allButtons) {
        const text = btn.textContent.trim();
        
        if (key === 'Backspace' && text === '← DEL') {
            button = btn;
            break;
        } else if (key === 'Escape' && text === 'C') {
            button = btn;
            break;
        } else if (key === '=' && text === '=') {
            button = btn;
            break;
        } else if (text === key || text.includes(key)) {
            button = btn;
            break;
        }
    }

    if (button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 150);
    }
}

// Basic Calculator Functions
function appendNumber(num) {
    if (formula === '' && result === '0') {
        formula = num;
    } else if (formula === '') {
        formula = result + num;
    } else {
        formula += num;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (formula === '') return;

    const trimmedFormula = formula.trim();
    const lastChar = trimmedFormula[trimmedFormula.length - 1];
    
    if (isOperator(lastChar)) {
        formula = trimmedFormula.slice(0, -1).trim() + ' ' + op + ' ';
    } else {
        formula += ' ' + op + ' ';
    }
    
    updateDisplay();
}

function appendChar(char) {
    if (char === '(') {
        if (formula === '') {
            formula = '(';
        } else if (isOperator(formula[formula.length - 1]) || formula[formula.length - 1] === '(') {
            formula += '(';
        } else {
            formula += ' * (';
        }
    } else if (char === ')') {
        if (formula.includes('(')) {
            formula += ')';
        }
    }
    updateDisplay();
}

function appendFunction(func) {
    if (formula === '') {
        formula = func + '(';
    } else if (isOperator(formula[formula.length - 1]) || formula[formula.length - 1] === '(') {
        formula += func + '(';
    } else {
        formula += ' ' + func + '(';
    }
    updateDisplay();
}

function appendConstant(constant) {
    const value = constant === 'pi' ? 'PI' : constant === 'e' ? 'E' : constant;
    
    if (formula === '') {
        formula = value;
    } else if (isOperator(formula[formula.length - 1]) || formula[formula.length - 1] === '(') {
        formula += ' ' + value;
    } else {
        formula += ' * ' + value;
    }
    updateDisplay();
}

function isOperator(char) {
    return ['+', '-', '*', '/', '%', '^'].includes(char);
}

// Smart Percentage Interpretation
function smartPercentageInterpretation(expr) {
    const pattern = /^(.+?)\s*([\+\-])\s*(\d+\.?\d*)\s*%$/;
    const match = expr.trim().match(pattern);
    
    if (match) {
        const leftOperand = match[1].trim();
        const operator = match[2];
        const percentage = match[3];
        
        if (operator === '+') {
            return `${leftOperand} + (${leftOperand} * ${percentage} / 100)`;
        } else if (operator === '-') {
            return `${leftOperand} - (${leftOperand} * ${percentage} / 100)`;
        }
    }
    
    let result = expr.replace(/(\d+\.?\d*)\s*%/g, '($1/100)');
    return result;
}

function getSmartInterpretation(expr) {
    if (expr === '' || expr === '0') {
        return '';
    }

    const originalExpr = expr.trim();
    let smartExpr = smartPercentageInterpretation(originalExpr);

    if (smartExpr === originalExpr) {
        return originalExpr;
    }

    return smartExpr;
}

// Scientific Functions
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

function scientificEvaluate(expr) {
    return expr
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/factorial\(/g, 'factorial(')
        .replace(/PI/g, Math.PI)
        .replace(/E/g, Math.E);
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Main Evaluation Function
function evaluateFormula(expr) {
    if (expr === '') return '0';

    try {
        let expression = expr;

        // Smart percentage interpretation
        expression = smartPercentageInterpretation(expression);

        // Convert power operator
        expression = expression.replace(/\^/g, '**');

        // Handle percentage division
        expression = expression.replace(/(\d+\.?\d*)\s*%/g, '($1/100)');

        // Scientific functions conversion
        const isScientific = /sin\(|cos\(|tan\(|asin\(|acos\(|atan\(|log\(|ln\(|sqrt\(|abs\(|factorial\(/i.test(expression);
        if (isScientific) {
            expression = scientificEvaluate(expression);

            // Handle angle conversion
            if (angleMode === 'deg') {
                expression = expression.replace(/Math\.sin\(/g, 'Math.sin(degToRad(');
                expression = expression.replace(/Math\.cos\(/g, 'Math.cos(degToRad(');
                expression = expression.replace(/Math\.tan\(/g, 'Math.tan(degToRad(');
                expression = expression.replace(/Math\.asin\(/g, 'radToDeg(Math.asin(');
                expression = expression.replace(/Math\.acos\(/g, 'radToDeg(Math.acos(');
                expression = expression.replace(/Math\.atan\(/g, 'radToDeg(Math.atan(');
                expression = expression.replace(/radToDeg\(Math\.asin\(/g, 'radToDeg(Math.asin(');
                expression = expression.replace(/radToDeg\(Math\.acos\(/g, 'radToDeg(Math.acos(');
                expression = expression.replace(/radToDeg\(Math\.atan\(/g, 'radToDeg(Math.atan(');
            }
        }

        // Remove spaces
        expression = expression.replace(/\s+/g, '');

        // Evaluate
        let calculatedResult = Function('"use strict"; return (' + expression + ')')();

        // Round to prevent floating point errors
        calculatedResult = Math.round(calculatedResult * 100000000) / 100000000;

        return calculatedResult.toString();
    } catch (error) {
        return 'Error';
    }
}

function calculate() {
    if (formula === '') return;

    try {
        const calculatedResult = evaluateFormula(formula);
        
        if (calculatedResult !== 'Error') {
            const smartInterpretation = getSmartInterpretation(formula);
            
            addToHistory(formula, smartInterpretation, calculatedResult);
            
            result = calculatedResult;
            formula = calculatedResult;
            inputCount++;
            updateDisplay();
        } else {
            result = 'Error';
            updateDisplay();
        }
    } catch (error) {
        result = 'Error';
        updateDisplay();
    }
}

function addToHistory(input, smartInterpretation, output) {
    let historyEntry;
    
    if (smartInterpretation !== input && smartInterpretation !== '') {
        historyEntry = {
            input: input.trim(),
            smart: smartInterpretation.trim(),
            output: output,
            timestamp: new Date().toLocaleTimeString()
        };
    } else {
        historyEntry = {
            input: input.trim(),
            smart: null,
            output: output,
            timestamp: new Date().toLocaleTimeString()
        };
    }

    calculationHistory.unshift(historyEntry);

    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }

    updateHistoryDisplay();
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
}

function updateHistoryDisplay() {
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No calculations yet...</p>';
        return;
    }

    historyList.innerHTML = calculationHistory.map((entry, index) => {
        let historyHTML = `
            <div class="history-item" onclick="loadFromHistory('${entry.input.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                <span class="history-input">${entry.input}</span>
                <span class="history-result">${entry.output}</span>
            </div>
        `;
        
        if (entry.smart) {
            historyHTML += `
                <div class="history-item" style="background: #f0f8ff; border-left-color: #4dabf7; opacity: 0.9;">
                    <span class="history-input" style="color: #4dabf7; font-size: 0.7em;">→ ${entry.smart}</span>
                </div>
            `;
        }
        
        return historyHTML;
    }).join('');
}

function loadFromHistory(input) {
    formula = input;
    updateDisplay();
}

// Display Update
function updateDisplay() {
    formulaDisplay.textContent = formula || '0';
    
    const smartInterpretation = getSmartInterpretation(formula);
    if (smartInterpretation && smartInterpretation !== formula) {
        smartFormulaDisplay.textContent = 'Smart: ' + smartInterpretation;
    } else {
        smartFormulaDisplay.textContent = '';
    }
    
    resultDisplay.textContent = result;
    inputCounter.textContent = `Inputs: ${inputCount}`;
}

function clearDisplay() {
    formula = '';
    result = '0';
    inputCount = 0;
    updateDisplay();
}

function deleteLast() {
    if (formula === '') return;

    formula = formula.slice(0, -1).trim();
    updateDisplay();
}

function toggleSign() {
    if (formula === '') return;

    try {
        if (formula.includes(' ')) {
            formula = '(-1) * (' + formula + ')';
        } else {
            let value = parseFloat(formula);
            value = value * -1;
            formula = value.toString();
        }
        updateDisplay();
    } catch (error) {
        console.error('Error toggling sign:', error);
    }
}

// Advanced Functions

// Complex Number Operations
function parseComplexNumber(str) {
    const complexRegex = /^(-?\d+\.?\d*)\s*([+-])\s*(\d+\.?\d*)i$/;
    const match = str.trim().match(complexRegex);
    
    if (match) {
        const real = parseFloat(match[1]);
        const imag = parseFloat(match[2] + match[3]);
        return { real, imag };
    }
    return null;
}

function complexMagnitude() {
    const complex = parseComplexNumber(document.getElementById('complexInput').value);
    if (!complex) {
        document.getElementById('complexResult').textContent = 'Invalid format! Use: a+bi';
        return;
    }
    const magnitude = Math.sqrt(complex.real ** 2 + complex.imag ** 2);
    document.getElementById('complexResult').textContent = `|z| = ${magnitude.toFixed(6)}`;
}

function complexPhase() {
    const complex = parseComplexNumber(document.getElementById('complexInput').value);
    if (!complex) {
        document.getElementById('complexResult').textContent = 'Invalid format! Use: a+bi';
        return;
    }
    let phase = Math.atan2(complex.imag, complex.real);
    if (angleMode === 'deg') {
        phase = radToDeg(phase);
    }
    document.getElementById('complexResult').textContent = `Phase = ${phase.toFixed(6)} ${angleMode === 'deg' ? '°' : 'rad'}`;
}

function complexConjugate() {
    const complex = parseComplexNumber(document.getElementById('complexInput').value);
    if (!complex) {
        document.getElementById('complexResult').textContent = 'Invalid format! Use: a+bi';
        return;
    }
    document.getElementById('complexResult').textContent = `Conjugate = ${complex.real}${complex.imag < 0 ? '' : '+'}${-complex.imag}i`;
}

// Statistical Functions
function parseStatisticalData(str) {
    return str.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
}

function calculateMean() {
    const data = parseStatisticalData(document.getElementById('statsInput').value);
    if (data.length === 0) {
        document.getElementById('statsResult').textContent = 'Invalid input!';
        return;
    }
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    document.getElementById('statsResult').textContent = `Mean = ${mean.toFixed(6)}`;
}

function calculateMedian() {
    let data = parseStatisticalData(document.getElementById('statsInput').value);
    if (data.length === 0) {
        document.getElementById('statsResult').textContent = 'Invalid input!';
        return;
    }
    data.sort((a, b) => a - b);
    const median = data.length % 2 === 0 
        ? (data[data.length / 2 - 1] + data[data.length / 2]) / 2 
        : data[Math.floor(data.length / 2)];
    document.getElementById('statsResult').textContent = `Median = ${median.toFixed(6)}`;
}

function calculateVariance() {
    const data = parseStatisticalData(document.getElementById('statsInput').value);
    if (data.length === 0) {
        document.getElementById('statsResult').textContent = 'Invalid input!';
        return;
    }
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;
    document.getElementById('statsResult').textContent = `Variance = ${variance.toFixed(6)}`;
}

function calculateStdDev() {
    const data = parseStatisticalData(document.getElementById('statsInput').value);
    if (data.length === 0) {
        document.getElementById('statsResult').textContent = 'Invalid input!';
        return;
    }
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;
    const stdDev = Math.sqrt(variance);
    document.getElementById('statsResult').textContent = `Std Dev = ${stdDev.toFixed(6)}`;
}

// Unit Converter
const unitConversions = {
    length: {
        m: 1,
        km: 0.001,
        cm: 100,
        ft: 3.28084,
        in: 39.3701
    },
    weight: {
        kg: 1,
        g: 1000,
        mg: 1000000,
        lb: 2.20462,
        oz: 35.274
    },
    temperature: {
        C: x => x,
        F: x => (x * 9/5) + 32,
        K: x => x + 273.15
    }
};

function updateUnitOptions() {
    const unitType = document.getElementById('unitType').value;
    const fromSelect = document.getElementById('unitFrom');
    const toSelect = document.getElementById('unitTo');
    
    const options = Object.keys(unitConversions[unitType]);
    
    fromSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt.toUpperCase()}</option>`).join('');
    toSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt.toUpperCase()}</option>`).join('');
}

function convertUnits() {
    const unitType = document.getElementById('unitType').value;
    const value = parseFloat(document.getElementById('unitValue').value);
    const from = document.getElementById('unitFrom').value;
    const to = document.getElementById('unitTo').value;
    
    if (isNaN(value)) {
        document.getElementById('unitResult').textContent = 'Invalid value!';
        return;
    }

    let result;
    if (unitType === 'temperature') {
        const celsius = from === 'C' ? value : from === 'F' ? (value - 32) * 5/9 : value - 273.15;
        result = unitConversions.temperature[to](celsius);
    } else {
        const baseValue = value / unitConversions[unitType][from];
        result = baseValue * unitConversions[unitType][to];
    }
    
    document.getElementById('unitResult').textContent = `${value} ${from.toUpperCase()} = ${result.toFixed(6)} ${to.toUpperCase()}`;
}

// Equation Solver (Quadratic)
function solveEquation() {
    const equation = document.getElementById('equationInput').value;
    
    // Quadratic equation format: ax^2 + bx + c = 0
    const quadraticRegex = /^([+-]?\d*\.?\d*)\*?x\^2\s*([+-])\s*(\d+\.?\d*)\*?x\s*([+-])\s*(\d+\.?\d*)\s*=\s*0$/;
    const match = equation.replace(/\s+/g, '').match(quadraticRegex);
    
    if (!match) {
        document.getElementById('equationResult').textContent = 'Invalid equation format! Use: ax^2 ± bx ± c = 0';
        return;
    }

    let a = parseFloat(match[1] || 1);
    const sign1 = match[2];
    let b = parseFloat(match[3]);
    const sign2 = match[4];
    let c = parseFloat(match[5]);

    b = sign1 === '-' ? -b : b;
    c = sign2 === '-' ? -c : c;

    const discriminant = b * b - 4 * a * c;

    let result;
    if (discriminant < 0) {
        result = `No real solutions (Discriminant: ${discriminant.toFixed(6)})`;
    } else if (discriminant === 0) {
        const x = -b / (2 * a);
        result = `One solution: x = ${x.toFixed(6)}`;
    } else {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        result = `Two solutions:<br>x₁ = ${x1.toFixed(6)}<br>x₂ = ${x2.toFixed(6)}`;
    }

    document.getElementById('equationResult').innerHTML = result;
}

// Matrix Operations
function getMatrixA() {
    return [
        [parseFloat(document.getElementById('a11').value) || 0, parseFloat(document.getElementById('a12').value) || 0],
        [parseFloat(document.getElementById('a21').value) || 0, parseFloat(document.getElementById('a22').value) || 0]
    ];
}

function getMatrixB() {
    return [
        [parseFloat(document.getElementById('b11').value) || 0, parseFloat(document.getElementById('b12').value) || 0],
        [parseFloat(document.getElementById('b21').value) || 0, parseFloat(document.getElementById('b22').value) || 0]
    ];
}

function displayMatrix(matrix, label) {
    return `${label}:<br>[${matrix[0][0].toFixed(4)}, ${matrix[0][1].toFixed(4)}]<br>[${matrix[1][0].toFixed(4)}, ${matrix[1][1].toFixed(4)}]`;
}

function matrixAdd() {
    const A = getMatrixA();
    const B = getMatrixB();
    const result = [
        [A[0][0] + B[0][0], A[0][1] + B[0][1]],
        [A[1][0] + B[1][0], A[1][1] + B[1][1]]
    ];
    document.getElementById('matrixResult').innerHTML = displayMatrix(result, 'A + B');
}

function matrixSubtract() {
    const A = getMatrixA();
    const B = getMatrixB();
    const result = [
        [A[0][0] - B[0][0], A[0][1] - B[0][1]],
        [A[1][0] - B[1][0], A[1][1] - B[1][1]]
    ];
    document.getElementById('matrixResult').innerHTML = displayMatrix(result, 'A - B');
}

function matrixMultiply() {
    const A = getMatrixA();
    const B = getMatrixB();
    const result = [
        [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
        [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
    ];
    document.getElementById('matrixResult').innerHTML = displayMatrix(result, 'A × B');
}

function matrixDeterminant() {
    const A = getMatrixA();
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    document.getElementById('matrixResult').innerHTML = `Det(A) = ${det.toFixed(6)}`;
}

function matrixInverse() {
    const A = getMatrixA();
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    
    if (Math.abs(det) < 1e-10) {
        document.getElementById('matrixResult').innerHTML = 'Matrix is singular (determinant = 0), no inverse exists';
        return;
    }

    const result = [
        [A[1][1] / det, -A[0][1] / det],
        [-A[1][0] / det, A[0][0] / det]
    ];
    document.getElementById('matrixResult').innerHTML = displayMatrix(result, 'A⁻¹');
}

function matrixTranspose() {
    const A = getMatrixA();
    const result = [
        [A[0][0], A[1][0]],
        [A[0][1], A[1][1]]
    ];
    document.getElementById('matrixResult').innerHTML = displayMatrix(result, 'A^T');
}

// History Export
document.getElementById('exportHistory').addEventListener('click', function() {
    if (calculationHistory.length === 0) {
        alert('No history to export!');
        return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Input,Output,Smart Formula\n';
    
    calculationHistory.forEach(entry => {
        const row = `"${entry.input}","${entry.output}","${entry.smart || ''}"`;
        csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'calculator_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById('clearHistory').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all history?')) {
        calculationHistory = [];
        updateHistoryDisplay();
        localStorage.removeItem('calculationHistory');
    }
});

// Initialize
function initialize() {
    initTheme();
    
    // Load history from localStorage
    const savedHistory = localStorage.getItem('calculationHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
    
    updateDisplay();
    updateUnitOptions();
}

initialize();
