from django.forms import ModelForm
from .models import Project

class ProjectForm (ModelForm):
    class Meta:
        model = Project
        # fields = '__all__' # its generate a frield for all available attributes in model
        fields = ['title', 'featured_image', 'description', 'source_link', 'demo_link', 'tags']