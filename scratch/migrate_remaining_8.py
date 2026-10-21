import urllib.request
import json

API_KEY = 'oek_vLhzeeO6fO_owBMaIIkLLzFPAWezb9I-f5H7isSGYug'
BASE_URL = 'https://tauqeer-inc-backend.onrender.com'
headers_oe = {'Authorization': f'Bearer {API_KEY}', 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json'}

# 1. Login to backend
data = json.dumps({'email': 'admin@qorlune.co.uk', 'password': 'Bushra@0609'}).encode()
req = urllib.request.Request(f'{BASE_URL}/auth/login', data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as r:
    token = json.loads(r.read())['data']['accessToken']

rem = [
    'abdul.moiz.watto@tauqeermustafa.tech',
    'kashaf.shahid@tauqeermustafa.tech',
    'abdul.sami@tauqeermustafa.tech',
    'mariyum.tariq@tauqeermustafa.tech',
    'fatima.majeed@tauqeermustafa.tech',
    'khadeja.zulfiqar@tauqeermustafa.tech',
    'wania.shahid@tauqeermustafa.tech',
    'monsa.hamid@tauqeermustafa.tech'
]

req_i = urllib.request.Request('https://api.open.email/api/v1/identities', headers=headers_oe)
with urllib.request.urlopen(req_i) as r:
    idents = json.loads(r.read())['identities']
i_map = {i['primaryAddress'].lower(): i for i in idents}

# Get DB users
all_u = []
page = 1
while True:
    req_u = urllib.request.Request(f'{BASE_URL}/admin/users?page={page}&pageSize=50', headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req_u) as r:
        d = json.loads(r.read())['data']
        all_u.extend(d['items'])
        if page >= d['pagination']['totalPages']:
            break
        page += 1
u_map = {u.get('email', '').lower(): u for u in all_u}

for old_em in rem:
    pfx = old_em.split('@')[0]
    new_em = f'{pfx}@qorlune.co.uk'
    ident = i_map.get(old_em)
    if ident:
        mb_id = ident['id']
        # route
        r_req = urllib.request.Request('https://api.open.email/api/v1/routes', data=json.dumps({'address': new_em, 'destinationType': 'mailbox', 'mailboxId': mb_id}).encode(), headers=headers_oe)
        try:
            urllib.request.urlopen(r_req)
        except Exception as e:
            pass
        # patch ident
        p_req = urllib.request.Request(f'https://api.open.email/api/v1/identities/{mb_id}', data=json.dumps({'primaryAddress': new_em}).encode(), headers=headers_oe, method='PATCH')
        try:
            urllib.request.urlopen(p_req)
        except Exception as e:
            pass
        # delete old route
        d_req = urllib.request.Request(f'https://api.open.email/api/v1/routes/{old_em}', headers=headers_oe, method='DELETE')
        try:
            urllib.request.urlopen(d_req)
        except Exception as e:
            pass
    # patch DB
    u = u_map.get(old_em)
    if u:
        pu_req = urllib.request.Request(f'{BASE_URL}/admin/users/{u["id"]}', data=json.dumps({'email': new_em, 'status': 'terminated'}).encode(), headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}, method='PATCH')
        try:
            urllib.request.urlopen(pu_req)
        except Exception as e:
            pass
    print(f'Migrated remaining {old_em} -> {new_em}')
