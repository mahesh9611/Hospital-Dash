# Hospital Availability Dashboard & App

This project tracks hospital availability (beds, ICU, oxygen, blood, doctors) using **Firebase** for real-time data storage. It is designed to work as a Website and a Progressive Web App (PWA) on Android/iOS.

## 🚀 Step 1: Set up Firebase (Database)

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `hospital-dashboard`).
3. Disable Google Analytics (optional) and create the project.
4. **Register the App:**
   - Click the **Web** icon (`</>`) on the dashboard.
   - Name it "Hospital Web".
   - **Copy the `firebaseConfig` object** (the part with `apiKey`, `authDomain`, etc.).
   - Open `app.js` in this folder and replace the placeholder `firebaseConfig` with your copied code.
5. **Set up Firestore Database:**
   - In Firebase Console, go to **Build > Firestore Database**.
   - Click **Create Database**.
   - Select **Start in test mode** (allows read/write for 30 days - easier for development).
   - Choose a location close to you.
   - Click **Enable**.

## 📱 Step 2: Run the App

### Option A: Local Server (Recommended)
Since this app uses modern JavaScript modules, it works best when served.
1. Open a terminal in this folder.
2. Run:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser to `http://localhost:8000`.

### Option B: Open File
You can try opening `index.html` directly in Chrome/Edge, but if you see CORS errors in the console, use Option A.

## 📲 Step 3: Install on Mobile (Android & iOS)

### Method 1: Progressive Web App (PWA) - Easiest
This code is PWA-ready.
1. Host this website (e.g., using Firebase Hosting or Vercel).
2. Open the website on your phone.
3. **Android (Chrome):** Tap menu (3 dots) -> "Add to Home Screen" or "Install App".
4. **iOS (Safari):** Tap Share button -> "Add to Home Screen".
   
It will look and feel like a native app.

### Method 2: Native App (APK/IPA) using Capacitor
If you want a real app store app, you need Node.js installed.
1. Install Node.js.
2. Run:
   ```bash
   npm init -y
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   npx cap init
   npx cap add android
   npx cap add ios
   npx cap open android
   ```
   This requires Android Studio / Xcode.

## 🛠 Features
- **Real-time Updates:** Changes appear instantly on all devices.
- **Search:** Filter by hospital name or area.
- **Doctor Availability:** New field added.
- **Direct Actions:** Click to Call or Open Maps.
