import os
from twilio.rest import Client

def get_twilio_client():
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    
    if not account_sid or not auth_token:
        print("Warning: Twilio credentials not found in .env file. SMS will be printed to console.")
        return None
    
    return Client(account_sid, auth_token)

twilio_client = get_twilio_client()

def send_sms(to_number, body):
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not twilio_client or not from_number:
        print("-" * 50)
        print(f"SIMULATED SMS to +91{to_number}")
        print(f"BODY: {body}")
        print("-" * 50)
        return {"success": True, "sid": "simulated_sms_id"}

    try:
        message = twilio_client.messages.create(
            body=body,
            from_=from_number,
            to=f"+91{to_number}"  # Assuming Indian country code
        )
        return {"success": True, "sid": message.sid}
    except Exception as e:
        print(f"Twilio SMS Error: {e}")
        return {"success": False, "error": str(e)}