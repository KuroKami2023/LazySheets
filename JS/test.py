import pandas as pd
import os
from datetime import datetime
import sys
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

SPREADSHEET_ID = "1Q6vPAovgHOffrr8uQDawW7M59wFNV14kI9eltW8P8RA"

def main():
    # Read the entire Excel file
    lines = sys.stdin.readlines()

    data = json.loads(lines[0])

    file_name = data.get('file', '')

    if file_name.endswith('.csv'):
        df = pd.read_csv(file_name, encoding='latin1', dtype=str)
    elif file_name.endswith('.xlsx'):
        df = pd.read_excel(file_name, engine='openpyxl')
    else:
        print("Unsupported file type")
        sys.exit(1)

    # Replace NaN values with a placeholder
    df.fillna('', inplace=True)

    # Check if there are multiple sheets
    if isinstance(df, dict):
        print("Multiple sheets found. Please select one:")
        for sheet_name in df.keys():
            print(sheet_name)
        selected_sheet = input("Enter the sheet name: ").strip()
        if selected_sheet in df.keys():
            df = df[selected_sheet]
        else:
            print("Invalid sheet name.")
            sys.exit(1)

    credentials = None
    if os.path.exists("token.json"):
        credentials = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            credentials = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(credentials.to_json())

    try:
        service = build("sheets", "v4", credentials=credentials)
        sheets = service.spreadsheets()

        # Convert DataFrame to list of lists
        values = df.values.tolist()

        # Clear existing data in the spreadsheet
        sheets.values().clear(
            spreadsheetId=SPREADSHEET_ID,
            range="Finances!A1:ZZ",
            body={}
        ).execute()

        # Convert datetime objects to string format
        for row in values:
            for i, value in enumerate(row):
                if isinstance(value, datetime):
                    row[i] = value.strftime('%Y-%m-%d %H:%M:%S')

        # Write data to the spreadsheet
        result = sheets.values().update(
            spreadsheetId=SPREADSHEET_ID,
            range="Finances!A1",
            valueInputOption="USER_ENTERED",
            body={"values": values}
        ).execute()

        print("Data successfully uploaded to Google Spreadsheet.")

    except HttpError as error:
        print(error)

if __name__ == "__main__":
    main()
