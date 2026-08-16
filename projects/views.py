from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden
from .models import Project
from .forms import ProjectForm
from django.contrib.auth.decorators import login_required
# Create your views here.




def projects(request):
    # return HttpResponse('Here your projects')
    page = 'projects'
    number = 1
    projects = Project.objects.all()
    return render(request,'projects/projects.html',{'page':page, 'number':number, 'projectlist':projects})
    

def project(request,pk):
    # return HttpResponse('Single project '+str(pk))   # it must have pk
    projectobj = get_object_or_404(Project, id=pk)
    tags = projectobj.tags.all()
    return render(request, 'projects/single-project.html',{'projectlist':projectobj, 'tags':tags})

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