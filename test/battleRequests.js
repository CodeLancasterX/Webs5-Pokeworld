const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

let token;

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
                .patch(`/battlerequests/${battleRequestId}`)
                .send({token: token, status: "Accepted"})
                .end((err, res) => {
                    console.log(res.body)
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
                    console.log(res.body)
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

