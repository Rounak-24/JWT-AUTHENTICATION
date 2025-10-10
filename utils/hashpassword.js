const bcrypt = require('bcrypt');

const hashPassword = async function (next) {
    try{
        const user = this;

        if(!user.isModified('password')){
            return next();
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(this.password, salt);
        next();
    }catch(err){
        next(err);
    }
}

module.exports = hashPassword;