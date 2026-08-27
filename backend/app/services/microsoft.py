import os
import httpx
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

def get_ms_graph_token() -> str:
    tenant_id = os.environ.get("MS_TENANT_ID")
    client_id = os.environ.get("MS_CLIENT_ID")
    client_secret = os.environ.get("MS_CLIENT_SECRET")

    if not all([tenant_id, client_id, client_secret]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Microsoft integration is not configured properly (missing credentials).",
        )

    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials",
    }

    try:
        response = httpx.post(token_url, data=data, timeout=10.0)
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        logger.error(f"Failed to get MS Graph token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate with Microsoft Graph API.",
        )


def provision_user_mailbox(first_name: str, last_name: str, display_name: str, email: str, password: str) -> None:
    domain = os.environ.get("MS_DOMAIN", "tauqeermustafa.tech")
    
    mail_nickname = email.split("@")[0]

    token = get_ms_graph_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    create_user_url = "https://graph.microsoft.com/v1.0/users"

    user_payload = {
        "accountEnabled": True,
        "displayName": display_name,
        "mailNickname": mail_nickname,
        "userPrincipalName": email,
        "givenName": first_name,
        "surname": last_name,
        "passwordProfile": {
            "forceChangePasswordNextSignIn": True,
            "password": password
        },
        "usageLocation": "US",
    }

    try:
        response = httpx.post(create_user_url, headers=headers, json=user_payload, timeout=15.0)
        
        if response.status_code != 201:
            err = response.json()
            logger.error(f"MS Graph create user failed: {err}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Microsoft 365 provisioning failed: {err.get('error', {}).get('message', 'Unknown error')}"
            )
            
    except httpx.RequestError as e:
        logger.error(f"MS Graph request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reach Microsoft Graph API."
        )
