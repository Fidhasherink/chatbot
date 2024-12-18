const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileUploadButton = document.querySelector("#file-upload")

// API setup
const API_KEY = "AIzaSyBlaxVMOXvHR228C1dkZg75A-UOCM-u9yc"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
};

// Function to create a message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Function to handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();

    if (!userData.message && !fileInput.files.lenght) return; // Avoid sending empty messages

    // Display user message
    const messageContent = `<div class="message-text">${userData.message}</div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight,behavier:"smooth"});

    messageInput.value = ""; // Clear input field
    chatBody.scrollTop = chatBody.scrollHeight;

    // Display thinking indicator and fetch bot response
    displayThinkingIndicator();
    generateBotResponse(userData.message);
};

// Function to display a thinking indicator
const displayThinkingIndicator = () => {
    const thinkingIndicator = `
        <div class="message-text">
            <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    const incomingMessageDiv = createMessageElement(thinkingIndicator, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight,behavier:"smooth"});
};

// Function to fetch bot response from the API
const generateBotResponse = async (userMessage) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: userMessage }],
                },
            ],
        }),
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();

        // Handle errors
        if (!response.ok) throw new Error(data.error.message || "Failed to fetch response");

        // Extract and clean bot response
        let botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
        botResponse = botResponse.replace(/\*/g, ""); // Remove all asterisks

        displayBotResponse(botResponse);
    } catch (error) {
        console.error("Error:", error.message);
        displayBotResponse("An error occurred. Please try again.");
    }
};


// Function to display bot response
const displayBotResponse = (botMessage) => {
    // Remove thinking indicator
    const thinkingElement = document.querySelector(".thinking");
    if (thinkingElement) thinkingElement.remove();

    // Display bot message
    const messageContent = `<div class="message-text">${botMessage}</div>`;
    const incomingMessageDiv = createMessageElement(messageContent, "bot-message");
    chatBody.appendChild(incomingMessageDiv);

    chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
};

// Event listeners for message sending
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
});

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));



fileUploadButton.addEventListener("click", () => {
    fileInput.click();
});

// Display selected file (optional)
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        const fileMessage = `<div class="message-text">📎 File Uploaded: ${file.name}</div>`;
        const fileElement = createMessageElement(fileMessage, "user-message");
        chatBody.appendChild(fileElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});