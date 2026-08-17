from django.db import models
import uuid
# Create your models here.
from users.models import profile

class tag (models.Model):
    name = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    def __str__(self):
        return self.name

#whenwever you add sth to your models you should first makemigrations and then migrate it.
class Project(models.Model):
    owner = models.ForeignKey(profile, null=True, blank=True, on_delete = models.SET_NULL)
    title = models.CharField (max_length=200)
    description = models.TextField (null=True, blank=True) #null is for db and blank is for usert to be empty
    demo_link = models.TextField (max_length=2000, null=True, blank=True)
    featured_image = models.ImageField(blank=True, null=True, default='default.jpg') # add image if its not uploaded shows default image
    tags = models.ManyToManyField (tag, blank=True)   # many to many relationship with tag
    vote_total = models.IntegerField (default= 0, null=True, blank=True)
    vote_ratio = models.IntegerField (default= 0, null=True, blank=True)
    source_link = models.TextField (max_length=2000, null=True, blank=True)
    created = models.DateTimeField (auto_now_add=True)
    id = models.UUIDField (default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    #These are all private attribute for showing them on admin panel:
    def __str__(self):
        return self.title


class review (models.Model):
    owner = models.ForeignKey(profile, on_delete=models.CASCADE, null=True, blank=True)
    Project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reviews') #cascade means if Project deleted review will delete too
    vote_type = (
        ('up', 'Up Vote'),
        ('down', 'Down Vote')
    ) # user can choose between these options
    body = models.TextField(null=True, blank=True)
    value = models.CharField(max_length=200, choices=vote_type)
    created = models.DateTimeField(auto_now_add=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)

    # this is for us for making sure someone can add review for a project only once not spamming it.
    class Meta:
        unique_together = [['owner', 'Project']]

    def __str__(self):
        return self.value
