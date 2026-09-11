from django.db import models
from django.contrib.auth.models import User


class Destinations(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='destinations',
        null=True,
        blank=True
    )
    place_name = models.CharField(max_length=50)
    weather = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    google_map_link = models.URLField()
    description = models.TextField()
    visitor_info = models.TextField(
        blank=True,
        default='',
        help_text="Timings, entry fee, best time to visit, etc."
    )
    shares_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.place_name


class DestinationPhoto(models.Model):
    destination = models.ForeignKey(
        Destinations,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='destination_photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.destination.place_name}"


class Comment(models.Model):
    destination = models.ForeignKey(
        Destinations,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.text[:30]}"


class Like(models.Model):
    destination = models.ForeignKey(
        Destinations,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('destination', 'user')

    def __str__(self):
        return f"{self.user.username} likes {self.destination.place_name}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )
    country = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)

    def __str__(self):
        return self.user.username
