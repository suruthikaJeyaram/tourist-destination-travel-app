from django.urls import path

from .views import (
    index,
    register,
    login,
    destinations,
    add_destination,
    edit_destination
)


urlpatterns = [

    path('', index, name='index'),

    path('register/', register, name='register'),

    path('login/', login, name='login'),

    path('destinations/', destinations, name='destinations'),

    path(
        'add-destination/',
        add_destination,
        name='add_destination'
    ),

    path(
        'edit-destination/<int:id>/',
        edit_destination,
        name='edit_destination'
    ),
]