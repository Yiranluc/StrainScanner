# StrainScanner

## An end-to-end strain-level bacterial identification web platform

Authors: Konsta Kanniainen, Petar Ulev, Yiran Wang, Daglar Coban, Matei Cristea-Enache

TU Delft, 2020

Brief on the Background: 
- Correctly identifying the bacteria strains present in a sample can be very important, especially for the healthcare sector. Since some strains with small genetic differences can cause dangerous diseases. 
- Several tools for bacterial strain identification exist, but usually computationally expensive and aimed at users with technology backgrounds, which makes them harder to use by the average microbiologist. 
- Our task is to build an easy to use, end-to-end and easy-to-deploy web platform, making use of existing strain estimation algorithms and available cloud platforms, as well as offering an intuitive user interface. 

Product description: 
After **authenticating with a Google account**, users can select the algorithm and enter the required parameters to run a strain-level bacterial identification for a provided metagenomics sample. Each calculation will be run by **Cromwell** on Google Cloud Platform through **Google Cloud APIs**. **MongoDB** is used to record the computations launched by each user. When a computation is completed, the bacterial strains identified in the sample and their corresponding relative abundances will be returned to the front end on the results page, written in **Vue.js**.

## Demo

https://user-images.githubusercontent.com/45097607/139356611-684b154b-30ba-4797-9b03-b7c40e4d8596.mp4

## Deployment

### Prerequisites

