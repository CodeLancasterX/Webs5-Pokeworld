const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

let token;

describe('Two users and a battlerequest should be created', () => {

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