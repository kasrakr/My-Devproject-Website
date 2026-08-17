from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden
from .models import Project,tag
from .forms import ProjectForm
from .forms import ReviewForm
from django.contrib import messages
from .utils import searchProjects
from django.contrib.auth.decorators import login_required
# Create your views here.



def projects(request):
    # return HttpResponse('Here your projects')
    projects, search_query = searchProjects(request)
    page = 'projects'
    number = 1
    context = {'page':page, 'number':number, 'projectlist':projects, 'search_query':search_query}
    return render(request,'projects/projects.html',context)
    

def project(request, pk):
    projectObj = get_object_or_404(Project, id=pk)
    tags = projectObj.tags.all()
    reviews = projectObj.reviews.all().order_by('-created')

    # has the logged-in user already reviewed this project?
    user_review = None
    if request.user.is_authenticated:
        user_review = reviews.filter(owner=request.user.profile).first()

    form = ReviewForm()

    if request.method == 'POST':
        if not request.user.is_authenticated:
            messages.error(request, 'You must be logged in to leave a review.')
            return redirect('project', pk=projectObj.id)

        if user_review:
            messages.info(request, 'You have already reviewed this project.')
            return redirect('project', pk=projectObj.id)

        form = ReviewForm(request.POST)
        if form.is_valid():
            new_review = form.save(commit=False)
            new_review.Project = projectObj
            new_review.owner = request.user.profile
            new_review.save()

            # keep vote_total / vote_ratio on Project in sync
            all_reviews = projectObj.reviews.all()
            total = all_reviews.count()
            up_votes = all_reviews.filter(value='up').count()
            projectObj.vote_total = total
            projectObj.vote_ratio = int((up_votes / total) * 100) if total > 0 else 0
            projectObj.save()

            messages.success(request, 'Your review was submitted!')
            return redirect('project', pk=projectObj.id)

    context = {
        'projectlist': projectObj,
        'tags': tags,
        'reviews': reviews,
        'user_review': user_review,
        'form': form,
    }
    return render(request, 'projects/single-project.html', context)

@login_required(login_url="login")
def CreateProject(request):
    form = ProjectForm()

    if request.method =='POST':
        form = ProjectForm(request.POST,request.FILES)
        if form.is_valid():
            project = form.save(commit=False)
            project.owner = request.user.profile
            project.save()
            return redirect('projects')

    context = {'form':form}
    return render (request,'projects/project_form.html', context)

@login_required(login_url="login")
def UpdateProject(request,pk):
    projectt = get_object_or_404(Project, id=pk)

    if projectt.owner != request.user.profile:
        return HttpResponseForbidden("You don't have permission to edit this project.")

    form = ProjectForm(instance=projectt)

    if request.method =='POST':
        form = ProjectForm(request.POST, request.FILES, instance=projectt)
        if form.is_valid():
            form.save()
            return redirect('projects')

    context = {'form':form}
    return render (request,'projects/project_form.html', context)


@login_required(login_url="login")
def DeleteProject(request,pk):
    project3 = get_object_or_404(Project, id=pk)

    if project3.owner != request.user.profile:
        return HttpResponseForbidden("You don't have permission to delete this project.")

    if request.method=='POST':
        project3.delete()
        return redirect('projects')
    context={'proname':project3}
    return render(request,'projects/delete_template.html',context)

