from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['first_name', 'email', 'username', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        placeholders = {
            'first_name': 'e.g. Masoud',
            'email': 'you@example.com',
            'username': 'e.g. masoudcs',
            'password1': '••••••••',
            'password2': '••••••••',
        }
        autocomplete = {
            'first_name': 'given-name',
            'email': 'email',
            'username': 'username',
            'password1': 'new-password',
            'password2': 'new-password',
        }

        for name, field in self.fields.items():
            field.widget.attrs.update({
                'class': 'auth-input',
                'placeholder': placeholders.get(name, ''),
                'autocomplete': autocomplete.get(name, ''),
            })
            # Drop Django's default paragraph-length help text (password
            # rules, username character limits) in favor of clean
            # placeholders — keeps the cinematic form uncluttered.
            field.help_text = ''

        self.fields['password2'].label = 'Confirm password'
