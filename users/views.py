from django.shortcuts import render, get_object_or_404
from .models import profile
# Create your views here.


def profiles(request):
    # prefetch_related loads all skills for all profiles in one extra query
    # (instead of one query per profile per .all()/.count() call in the
    # template), and list() evaluates it exactly once so the template's
    # |slice and |length don't trigger further queries either.
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
