# DevDocs

_This documentation details the functionalities and API calls within Experiencer_

## API Calls

### Authentiaction

1. Get Token

`curl --location 'BASE_URL/oauth/token'
--header 'Authorization: Basic TOKEN'
--header 'Content-Type: application/x-www-form-urlencoded'
--data-urlencode 'grant_type=password'
--data-urlencode 'username=EMAIL'
--data-urlencode 'password=PASSWORD'`

- Response structure (200 OK)

`{"access_token": "REMOVED FOR PRIVACY",
"token_type": "REMOVED FOR PRIVACY",
"refresh_token": "REMOVED FOR PRIVACY",
"expires_in": "REMOVED FOR PRIVACY",
"scope": "REMOVED FOR PRIVACY",
"jti": "REMOVED FOR PRIVACY"
}`

- Response structure (400 Bad Request)

`{
    "error": "invalid_grant",
    "error_description": "Bad credentials"
}`

2. Connect a watch to a user and a study

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

`curl --location 'BASE_URL/wearables/tizen/register/study?policy=POLICY'
--header 'Content-Type: application/json'
--header 'Authorization: Bearer TOKEN'
--data '{"registerId": "REGISTER_ID","study": "STUDY_NAME"}'`

- Response structure (200 OK)

`{
    "id": REMOVED FOR PRIVACY (WAS INT),
    "registerId": "5REMOVED FOR PRIVACY",
    "registeredAt": REMOVED FOR PRIVACY (WAS TS IN MS)
}`

- Response structure (422 Unprocessable Entity)