To deploy a StrainScanner instance, you must meet these prerequisites:
- Create a Google APIs project with billing enabled (https://support.google.com/googleapi/answer/6158867?hl=en).
- Add all Google accounts that will be deploying workflows to this project as `Editor`s at https://console.developers.google.com/iam-admin/iam.
- Enable Cloud Life Sciences and Compute Engine APIs for the project at https://console.developers.google.com/apis/library.
- Set up a consent screen for the project at https://console.developers.google.com/apis/credentials/consent. You may choose either internal or external for user type; if you choose external, an "unverified app" warning will be displayed at first login and other limits, such as a limit for the amount of users, will be in place. If you are running the app locally, a redirect host such as lvh.me is needed for "Authorised domains".
- Create OAuth client ID credentials for web application at https://console.developers.google.com/apis/credentials. In "Authorised JavaScript origins", add the address you will use to access the app, e.g. `http://lvh.me:3001` if running locally. Mark down the displayed client ID and client secret.
- Deploy a MongoDB instance (e.g. at https://www.mongodb.com/) and mark down the connection string
- Create a .env file containing the variables `DB_LINK`, `CLIENT_ID`, `CLIENT_SECRET`, and `PROJECT_ID`. The last variable is the ID of your billing-enabled Google project.

### Configuring

The app comes bundled with the strain estimation algorithm StrainEst and two supported reference species; E.coli and S.epidermidis.

### Running

For deploying, there are two options: build it yourself or run the ready-made Docker image. Expose port 3001 for Express.
- The image is available at Docker Hub and you can just run it with your .env file, for example: `docker run -p 3001:3001 --env-file=path/to/.env strainscanner/strain-scanner`. For more fine-tuned control of the deployment process, see Docker docs: https://docs.docker.com/engine/reference/commandline/docker/
- To build yourself, you need npm and Java 8 installed. Clone the repository and install dependencies with `npm install`. Download the Cromwell executable from https://github.com/broadinstitute/cromwell/releases/tag/50 and place it in /backend/cromwell/. Place your .env file in the `backend` folder and run `npm run deploy` and `npm start` in the project root.

Once the server starts up either way, the app will be ready to use at `http(s)://your.host:3001`.

## Usage

### Prerequisites

To use StrainScanner after it has been set up, you need the following information:
- Accession number for metagenomic sample data in the Sequence Read Archive
- Information on whether the sample contains single-end or paired-end reads
- Name of reference species in question

### Api documentation

To help future developers we have included a high level overview of our internal API in the form of a swagger api page. Once the server starts, the documentation can be accessed at `http(s)://your.host:3001/api-docs`. There, we have documented all HTTP requests sent by our frontend to the backend. This way, it is easier to see all necessary paramaters, authorization headers and response objects that our app internally uses. Future developers should find this of great help in letting them build upon our app.

### Home/Configure screen
This page hosts the controls for executing a workflow. There are two dropdowns; one for the available algorithms on this server and one for the available reference species for this algorithm. Furthermore, there is an input field for the accession number and radio buttons for selecting single- or paired-end reads. On the right, the user's login info is displayed alongside a log out button.

### Results screen
Every computation launched by the user will be shown on the Results screen. There is an icon showing whether the computation is "Submitted", "Running", "Error", "Failed", or "Succeed". If "error" appears, there is something wrong with the cromwell. If the computation is failed, the user can click the "google bucket" button and inspect the errors happend during the computation. And when computation succeeds, you can click the computation box and it will show a bar chart containing the relative abundance of each identified strain in the sample. If the phylogenetic tree newick file of the reference species is present in the backend, a phylogenetic tree with identified strains in red would be shown by the side of the bar chart.


## Extendability of StrainScanner

### Add new strain identification algorithms

Since StrainScanner uses <a href="https://cromwell.readthedocs.io/en/stable/tutorials/Containers/">Cromwell</a>, which supports WDL to launch each computation, if users want to add a new algorithm, they have to convert the commands of related softwares into one WDL script and include the docker images of related software in the runtime section. Users can also take the StrainEst WDL script in our app as a reference and <a href="https://support.terra.bio/hc/en-us/sections/360007274612-WDL-Documentation">here</a> is a more detailed documentation for WDL. There are several requirements when adding new algorithms:
- According to what StrainScanner offers for configuration, reference species, route to referece folder, accession number, and sequencing format should be the four compulsory inputs of the wdl script.
- The wdl scripts should be named "Algorithm.wdl" (e.g. "StrainEst.wdl").
- The scripts should be placed in /backend/algorithm/<Algorithm>/wdl-scripts.

Following these steps, StrainScanner would automatically recognise the newly added algorithms and offer them as options to choose when launching a new computation. StrainScanner always provides a link to the relevant folder in the user's Google bucket to browse and retrieve computation results and possible error logs. If the user wants StrainScanner to parse the results, a new case should be added in /backend/util/resultsUtil.js:readAbundances to do the parsing according to the output format of the new algorithm.

### Add new reference species/Update existing reference species

When users have built a new database for certain reference species by themselves, it is very simple to integrate it with our app. In the folder /backend/algorithm there is a folder for each algorithm, and in that, a folder "species". Users can add new reference species in the contained json file, named with pattern "Algorithm.json" (e.g. "StrainEst.json"). However, they need to make sure themselves that in the WDL script, they add the correct route to fetch the pre-built database. To notice, if the user wants to change the way of how reference species names are parsed in order to meet the requirements of input formats in algorithm wdl scripts, a new case for each algorithm can be added (and existing cases can be adjusted) in frontend/src/services/compute.js:compute.

Example contents of the species file:
```
[
  "Escherichia coli",
  "Staphylococcus epidermidis"
]
```

### Add new phylogenetic trees for StrainEst

It is very likely that with the default phylogenetic tree of E. coli in our server, you are not able to find an existing w In order to see what phylogenetic relation of the identified strains is like within the species, users can add the phylogenetic relations of the strains of their interest in the Newick format under the folder /backend/algorithm/phylotrees. The name of the file should be "species.nwk" (e.g. "ecoli.nwk"), where "species" matches the reference species name used in "species/Algorithm.json". In addition, sometimes the strain names used in the algorithms and the strain names used in the phylogenetic trees are different, we also offer users the option to place a strain-name mapping file under /backend/algorithm/<Algorithm>/mapping. The mapping file should consist of tab-separated values (tsv) and follow the name pattern of “Algorithm_species.tsv” (e.g. “StrainEst_ecoli.tsv”).

Example contents of the mapping file:
```
GCF_001936315.1	Esch_coli_SLK172
GCF_900497095.1	Esch_coli_EC-TO75
GCF_001901215.1	Esch_coli_M19
GCF_002953795.1	Esch_coli_5FA
```

### Update Cromwell

StrainScanner comes bundled with Cromwell 50. It is possible to change the version of Cromwell running inside the app. Place the executable in /backend/cromwell/ and make sure it conforms to the name pattern `cromwell-<version>.jar`. Then, add a line to the .env file: `CROMWELL_VERSION=<version>` and restart the server.

### Experimental: modify the Cromwell config

StrainScanner comes with a pre-configured Cromwell to launch workflows on Google Cloud. For more fine-tuned control, the user can modify the file /backend/cromwell/google.conf to taste or even provide another file and refer to it in /backend/cromwell/cromwell.js:conf.

## Troubleshooting

### Login fails immediately before displaying the consent screen

- Try disabling adblocker
- Remove access for the app from https://myaccount.google.com/ -> "Secure account" and try logging in again (renews the refresh token)

### Error: invalid_grant -OR- Error: no refresh_token

- Remove access for the app from https://myaccount.google.com/ -> "Secure account" and try logging in again (renews the refresh token)

## References and links

### Cromwell

Voss K, Van der Auwera G and Gentry J. Full-stack genomics pipelining with GATK4 + WDL + Cromwell [version 1; not peer reviewed]. F1000Research 2017, 6(ISCB Comm J):1381 (slides) (https://doi.org/10.7490/f1000research.1114634.1)
