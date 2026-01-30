from django.urls import path
from .views import login_user, add_book, list_books

urlpatterns = [
    path('login/', login_user),
    path('add-book/', add_book),
    path('books/', list_books),
]
