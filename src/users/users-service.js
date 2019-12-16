const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
    getAllUsers(knex){
        return knex.select('*')
            .from('users')
    },
    insertUser(knex, newUser){
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => {
                return user
            })
    },
    getUserById(knex, id){
        return knex
            .from('users')
            .select('*')
            .where('id',id)
            .first()
    },
    deleteUser(knex, id){
        return knex('users')
            .where({id})
            .delete()
    },
    updateUserById(knex, id, userUpdates){
        return knex('users')
            .where({ id })
            .update(userUpdates)
    },
    validatePassword(password){
        // password length
        if (password.length < 8 || password.length > 72) {
            return res
            .status(400)
            .send('Password must be between 8 and 72 characters');
        }

        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
    
        // password contains digit, using a regex here
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character';
        } 
        return null;
    },
    hashPassword(password){
        return bcrypt.hash(password, 12);
    },
    hasUserWithEmail(db, email){
        return db('users')
            .where({ email })
            .first()
            .then(user => !!user)
    }
};

module.exports = UsersService;