from django.shortcuts import render
from .models import profile
# Create your views here.

def profiles(request):
    profiles = profile.objects.all()
    context = {'profiles':profiles}
    return render(request, 'users/profiles.html', context)