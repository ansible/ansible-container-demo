from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.conf.urls import patterns, url
from rest_framework_nested import routers
from project.views import ApiV1RootView, IndexView
from project.authentication.views import AccountViewSet, LoginView, LogoutView
from project.posts.views import AccountPostsViewSet, PostViewSet

router = routers.SimpleRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'posts', PostViewSet)

accounts_router = routers.NestedSimpleRouter(
    router, r'accounts', lookup='account'
)
accounts_router.register(r'posts', AccountPostsViewSet)

urlpatterns = [
    url(r'^api/v1/login/$', LoginView.as_view(), name='login'),
    url(r'^api/v1/logout/$', LogoutView.as_view(), name='logout'),
    url(r'^api/v1/$', ApiV1RootView.as_view()),
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/', include(accounts_router.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # url('^.*$', IndexView.as_view(), name='index'),
]

# urlpatterns += static('/static', document_root='/django/dist')

