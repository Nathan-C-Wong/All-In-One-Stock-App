// Top Section
const stockForm = document.getElementById("stock-form");
const submit = document.getElementById("submit");
const clear = document.getElementById("clear");
const inputStock = document.getElementById("input-stock");

// Tabs 
const optionTab = document.getElementById("options");
const outlook = document.getElementById("outlook");
const summary = document.getElementById("summary");
const history = document.getElementById("search-history");

// Output area
const outArea = document.getElementById("output-area");
const compOutlook = document.getElementById("company-outlook");
const stockSummary = document.getElementById("stock-summary");
const myHistory = document.getElementById("my-history");

// Error area
const errHandle = document.getElementById("error-message");

// Cache Retrieval Statement
const cacheStatement = document.getElementById("cache-statement");

// Company Info Table output
const compName = document.getElementById("name");
const outSymbol = document.getElementById("out-symbol");
const exchangeCode = document.getElementById("exchange-code");
const startDate = document.getElementById("start-date");
const description = document.getElementById("description");

// Stock Summary Table output
const symbol = document.getElementById("symbol");
const tradingDay = document.getElementById("trading-day");
const prevClosing = document.getElementById("prev-closing");
const openPrice = document.getElementById("open-price");
const highPrice = document.getElementById("high-price");
const lowPrice = document.getElementById("low-price");
const lastPrice = document.getElementById("last-price"); 
const change = document.getElementById("change");
const changePercent = document.getElementById("change-percent");
const sharesTraded = document.getElementById("shares-traded");

// History Table output
const history1 = document.getElementById("history-1");
const timestamp1 = document.getElementById("timestamp-1");

const history2 = document.getElementById("history-2");
const timestamp2 = document.getElementById("timestamp-2");

const history3 = document.getElementById("history-3");
const timestamp3 = document.getElementById("timestamp-3");

const history4 = document.getElementById("history-4");
const timestamp4 = document.getElementById("timestamp-4");

const history5 = document.getElementById("history-5");
const timestamp5 = document.getElementById("timestamp-5");

const history6 = document.getElementById("history-6");
const timestamp6 = document.getElementById("timestamp-6");

const history7 = document.getElementById("history-7");
const timestamp7 = document.getElementById("timestamp-7");

const history8 = document.getElementById("history-8");
const timestamp8 = document.getElementById("timestamp-8");

const history9 = document.getElementById("history-9");
const timestamp9 = document.getElementById("timestamp-9");

const history10 = document.getElementById("history-10");
const timestamp10 = document.getElementById("timestamp-10");


// Clear input
clear.addEventListener("click", function() {
    inputStock.value = "";
    stockSummary.style.display = "none";
    myHistory.style.display = "none";
    compOutlook.style.display = "none";
    optionTab.style.display = "none";
    errHandle.style.display = "none";
    cacheStatement.style.display = "none";
});

// Tabs
outlook.addEventListener("click", function() {
    summary.style.backgroundColor = "rgb(218, 218, 218)";
    history.style.backgroundColor = "rgb(218, 218, 218)";
    outlook.style.backgroundColor = "rgb(193, 193, 193)";
    stockSummary.style.display = "none";
    myHistory.style.display = "none";
    compOutlook.style.display = "table";
});

summary.addEventListener("click", function() {
    outlook.style.backgroundColor = "rgb(218, 218, 218)";
    history.style.backgroundColor = "rgb(218, 218, 218)";
    summary.style.backgroundColor = "rgb(193, 193, 193)";
    compOutlook.style.display = "none";
    myHistory.style.display = "none";
    stockSummary.style.display = "table";
});

history.addEventListener("click", function() {
    history.style.backgroundColor = "rgb(193, 193, 193)";
    outlook.style.backgroundColor = "rgb(218, 218, 218)";
    summary.style.backgroundColor = "rgb(218, 218, 218)";
    compOutlook.style.display = "none";
    stockSummary.style.display = "none";
    myHistory.style.display = "table";
});

