from rest_framework import status, viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    BasePermission,
    SAFE_METHODS
)
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import render
from django.db.models import F

from .models import Destinations, UserProfile, Comment, Like
from .serializers import (
    DestinationsSerializer,
    UserProfileSerializer,
    UserSerializer,
    CommentSerializer
)


class IsOwnerOrReadOnly(BasePermission):
    """
    Anyone can view (safe methods). Only the destination's original
    poster can update or delete it.
    """

    def has_object_permission(self, request, view, obj):

        if request.method in SAFE_METHODS:
            return True

        return bool(
            request.user.is_authenticated and
            obj.owner_id == request.user.id
        )


class IsCommentOwnerOrAdmin(BasePermission):
    """
    Only the comment's author, or an admin/staff user, can edit
    or delete a comment. (Viewing already requires login - see
    CommentViewSet's permission_classes.)
    """

    def has_object_permission(self, request, view, obj):

        if request.method in SAFE_METHODS:
            return True

        return bool(
            obj.user_id == request.user.id or
            request.user.is_staff
        )


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user:

            token, created = Token.objects.get_or_create(
                user=user
            )

            return Response({
                "token": token.key,
                "username": user.username,
                "message": "Login Successful"
            })

        return Response({
            "message": "Invalid Username or Password"
        }, status=status.HTTP_400_BAD_REQUEST)


class DestinationViewSet(viewsets.ModelViewSet):
    """
    Anyone (logged in or not) can browse the destinations list and
    view individual destinations. Visitor information and comments
    are hidden from the response unless the requester is logged in
    (see DestinationsSerializer). Liking, sharing and commenting all
    require login. Editing/deleting a destination is restricted to
    its original poster (see IsOwnerOrReadOnly).
    """

    queryset = Destinations.objects.all().prefetch_related(
        'photos', 'likes', 'comments'
    )
    serializer_class = DestinationsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser
    ]

    filter_backends = [filters.SearchFilter]
    search_fields = ['place_name', 'location']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    def like(self, request, pk=None):
        """Toggle like/unlike for the current user on this destination."""

        destination = self.get_object()

        like, created = Like.objects.get_or_create(
            destination=destination,
            user=request.user
        )

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response({
            "liked": liked,
            "likes_count": Like.objects.filter(
                destination_id=destination.id
            ).count()
        })

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    def share(self, request, pk=None):
        """Bump the share counter (called when a user uses the Share button)."""

        Destinations.objects.filter(pk=pk).update(
            shares_count=F('shares_count') + 1
        )

        destination = self.get_object()

        return Response({
            "shares_count": destination.shares_count
        })

    @action(
        detail=True,
        methods=['get', 'post'],
        permission_classes=[IsAuthenticated]
    )
    def comments(self, request, pk=None):
        """
        GET: list comments for this destination (login required to view).
        POST: add a comment (login required).
        """

        destination = self.get_object()

        if request.method == 'POST':

            serializer = CommentSerializer(
                data=request.data,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user, destination=destination)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        comments = destination.comments.all()
        serializer = CommentSerializer(
            comments,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    Dedicated endpoint for editing/deleting a single comment
    (used by the destination cards' Edit/Delete-comment buttons).
    Viewing, editing and deleting a comment all require login;
    only the comment's author or an admin/staff user can edit
    or delete it.
    """

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsCommentOwnerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserProfileViewSet(viewsets.ModelViewSet):

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]


def index(request):
    return render(request, 'index.html')


def register(request):
    return render(request, 'register.html')


def login(request):
    return render(request, 'login.html')


def destinations(request):
    return render(request, 'destinations.html')


def add_destination(request):
    return render(request, 'add_destination.html')


def edit_destination(request, id):
    return render(request, 'edit_destination.html')
