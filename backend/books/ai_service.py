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


def chat_with_ai(book_name, author_name, user_message, conversation_history=None):
    """
    Chat with AI about a specific book. Maintains conversation context.
    
    Args:
        book_name: Name of the book
        author_name: Name of the author
        user_message: Current user message
        conversation_history: List of previous messages in format [{"role": "user/assistant", "content": "..."}]
    
    Returns:
        str: AI response or None if error occurs
    """
    try:
        api_key = settings.GROQ_API_KEY
        
        if not api_key:
            logger.error("GROQ_API_KEY is not set in environment variables")
            return None
        
        client = Groq(api_key=api_key)
        
        # Build conversation messages
        messages = [
            {
                "role": "system",
                "content": f"""You are a helpful AI assistant specialized in providing information about books. 
You are currently discussing the book "{book_name}" by {author_name}. 
Provide detailed, accurate, and engaging responses about this book. 
Be conversational, informative, and helpful. Keep responses concise but comprehensive."""
            }
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=500
        )
        
        response = chat_completion.choices[0].message.content.strip()
        logger.info(f"Successfully generated chat response for book: {book_name}")
        return response
        
    except Exception as e:
        logger.error(f"Error in chat with AI: {str(e)}")
        return None
