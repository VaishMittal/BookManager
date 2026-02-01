from django.urls import path
from .views import login_user, add_book, list_books, generate_ai_summary, get_book, send_chat_message

urlpatterns = [
    path('login/', login_user),
    path('add-book/', add_book),
    path('books/', list_books),
    path('books/<int:book_id>/', get_book),
    path('generate-summary/', generate_ai_summary),
    path('chat/', send_chat_message),
]
