import os
import sys
import requests
from datetime import datetime, timedelta
from typing import Optional


AUTH_TOKEN = os.getenv("AUTH_TOKEN") or sys.argv[1]
API_URL = os.getenv("API_URL") or sys.argv[2]
COVERAGE = int(os.getenv("COVERAGE", 10))  # 7 DAYS to cover between execution + 3 days coverage to have some margin

API_ENDPOINT_LAST_DATE = f'{API_URL}/admin/daily/last-date'
API_ENDPOINT_GENERATE = f'{API_URL}/admin/daily/generate-answer' 
API_AUTH_HEADER = {'Authorization': f'Bearer {AUTH_TOKEN}'}

def main(req: Optional[dict] = None) -> str:
    """
    Fetch latest daily challenge date, generate response for following date and logs results.
    """
    try:
        # 1. Récupérer "lastDate" via une requête HTTP
        last_date = get_last_date()
        print(f'last date retreived: {last_date}')
        if not last_date:
            raise ValueError("failed to fetch last daily challenge date.")

        # 2. Récupérer "coverage" (paramètre ou valeur par défaut)
        date_max = datetime.now() + timedelta(days=COVERAGE)
        date_list = [last_date + timedelta(days=x) for x in range(1, (date_max - last_date).days)]
        print(f"last daily date : {last_date.date()}, next date to cover : {date_max.date()}.")

        # 3. Boucle pour chaque jour dans la plage
        results = []
        for date_to_process in date_list:
            try:
                response = generate_response_for_date(date_to_process)
                results.append((date_to_process, response, None))
                print(f"Generated challenge for {date_to_process}: {response}")
            except Exception as e:
                error_msg = f"Error for {date_to_process}: {str(e)}"
                results.append((date_to_process, None, error_msg))
                print(error_msg)

        # Retourne un résumé des résultats
        return format_results(results)

    except Exception as e:
        print(f"global error : {str(e)}")
        return f"Error : {str(e)}"

def get_last_date() -> datetime:
    """Fetch the latest challenge date from the API."""
    try:
        response = requests.get(API_ENDPOINT_LAST_DATE, headers=API_AUTH_HEADER)
        response.raise_for_status()
        last_date_str = response.json()
        return datetime.strptime(last_date_str, "%Y-%m-%dT%H:%M:%SZ")
    except Exception as e:
        print(f"Error while fetching the latest challenge date : {str(e)}")
        raise


def generate_response_for_date(date: datetime) -> str:
    """Sends an HTTP request to generate a daily challenge for the specified date"""
    try:
        print(f'sending generation request for {date}')
        print(date)
        response = requests.post(API_ENDPOINT_GENERATE, params={"date": date}, headers=API_AUTH_HEADER)
        response.raise_for_status()
        return "ok"  
    except Exception as e:
        print(f"Error while generating challenge for {date}: {str(e)}")
        raise

def format_results(results: list) -> str:
    """format final results for a clean summary."""
    output = ["Results:"]
    for date, response, error in results:
        if error:
            output.append(f"- {date}: X {error}")
        else:
            output.append(f"- {date}: O {response}")
    return "\n".join(output)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_daily_challenges.py <AUTH_TOKEN> <API_URL> [COVERAGE]")
        sys.exit(1)
    print(main())




