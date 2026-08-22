from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ProjectSerializers
from projects.models import Project
# decorators of django rest framework
@api_view(['GET'])
def getRoutes(request):

    routes = [
        {'GET' : '/api/projects'},
        {'GET' : '/api/projects/id'},
        {'POST' : '/api/projects/id/vote'},

        # its for making sure that user stay login
        {'POST' : '/api/users/token'},
        {'POST' : '/api/users/token/refresh'},
    ]
    return Response(routes) 

@api_view(['GET'])
def getProjects(request):
    projects = Project.objects.all()
    # if you have many objects make many True
    serializer = ProjectSerializers(projects, many=True)
    # to actually shows us data we should use this serilizer.data
    return Response(serializer.data)


@api_view(['GET'])
def getProject(request,pk):
    project = Project.objects.get(id = pk)
    # if you have many objects make many True
    serializer = ProjectSerializers(project, many=False)
    # to actually shows us data we should use this serilizer.data
    return Response(serializer.data)