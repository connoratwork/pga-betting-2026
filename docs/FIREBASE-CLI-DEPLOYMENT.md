# Firebase CLI Installation & Deployment - Complete Guide

This guide walks you through installing Firebase CLI and deploying your project step-by-step.

---

## Part 1: Install Firebase CLI

### Step 1: Open Your Terminal

**On Mac:**
1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal" and press Enter
3. A terminal window will open

**On Windows:**
1. Press `Windows + R`
2. Type "cmd" and press Enter
3. Command Prompt will open

**On Linux:**
1. Press `Ctrl + Alt + T`
2. Terminal will open

### Step 2: Check if Node.js is Installed

Before installing Firebase CLI, you need Node.js. Let's check if you have it:

1. In your terminal, type:
```bash
node --version
```

2. Press Enter

**If you see a version number** (like `v18.0.0` or `v20.0.0`):
- ✅ Great! Node.js is installed. Continue to Step 3.

**If you see an error** (like "command not found"):
- ❌ You need to install Node.js first
- Go to: https://nodejs.org/
- Download the "LTS" (Long Term Support) version
- Install it (follow the installer prompts)
- Restart your terminal
- Try `node --version` again

### Step 3: Install Firebase CLI Globally

Now install Firebase CLI:

1. In your terminal, type:
```bash
npm install -g firebase-tools
```

2. Press Enter

3. Wait for installation (1-2 minutes)
   - You'll see progress messages
   - May see some warnings (usually safe to ignore)

4. When complete, you'll see your command prompt again

**On Mac/Linux - Permission Error?**
If you see "permission denied" or "EACCES" error:
```bash
sudo npm install -g firebase-tools
```
Then enter your computer password when prompted.

### Step 4: Verify Installation

Check that Firebase CLI installed correctly:

1. Type:
```bash
firebase --version
```

2. Press Enter

3. You should see a version number (like `13.0.0`)
   - ✅ Success! Firebase CLI is installed

**If you see an error:**
- Close and reopen your terminal
- Try `firebase --version` again
- If still not working, restart your computer

---

## Part 2: Login to Firebase

### Step 5: Login to Firebase

1. In your terminal, type:
```bash
firebase login
```

2. Press Enter

3. You'll see a prompt: "Allow Firebase to collect CLI usage and error reporting information?"
   - Type `Y` and press Enter (or `N` if you prefer)

4. **Your web browser will open automatically**
   - You'll see a Google sign-in page
   - Sign in with the same Google account you used for Firebase Console

5. You'll see: "Firebase CLI Login Successful"
   - Click "Allow" to give Firebase CLI access

6. Return to your terminal
   - You should see: "✔ Success! Logged in as your-email@gmail.com"

**Troubleshooting:**
- If browser doesn't open, copy the URL from terminal and paste in browser
- If you see "already logged in", that's fine - continue to next step

---

## Part 3: Navigate to Your Project

### Step 6: Change to Project Directory

You need to be in your project folder to run Firebase commands.

1. In terminal, type:
```bash
cd ~/Desktop/Bob\ Assets/pga-championship-betting
```

2. Press Enter

**Note:** Adjust the path if your project is in a different location:
- If on Desktop: `cd ~/Desktop/pga-championship-betting`
- If in Documents: `cd ~/Documents/pga-championship-betting`
- If elsewhere: `cd /path/to/your/pga-championship-betting`

3. Verify you're in the right place:
```bash
ls
```

4. You should see files like:
   - `firebase.json`
   - `firestore.rules`
   - `public/`
   - `functions/`

✅ If you see these files, you're in the right place!

---

## Part 4: Initialize Firebase Project

### Step 7: Initialize Firebase

1. In your terminal (still in the project directory), type:
```bash
firebase init
```

2. Press Enter

3. You'll see the Firebase logo and some questions. Answer them as follows:

### Question 1: "Are you ready to proceed?"
- Press `Y` and Enter

### Question 2: "Which Firebase features do you want to set up?"
- Use arrow keys to move up/down
- Press `Space` to select/deselect
- Select these THREE options (they should have `◉` when selected):
  - `◉ Firestore: Configure security rules and indexes files`
  - `◉ Functions: Configure a Cloud Functions directory and its files`
  - `◉ Hosting: Configure files for Firebase Hosting`
- Press `Enter` when done

### Question 3: "Please select an option"
- Select: `Use an existing project`
- Press Enter

### Question 4: "Select a default Firebase project"
- Use arrow keys to find your project (e.g., `pgachampionshipbackend`)
- Press Enter

### Question 5: "What file should be used for Firestore Rules?"
- Press Enter (accept default: `firestore.rules`)

### Question 6: "What file should be used for Firestore indexes?"
- Press Enter (accept default: `firestore.indexes.json`)

