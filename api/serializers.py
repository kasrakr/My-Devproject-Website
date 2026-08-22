from rest_framework import serializers
from projects.models import Project

# this would converts our data in databse to json file
class ProjectSerializers(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'