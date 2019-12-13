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
            .then(rows => {
                return rows[0]
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
    }
};

module.exports = UsersService;