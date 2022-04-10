const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

let token;
let encounterId;
let userId;

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
    name: "HeadAdminEncounter",
    email: "HeadAdminEncounter@NewLancaster.com",
    password: "password",
    isAdmin: true,
    noPokemon: true
}

describe("User", () => {
    
    let agent = chai.request.agent(server);

    let adminUser = {
        name: "CJTheEncounterAdmin",
        email: "CJTheEncounterAdmin@NewLancaster.com",
        password: "password",
        pokemon: "squirtle",
        isAdmin: true
    }
    
    let defaultUser = {
        name: 'CJTheEncounterUser',
        email: 'CJTheEncounterUser@NewLancaster.com',
        password: 'password',
        pokemon: 'bulbasaur',
        isAdmin: false
    }

    describe('Encounterroutes', () => {

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

        /**
         * Test POST route.
         */
            describe('POST /encounters', () => {
            it('It should CREATE a new encounter.', (done) => {
                agent
                    .post('/encounters')
                    .send({token: token,
                    pokemon: {
                        pokemonId: 1,
                        name: "bulbasaur",
                        imageUrl: "https://www.serebii.net/pokemongo/pokemon/001.png",
                        type: [
                            "grass",
                            "poison"
                        ],
                        weight: 80,
                        height: 9,
                        moves: [
                            "fury-cutter",
                            "tackle",
                            "outrage",
                            "facade"
                        ]
                    },
                    caught: false})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        // console.log(res)
                        expect(res).to.have.status(201);
                        expect(res.body).to.have.property("_id");
                        expect(res.body).to.have.property("message");
                        expect(res.body).to.have.property("url");
                        encounterId = res.body._id;
                        done();
                    });

            })
        })


        /**
         * Test GET route.
         */
        describe('GET /encounters', () => {
            it('It should GET all encounters.', (done) => {
                agent
                    .get('/encounters')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.encounters).to.be.a('array');
                        expect(res.body.encounters.length).to.be.eq(res.body.count);
                        done();
                    })
            })
        })

        describe('GET /encounters', () => {
            it('It should NOT GET all encounters.', (done) => {
                agent
                    .get('/encounter')
                    .end((err, res) => {
                        expect(res).to.have.status(404);
                        done();
                    })
            })
        })

        /**
         * Test GET /:id route.
         */
        describe('GET /encounters/:id', () => {
            it('It should GET an encounter by ID.', (done) => {
                agent
                    .get(`/encounters/${encounterId}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.a('object');
                        expect(res.body).to.have.property('pokemon');
                        expect(res.body).to.have.property('_id');
                        expect(res.body).to.have.property('user');
                        done();
                    })
            })
        })

        // describe('GET /encounters/:id', () => {
        //     it('It should NOT GET a encounter by ID for invalid ID format.', (done) => {
        //         const id = '123'
        //         chai.request(server)
        //         .get('/encounters/' + id)
        //         .end((err, response) => {
        //             response.should.have.status(404);
        //         done();
        //         })
        //     })
        // })

        describe('GET /encounters/:id', () => {
            it('It should NOT GET an encounter by ID for invalid ID.', (done) => {
                const id = '62197b98a10a06efc7c8aa5'
                agent
                    .get('/encounters/' + id)
                    .end((err, res) => {
                        expect(res).to.have.status(500);
                        done();
                    })
            })
        })



        /**
         * Test PATCH route.
         */
        describe('PATCH /encounters/:id', () => {
            it('It should UPDATE an encounter so that a pokemon is caught.', (done) => {
                agent
                    .put(`/encounters/${encounterId}`)
                    .send({token: token, encounterId: encounterId, caught: true})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        expect(res.body).to.have.property("userId");
                        expect(res.body).to.have.property("pokemonId");
                        expect(res.body).to.have.property("message");
                        expect(res.body).to.have.property("update");
                        expect(res.body).to.have.property("pokeUrl");
                        userId = res.body.userId;
                        done();
                    });
            })
        })

        /**
         * Test DELETE route.
         */

         describe('DELETE /encounters/:id', () => {
            it('It should DELETE an encounter.', (done) => {
                agent
                    .delete(`/encounters/${encounterId}`)
                    .send({token: token})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property("message");
                        done();
                    });
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
            it('It should DELETE a head admin.', (done) => {
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
})