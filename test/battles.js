const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('../models/user');
const expect = chai.expect;


//Assertion style
chai.should();

chai.use(chaiHttp);

//create jwt token authentication.
let adminUser = {
    name: "CJTheBattleAdmin",
    email: "CJTheBattleAdmin@NewLancaster.com",
    password: "password",
    pokemon: "squirtle",
    isAdmin: true
}

let defaultUser = {
    name: 'CJTheBattleUser',
    email: 'CJTheBattleUser@NewLancaster.com',
    password: 'password',
    pokemon: 'bulbasaur',
    isAdmin: false
}



let token;
let battleId;

describe("User", () => {

    let agent = chai.request.agent(server);

    describe('Battleroutes', () => {

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
        describe('POST /battles', () => {
            it('It should CREATE a new battle.', (done) => {
                const defender = defaultUser._id
                agent
                    .post('/battles')
                    .send({
                        token: token,
                        challenger: adminUser._id,
                        defender: defender,
                        winner: null
                    })
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        battleId = res.body._id;
                        done();
                    });

            })
        })

        /**
         * Test GET route.
         */
        describe('GET /battles', () => {
            it('It should GET all battles.', (done) => {
                agent
                    .get('/battles')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.battles.should.be.a('array');
                        res.body.battles.length.should.be.eq(res.body.count);
                        done();
                    })
            })
        })

        describe('GET /battles', () => {
            it('It should NOT GET all battles.', (done) => {
                agent
                    .get('/battle')
                    .end((err, res) => {
                        res.should.have.status(404);
                        done();
                    })
            })
        })

        /**
         * Test GET /:id route.
         */
        describe('GET /battles/:id', () => {
            it('It should GET a battle by ID.', (done) => {
                const id = battleId
                agent
                    .get('/battles/' + id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('challenger');
                        res.body.should.have.property('defender');
                        res.body.should.have.property('winner');
                        done();
                    })
            })
        })

        // describe('GET /battles/:id', () => {
        //     it('It should NOT GET a battle by ID for invalid ID format.', (done) => {
        //         const id = '123'
        //         chai.request(server)
        //         .get('/battles/' + id)
        //         .end((err, response) => {
        //             response.should.have.status(404);
        //         done();
        //         })
        //     })
        // })

        describe('GET /battles/:id', () => {
            it('It should NOT GET a battle by ID for invalid ID.', (done) => {
                const id = '6231af3fad6e38e97fa54f87'
                agent
                    .get('/battles/' + id)
                    .end((err, res) => {
                        res.should.have.status(404);
                        done();
                    })
            })
        })

        /**
         * Test PATCH route.
         */
        describe('PATCH /battles/:id', () => {
            it('It should UPDATE a battle so that there is a winner.', (done) => {
                agent
                    .put(`/battles/${battleId}`)
                    .send({
                        token: token,
                        winner: adminUser._id,
                    })
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        done();
                    });
            })
        })

        /**
         * Test DELETE route.
         */
        describe('DELETE /battles/:id', () => {
            it('It should DELETE a battle.', (done) => {
                agent
                    .delete(`/battles/${battleId}`)
                    .send({
                        token: token
                    })
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