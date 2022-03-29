const chai = require('chai');
const chaiHttp = require('chai-http');
const {
    response
} = require('../app');
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

describe("Battleroutetests", () => {
    let agent = chai.request.agent(server);

    // beforeEach(function(done) {
    //     agent
    //         .post('/users/signup')
    //         .send(defaultUser)
    //         .end((err, res) => {
    //             expect(err).to.be.null;
    //             expect(res).to.have.status(201);
    //             done();
    //         });
	// });

    beforeEach(function(done) {
        agent
            .post('/users/login')
            .send(defaultUser)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
	});


    // await beforeEach(async done => {
    //     const response = await chai.request(server)
    //         .post("/users/signup")
    //         .send(defaultUser)
    //     done();
    //     response.should.have.status(201);
    // }, 10000)

    // await beforeEach(async done => {
    //     const response = await chai.request(server)
    //         .post("/users/login")
    //         .send(defaultUser)
    //     token = res.body.token;
    //     response.should.have.status(200);
    //     done();
    // });

    // afterEach( function(done) {
    //     // After each test we truncate the database
    //     User.deleteOne({
    //         email: defaultUser.email
    //     }, err => {
    //         console.log('check.')
    //     });
    //     done();
    // });

    describe('Battleroutes', () => {

        /**
         * Test GET route.
         */
        describe('GET /battles', () => {
            it('It should GET all battles with status 200.', (done) => {
                chai.request(server)
                    .get('/battles')
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.body.battles.should.be.a('array');
                        response.body.battles.length.should.be.eq(response.body.count);
                        done();
                    })
            }).timeout(10000);
        });

        describe('GET /battles', () => {
            it('It should NOT GET all battles with status 404.', (done) => {
                chai.request(server)
                    .get('/battle')
                    .end((err, response) => {
                        response.should.have.status(404);
                        done();
                    })
            })
        }, 10000)

        /**
         * Test GET /:id route.
         */
        describe('GET /battles/:id', () => {
            it('It should GET a battle by ID.', (done) => {
                const id = '6231af3fad6e38e97fa54f88'
                chai.request(server)
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
                chai.request(server)
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
            it('It should POST a new battle.',(done) => {
                const response = chai.request(server)
                    .post('/battles')
                    .set({
                        Authorization: `Bearer ${token}`
                    })

                    response.should.have.status(201);
                    done();

            })
        })

        /**
         * Test PATCH route.
         */


        /**
         * Test DELETE route.
         */

    })
})