from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login, authenticate,logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import profile
# Create your views here.


def loginUser(request):

    if request.user.is_authenticated:
        return redirect('profiles')



    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)
        except:
            print("username does not exist")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request,user)
            return redirect('profiles')
        else:
            print('username or password is incorrect')
        
    return render(request, 'users/login_register.html')

def logoutUser(request):
    logout(request)
    return redirect('login')


def profiles(request):
    # prefetch_related loads all skills for all profiles in one extra query
    # (instead of one query per profile per .all()/.count() call in the
    profiles_list = list(profile.objects.prefetch_related('skills'))
    context = {
        'profiles': profiles_list,
        'profiles_count': len(profiles_list),
    }
    return render(request, 'users/profiles.html', context)


def userProfile(request, pk):
    profile_item = get_object_or_404(
        profile.objects.prefetch_related('skills'), id=pk
    )
    skills = profile_item.skills.all()
    skills_count = len(skills)  # already prefetched, so len() is free

    # Get user's projects, with tags prefetched so the template doesn't
    # fire a query per project for project.tags.all() / .count()
    projects = list(
        profile_item.project_set.prefetch_related('tags').order_by('-created')
    )
    projects_count = len(projects)

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
        'social_count': social_count,
        'projects': projects,
        'projects_count': projects_count
    }
    return render(request, 'users/userProfile.html', context)


