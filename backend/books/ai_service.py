import logging
from django.conf import settings
from groq import Groq

logger = logging.getLogger('books.ai_service')

def generate_book_summary(book_name, author_name, isbn=None):
    """
    Generate an AI-powered summary for a book using Groq API.
    
    Args:
        book_name: Name of the book
        author_name: Name of the author
        isbn: Optional ISBN number
    
    Returns:
        str: Generated summary or None if error occurs
    """
    try:
        api_key = settings.GROQ_API_KEY
        
        if not api_key:
            logger.error("GROQ_API_KEY is not set in environment variables")
            return None
        
        client = Groq(api_key=api_key)
        
        # Create a prompt for the AI
        prompt = f"""Write a brief, engaging summary (2-3 sentences) for the book "{book_name}" by {author_name}.
        
The summary should:
- Be concise and informative
- Highlight the main theme or plot
- Be suitable for a book catalog
- Be written in a professional tone

Book Title: {book_name}
Author: {author_name}
{f'ISBN: {isbn}' if isbn else ''}

Summary:"""
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that writes concise, engaging book summaries for a library catalog system."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",  # Using a fast model for quick responses
            temperature=0.7,
            max_tokens=150
        )
        
        summary = chat_completion.choices[0].message.content.strip()
        logger.info(f"Successfully generated summary for book: {book_name}")
        return summary
        
    except Exception as e:
        logger.error(f"Error generating book summary: {str(e)}")
        return None
