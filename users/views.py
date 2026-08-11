from django.shortcuts import render
from .models import profile
# Create your views here.

def profiles(request):
    profiles = profile.objects.all()
    context = {'profiles':profiles}
    return render(request, 'users/profiles.html', context)

def userprofile(request,pk):
    userprofile = profile.objects.get(id=pk)
    context = {'userprofile':userprofile}
    return render(request, 'users/user-profile.html', context)
