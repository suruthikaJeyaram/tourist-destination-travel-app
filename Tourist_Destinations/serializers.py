from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Destinations,
    UserProfile,
    DestinationPhoto,
    Comment,
    Like
)


class DestinationPhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = DestinationPhoto
        fields = ['id', 'image']


class CommentSerializer(serializers.ModelSerializer):

    username = serializers.ReadOnlyField(source='user.username')
    can_modify = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'destination',
            'username',
            'text',
            'created_at',
            'can_modify'
        ]
        read_only_fields = ['destination']

    def get_can_modify(self, obj):
        request = self.context.get('request')

        if not (request and request.user.is_authenticated):
            return False

        return bool(
            obj.user_id == request.user.id or
            request.user.is_staff
        )


class DestinationsSerializer(serializers.ModelSerializer):

    photos = DestinationPhotoSerializer(
        many=True,
        read_only=True
    )

    owner_username = serializers.ReadOnlyField(
        source='owner.username'
    )

    is_owner = serializers.SerializerMethodField()

    likes_count = serializers.SerializerMethodField()

    liked_by_user = serializers.SerializerMethodField()

    comments = CommentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Destinations

        fields = [
            'id',
            'owner_username',
            'is_owner',
            'place_name',
            'weather',
            'location',
            'google_map_link',
            'description',
            'visitor_info',
            'created_at',
            'photos',
            'likes_count',
            'liked_by_user',
            'shares_count',
            'comments',
        ]

    def _is_logged_in(self):
        request = self.context.get('request')

        return bool(
            request and
            request.user.is_authenticated
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Visitor information and comments are only shown
        # to logged-in users.
        if not self._is_logged_in():
            data['visitor_info'] = None
            data['comments'] = []

        return data

    def get_is_owner(self, obj):
        request = self.context.get('request')

        return bool(
            request and
            request.user.is_authenticated and
            obj.owner_id == request.user.id
        )

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_liked_by_user(self, obj):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            return obj.likes.filter(
                user=request.user
            ).exists()

        return False

    def create(self, validated_data):

        request = self.context.get('request')

        destination = Destinations.objects.create(
            **validated_data
        )

        # Get uploaded images directly from request.FILES
        if request:
            photos = request.FILES.getlist(
                'uploaded_photos'
            )

            for photo in photos:
                DestinationPhoto.objects.create(
                    destination=destination,
                    image=photo
                )

        return destination

    def update(self, instance, validated_data):

        request = self.context.get('request')

        # Update normal destination fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Add newly uploaded images
        if request:
            photos = request.FILES.getlist(
                'uploaded_photos'
            )

            for photo in photos:
                DestinationPhoto.objects.create(
                    destination=instance,
                    image=photo
                )

        return instance


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password'
        ]

        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        return User.objects.create_user(
            **validated_data
        )