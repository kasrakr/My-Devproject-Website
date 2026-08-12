from django.contrib.auth.models import User
from .models import profile
# we add this for django post save signals
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

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


# this one is for any time we delete the profile, user will delete too.
@receiver(post_delete, sender=profile)
def deleteUser(sender, instance, **kwargs):
    user = instance.user
    user.delete()
# post_delete.connect(deleteUser, sender=profile)