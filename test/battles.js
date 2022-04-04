const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('../models/user');
const expect = chai.expect;


//Assertion style
chai.should();

chai.use(chaiHttp);

//create jwt token authentication.
const defaultUser = {
    _id: '62435de9e3fc1bcdedd774f5',
    email: 'CJTheTest@lancaster.com',
    password: 'password'
}


let token;
let battleId;

describe("User", () => {
    // await beforeEach(async done => {
    //     const response = await chai.request(server)
    //         .post("/users/signup")
    //         .send(defaultUser)
    //     done();
    //     response.should.have.status(201);
    // }, 10000)
    



    // await afterEach(async (done) => {
    //     // After each test we truncate the database
    //     User.deleteOne({
    //         email: defaultUser.email
    //     }, err => {
    //         console.log('check.')
    //     });
    //     done();
    // }, 10000);
    let agent = chai.request.agent(server);

    beforeEach( function(done){
        agent
            .post("/users/login")
            .send(defaultUser)
            
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                // console.log(token)
                // console.log(res.body)
                res.should.have.status(200);
                token = res.body.token;
                done();
            });

    });

    describe('Battleroutes', () => {



        /**
         * Test GET route.
         */
        describe('GET /battles', () => {
            it('It should GET all battles.', (done) => {
                agent
                    .get('/battles')
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.body.battles.should.be.a('array');
                        response.body.battles.length.should.be.eq(response.body.count);
                        done();
                    })
            })
        })

        describe('GET /battles', () => {
            it('It should NOT GET all battles.', (done) => {
                agent
                    .get('/battle')
                    .end((err, response) => {
                        response.should.have.status(404);
                        done();
                    })
            })
        })

        /**
         * Test GET /:id route.
         */
        describe('GET /battles/:id', () => {
            it('It should GET a battle by ID.', (done) => {
                const id = '6231af3fad6e38e97fa54f88'
                agent
                    .get('/battles/' + id)
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('challenger');
                        response.body.should.have.property('defender');
                        response.body.should.have.property('winner');
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
                    .end((err, response) => {
                        response.should.have.status(404);
                        done();
                    })
            })
        })

        /**
         * Test POST route.
         */
        describe('POST /battles', () => {
            it('It should CREATE a new battle.', (done) => {
                const defender = '621993e4ce59ffa0a0b4052e'
                agent
                    .post('/battles')
                    .send({token: token, challenger: defaultUser._id, defender: defender, winner: null})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        battleId = res.body._id;
                        done();
                    });

            })
        })

        /**
         * Test PATCH route.
         */
        describe('PATCH /battles/:id', () => {
            it('It should UPDATE a battle so that there is a winner.', (done) => {
                agent
                    .patch('/battles/:id')
                    .send({token: token, winner: defaultUser._id, battleId: battleId})
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
                    .send({token: token})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        done();
                    });
            })
        })
    })
})