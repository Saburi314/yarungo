from django.utils.deprecation import MiddlewareMixin
import uuid

class GuestUUIDMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if not request.user.is_authenticated:
            uuid_key = 'user_uuid'
            user_uuid = request.COOKIES.get(uuid_key)
            if not user_uuid:
                user_uuid = str(uuid.uuid4())
                request.new_user_uuid = user_uuid
            request.user_uuid = user_uuid
        else:
            request.user_uuid = None