### Question 6a: "Would you like to initialize a new codebase, or overwrite an existing one?"
- **This question appears because you already have a `functions` folder**
- Type `N` and press Enter (we want to keep our existing functions code)
- **Alternative**: If you accidentally said Yes, type: `pga-functions` as the codebase name

### Question 7: "What language would you like to use to write Cloud Functions?"
- Select: `JavaScript`
- Press Enter

### Question 8: "Do you want to use ESLint?"
- Type `N` and press Enter (we don't need it)

### Question 9: "Do you want to install dependencies with npm now?"
- Type `Y` and press Enter
- Wait 1-2 minutes while dependencies install

### Question 10: "What do you want to use as your public directory?"
- Type: `public`
- Press Enter

### Question 11: "Configure as a single-page app?"
- Type `Y` and press Enter

### Question 12: "Set up automatic builds and deploys with GitHub?"
- Type `N` and press Enter (we'll use GitHub Pages instead)

### Question 13: "File public/index.html already exists. Overwrite?"
- Type `N` and press Enter (keep our existing file!)

8. You should see: "✔ Firebase initialization complete!"

---

## Part 5: Deploy Firestore Rules

### Step 8: Deploy Firestore Rules and Indexes

1. In your terminal, type:
```bash
firebase deploy --only firestore
```

2. Press Enter

3. Wait 30-60 seconds

4. You should see:
   - `✔ Deploy complete!`
   - URLs for your deployed rules

✅ Firestore rules are now live!

---

## Part 6: Install Function Dependencies

### Step 9: Install Dependencies for Cloud Functions

1. Navigate to the functions folder:
```bash
cd functions
```

2. Press Enter

3. Install dependencies:
```bash
npm install
```

4. Press Enter

5. Wait 1-2 minutes while packages install

6. Go back to project root:
```bash
cd ..
```

7. Press Enter

---

## Part 7: Deploy Cloud Functions

### Step 10: Deploy Cloud Functions

1. In your terminal (in project root), type:
```bash
firebase deploy --only functions
```

2. Press Enter

3. Wait 2-3 minutes (this takes longer than rules)
   - You'll see progress messages
   - Functions are being uploaded and deployed

4. You should see:
   - `✔ Deploy complete!`
   - URLs for your functions:
     - `updateScores` (scheduled function)
     - `manualUpdateScores` (HTTP function)
     - `initializePlayers` (HTTP function)

5. **Copy the function URLs** - you'll need them later!
   - They look like: `https://us-central1-pgachampionshipbackend.cloudfunctions.net/functionName`

✅ Cloud Functions are now live!

---

## Part 8: Verify Deployment

### Step 11: Check Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Click "Functions" in left sidebar
4. You should see your 3 functions listed:
   - `updateScores`
   - `manualUpdateScores`
   - `initializePlayers`

5. Click "Firestore Database" in left sidebar
6. Click "Rules" tab
7. You should see your custom rules deployed

✅ Everything is deployed successfully!

---

## Summary of What You've Done

✅ Installed Firebase CLI
✅ Logged into Firebase
✅ Initialized your project
✅ Deployed Firestore rules and indexes
✅ Installed function dependencies
✅ Deployed Cloud Functions

---

## Next Steps

Now you're ready to:
1. **Initialize player data** (see Part 2 of SETUP.md)
2. **Deploy to GitHub Pages** (see Part 3 of SETUP.md)
3. **Test your website**

---

## Common Issues & Solutions

### Issue: "firebase: command not found"
**Solution:**
1. Close and reopen terminal
2. Try: `npm install -g firebase-tools` again
3. Restart computer if needed

### Issue: "Permission denied" on Mac/Linux
**Solution:**
```bash
sudo npm install -g firebase-tools
```
Enter your password when prompted.

### Issue: "EACCES" error during npm install
**Solution:**
```bash
sudo npm install -g firebase-tools
```

### Issue: Functions deployment fails
**Solution:**
1. Check you're in the project root directory
2. Make sure `functions/package.json` exists
3. Try: `cd functions && npm install && cd ..`
4. Try deployment again

### Issue: "Project not found"
**Solution:**
1. Run `firebase projects:list` to see your projects
2. Run `firebase use YOUR_PROJECT_ID`
3. Try deployment again

### Issue: Browser doesn't open for login
**Solution:**
1. Copy the URL from terminal
2. Paste it in your browser manually
3. Complete the login process

---

## Useful Commands Reference

```bash
# Check Firebase CLI version
firebase --version

# Login to Firebase
firebase login

# Logout from Firebase
firebase logout

# List your Firebase projects
firebase projects:list

# Switch to a different project
firebase use PROJECT_ID

# Deploy everything
firebase deploy

# Deploy only Firestore
firebase deploy --only firestore

# Deploy only Functions
firebase deploy --only functions

# Deploy only Hosting
firebase deploy --only hosting

# View function logs
firebase functions:log

# Open Firebase Console
firebase open
```

---

**You're now ready to continue with Part 2 of the setup! 🚀**