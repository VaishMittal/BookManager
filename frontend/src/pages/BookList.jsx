import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./BookList.css";

function BookList() {
  const [books, setBooks] = useState([]);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchBooks = async (url = "http://localhost:8000/api/books/") => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      setBooks(res.data.results || []);
      setNext(res.data.next);
      setPrev(res.data.previous);
      // Calculate current page
      if (res.data.next) {
        const urlParams = new URLSearchParams(res.data.next.split('?')[1]);
        const page = parseInt(urlParams.get('page')) - 1;
        setCurrentPage(page || 1);
      } else if (res.data.previous) {
        const urlParams = new URLSearchParams(res.data.previous.split('?')[1]);
        const page = parseInt(urlParams.get('page')) + 1;
        setCurrentPage(page || 1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      console.error("Error details:", error.response?.data);
      alert(`Error loading books: ${error.response?.data?.detail || error.message || "Please check your backend server and database migrations."}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const totalPages = next ? currentPage + 1 : (prev ? currentPage : 1);

  return (
    <Layout>
      <div className="book-list-container">
        <h1 className="book-list-title">Add Book</h1>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No books found</h3>
            <p>Get started by adding your first book</p>
            <button 
              className="btn-primary"
              onClick={() => navigate("/add-book")}
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          <>
            <div className="books-table-container">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Book ID</th>
                    <th>Book Name</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Price (₹)</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id}>
                      <td className="book-id">{b.id}</td>
                      <td className="book-name">{b.book_name}</td>
                      <td className="author-name">{b.author_name}</td>
                      <td className="isbn">{b.isbn}</td>
                      <td className="price">₹{b.price ? parseFloat(b.price).toFixed(2) : '0.00'}</td>
                      <td className="quantity">{b.quantity ?? 0}</td>
                      <td className="actions">
                        <button 
                          className="action-button" 
                          title="View chat history"
                          onClick={() => navigate(`/chat/${b.id}`)}
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => fetchBooks(prev)}
                disabled={!prev}
              >
                Previous
              </button>
              <div className="pagination-numbers">
                <span className={`page-number ${currentPage === 1 ? 'active' : ''}`}>1</span>
                {totalPages > 1 && (
                  <span className={`page-number ${currentPage === 2 ? 'active' : ''}`}>2</span>
                )}
              </div>
              <button
                className="pagination-button"
                onClick={() => fetchBooks(next)}
                disabled={!next}
              >
                Next
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default BookList;
