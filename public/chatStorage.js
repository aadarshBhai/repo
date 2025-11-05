// Chat Storage Module
const CHAT_STORAGE_KEY = 'chatHistory';

/**
 * Saves a message to localStorage
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - The message text
 */
function saveMessage(sender, text) {
    try {
        // Get existing messages or initialize empty array
        const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
        
        // Add new message with timestamp
        messages.push({
            sender,
            text,
            timestamp: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        
        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('chatMessageSaved', { 
            detail: { sender, text } 
        }));
        
        return true;
    } catch (error) {
        console.error('Error saving message:', error);
        return false;
    }
}

/**
 * Loads all chat messages from localStorage
 * @returns {Array} Array of message objects
 */
function loadMessages() {
    try {
        return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
    } catch (error) {
        console.error('Error loading messages:', error);
        return [];
    }
}

/**
 * Clears the chat history from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
function clearChat() {
    try {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        
        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('chatCleared'));
        
        return true;
    } catch (error) {
        console.error('Error clearing chat:', error);
        return false;
    }
}

// Initialize chat history if it doesn't exist
function initializeChat() {
    if (!localStorage.getItem(CHAT_STORAGE_KEY)) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([]));
    }
}

// Auto-initialize when loaded
initializeChat();

// Export functions for use in other files
window.chatStorage = {
    saveMessage,
    loadMessages,
    clearChat
};

// Example usage:
// chatStorage.saveMessage('user', 'Hello, bot!');
// chatStorage.saveMessage('bot', 'Hi there!');
// const messages = chatStorage.loadMessages();
// chatStorage.clearChat();
