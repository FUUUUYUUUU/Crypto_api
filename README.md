Here are the corrections for grammar and misspelled words:

## Project Overview
This project involves creating an ERD diagram to simulate a cryptocurrency database and developing an API compatible with standard crypto websites. This includes functionalities such as registration, creating buy/sell orders, depositing cash, viewing transactions, and accessing user wallets.

## Get started
1. Clone this project
2. Install the dependencies with the command "npm install"
3. Start the project server with the command "npm run start"

## How to use demo API
1. In this repository, there is 'Crypto API.postman_collection.json'
2. Open Postman
3. Import 'Crypto API.postman_collection.json'
4. Test the API

## API explanation
1. Register API (/auth/register)
   - To create a user account

2. Create order API (/order)
   - Users can create buy/sell orders with this API
   - the amount of sell/buy order can not exceed the balance

3. Match order API (/matching)
   - After buy or sell orders are created, this API will match buy and sell orders together
   - If two orders are matched, cash will transfer to the seller and cryptocurrency will transfer to the buyer

4. Depositing API (/user/deposit)
   - Users can deposit cash into the website with this API

5. View wallet balance API (/user/wallets)
   - Users can view their wallet balance with this API

6. View transactions API (/user/transactions)
   - Users can view their transactions after buying or selling cryptocurrency
  

