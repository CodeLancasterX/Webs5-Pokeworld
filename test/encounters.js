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
let userId;

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
            it('It should GET an encounter by ID.', (done) => {
                const id = '62197b98a10a06efc7c8aa56'
                agent
                    .get(`/encounters/${id}`)
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        // response.body.should.have.property('challenger');
                        // response.body.should.have.property('defender');
                        // response.body.should.have.property('winner');
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
                    .end((err, response) => {
                        response.should.have.status(500);
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
                    .post('/encounters/')
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
            it('It should UPDATE an encounter so that a pokemon is caught.', (done) => {
                agent
                    .patch('/encounters/:id')
                    .send({token: token, encounterId: encounterId, caught: true})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(201);
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
                        done();
                    });
            })
        })
    })
})