const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

let token;

let agent = chai.request.agent(server);

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

describe('Admin and user should be created and cascade deleted with chosen pokemon and encounters.', () => {
    
    let adminUser = {
        name: "CJTheNewTest",
        email: "CJTheNewTest@NewLancaster.com",
        password: "password",
        pokemon: "squirtle",
        isAdmin: true,

    }
    
    let defaultUser = {
        name: 'CJToBeDeletedTest',
        email: 'CJToBeDeleted@NewLancaster.com',
        password: 'password',
        pokemon: 'bulbasaur',
        isAdmin: false
    }

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

    /**
     * Test signup route.
     */
    describe('POST /users/signup admin', () => {
        it('It should signup an admin.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    adminUser._id = res.body._id
                    // console.log(res)
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
                    // console.log(res.body)
                    defaultUser._id = res.body._id;
                    done();
                });
        })
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
            agent
                .post("/users/login")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    token = res.body.token;
                    adminUser._id = res.body._id
                    done();
                })
        })
    })



    //pokemon creation on signup test.
    describe('GET /users/:id/pokemon', () => {
        it('It should GET all admin\'s pokemon.', (done) => {
            agent
                .get(`/users/${adminUser._id}/pokemon`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.pokemon).to.be.a('array');
                    expect(res.body.pokemon.length).to.eq(res.body.count);
                    adminUser.pokemonId = res.body.pokemon[0]._id
                    done();
                })
        })
    })

    //encounter tests.
    describe('POST /users/:id/encounters', () => {
        it('It should create a new encounter.', (done) => {
            agent
                .post(`/users/${adminUser._id}/encounters`)
                .send({token: token})
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    adminUser.encounterId = res.body._id
                    done();
                })
        })
    })

    describe('GET /users/:id/encounters', () => {
        it('It should get encounter.', (done) => {
            agent
                .post(`/users/${adminUser._id}/encounters`)
                .send({token: token})
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    done();
                })
        })
    })

    //delete test.
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


    //Cascade delete test.
    describe('GET /users/:id/pokemon/:id', () => {
        it('It should NOT get pokemon after admin user has been deleted.', (done) => {
            agent
                .get(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    done();
                })
        })
    })

    describe('GET /users/:id/encounters', () => {
        it('It should NOT get encounter after admin user has been deleted.', (done) => {
            agent
                .get(`/users/${adminUser._id}/encounters/${adminUser.encounterId}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    done();
                })
        })
    })

})

describe('User should update account', () => {
    let adminUser = {
        name: 'CJTheUpdateTest',
        email: 'CJToBeUpdated@NewLancaster.com',
        password: 'password',
        pokemon: 'charmander',
        isAdmin: true
    }

    describe('POST /users/signup', () => {
        
        it('It should signup a new user.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {

                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res.body)
                    adminUser._id = res.body._id;
                    
                    done();
  
                });
        })
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
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

    describe('PATCH /users/:id', () => {
        it('It should update user\'s email.', (done) => {
            data = {
                email: adminUser.email,
                newEmail: "CJHasBeenUpdated@NewLancaster.com",
                password: "newpassword",
                token: token
            }
            agent
                .put(`/users/${adminUser._id}`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a default user.', (done) => {
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

describe('User should update pokemon', () => {
    let adminUser = {
        name: 'CJThePokemonUpdate',
        email: 'CJThePokemonUpdate@NewLancaster.com',
        password: 'password',
        pokemon: 'charmander',
        isAdmin: true
    }

    describe('POST /users/signup', () => {
        
        it('It should signup a new user.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {

                    // console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res.body)
                    adminUser._id = res.body._id;
                    
                    done();
  
                });
        }).timeout(5000)
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
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

    describe('GET /users/:id/pokemon', () => {
        it('It should GET all pokemon of user', (done) => {
            agent
                .get(`/users/${adminUser._id}/pokemon`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    adminUser.pokemonId = res.body.pokemon[0]._id;
                    done();
                })
        })
    })

    describe('PATCH /users/:id/pokemon/:id', () => {
        it('It should update user\'s pokemon nickname.', (done) => {
            data = {
                nickName: "newNickname",
                token: token
            }
            agent
                .put(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}`)
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.nickName).to.be.eq('newNickname')
                    done();
                })
        })
    })

    describe('PATCH /users/:id/pokemon/:id/moves', () => {
        it('It should update user\'s pokemon moves.', (done) => {
            data = {
                moves: [
                    "flamethrower",
                    "bite",
                    "ember",
                    "fire-fang"
                ],
                token: token
            }
            agent
                .put(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}/moves`)
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);      
                    done();
                })
        })
    })

    describe('PATCH /users/:id/pokemon/:id/moves', () => {
        it('It should NOT update user\'s pokemon moves.', (done) => {
            data = {
                moves: [
                    "pwegjpdw", /*invalid move*/
                    "bite",
                    "ember",
                    "fire-fang"
                ],
                token: token
            }
            agent
                .put(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}/moves`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);      
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a default user.', (done) => {
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

describe('User should update encounter', () => {
    let adminUser = {
        name: 'CJTheUpdateTest',
        email: 'CJToBeUpdated@NewLancaster.com',
        password: 'password',
        pokemon: 'charmander',
        isAdmin: true
    }

    describe('POST /users/signup', () => {
        
        it('It should signup a new user.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {

                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res.body)
                    adminUser._id = res.body._id;
                    
                    done();
  
                });
        })
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
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

    describe('PATCH /users/:id', () => {
        it('It should update user\'s email.', (done) => {
            data = {
                email: adminUser.email,
                newEmail: "CJHasBeenUpdated@NewLancaster.com",
                password: "newpassword",
                token: token
            }
            agent
                .put(`/users/${adminUser._id}`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a default user.', (done) => {
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

describe('User should update pokemon moves', () => {
    let adminUser = {
        name: 'CJTheUpdateTest',
        email: 'CJToBeUpdated@NewLancaster.com',
        password: 'password',
        pokemon: 'charmander',
        isAdmin: true
    }

    describe('POST /users/signup', () => {
        
        it('It should signup a new user.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {

                    // console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res.body)
                    adminUser._id = res.body._id;
                    
                    done();
  
                });
        })
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
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

    describe('PATCH /users/:id', () => {
        it('It should update user\'s email.', (done) => {
            data = {
                email: adminUser.email,
                newEmail: "CJHasBeenUpdated@NewLancaster.com",
                password: "newpassword",
                token: token
            }
            agent
                .put(`/users/${adminUser._id}`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
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
        it('It should DELETE head admin.', (done) => {
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
        it('It should DELETE a admin user.', (done) => {
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