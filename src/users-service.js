const UsersService = {
    getAllArticles(knex){
        return knex.select('*')
            .from('users')
    }
};

module.exports = UsersService;