// Fetch 
stockForm.addEventListener("submit", function(e) {
    e.preventDefault();

    let stockTicker = inputStock.value;
    console.log("Stock ticker submitted: " + stockTicker);

    errHandle.style.display = "none";
    
    // To get the Company Outlook
    fetch(`/search?ticker=${stockTicker}`)
    .then(response => response.json())
    .then(data => {
        if (data) {
            console.log(data);
            console.log("Success");

            const companyStock = data.outlook;
            const companyStockSummary = data.summary[0]
            const searchHistory = data.history
            const cache = data.cache

            optionTab.style.display = "block";
            stockSummary.style.display = "none";
            myHistory.style.display = "none";
            compOutlook.style.display = "table";

            // Outlook Table
            summary.style.backgroundColor = "rgb(218, 218, 218)";
            history.style.backgroundColor = "rgb(218, 218, 218)";
            outlook.style.backgroundColor = "rgb(193, 193, 193)";

            // Fill out outlook table
            compName.innerHTML = companyStock.name;
            outSymbol.innerHTML = companyStock.ticker;
            exchangeCode.innerHTML = companyStock.exchangeCode;
            startDate.innerHTML = companyStock.startDate;
            description.innerHTML = companyStock.description;

            // Fill out stock summary table
            symbol.innerHTML = companyStockSummary.ticker;
            tradingDay.innerHTML = companyStockSummary.timestamp.split("T")[0];
            prevClosing.innerHTML = companyStockSummary.prevClose.toFixed(2);
            openPrice.innerHTML = companyStockSummary.open.toFixed(2);
            highPrice.innerHTML = companyStockSummary.high.toFixed(2);
            lowPrice.innerHTML = companyStockSummary.low.toFixed(2);
            
            // Cache Statement 
            cacheStatement.style.display = "none";   // clear first before checking
            if (cache) {
                cacheStatement.style.display = "block";
            }

            // Checking if last is null
            if (companyStockSummary.last === null) {
                lastPrice.innerHTML = "N/A";
                change.innerHTML = "N/A";
                changePercent.innerHTML = "N/A";
                
            } else {
                lastPrice.innerHTML = companyStockSummary.last.toFixed(2);
                
                let changeAmt = parseFloat((companyStockSummary.last - companyStockSummary.prevClose).toFixed(2));

                //let changeAmt = 5;
                if (changeAmt >= 0) {
                    console.log(changeAmt);
                    change.innerHTML = `
                        ${changeAmt.toFixed(2)}
                        <img src="${greenArrowUrl}" alt="Green Arrow Up" width="15" height="20" style="vertical-align: middle;">
                        `;
                } else {
                    change.innerHTML = `
                        ${changeAmt.toFixed(2)}
                        <img src="${redArrowUrl}" alt="Red Arrow Down" width="15" height="20" style="vertical-align: middle;">
                        `;
                }   

                let changePercentAmt = (changeAmt / companyStockSummary.prevClose) * 100;

                if (changePercentAmt >= 0) {
                    changePercent.innerHTML = `
                        ${changePercentAmt.toFixed(2)}%
                        <img src="${greenArrowUrl}" alt="Green Arrow Up" width="15" height="20" style="vertical-align: middle;">
                        `;
                } else {
                    changePercent.innerHTML = `
                        ${changePercentAmt.toFixed(2)}%
                        <img src="${redArrowUrl}" alt="Red Arrow Down" width="15" height="20" style="vertical-align: middle;">
                        `;
                }
                 
            }
            
            sharesTraded.innerHTML = companyStockSummary.volume;
            
            // History Table
            history1.innerHTML = searchHistory.length >= 1 ? searchHistory[0].ticker : "N/A";
            timestamp1.innerHTML = searchHistory.length >= 1 ? searchHistory[0].timestamp : "N/A";

            history2.innerHTML = searchHistory.length >= 2 ? searchHistory[1].ticker : "N/A";
            timestamp2.innerHTML = searchHistory.length >= 2 ? searchHistory[1].timestamp : "N/A";

            history3.innerHTML = searchHistory.length >= 3 ? searchHistory[2].ticker : "N/A";
            timestamp3.innerHTML = searchHistory.length >= 3 ? searchHistory[2].timestamp : "N/A";

            history4.innerHTML = searchHistory.length >= 4 ? searchHistory[3].ticker : "N/A";
            timestamp4.innerHTML = searchHistory.length >= 4 ? searchHistory[3].timestamp : "N/A";

            history5.innerHTML = searchHistory.length >= 5 ? searchHistory[4].ticker : "N/A";
            timestamp5.innerHTML = searchHistory.length >= 5 ? searchHistory[4].timestamp : "N/A";

            history6.innerHTML = searchHistory.length >= 6 ? searchHistory[5].ticker : "N/A";
            timestamp6.innerHTML = searchHistory.length >= 6 ? searchHistory[5].timestamp : "N/A";

            history7.innerHTML = searchHistory.length >= 7 ? searchHistory[6].ticker : "N/A";
            timestamp7.innerHTML = searchHistory.length >= 7 ? searchHistory[6].timestamp : "N/A";

            history8.innerHTML = searchHistory.length >= 8 ? searchHistory[7].ticker : "N/A";
            timestamp8.innerHTML = searchHistory.length >= 8 ? searchHistory[7].timestamp : "N/A";

            history9.innerHTML = searchHistory.length >= 9 ? searchHistory[8].ticker : "N/A";
            timestamp9.innerHTML = searchHistory.length >= 9 ? searchHistory[8].timestamp : "N/A";

            history10.innerHTML = searchHistory.length >= 10 ? searchHistory[9].ticker : "N/A";
            timestamp10.innerHTML = searchHistory.length >= 10 ? searchHistory[9].timestamp : "N/A";

        } else {
            console.log("Invalid Ticker")
            errHandle.style.display = "block";
        }
    })
    .catch(error => {
        //console.log(error);
        stockSummary.style.display = "none";
        myHistory.style.display = "none";
        compOutlook.style.display = "none";
        optionTab.style.display = "none";
        errHandle.style.display = "block";
    })
    
});