from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django import forms
from .models import profile, Skill, Message
from django.forms import ModelForm

class ProfileForm(forms.ModelForm):
    class Meta:
        model = profile
        fields = [
            'profile_image',
            'name', 'username', 'email', 'location',
            'short_intro', 'bio',
            'social_github', 'social_linkedin', 'social_telegram',
            'social_whatsapp', 'social_youtube', 'social_website',
        ]
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Your full name'}),
            'location': forms.TextInput(attrs={'placeholder': 'City, Country'}),
            'short_intro': forms.TextInput(attrs={'placeholder': 'e.g. Backend developer, Django enthusiast'}),
            'bio': forms.Textarea(attrs={'rows': 6, 'placeholder': 'Tell people a bit about yourself…'}),
            'social_github': forms.TextInput(attrs={'placeholder': 'https://github.com/username'}),
            'social_linkedin': forms.TextInput(attrs={'placeholder': 'https://linkedin.com/in/username'}),
            'social_telegram': forms.TextInput(attrs={'placeholder': 'https://t.me/username'}),
            'social_whatsapp': forms.TextInput(attrs={'placeholder': 'https://wa.me/…'}),
            'social_youtube': forms.TextInput(attrs={'placeholder': 'https://youtube.com/@username'}),
            'social_website': forms.TextInput(attrs={'placeholder': 'https://yoursite.com'}),
        }


class SkillForm(forms.ModelForm):
    class Meta:
        model = Skill
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'e.g. Django'}),
            'description': forms.Textarea(attrs={'rows': 3, 'placeholder': 'What you can do with it…'}),
        }



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

class MessageForm(ModelForm):
    class Meta:
        model = Message
        fields = ['name', 'email', 'subject', 'body']
    def __init__(self, *args, **kwargs):
        super(MessageForm,self).__init__(*args, **kwargs)

        for name, field in self.fields.items():
            field.widget.attrs.update({'class':'input'})
