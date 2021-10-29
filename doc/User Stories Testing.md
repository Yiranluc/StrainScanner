## Frontend testing with user stories

### Login Page
- After I launch StrainScanner, what I first see is the page for logging in using google account. I am not able to go to other pages or use other functions of this app without logging in.
- When “Sign in with Google” button on the login page is clicked, a pop-up screen shows up and then I can choose a google account to log in.
- If the google account for login is used for the first time with this app, I get notified that this app is not verified by google yet in the pop-up screen. I can choose “Advanced” and “Go to GenomeStuffInc” to grant GenomeStuffInc the permission to manage my data across Google Cloud Platform service. Whereas if the google account has been used before to log in, I can directly log in without granting the permission again. Once I log in, the home page would be shown.

### Home Page
- On the home page, I can click “Algorithm” and choose one among which offered in the drop-down menu. Before choosing an algorithm, when I click “Species”, it would show “No data available”. Once the algorithm is selected, the algorithm name is updated to the “Run” button (e.g “Run StrainEst”) and after I click “Species”, a list of available reference species are shown. And I can enter the “SRA accession number” and choose its corresponding sequencing format (i.e. “Single-end” or “Paired-end”). Only after the above things are all configured, the “Run” button becomes clickable. After the “Run” button is clicked, an hourglass shows up and a pop-up message would say the workflow is submitted.
- On the left side of the home page, there is a menu bar for selecting whether go to the home page or go to the results page with clicking the tab.
- On the right side of the home page, I can see my google account and profile picture. My current google account can be logged out by clicking the "Log out" button, which then leads me to the Login page.
- When I resize the screen to the width with 1263px, the left side menu bar containing tabs for home page and result page disappears.
- When I further resize the screen to the width less than 960px, the section for showing my google account and signing out moves underneath the configuration module on the home page.

### Results Page
- On the results page, I can scroll down the “Results” section and see all the computations I have launched before.
- For each computation launched, there is a sub-module saying the sample accession number, its corresponding sequencing format, the identification method (i.e. algorithm) used for this computation, the starting time of this computation based on my local time zone. There is also a label in each sub-module telling the phase this computation is in. These include "Error" and "Failed" in red, "Submitted", "Running", and "Succeeded" in blue, and "Succeeded" in green. There is also a button labeled "Open bucket", which when clicked opens the Google storage bucket corresponding to the workflow in a new browser tab.
- There is a refresh button at the top which, when clicked, forces a refresh of all workflows. For the time of loading, a hourglass is displayed next to it and the button is not clickable.
- When I enter the results page, the refresh button is automatically clicked.
- When I refresh the results page, the refresh button is automatically clicked.
- Workflows that are "Submitted" update their status every five seconds automatically, and workflows that are "Running", every minute.
- Only when the computation turns to “Succeeded” in green, the sub-module becomes clickable and expandable.
- Once the sub-module expands, there is a bar chart and a phylogenetic tree presented side by side within the sub-module. The bar chart contains the relative abundances of the strain identified in the metagenomic sample. If no phylogenetic tree was found on the server, the tree will not be displayed. I can choose whether to show a pruned phylogenetic tree or the whole tree by clicking the corresponding button and the identified strains will be marked in red if they exist in the tree.

### Special cases
- If I modify or remove the id_token cookie, next time I try to move between pages or the client submits any queries to the backend, an "Unauthorized" alert is displayed and I am logged out.
- If the refresh_token is missing from the database, I get an "Unauthorized. Error: no refresh_token" and another alert at login. I am not able to log in. After removing access to the app at `https://myaccount.google.com/`, I see a new consent screen when logging in and I am able to log in again.
- If the refresh_token is modified in the database, I get an "Unauthorized. invalid_grant" alert at login, computation upload, and results fetch. I get logged out. After removing access to the app at `https://myaccount.google.com/`, I see a new consent screen when logging in and I am able to log in again.
