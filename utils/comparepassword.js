const bcrypt = require('bcrypt');

const comparePassword = async function (usergivenPassword) {
    try{
        return await bcrypt.compare(usergivenPassword,this.password);
    }catch(err){
        return next(err)
    }
}

module.exports = comparePassword;
