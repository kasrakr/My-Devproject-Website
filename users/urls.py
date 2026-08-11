from django.urls import path
from . import views
urlpatterns = [
    path('',views.profiles, name="profiles"), #if its blank '' it means its become your homepage
    path('profile/<str:pk>', views.userprofile, name='user-profile')
]