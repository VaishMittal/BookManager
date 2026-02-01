import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AddBook from "./pages/AddBook";
import BookList from "./pages/BookList";
import ChatHistory from "./pages/ChatHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/chat/:id" element={<ChatHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
