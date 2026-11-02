// DOM: Select nodes
const display = document.getElementById('display');
const keys = document.querySelector('.calculator-keys');
const allButtons = document.querySelectorAll('.key');

// Calculator State
let expression = '0';
let evaluated = false;

// Update screen display and automatically scroll to the end
function updateDisplay() {
    display.textContent = expression;
    display.scrollLeft = display.scrollWidth;
}

// Logic: Handle number and decimal inputs
function inputNumber(digit) {
    if (evaluated) {
        expression = digit;
        evaluated = false;
        return;
    }

    if (expression === '0' && digit !== '.') {
        expression = digit;
    } else {
        const tokens = expression.split(/[\+\-\×\÷]/);
        const currentToken = tokens[tokens.length - 1];
        if (digit === '.' && currentToken.includes('.')) return;
        
        expression += digit;
    }
}

// Logic: Handle operator inputs
function handleOperator(opSymbol) {
    if (evaluated) {
        evaluated = false;
    }

    const lastChar = expression.slice(-1);
    const operators = ['+', '-', '×', '÷'];

    if (operators.includes(lastChar)) {
        expression = expression.slice(0, -1) + opSymbol;
    } else {
        expression += opSymbol;
    }
}

// Logic: Reset calculator
function resetCalculator() {
    expression = '0';
    evaluated = false;
}

// Logic: Handle percentage conversion
function handlePercent() {
    try {
        const tokens = expression.split(/([\+\-\×\÷])/);
        let lastToken = tokens[tokens.length - 1];
        if (lastToken && !isNaN(lastToken)) {
            let val = parseFloat(lastToken) / 100;
            tokens[tokens.length - 1] = val.toString();
            expression = tokens.join('');
        }
    } catch (e) {
        expression = 'Error';
    }
}

// Logic: Evaluate expression with proper Operator Precedence
function evaluateExpression() {
    try {
        let cleanExpr = expression;
        const operators = ['+', '-', '×', '÷'];
        while (cleanExpr.length > 0 && operators.includes(cleanExpr.slice(-1))) {
            cleanExpr = cleanExpr.slice(0, -1);
        }

        let formattedExpr = cleanExpr.replace(/×/g, '*').replace(/÷/g, '/');

        let tokens = [];
        let currentNum = '';
        
        for (let i = 0; i < formattedExpr.length; i++) {
            let char = formattedExpr[i];
            if ((char === '-' || char === '+') && (i === 0 || ['*', '/', '+', '-'].includes(formattedExpr[i - 1]))) {
                currentNum += char;
            } else if (['+', '-', '*', '/'].includes(char)) {
                if (currentNum !== '') {
                    tokens.push(parseFloat(currentNum));
                    currentNum = '';
                }
                tokens.push(char);
            } else {
                currentNum += char;
            }
        }
        if (currentNum !== '') {
            tokens.push(parseFloat(currentNum));
        }

        // Pass 1: Multiplication and Division
        let pass1 = [];
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === '*' || tokens[i] === '/') {
                let prev = pass1.pop();
                let next = tokens[i + 1];
                let res = tokens[i] === '*' ? prev * next : (next === 0 ? 'Error' : prev / next);
                if (res === 'Error') return 'Error';
                pass1.push(res);
                i++;
            } else {
                pass1.push(tokens[i]);
            }
        }

        // Pass 2: Addition and Subtraction
        let result = pass1[0];
        for (let i = 1; i < pass1.length; i += 2) {
            let op = pass1[i];
            let nextVal = pass1[i + 1];
            if (op === '+') result += nextVal;
            if (op === '-') result -= nextVal;
        }

        return isNaN(result) ? 'Error' : parseFloat(result.toFixed(7)).toString();
    } catch (error) {
        return 'Error';
    }
}

// Core action handler to process calculator tasks from both click and keyboard events
function processAction(actionType, value) {
    if (actionType === 'number') {
        inputNumber(value);
    } else if (actionType === 'operator') {
        if (value === 'calculate') {
            const result = evaluateExpression();
            expression = result;
            evaluated = true;
        } else if (value === 'add') {
            handleOperator('+');
        } else if (value === 'subtract') {
            handleOperator('-');
        } else if (value === 'multiply') {
            handleOperator('×');
        } else if (value === 'divide') {
            handleOperator('÷');
        }
    } else if (actionType === 'action') {
        if (value === 'clear') {
            resetCalculator();
        } else if (value === 'double-zero') {
            inputNumber('0');
            inputNumber('0');
        } else if (value === 'percent') {
            handlePercent();
        }
    }
    updateDisplay();
}

// Event: Standard addEventListener using click event delegation
keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) return;

    if (target.classList.contains('number')) {
        processAction('number', target.dataset.value);
    } else if (target.classList.contains('operator')) {
        processAction('operator', target.dataset.action);
    } else if (target.classList.contains('action')) {
        processAction('action', target.dataset.action);
    }
});

// Event: Standard addEventListener for Keyboard Input
window.addEventListener('keydown', (event) => {
    let key = event.key;
    let targetButton = null;

    if (!isNaN(key) || key === '.') {
        targetButton = document.querySelector(`.key.number[data-key="${key}"]`);
        if (targetButton) processAction('number', targetButton.dataset.value);
    } else if (key === '+' || key === '-') {
        targetButton = document.querySelector(`.key.operator[data-key="${key}"]`);
        if (targetButton) processAction('operator', targetButton.dataset.action);
    } else if (key === '*') {
        targetButton = document.querySelector(`.key.operator[data-key="*"]`);
        if (targetButton) processAction('operator', 'multiply');
    } else if (key === '/') {
        event.preventDefault(); // Prevent browser quick-find shortcut
        targetButton = document.querySelector(`.key.operator[data-key="/"]`);
        if (targetButton) processAction('operator', 'divide');
    } else if (key === 'Enter' || key === '=') {
        targetButton = document.querySelector(`.key.operator[data-key="Enter"]`);
        processAction('operator', 'calculate');
    } else if (key === 'Escape') {
        targetButton = document.querySelector(`.key.action[data-key="Escape"]`);
        processAction('action', 'clear');
    } else if (key === 'Backspace') {
        // Delete last character or reset if single digit/error
        if (expression.length > 1 && !evaluated) {
            expression = expression.slice(0, -1);
        } else {
            expression = '0';
        }
        updateDisplay();
    } else if (key === '%') {
        targetButton = document.querySelector(`.key.action[data-key="%"]`);
        processAction('action', 'percent');
    }

    if (targetButton) {
        targetButton.classList.add('keyboard-active');
        setTimeout(() => {
            targetButton.classList.remove('keyboard-active');
        }, 150);
    }
});

// Initial screen render
updateDisplay();