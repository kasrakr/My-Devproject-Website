from .models import profile, Skill
from django.db.models import Q
# for making querys | and &

def searchProfiles(request):
    search_query = '' 

    if request.GET.get('search_query'):
        search_query = request.GET.get('search_query')

    # iexact that means you have to write that keyword exactly
    skills = Skill.objects.filter(name__iexact = search_query)
    # icontains for no case sensetive query
    proFile = profile.objects.distinct().filter(
                                        Q(name__icontains = search_query) |
                                        Q(short_intro__icontains = search_query) |
                                        Q(skills__in=skills))
    profiles_list = list(profile.objects.prefetch_related('skills'))

    return profiles_list, proFile, search_query 