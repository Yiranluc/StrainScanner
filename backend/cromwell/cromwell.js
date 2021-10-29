const { exec } = require('child_process');

const cw = './cromwell/cromwell-' + (process.env.CROMWELL_VERSION || 50) + '.jar';
const conf = './cromwell/google.conf';
const command = 'java -Dconfig.file=' + conf
  + ' -Dbackend.providers.PAPIv2.config.project=' + process.env.PROJECT_ID
  + ' -Dbackend.providers.PAPIv2.config.root=gs://cromwell-' + process.env.PROJECT_ID
  + ' -Dgoogle.clientId=' + process.env.CLIENT_ID
  + ' -Dgoogle.clientSecret=' + process.env.CLIENT_SECRET
  + ' -jar ' + cw
  + ' server';

const cromwell = exec(command);

cromwell.stdout.on('data', (data) => {
  console.log(`[Cromwell]: ${data}`);
});

cromwell.stderr.on('data', (data) => {
  console.log(`[Cromwell error]: ${data}`);
});
