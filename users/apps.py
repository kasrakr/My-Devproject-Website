from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'
    # this one is for configuring signals.py for our app.
    def ready(self):
        import users.signals
