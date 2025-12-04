from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import json
import requests
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)

# Initialize DB Function
def init_db():
    with sqlite3.connect("search_history.db") as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS SearchHistory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )''')

    with sqlite3.connect("search_history.db") as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS CachedStockData (
            ticker TEXT PRIMARY KEY,
            company_json TEXT,
            stock_json TEXT,
            last_updated DATETIME
        )''')

# Connect to DB Function
def get_db_connection():
    conn = sqlite3.connect('search_history.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_cache_connection():
    conn = sqlite3.connect('cache_stock.db')
    conn.row_factory = sqlite3.Row
    return conn

# Insert stock_ticker into SearchHistory table
def insert_history(stock_ticker):
    conn = get_db_connection()
    conn.execute('INSERT INTO SearchHistory (ticker) VALUES (?)', (stock_ticker,))
    conn.commit()
    conn.close()

# Insert into cache
def insert_cache(stock_ticker, company_json, stock_json, timestamp):

    print("============================")
    print("Insert_Cache Debug Below: ")
    print("Stock Ticker: ", stock_ticker)
    print("Company Json: ", company_json)
    print("Stock Json: ", stock_json)
    print("Timestamp: ", timestamp)
    print("============================")

    conn = get_db_connection()
    conn.execute(
        '''
        INSERT OR REPLACE INTO CachedStockData (ticker, company_json, stock_json, last_updated)
        VALUES (?, ?, ?, ?)
        ''',
        (stock_ticker, company_json, stock_json, timestamp)
    )
    conn.commit()
    conn.close()

# Get from SearchHistory table
def get_history():
    conn = get_db_connection()    
    my_history = conn.execute("SELECT ticker, timestamp FROM SearchHistory ORDER BY timestamp DESC LIMIT 10").fetchall()    
    conn.close()
    return [dict(h) for h in my_history] 

# True if stock is in cache and within 15 minutes
def search_cache(stock_ticker):
    conn = get_db_connection()    
    my_cache = conn.execute(
        "SELECT last_updated FROM CachedStockData WHERE ticker = ?", (stock_ticker,)).fetchall()   
    conn.close()
    
    if my_cache:
        # gets timestamp
        cached_time_str = my_cache[0][0]
        print("Time String: ", cached_time_str)
        # converts timestamp string to datetime format
        cached_time = datetime.fromisoformat(cached_time_str)

        # if within 15 minutes return true
        if datetime.now() - cached_time < timedelta(minutes=15):
            return True
        return False

def get_cached_stock(stock_ticker):
    conn = get_db_connection()
    my_cache = conn.execute(
        "SELECT company_json, stock_json FROM CachedStockData WHERE ticker = ?", (stock_ticker,)).fetchone()
    conn.close()

    if my_cache:
        company_data = json.loads(my_cache[0])  # convert JSON string -> dict
        stock_data = json.loads(my_cache[1])    # convert JSON string -> list
        return company_data, stock_data
    return None, None

# Constants
load_dotenv()
TIINGO_API_TOKEN = os.getenv("API_KEY")  # Make sure you have an .env file with MY_API_KEY=(your API key here)
BASE_LINK = "https://api.tiingo.com"

############################################################################################

# Initialize DB
init_db()

# Home page
@app.route("/")
@app.route("/index")
def index():
    return render_template("index.html")

# For searching a stock
@app.route("/search")
def search():

    # Get ticker from fetch
    ticker = request.args.get("ticker")

    # If ticker is empty
    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400

    headers = {
        'Content-Type': 'application/json'
    }
    
    # If stock is in cache
    if search_cache(ticker): 

        # update history
        try:
            insert_history(ticker)
            search_history_data = get_history()
        except sqlite3.Error as e:
            return jsonify({"error": "Database error"}), 500

        # stock data from cache
        
        #retrieved_data = get_cached_stock(ticker)
        #cached_outlook_data = retrieved_data[0]
        #cached_stock_summary_data = retrieved_data[1]
        cached_outlook_data, cached_stock_summary_data = get_cached_stock(ticker)

        print("============================")
        print("Retrieve Cache Debug Below: ")
        print("Stock Ticker: ", ticker)
        print("Company Json: ", cached_outlook_data)
        print("Stock Json: ", cached_stock_summary_data)
        print("============================")

        combined_data = {
            "outlook": cached_outlook_data,  # type = dict
            "summary": cached_stock_summary_data, # type = list
            "history": search_history_data,
            "cache": True
        }
        return jsonify(combined_data)

    # Company Outlook 
    response_outlook = requests.get(
        f"{BASE_LINK}/tiingo/daily/{ticker}?token={TIINGO_API_TOKEN}",
        headers=headers
    )

    try:
        outlook_data = response_outlook.json()
    except ValueError:
        return jsonify({"error": "Invalid JSON response from Tiingo"}), 500

    # Stock Summary
    response_stock_summary = requests.get(
        f"{BASE_LINK}/iex/?tickers={ticker}&token={TIINGO_API_TOKEN}",
        headers=headers
    )
    
    try:
        stock_summary_data = response_stock_summary.json()
    except ValueError:
        return jsonify({"error": "Invalid JSON response from Tiingo"}), 500
    

    # History
    try:
        insert_history(ticker)
        search_history_data = get_history()
    except sqlite3.Error as e:
        return jsonify({"error": "Database error"}), 500

    # combine
    combined_data = {
        "outlook": outlook_data,  # type = dict
        "summary": stock_summary_data, # type = list
        "history": search_history_data,
        "cache":  False
    }

    # Debug statements
    print("Final Debug")
    print(response_outlook.json())
    print(response_stock_summary.json())
    print(combined_data["cache"])

    # Insert into cache
    insert_cache(ticker, json.dumps(outlook_data), json.dumps(stock_summary_data), datetime.now())

    return jsonify(combined_data)

if __name__ == '__main__':
    app.run(debug=True) 