/**
 * Chatbot Widget untuk Apotek
 * Widget floating chat yang terintegrasi dengan Flask API
 */

class ApotekChatbot {
  constructor(apiUrl = 'http://localhost:5000') {
    this.apiUrl = apiUrl;
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.addMessage('bot', 'Halo! Selamat datang di Apotek kami. Ada yang bisa saya bantu?');
  }

  createWidget() {
    // Create container
    const container = document.createElement('div');
    container.id = 'apotek-chatbot';
    container.className = 'chatbot-container';
    
    container.innerHTML = `
      <!-- Chat Toggle Button -->
      <button class="chatbot-toggle" id="chatbot-toggle">
        <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Chat Window -->
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <h3>💊 Chatbot Apotek</h3>
          <button class="chatbot-close" id="chatbot-close">×</button>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Messages will be inserted here -->
        </div>
        
        <div class="chatbot-input">
          <input 
            type="text" 
            id="chatbot-input-field" 
            placeholder="Ketik pertanyaan Anda..."
            autocomplete="off"
          />
          <button id="chatbot-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
  }

  attachEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const inputField = document.getElementById('chatbot-input-field');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.toggleChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    
    if (this.isOpen) {
      window.classList.add('active');
      toggle.classList.add('active');
      document.getElementById('chatbot-input-field').focus();
    } else {
      window.classList.remove('active');
      toggle.classList.remove('active');
    }
  }

  addMessage(sender, text, data = null) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender}`;
    
    let content = `<div class="message-bubble">${this.formatMessage(text, data)}</div>`;
    messageDiv.innerHTML = content;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    this.messages.push({ sender, text, data, timestamp: new Date() });
  }

  formatMessage(text, data) {
    let formatted = text;
    
    // If there's medicine data, format it nicely
    if (data && Array.isArray(data)) {
      formatted += '<div class="medicine-list">';
      data.forEach(med => {
        formatted += `
          <div class="medicine-item">
            <strong>${med.name}</strong><br>
            <small>${med.composition}</small>
          </div>
        `;
      });
      formatted += '</div>';
    } else if (data && data.name) {
      formatted += `
        <div class="medicine-detail">
          <strong>${data.name}</strong><br>
          <small>${data.composition}</small>
        </div>
      `;
    }
    
    return formatted;
  }

  addTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-bubble">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  async sendMessage() {
    const inputField = document.getElementById('chatbot-input-field');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addMessage('user', message);
    inputField.value = '';
    
    // Show typing indicator
    this.addTypingIndicator();
    
    try {
      // Call API
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      // Remove typing indicator
      this.removeTypingIndicator();
      
      if (data.status === 'success') {
        this.addMessage('bot', data.response, data.data);
      } else {
        this.addMessage('bot', 'Maaf, terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessage('bot', 'Maaf, tidak dapat terhubung ke server. Pastikan API server berjalan.');
      console.error('Error:', error);
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.apotekChatbot = new ApotekChatbot('http://localhost:5000');
});
