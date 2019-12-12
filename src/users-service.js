const UsersService = {
    getAllUsers(knex){
        return knex.select('*')
            .from('users')
    },
};

module.exports = UsersService;