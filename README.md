# Telegram Bot Project

## Overview

This project is a MERN stack application that integrates a Telegram bot with a MongoDB database and Kafka queue system. The bot interacts with users through Telegram commands, processes these interactions via Kafka queues, and manages retries and error handling using Kafka's retry and dead letter queues.

## Features

- **Telegram Bot Integration**: Handles commands like `/start`, `/checkTerms`, and `/connectWallet`.
- **Kafka Queue System**: Manages message flow with producer and consumer for handling bot messages.
- **Retry Mechanism**: Retries failed message deliveries and logs messages that fail after multiple retries.
- **Database Management**: Stores and updates user information and states in MongoDB.
- **Error Handling**: Utilizes dead letter queue for messages that fail after maximum retries.

## Components

### Telegram Bot

- Receives user commands and messages.
- Sends messages to Kafka topics.

### Kafka Producer

- Sends messages from the bot to Kafka topics.
- Topics: `welcomeMessageQueue`, `termsMessageQueue`, `walletMessageQueue`, `confirmationQueue`.

### Kafka Broker

- Manages topics and partitions.
- Routes messages between producers and consumers.

### Kafka Consumer

- Reads messages from Kafka topics.
- Handles retries and processes messages.

### Retry Queue

- Receives and retries failed messages after a delay.
- Moves messages to Dead Letter Queue after max retries.

### Dead Letter Queue (DLQ)

- Logs messages that fail after maximum retries.
- For manual intervention and further investigation.

### MongoDB

- Stores user data, including username, chatId, state, and other relevant fields.

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Kafka

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/rishabh259jain/telegramBot.git
    cd telegramBot
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Create a `.env` file in the root directory and add the following variables:

    ```plaintext
    BOT_TOKEN=your_telegram_bot_token
    MONGO_URI=mongodb://localhost/telegram-bot
    KAFKA_BROKER=localhost:9092
    ```

4. **Start MongoDB and Kafka**

    Make sure MongoDB and Kafka are running on your local machine or specify their addresses in the `.env` file.

5. **Run the Application**

    ```bash
    npm start
    ```

## Testing

To run the tests, use the following command:

    ```bash
    npm test
    ```

## Diagram

    ```bash
    
    +-------------------+        +-----------------+        +-----------------+
    |  Telegram Bot     |        |  Kafka Producer |        |  Kafka Broker   |
    |  /start           |        |  send messages  |        |  Topics:        |
    |  /checkTerms      |  --->  |  to topics      |  --->  |  welcomeMessage | 
    |  /connectWallet   |        |                 |        |  termsMessage   |
    +-------------------+        +-----------------+        |  walletMessage  |
                                                             +-----------------+
    
    +------------------+        +--------------------+        +--------------------+
    |  Kafka Consumer  |        |  Retry Queue       |        |  Dead Letter Queue |
    |  process messages|  --->  |  retry failed msgs |  --->  |  log & manual fix  |
    +------------------+        +--------------------+        +--------------------+
    
                                |
                                v
                        +-------------------+
                        |    Database       |
                        |  update user info |
                        +-------------------+

    ```
