const jwt = require('jsonwebtoken');
const blacklist = new Set();

function addTokentoBlacklist(token, ttlMs){
    if(!token) return;
    blacklist.add(token);
    if(ttlMs && ttlMs>0){
        setTimeout(()=>{
            blacklist.delete(token);
        },ttlMs);
    }
}

function blacklistHasToken(token){
    return blacklist.has(token);
}

module.exports = {addTokentoBlacklist, blacklistHasToken};