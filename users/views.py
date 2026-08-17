from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login, authenticate,logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import CustomUserCreationForm, ProfileForm, SkillForm, MessageForm
from django.contrib.auth.models import User
from .models import profile, Skill, Message
from . utils import searchProfiles
# Create your views here.


def loginUser(request):
    page = 'login'

    if request.user.is_authenticated:
        return redirect('profiles')

    if request.method == 'POST':
        username = request.POST['username'].strip()
        password = request.POST['password']

        try:
            # Case-insensitive username lookup
            user_obj = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            messages.error(request, "Username does not exist!")
            return render(request, 'users/login_register.html', {
                'page': page
            })

        # Authenticate using the user's actual username
        user = authenticate(
            request,
            username=user_obj.username,
            password=password
        )

        if user is not None:
            login(request, user)
            return redirect('profiles')
        else:
            messages.error(request, 'Username or Password is incorrect!')

    context = {'page': page}
    return render(request, 'users/login_register.html', context)

def logoutUser(request):
    logout(request)
    messages.error(request,'User was logged out!')
    return redirect('login')


def registerUser(request):
    page = "register"
    form = CustomUserCreationForm()

    if request.method == "POST":
        # use this to create new user 
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            # it hold the user before we really proccesing it
            user = form.save(commit=False)
            # because we dont want to usernames case sensetive
            user.username = user.username.lower()
            user.save()
            messages.success(request, 'User acoount was succesfully created!')
            login(request, user)
            return redirect('profiles')
        else:
            messages.error(request, 'An error has occurred during registration!')

    context = {'page':page, 'form':form}
    return render(request, 'users/login_register.html', context)


def profiles(request):
    # prefetch_related loads all skills for all profiles in one extra query
    profiles_list , proFile, search_query = searchProfiles(request)
    context = {
        'profiles': proFile,
        'profiles_count': len(profiles_list),
        'search_query' : search_query,
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


@login_required(login_url='login')
def userAccount(request):
    profile_item = request.user.profile
    skills = profile_item.skills.all()
    projects = list(profile_item.project_set.all().order_by('-created'))

    form = ProfileForm(instance=profile_item)
    skill_form = SkillForm()

    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        if form_type == 'profile':
            form = ProfileForm(request.POST, request.FILES, instance=profile_item)
            if form.is_valid():
                form.save()
                messages.success(request, 'Your profile was updated successfully!')
                return redirect('account')
            else:
                messages.error(request, 'Please fix the errors below and try again.')

        elif form_type == 'add_skill':
            skill_form = SkillForm(request.POST)
            if skill_form.is_valid():
                skill = skill_form.save(commit=False)
                skill.owner = profile_item
                skill.save()
                messages.success(request, 'Skill added!')
                return redirect('account')
            else:
                messages.error(request, 'Please give the skill a name.')

        elif form_type == 'delete_skill':
            skill_id = request.POST.get('skill_id')
            Skill.objects.filter(id=skill_id, owner=profile_item).delete()
            messages.success(request, 'Skill removed.')
            return redirect('account')

    context = {
        'profile': profile_item,
        'skills': skills,
        'skills_count': len(skills),
        'projects': projects,
        'projects_count': len(projects),
        'form': form,
        'skill_form': skill_form,
    }
    return render(request, 'users/account.html', context)

@login_required(login_url='login')
def inbox(request):
    profile = request.user.profile
    # because we set related name of recipient messages
    messageRequest = profile.messages.all()
    unreadCount = messageRequest.filter(is_read=False).count()
    context = {'messageRequest':messageRequest , 'unreadCount':unreadCount}
    return render (request, 'users/inbox.html', context)

@login_required(login_url='login')
def viewMessage(request,pk):
    profile = request.user.profile
        # because we set related name of recipient messages
    message = profile.messages.get(id=pk)
    if message.is_read == False:
        message.is_read = True
        message.save()
    context = {'message':message}
    return render (request, 'users/message.html',context)

@login_required(login_url='login')
def createMessage(request,pk):
    recipient = profile.objects.get(id=pk)
    form = MessageForm()
    try : 
        sender = request.user.profile
    except:
        sender = None
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid(): 
            message = form.save(commit=False)
            message.sender = sender
            message.recipient = recipient

            if sender :
                message.name = sender.name
                message.email = sender.email
            message.save()
            messages.success(request, 'Your message was successfully sent!')
            return redirect('userProfile', pk = recipient.id)
    context = {'recipient':recipient, 'form':form}
    return render (request, 'users/message_form.html', context)