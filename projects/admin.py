from django.contrib import admin

# Register your models here.
from .models import Project,review,tag

admin.site.register(Project)
admin.site.register(review)
admin.site.register(tag)