const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

let token;

let starterCharmander = {
    name: "charmander",
    starter: true,
}

let starterSquirtle = {
    name: "squirtle",
    starter: true,
}

let starterBulbasaur = {
    name: "bulbasaur",
    starter: true,
}

let headAdmin = {
    name: "HeadAdmin",
    email: "HeadAdmin@NewLancaster.com",
    password: "password",
    isAdmin: true,
    noPokemon: true
}

describe('Pokemon should be created, read, edited and deleted.', () => {

    let agent = chai.request.agent(server);
    
    let adminUser = {
        name: "CJThePokemonAdmin",
        email: "CJThePokemonAdmin@NewLancaster.com",
        password: "password",
        pokemon: "squirtle",
        isAdmin: true
    }
    
    let defaultUser = {
        name: 'CJThePokemonUser',
        email: 'CJThePokemonUser@NewLancaster.com',
        password: 'password',
        pokemon: 'bulbasaur',
        isAdmin: false
    }

    let pokemonId;

    describe('POST /users/signup head admin', () => {
        it('It should signup a head admin.', (done) => {
            agent
                .post("/users/signup")
                .send(headAdmin)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    headAdmin._id = res.body._id
                    // console.log(res)
                    done();
                });
        })
    })

    describe('POST /users/login', () => {
        it('It should login a head admin.', (done) => {
            agent
                .post("/users/login")
                .send(headAdmin)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    token = res.body.token;
                    starterCharmander.token = token;
                    starterBulbasaur.token = token;
                    starterSquirtle.token = token;
                    done();
                })
        })
    })

    describe('POST /pokemon admin user', () => {
        it('It should create a pokemon.', (done) => {
            agent
                .post("/pokemon")
                .send(starterCharmander)
                .end((err, res) => {
                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    starterCharmander._id = res.body._id;
                    done();
                });
        })
    })

    describe('POST /pokemon admin user', () => {
        it('It should create a pokemon.', (done) => {
            agent
                .post("/pokemon")
                .send(starterSquirtle)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    starterSquirtle._id = res.body._id;
                    done();
                });
        })
    })

    describe('POST /pokemon admin user', () => {
        it('It should create a pokemon.', (done) => {
            agent
                .post("/pokemon")
                .send(starterBulbasaur)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    starterBulbasaur._id = res.body._id;
                    done();
                });
        })
    })

    describe('POST /users/signup admin', () => {
        it('It should sign up an admin.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    adminUser._id = res.body._id;
                    done();
                });
        })
    })


    describe('POST /users/signup default user', () => {
        it('It should signup a default user.', (done) => {
            agent
                .post("/users/signup")
                .send(defaultUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    defaultUser._id = res.body._id;
                    done();
                });
        })
    })

    describe('POST /users/login admin', () => {
        it('It should login an admin.', (done) => {
            agent
                .post("/users/login")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    token = res.body.token;
                    done();
                })
        })
    })

    describe('POST /pokemon admin user', () => {
        it('It should create a pokemon.', (done) => {
            data = {
                name: "newPokemon",
                description: "pokemon made by admin",
                type: "customType",
                accuracy: 100,
                power: 100,
                starter: true,
                token: token
            }
            agent
                .post("/pokemon")
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    pokemonId = res.body._id
                    done();
                });
        })
    })
    
    describe('GET /pokemon', () => {
        it('It should GET all pokemon.', (done) => {
            agent
                .get("/pokemon")
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.pokemon.length).to.be.eq(res.body.count);
                    done();
                });
        })
    })

    describe('GET /pokemon/starters', () => {
        it('It should GET all starter pokemon.', (done) => {
            agent
                .get("/pokemon/starters")
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.pokemon.length).to.be.eq(res.body.count);
                    done();
                });
        })
    })

    describe('PUT /pokemon/:id', () => {
        it('It should edit a specific pokemon.', (done) => {
            let data = {
                name: "editedNewPokemon",
                description: "edited description",
                type: "editedType",
                accuracy: 90,
                power: 90,
                token: token
            }
                agent
                .put(`/pokemon/${pokemonId}`)
                .send(data)
                .end((err, res) => {
                    // console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });

        })
    })

    //delete test.
    describe('DELETE /pokemon/:id', () => {
        it('It should a DELETE pokemon.', (done) => {
            agent
                .delete(`/pokemon/${pokemonId}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

        describe('DELETE /pokemon/:id', () => {
        it('It should a DELETE starter pokemon.', (done) => {
            agent
                .delete(`/pokemon/${starterCharmander._id}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /pokemon/:id', () => {
        it('It should a DELETE starter pokemon.', (done) => {
            agent
                .delete(`/pokemon/${starterSquirtle._id}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /pokemon/:id', () => {
        it('It should a DELETE starter pokemon.', (done) => {
            agent
                .delete(`/pokemon/${starterBulbasaur._id}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a admin user.', (done) => {
            agent
                .delete(`/users/${headAdmin._id}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a default user.', (done) => {
            agent
                .delete(`/users/${defaultUser._id}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE an admin user.', (done) => {
            agent
                .delete(`/users/${adminUser._id}`)
                .send({
                    token: token
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })




})

