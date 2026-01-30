import { useParams } from "react-router-dom";

function ChatHistory() {
  const { id } = useParams();

  return (
    <div>
      <h2>Chat History for Book ID: {id}</h2>
      <p>No chat history found for this book.</p>
    </div>
  );
}

export default ChatHistory;
