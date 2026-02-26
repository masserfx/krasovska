import os
os.environ["DJANGO_SETTINGS_MODULE"] = "plane.settings.production"
import django
django.setup()
from plane.license.models import InstanceConfiguration
from plane.license.utils.encryption import encrypt_data

configs = {
    "EMAIL_HOST": ("smtp.web4u.cz", False),
    "EMAIL_HOST_USER": ("info@hradev.cz", False),
    "EMAIL_HOST_PASSWORD": ("m80tte2u", True),
    "EMAIL_PORT": ("587", False),
    "EMAIL_USE_TLS": ("1", False),
    "EMAIL_USE_SSL": ("0", False),
    "EMAIL_FROM": ("Hala Krasovska <info@hradev.cz>", False),
}

for key, (value, encrypted) in configs.items():
    store_value = encrypt_data(value) if encrypted else value
    obj, created = InstanceConfiguration.objects.update_or_create(
        key=key,
        defaults={"value": store_value, "is_encrypted": encrypted}
    )
    status = "CREATED" if created else "UPDATED"
    if encrypted:
        print(f"  {status}: {key} = ***")
    else:
        print(f"  {status}: {key} = {value}")

print()
print("Verifying...")
from plane.license.utils.instance_value import get_email_configuration
config = get_email_configuration()
print(f"  EMAIL_HOST: {config[0]}")
print(f"  EMAIL_HOST_USER: {config[1]}")
print(f"  EMAIL_HOST_PASSWORD set: {bool(config[2])}")
print(f"  EMAIL_PORT: {config[3]}")
print(f"  EMAIL_USE_TLS: {config[4]}")
print(f"  EMAIL_USE_SSL: {config[5]}")
print(f"  EMAIL_FROM: {config[6]}")
