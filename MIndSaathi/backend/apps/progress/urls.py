from django.urls import path
from .views import ProgressSummaryView, ProgressHistoryView, ActivityTimelineView

urlpatterns = [
    path('summary/', ProgressSummaryView.as_view(), name='progress-summary'),
    path('history/', ProgressHistoryView.as_view(), name='progress-history'),
    path('timeline/', ActivityTimelineView.as_view(), name='activity-timeline'),
]
