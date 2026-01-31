import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./AddBook.css";

function AddBook() {
  const [book_name, setBookName] = useState("");
  const [author_name, setAuthorName] = useState("");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const navigate = useNavigate();

  const generateAISummary = async () => {
    if (!book_name || !author_name) {
      alert("Please enter book title and author name first");
      return;
    }

    setGeneratingSummary(true);
    try {
      const response = await axios.post("http://localhost:8000/api/generate-summary/", {
        book_name,
        author_name,
        isbn: isbn || null,
      });
      
      if (response.data.success && response.data.summary) {
        setDescription(response.data.summary);
      } else {
        alert("Failed to generate summary. Please try again.");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert(error.response?.data?.error || "Error generating summary. Please check if GROQ_API_KEY is configured.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const addBook = async () => {
    if (!book_name || !author_name || !isbn || !price || !quantity || !description) {
      alert("Please fill in all fields");
      return;
    }

    if (isbn.length !== 13 || !/^\d+$/.test(isbn)) {
      alert("ISBN must be exactly 13 digits");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/add-book/", {
        book_name,
        author_name,
        isbn,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
      });
      alert("Book Added Successfully!");
      // Reset form
      setBookName("");
      setAuthorName("");
      setIsbn("");
      setPrice("");
      setQuantity("");
      setDescription("");
      navigate("/books");
    } catch (error) {
      alert(error.response?.data?.isbn?.[0] || "Error adding book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="add-book-container">
        <div className="add-book-card">
          <h1 className="add-book-title">Add Book</h1>

          <div className="add-book-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="book_name">Title *</label>
                <input
                  id="book_name"
                  type="text"
                  placeholder="Enter title"
                  value={book_name}
                  onChange={(e) => setBookName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="author_name">Author *</label>
                <input
                  id="author_name"
                  type="text"
                  placeholder="Enter author"
                  value={author_name}
                  onChange={(e) => setAuthorName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="isbn">Isbn *</label>
                <input
                  id="isbn"
                  type="text"
                  placeholder="Enter ISBN"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value.replace(/\D/g, ""))}
                  maxLength={13}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">About the book (short description) *</label>
              <textarea
                id="description"
                placeholder="Enter about"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                disabled={loading}
              ></textarea>
              <button 
                className="generate-ai-button" 
                type="button" 
                onClick={generateAISummary}
                disabled={generatingSummary || loading || !book_name || !author_name}
              >
                {generatingSummary ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <div className="form-actions">
              <button
                className="btn-cancel"
                onClick={() => navigate("/books")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={addBook}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AddBook;
