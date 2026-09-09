import requests

BASE_URL = "http://localhost:8080"

def get_all_user_ids() -> list[int]:
    url = f"{BASE_URL}/users"
    session = requests.Session()

    params = {
        "page": 0,
    }

    user_ids = []
    res = None

    while res is None or len(res) > 0:
        res = session.get(url, params=params, timeout=3)
        if not res.ok:
            break
        res = res.json()

        for user in res:
            user_ids.append(user["model"]["ID"])

        params["page"] += 1

    return user_ids

def display_req(req, index):
    print(f"Req number {index}: {len(req)} users, starting with user ID {req[0]}, ending with user ID {req[len(req) - 1]}")


def main() -> None:
    print("Verifying all user_ids are correct")

    reqs = [
        get_all_user_ids(),
        get_all_user_ids(),
    ]

    for (i, req) in enumerate(reqs):
        display_req(req, i)

    print("Are both requests the same?", reqs[0] == reqs[1])
