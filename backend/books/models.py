from django.db import models

class Book(models.Model):
    book_name = models.CharField(max_length=200)
    author_name = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.IntegerField(default=0)
    description = models.TextField()

    def __str__(self):
        return self.book_name
