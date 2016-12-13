from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic.base import TemplateView
from django.utils.decorators import method_decorator

from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.reverse import reverse
from rest_framework.response import Response

class ApiV1RootView(APIView):
    permission_classes = (permissions.AllowAny,)
    view_name = 'Version 1'

    def get(self, request, format=None):
        # list top level resources
        data = dict()
        data['accounts'] = reverse('account-list', request=request)
        data['posts'] = reverse('post-list', request=request)
        return Response(data)


class IndexView(TemplateView):
    template_name = 'index.html'

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super(IndexView, self).dispatch(*args, **kwargs)
