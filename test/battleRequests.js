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

describe('Battle request should be created, read, edited and deleted.', () => {

    let agent = chai.request.agent(server);
    
    let adminUser = {
        name: "CJTheBattleRequestAdmin",
        email: "CJTheBattleRequestAdmin@NewLancaster.com",
        password: "password",
        pokemon: "squirtle",
        isAdmin: true
    }
    
    let defaultUser = {
        name: 'CJTheBattleRequestUser',
        email: 'CJTheBattleRequestUser@NewLancaster.com',
        password: 'password',
        pokemon: 'bulbasaur',
        isAdmin: false
    }

    let battleRequestId;
    let battleId;

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
                    console.log(res.body)
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

    describe('POST /battlerequests admin user', () => {
        it('It should create a battlerequest between admin and default user.', (done) => {
            data = {
                challenger: adminUser._id,
                defender: defaultUser._id,
                token: token
            }
            agent
                .post("/battlerequests")
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    battleRequestId = res.body._id
                    done();
                });
        })
    })
    
    describe('GET /battlerequests', () => {
        it('It GET all battle requests.', (done) => {
            agent
                .get("/battlerequests")
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.battleRequests.length).to.be.eq(res.body.count);
                    done();
                });
        })
    })

    describe('PATCH /battlerequests/:id', () => {
        it('It should edit a specific battle request.', (done) => {

                agent
                .put(`/battlerequests/${battleRequestId}`)
                .send({token: token, status: "Accepted"})
                .end((err, res) => {
                    battleId = res.body.battleId;
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    done();
                });

        })
    })

    describe('GET /battles/:id', () => {
        it('Battle should be created after accept status.', (done) => {

                agent
                .get(`/battles/${battleId}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });

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

    describe('GET /battlerequests/:id', () => {
        it('It should NOT GET a specific battle request.', (done) => {
            setTimeout(() => {
                agent
                .get(`/battlerequests/${battleRequestId}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    done();
                });
            }, 5000);

        })
    })


})

