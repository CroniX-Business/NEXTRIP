# Nextrip

Nextrip is your ultimate travel companion, empowering you to generate trips tailored to your unique preferences. Whether you're seeking adventure, relaxation, or cultural exploration, Nextrip has you covered. Once your trip is generated, you can save it for future reference, export the itinerary directly to Google Maps for seamless navigation, and even make edits on the go. With Nextrip, your travel plans are as flexible and personalized as you are.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Usage](#usage)
6. [License](#license)

## Features

- **Personalized Trip Generation:** Create trips based on your specific preferences and interests.
- **Itinerary Export:** Export your itinerary directly to Google Maps for easy navigation.
- **Save & Edit Trips:** Save your trips for future reference and make edits on the go.
- **Flexible Travel Plans:** Adapt and modify your travel plans as needed, ensuring they stay in line with your desires.

## Tech Stack

- **Frontend:** Angular - http://localhost:4200
- **Backend:** NestJS - http://localhost:3000

## Installation

To set up Nextrip on your local machine, follow these steps:

### 1. Clone the repository:

```bash
git clone https://github.com/CroniX-Business/NEXTRIP.git
cd NEXTRIP
```

### 2. Install Dependencies:

```bash
npm install & cd backend/ && npm install
```

### 3. Configuring a .env:

1. 
Make .env inside src/environments and copy following code and edit for yourself.
For Help - src/environments/set-env.ts - commented text:
```bash
    JWT_TOKEN=
    BACKEND_API=http://localhost:3000
    MONGO_URI=mongodb+srv://myDatabaseUser:D1fficultP%40ssw0rd@cluster0.example.mongodb.net/?retryWrites=true&w=majority
    MAP_STYLE_API=fc7404e322bd48fc82bc5ea396c601f3
    MAP_STYLE_JSON=https://maps.geoapify.com/v1/styles/positron-blue/style.json
    GOOGLE_PLACES_API=
    MAILER_USER=
    MAILER_PASS=
```

2. 
```bash
run frontend package.json build script
```

### 4. Running the Application::

Run following scripts
```bash
1. nextrip/package.json - start script 
2. backend/package.json - build script
3. backend/package.json - start script
```

## Usage

1. Open your browser and navigate to http://localhost:4200.
2. Start generating trips based on your preferences.
3. Save, edit, and export your itineraries as needed.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.