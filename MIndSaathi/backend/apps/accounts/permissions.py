from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    """Allow access only to users with PATIENT role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'PATIENT'
        )


class IsCaretaker(BasePermission):
    """Allow access only to users with CARETAKER role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'CARETAKER'
        )


class IsDoctor(BasePermission):
    """Allow access only to users with DOCTOR role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'DOCTOR'
        )


class IsPatientOrCaretaker(BasePermission):
    """Allow access to PATIENT or CARETAKER roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('PATIENT', 'CARETAKER')
        )


class IsDoctorOrCaretaker(BasePermission):
    """Allow access to DOCTOR or CARETAKER roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('DOCTOR', 'CARETAKER')
        )
