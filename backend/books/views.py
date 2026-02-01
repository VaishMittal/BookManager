from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import Book
from .serializers import BookSerializer
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import csrf_exempt
from .ai_service import generate_book_summary, chat_with_ai
import json

@csrf_exempt
@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        return Response({
            "message": "Login successful",
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name
        })
    else:
        return Response({"error": "Invalid credentials"}, status=400)


@api_view(['POST'])
def add_book(request):
    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Book added successfully"})
    return Response(serializer.errors, status=400)


class BookPagination(PageNumberPagination):
    page_size = 5


@api_view(['GET'])
def list_books(request):
    try:
        books = Book.objects.all().order_by('-id')
        paginator = BookPagination()
        result_page = paginator.paginate_queryset(books, request)
        serializer = BookSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        return Response({"error": str(e), "detail": "Error fetching books. Please ensure database migrations are run."}, status=500)


@csrf_exempt
@api_view(['POST'])
def generate_ai_summary(request):
    """
    Generate AI summary for a book based on title, author, and optional ISBN.
    """
    book_name = request.data.get('book_name')
    author_name = request.data.get('author_name')
    isbn = request.data.get('isbn')
    
    if not book_name or not author_name:
        return Response({
            "error": "book_name and author_name are required"
        }, status=400)
    
    summary = generate_book_summary(book_name, author_name, isbn)
    
    if summary:
        return Response({
            "summary": summary,
            "success": True
        })
    else:
        return Response({
            "error": "Failed to generate summary. Please check if GROQ_API_KEY is set correctly.",
            "success": False
        }, status=500)


@api_view(['GET'])
def get_book(request, book_id):
    """
    Get book details by ID.
    """
    try:
        book = Book.objects.get(id=book_id)
        serializer = BookSerializer(book)
        return Response(serializer.data)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def send_chat_message(request):
    """
    Send a chat message to AI about a book.
    """
    book_id = request.data.get('book_id')
    user_message = request.data.get('message')
    conversation_history = request.data.get('conversation_history', [])
    
    if not book_id or not user_message:
        return Response({
            "error": "book_id and message are required"
        }, status=400)
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=404)
    
    # Convert conversation history to proper format if it's a string
    if isinstance(conversation_history, str):
        try:
            conversation_history = json.loads(conversation_history)
        except:
            conversation_history = []
    
    # Ensure conversation history is in the right format
    formatted_history = []
    for msg in conversation_history:
        if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
            formatted_history.append({
                "role": msg['role'],
                "content": msg['content']
            })
    
    # Get AI response
    ai_response = chat_with_ai(
        book.book_name,
        book.author_name,
        user_message,
        formatted_history if formatted_history else None
    )
    
    if ai_response:
        return Response({
            "response": ai_response,
            "success": True
        })
    else:
        return Response({
            "error": "Failed to get AI response. Please check if GROQ_API_KEY is set correctly.",
            "success": False
        }, status=500)

