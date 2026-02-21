const fs = require('fs');
const bcrypt = require('bcrypt');

const password = 'REvamp@GSOC69';
const hash = bcrypt.hashSync(password, 10);

let envContent = fs.readFileSync('.env', 'utf8');
envContent = envContent.replace(/ADMIN_PASSWORD_HASH=".*"/, `ADMIN_PASSWORD_HASH="${hash}"`);

fs.writeFileSync('.env', envContent);
console.log('Updated .env with hash:', hash);
console.log('Verification check:', bcrypt.compareSync(password, hash));
