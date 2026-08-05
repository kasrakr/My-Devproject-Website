from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Project
from .forms import ProjectForm
# Create your views here.




def projects(request):
    # return HttpResponse('Here your projects')
    page = 'projects'
    number = 1
    projects = Project.objects.all()
    return render(request,'projects/projects.html',{'page':page, 'number':number, 'projectlist':projects})
    

def project(request,pk):
    # return HttpResponse('Single project '+str(pk))   # it must have pk
    projectobj = Project.objects.get(id=pk)
    tags = projectobj.tags.all()
    return render(request, 'projects/single-project.html',{'projectlist':projectobj, 'tags':tags})


def CreateProject(request):
    form = ProjectForm()

    if request.method =='POST':
        form = ProjectForm(request.POST,request.FILES)
        if form.is_valid():
            form.save()
            return redirect('projects')

    context = {'form':form}
    return render (request,'projects/project_form.html', context)


def UpdateProject(request,pk):
    projectt = Project.objects.get(id=pk)
    form = ProjectForm(instance=projectt)

    if request.method =='POST':
        form = ProjectForm(request.POST, request.FILES, instance=projectt)
        if form.is_valid():
            form.save()
            return redirect('projects')

    context = {'form':form}
    return render (request,'projects/project_form.html', context)

def DeleteProject(requset,pk):
    project3 = Project.objects.get(id=pk)
    if requset.method=='POST':
        project3.delete()
        return redirect('projects')
    context={'proname':project3}
    return render(requset,'projects/delete_template.html',context)