import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "./ChatHistory.css";

function ChatHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const chatEndRef = useRef(null);
  const historyEndRef = useRef(null);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/books/${id}/`);
        setBook(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching book:", error);
        alert("Error loading book details");
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Auto-send first message when starting new conversation
  useEffect(() => {
    if (book && isNewConversation && messages.length === 0) {
      const firstMessage = `Write me a description in about 5-10 lines for the book name '${book.book_name}' & book author name '${book.author_name}'`;
      
      // Add user message to chat
      const userMsg = {
        role: "user",
        content: firstMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages([userMsg]);
      setSending(true);
      setIsNewConversation(false);

      // Send to API
      axios.post("http://localhost:8000/api/chat/", {
        book_id: id,
        message: firstMessage,
        conversation_history: [],
      })
      .then((response) => {
        if (response.data.success && response.data.response) {
          const aiMsg = {
            role: "assistant",
            content: response.data.response,
            timestamp: new Date().toISOString(),
          };
          setMessages([userMsg, aiMsg]);
          setChatHistory([
            {
              question: firstMessage,
              answer: response.data.response,
            },
          ]);
        } else {
          const errorMsg = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date().toISOString(),
          };
          setMessages([userMsg, errorMsg]);
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        const errorMsg = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages([userMsg, errorMsg]);
      })
      .finally(() => {
        setSending(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, isNewConversation, id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const sendMessage = async (messageText = null, isAutoSend = false) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend && !isAutoSend) return;

    if (!isAutoSend) {
      setInputMessage("");
    }

    // Add user message to chat
    const userMsg = {
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    // Build conversation history for API
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await axios.post("http://localhost:8000/api/chat/", {
        book_id: id,
        message: messageToSend,
        conversation_history: conversationHistory,
      });

      if (response.data.success && response.data.response) {
        // Add AI response to chat
        const aiMsg = {
          role: "assistant",
          content: response.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Update chat history (left panel) with the exchange
        setChatHistory((prev) => [
          ...prev,
          {
            question: messageToSend,
            answer: response.data.response,
          },
        ]);
      } else {
        // Show error message
        const errorMsg = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !sending) {
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setChatHistory([]);
    setIsNewConversation(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="chat-history-container">
          <div className="loading-state">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="chat-history-container">
          <div className="error-state">Book not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="chat-history-container">
        {/* Left Panel - Chat History */}
        <div className="chat-history-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              Chat History &gt; {book.book_name}
            </h2>
            <button className="start-chat-button" onClick={startNewChat}>
              Start AI Chat
            </button>
          </div>
          <div className="history-content">
            {chatHistory.length === 0 ? (
              <div className="empty-history">
                <p>No chat history yet. Start a conversation to see it here.</p>
              </div>
            ) : (
              chatHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-answer">
                    &quot;{item.answer}&quot;
                  </div>
                  <div className="history-question">
                    {item.question}
                  </div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>
        </div>

        {/* Right Panel - AI Chat */}
        <div className="ai-chat-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="star-icon">⭐</span> AI Chat
            </h2>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>Start chatting with AI about this book...</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role === "user" ? "user-message" : "ai-message"}`}
                >
                  <div className="message-content">{msg.content}</div>
                </div>
              ))
            )}
            {sending && (
              <div className="message ai-message">
                <div className="message-content">Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="send-button"
              disabled={sending || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ChatHistory;
