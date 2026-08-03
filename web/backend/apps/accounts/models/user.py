from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Custom user from day one — swapping later requires a db rebuild in Django.
    pass
