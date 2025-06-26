// Chatbot variables
let chatMessages = null;
let chatInput = null;
let sendChatBtn = null;
let clearChatBtn = null;
let isTyping = false;

// Initialize chatbot
function initializeChatbot() {
    console.log('Initializing chatbot...');
    
    // Get DOM elements
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendChatBtn = document.getElementById('sendChatBtn');
    clearChatBtn = document.getElementById('clearChatBtn');
    
    if (!chatMessages || !chatInput || !sendChatBtn) {
        console.warn('Chatbot DOM elements not found, skipping chatbot initialization');
        return;
    }
    
    // Setup event listeners
    setupChatEventListeners();
    
    // Set initial timestamp for welcome message
    updateMessageTime();
    
    console.log('Chatbot initialized successfully');
}

// Setup chatbot event listeners
function setupChatEventListeners() {
    // Send button click
    sendChatBtn.addEventListener('click', handleSendMessage);
    
    // Enter key press in input
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Clear chat button
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }
    
    // Auto-resize input (optional enhancement)
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Handle sending message
async function handleSendMessage() {
    const message = chatInput.value.trim();
    
    if (!message || isTyping) {
        return;
    }
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send message to server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response to chat
        addMessage(data.response, 'bot');
        
    } catch (error) {
        console.error('Error sending message to chatbot:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add error message
        addMessage(
            'Sorry, I\'m having trouble connecting to the server. Please try again later.',
            'bot'
        );
        
        // Check for authentication errors
        if (error.message && error.message.includes('401')) {
            addMessage('Please log in to continue using the chatbot.', 'bot');
            if (typeof window.Auth !== 'undefined' && window.Auth.handleUnauthorizedError) {
                window.Auth.handleUnauthorizedError(error);
            }
            return;
        }
        
        // Show error notification
        if (typeof window.BusTracker !== 'undefined') {
            window.BusTracker.showError('Failed to send message to chatbot. Please check your connection.');
        }
    }
}

// Add message to chat
function addMessage(content, sender) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Handle multiline messages
    const formattedContent = content.replace(/\n/g, '<br>');
    messageContent.innerHTML = `<p>${formattedContent}</p>`;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
    
    // Animate message appearance
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
}

// Show typing indicator
function showTypingIndicator() {
    if (isTyping) return;
    
    isTyping = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Add CSS for typing animation if not already added
    addTypingStyles();
    
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

// Add typing animation styles
function addTypingStyles() {
    if (document.getElementById('typingStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'typingStyles';
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 8px 0;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #95a5a6;
            animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        .typing-dots span:nth-child(3) { animation-delay: 0; }
        
        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Scroll chat to bottom
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Clear chat messages
function clearChat() {
    if (!chatMessages) return;
    
    // Keep only the welcome message
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach((message, index) => {
        if (index > 0) { // Keep first message (welcome)
            message.remove();
        }
    });
    
    // Update welcome message timestamp
    updateMessageTime();
    
    console.log('Chat cleared');
}

// Update message timestamp (for welcome message)
function updateMessageTime() {
    const firstMessage = chatMessages.querySelector('.message .message-time');
    if (firstMessage) {
        firstMessage.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Add quick reply buttons for common queries
function addQuickReplies() {
    const quickReplies = [
        'Where is the bus?',
        'What\'s the current speed?',
        'Is the device online?',
        'Show bus status'
    ];
    
    const quickReplyContainer = document.createElement('div');
    quickReplyContainer.className = 'quick-replies';
    quickReplyContainer.innerHTML = `
        <div class="quick-reply-title">Quick questions:</div>
        ${quickReplies.map(reply => 
            `<button class="quick-reply-btn" onclick="sendQuickReply('${reply}')">${reply}</button>`
        ).join('')}
    `;
    
    // Add styles for quick replies
    const style = document.createElement('style');
    style.textContent = `
        .quick-replies {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .quick-reply-title {
            font-size: 0.8rem;
            color: #6c757d;
            margin-bottom: 8px;
        }
        
        .quick-reply-btn {
            display: inline-block;
            margin: 2px 4px;
            padding: 4px 8px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 12px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .quick-reply-btn:hover {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
    `;
    document.head.appendChild(style);
    
    // Add after welcome message
    const firstMessage = chatMessages.querySelector('.message');
    if (firstMessage) {
        firstMessage.appendChild(quickReplyContainer);
    }
}

// Send quick reply
function sendQuickReply(message) {
    chatInput.value = message;
    handleSendMessage();
}

// Auto-suggestions based on current bus data
function getSuggestions(query) {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('where') || queryLower.includes('location')) {
        suggestions.push('Where is the bus right now?');
        suggestions.push('Show me the current location');
    }
    
    if (queryLower.includes('speed') || queryLower.includes('fast')) {
        suggestions.push('What\'s the current speed?');
        suggestions.push('How fast is the bus going?');
    }
    
    if (queryLower.includes('status') || queryLower.includes('online')) {
        suggestions.push('Is the bus device online?');
        suggestions.push('Show device status');
    }
    
    return suggestions;
}

// Export functions for use in other modules
window.initializeChatbot = initializeChatbot;
window.sendQuickReply = sendQuickReply;
window.addMessage = addMessage;
window.clearChat = clearChat;
