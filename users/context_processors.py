def unread_messages(request):
    # Makes `unread_message_count` available in every template's context
    # (once registered in settings.py — see the instructions alongside this
    # file), so the navbar can show an unread badge on any page, not just
    # on /inbox/ itself.

    if request.user.is_authenticated:
        try:
            count = request.user.profile.messages.filter(is_read=False).count()
        except AttributeError:
            count = 0
    else:
        count = 0

    return {'unread_message_count': count}
