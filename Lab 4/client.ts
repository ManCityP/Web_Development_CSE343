// ==========================================
// 1. Interfaces & Types
// ==========================================
class Todo {
    private static currentID: number = 0;
    public readonly id: number;
    public text: string;
    public completed: boolean;

    constructor(text: string) {
        this.id = Todo.currentID;
        Todo.currentID++;
        this.text = text;
        this.completed = false;
    }
}

enum FilterType {
    All = 'all',
    Active = 'active',
    Completed = 'completed'
}

// ==========================================
// 2. Global State Variables
// ==========================================
let todos: Todo[] = [];
let currentFilter: FilterType = FilterType.All;

// ==========================================
// 3. DOM Element Selectors
// ==========================================
const todoInput = document.getElementById('todo-input') as HTMLInputElement;
const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
const todoList = document.getElementById('todo-list') as HTMLUListElement;
const itemsLeft = document.getElementById('items-left') as HTMLSpanElement;
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed') as HTMLButtonElement;
const clearAllBtn = document.getElementById('clear-all') as HTMLButtonElement;

// ==========================================
// 4. Core Functions (Implement these!)
// ==========================================

/**
 * Reads the input value, creates a new Todo object, pushes it to the array,
 * clears the input field, and triggers a re-render.
 */
function AddTodo(): void {
    const text = todoInput.value.trim();
    if (text === '') return; // Don't add empty todos

    const todo: Todo = new Todo(text);
    todos.push(todo);
    todoInput.value = '';
    Render();
}

/**
 * Finds a todo by its ID and flips its 'completed' status, then re-renders.
 */
function ToggleTodo(id: number): void {
    const todo: Todo | undefined = todos.find(item => item.id === id);
    if(todo === undefined){
        return;
    }
    todo.completed = !todo.completed;
    Render();
}

/**
 * Removes a todo item from the todos array by its ID, then re-renders.
 */
function DeleteTodo(id: number): void {
    todos = todos.filter(item => item.id !== id);
    Render();
}

/**
 * Updates the text of a specific todo item by its ID, then re-renders.
 */
function EditTodo(id: number, newText: string): void {
    const todo: Todo | undefined = todos.find(item => item.id === id);
    if(todo === undefined){
        return;
    }
    todo.text = newText;
    Render();
}

/**
 * Clears completed todos from the array, then re-renders.
 */
function ClearCompleted(): void {
    todos = todos.filter(item => !item.completed);
    Render();
}

/**
 * Clears all todos from the array, then re-renders.
 */
function ClearAll(): void {
    todos.length = 0;
    Render();
}

/**
 * Clears the HTML list, filters the todos based on currentFilter,
 * generates the HTML elements, and updates the items-left counter.
 */
function Render(): void {
    // 1. Clear the existing HTML list to prevent duplicates
    todoList.innerHTML = '';

    // 2. Filter the todos array based on the selected filter tab ('all', 'active', 'completed')
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === FilterType.Active) return !todo.completed;
        if (currentFilter === FilterType.Completed) return todo.completed;
        return true; // 'all'
    });

    // 3. Loop through the filtered list and build DOM elements
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        // Add the 'completed' class if the todo is finished (applies line-through style)
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        // Construct the inner HTML structure, passing the item's unique ID to data attributes
        li.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text" data-id="${todo.id}">${todo.text}</span>
            </div>
            <button class="delete-btn" data-id="${todo.id}">🗑️</button>
        `;

        // Append the newly created <li> item to the <ul> list
        todoList.appendChild(li);
    });

    // 4. Calculate how many items are left (incomplete)
    const activeCount = todos.filter(todo => !todo.completed).length;

    // 5. Update the footer counter text
    itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
}

// ==========================================
// 5. Event Listeners Setup
// ==========================================

// Listen for click on Add button
addBtn.addEventListener('click', () => {
    AddTodo();
});

// Listen for Enter key on the input field
todoInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        AddTodo();
    }
});

// Event delegation on the todo list for checkboxes, delete buttons, and editing
todoList.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Get the data-id from the clicked element
    const idAttr = target.getAttribute('data-id');
    if (!idAttr) return; // Exit if the clicked element doesn't have a data-id

    const id = Number(idAttr);
    if (target.classList.contains('todo-checkbox')) {
        ToggleTodo(id);
    }
    else if (target.classList.contains('delete-btn')) {
        DeleteTodo(id);
    }
});

// Event delegation on the todo list for inline editing
todoList.addEventListener('dblclick', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('todo-text')) {
        const idAttr = target.getAttribute('data-id');
        if (!idAttr) return;
        const id = Number(idAttr);

        const currentText = target.textContent || '';

        // Create a temporary input element for editing
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        input.style.flex = '1';
        input.style.padding = '6px';
        input.style.fontSize = '16px';
        input.style.border = '1px solid #3b82f6';
        input.style.borderRadius = '4px';
        input.style.outline = 'none';

        // Replace the text span with the input box
        target.replaceWith(input);
        input.focus();

        // Helper function to save changes
        const save = () => {
            const newText = input.value.trim();
            if (newText !== '') {
                EditTodo(id, newText);
            } else {
                Render(); // Revert if empty
            }
        };

        // Save on Enter or cancel/revert on Escape
        input.addEventListener('keydown', (ke: KeyboardEvent) => {
            if (ke.key === 'Enter') {
                save();
            } else if (ke.key === 'Escape') {
                Render();
            }
        });

        // Also save when clicking outside the input box (blur)
        input.addEventListener('blur', () => {
            save();
        });
    }
});

// Listen for clicks on filter buttons (All, Active, Completed)
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const filterValue = target.getAttribute('data-filter');

        if (filterValue) {
            filterBtns.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            currentFilter = filterValue as FilterType;
            Render();
        }
    });
});

// Listen for click on "Clear completed"
clearCompletedBtn.addEventListener('click', () => {
    ClearCompleted();
});

// Listen for click on "Clear all"
clearAllBtn.addEventListener('click', () => {
    ClearAll();
});

// Initial render call when the script loads
Render();