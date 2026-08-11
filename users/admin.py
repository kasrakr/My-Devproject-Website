from django.contrib import admin

# Register your models here.
from .models import profile,Skill
# for showing profile on admin panel
admin.site.register(profile)
admin.site.register(Skill)