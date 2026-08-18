from django.contrib.auth.models import User
from .models import profile
# we add this for django post save signals
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

# function that create a profile anytime user sign up
@receiver(post_save, sender=User)
def createProfile(sender, instance, created, **kwargs):
    if created:
        user = instance
        Profile = profile.objects.create(
            user = user,
            username = user.username,
            email = user.email,
            name = user.first_name
        )
# post_save.connect(createProfile, sender=User) we can use decorator instead of this
# because of that cascade in profile anytime user deleted it profile will delete too and there is no need to delete function

    

