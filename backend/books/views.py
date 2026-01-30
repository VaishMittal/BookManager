from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import Book
from .serializers import BookSerializer
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import csrf_exempt

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

