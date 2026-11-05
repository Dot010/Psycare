from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "role", "specialty", "date_joined"]
        read_only_fields = ["id", "email", "role", "specialty", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, max_length=128)
    accept_terms = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "name", "password", "role", "specialty", "accept_terms"]

    def validate_email(self, value):
        email = value.strip().lower()  
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Já existe uma conta com este e-mail.")
        return email

    def validate_accept_terms(self, value):
        if not value:  
            raise serializers.ValidationError(
                "Para criar a conta, aceite os termos e a política de privacidade."
            )
        return value

    def validate(self, attrs):
        role = attrs.get("role", User.Role.PATIENT)
        specialty = attrs.get("specialty", "")

        if role == User.Role.PROFESSIONAL and not specialty:
            raise serializers.ValidationError(
                {"specialty": "Informe se você é psicólogo(a) ou psiquiatra."}
            )
        if role == User.Role.PATIENT and specialty:
            raise serializers.ValidationError(
                {"specialty": "Conta de paciente não tem especialidade."}
            )

        candidate = User(email=attrs["email"], name=attrs["name"])
        try:
            password_validation.validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop("accept_terms")
        password = validated_data.pop("password")
        return User.objects.create_user(
            password=password, terms_accepted_at=timezone.now(), **validated_data 
        )


    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, max_length=128)

    def validate_email(self, value):
        return value.strip().lower()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, max_length=128)
    new_password = serializers.CharField(write_only=True, max_length=128)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):  
            raise serializers.ValidationError("Senha atual incorreta.")
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value, user=self.context["request"].user)  
        return value