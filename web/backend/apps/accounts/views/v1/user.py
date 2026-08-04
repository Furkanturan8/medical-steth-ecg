from rest_framework.generics import RetrieveAPIView

from apps.accounts.serializers.v1.user import UserSerializer


class MeView(RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
