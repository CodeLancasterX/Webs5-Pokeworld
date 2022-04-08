const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

let token;

describe('Move should be created, read, edited and deleted.', () => {

    let agent = chai.request.agent(server);
    
    let adminUser = {
        name: "CJTheMoveAdmin",
        email: "CJTheMoveAdmin@NewLancaster.com",
        password: "password",
        pokemon: "squirtle",
        isAdmin: true
    }
    
    let defaultUser = {
        name: 'CJTheMoveUser',
        email: 'CJTheMoveUser@NewLancaster.com',
        password: 'password',
        pokemon: 'bulbasaur',
        isAdmin: false
    }

    let moveId;


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

    describe('POST /moves admin user', () => {
        it('It should create a move.', (done) => {
            data = {
                name: "newMove",
                description: "move made by admin",
                type: "customType",
                accuracy: 100,
                power: 100,
                token: token
            }
            agent
                .post("/moves")
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    moveId = res.body._id
                    done();
                });
        })
    })
    
    describe('GET /moves', () => {
        it('It GET all moves.', (done) => {
            agent
                .get("/moves")
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.moves.length).to.be.eq(res.body.count);
                    done();
                });
        })
    })

    describe('PATCH /moves/:id', () => {
        it('It should edit a specific move.', (done) => {
            let data = {
                name: "editedNewMove",
                description: "edited description",
                type: "editedType",
                accuracy: 90,
                power: 90,
                token: token
            }
                agent
                .patch(`/moves/${moveId}`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
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

    describe('DELETE /moves/:id', () => {
        it('It should a DELETE move.', (done) => {
            agent
                .delete(`/moves/${moveId}`)
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

