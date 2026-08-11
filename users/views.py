from django.shortcuts import render,get_object_or_404
from .models import profile
# Create your views here.

def profiles(request):
    profiles = profile.objects.all()
    context = {'profiles':profiles}
    return render(request, 'users/profiles.html', context)

def userProfile(request, pk):
    profile_item = get_object_or_404(profile, id=pk)
    skills = profile_item.skills.all()
    skills_count = skills.count()

    # Count social links
    social_count = 0
    if profile_item.social_github: social_count += 1
    if profile_item.social_linkedin: social_count += 1
    if profile_item.social_website: social_count += 1
    if profile_item.social_whatsapp: social_count += 1
    if profile_item.social_telegram: social_count += 1
    if profile_item.social_youtube: social_count += 1

    context = {
        'profile': profile_item,
        'skills': skills,
        'skills_count': skills_count,
        'social_count': social_count
    }
    return render(request, 'users/userProfile.html', context)
