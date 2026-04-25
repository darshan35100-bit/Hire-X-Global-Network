const fs = require('fs'); 
let data = fs.readFileSync('server.js', 'utf8'); 
data = data.replace(/req\.user\.email !== 'kmthecoder@gmail\.com'/g, "req.user.role !== 'main_admin'"); 
data = data.replace(/user\.email === 'kmthecoder@gmail\.com'/g, "user.role === 'main_admin'"); 
data = data.replace(/req\.user\.email === 'kmthecoder@gmail\.com'/g, "req.user.role === 'main_admin'"); 
fs.writeFileSync('server.js', data);
