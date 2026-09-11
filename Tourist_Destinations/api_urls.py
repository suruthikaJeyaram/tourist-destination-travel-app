from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    DestinationViewSet,
    UserProfileViewSet,
    CommentViewSet
)


router = DefaultRouter()

router.register(r'users', UserViewSet)
router.register(r'destinations', DestinationViewSet)
router.register(r'userprofile', UserProfileViewSet)
router.register(r'comments', CommentViewSet)


urlpatterns = [
    path('', include(router.urls)),
]