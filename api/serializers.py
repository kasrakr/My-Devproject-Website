from rest_framework import serializers
from projects.models import Project, tag
from users.models import profile



class ProfileSerializers(serializers.ModelSerializer):
    class Meta :
        model = profile
        fields = '__all__'


class TagSerializers(serializers.ModelSerializer):
    class Meta :
        model = tag
        fields = '__all__'


# this would converts our data in databse to json file
class ProjectSerializers(serializers.ModelSerializer):
    owner = ProfileSerializers(many = False)
    tags = TagSerializers(many = True)
    class Meta:
        model = Project
        fields = '__all__'
