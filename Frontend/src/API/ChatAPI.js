class ChatAPI {
    static async getMessages() {
      try {
        const response = await fetch('http://localhost:5000/api/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    }
  
    static async sendMessage(message) {
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    }
  }
  
  export { ChatAPI };
  
  