const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
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
let encounterId;

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

    describe('Encounterroutes', () => {



        /**
         * Test GET route.
         */
        describe('GET /encounters', () => {
            it('It should GET all encounters.', (done) => {
                agent
                    .get('/encounters')
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.body.encounters.should.be.a('array');
                        response.body.encounters.length.should.be.eq(response.body.count);
                        done();
                    })
            })
        })

        describe('GET /encounters', () => {
            it('It should NOT GET all encounters.', (done) => {
                agent
                    .get('/encounter')
                    .end((err, response) => {
                        response.should.have.status(404);
                        done();
                    })
            })
        })

        /**
         * Test GET /:id route.
         */
        describe('GET /encounters/:id', () => {
            it('It should GET a encounter by ID.', (done) => {
                const id = '6231af3fad6e38e97fa54f88'
                agent
                    .get('/encounters/' + id)
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
            it('It should NOT GET a encounter by ID for invalid ID.', (done) => {
                const id = '6231af3fad6e38e97fa54f87'
                agent
                    .get('/encounters/' + id)
                    .end((err, response) => {
                        response.should.have.status(404);
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
                    .send({})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
                        encounterId = res.body._id;
                        done();
                    });

            })
        })

        /**
         * Test PATCH route.
         */
        describe('PATCH /encounters/:id', () => {
            it('It should EDIT a encounter.', (done) => {
                agent
                    .patch('/encounters/:id')
                    .send({token: token, winner: defaultUser._id, encounterId: encounterId})
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
         describe('DELETE /encounters/:id', () => {
            it('It should DELETE a encounter.', (done) => {
                agent
                    .delete(`/encounters/${encounterId}`)
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