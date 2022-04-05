const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

//create jwt token authentication.
// const defaultUser = {
//     _id: '62435de9e3fc1bcdedd774f5',
//     email: 'CJTheNewTest@NewLancaster.com',
//     password: 'password'
// }
const adminUser = {
    name: 'CJTheNewTest',
    email: 'CJTheNewTest@NewLancaster.com',
    password: 'password',
    pokemon: 'squirtle',
    isAdmin: true
}

const defaultUser = {
    name: 'CJToBeDeletedTest',
    email: 'CJToBeDeleted@NewLancaster.com',
    password: 'password',
    pokemon: 'bulbasaur',
    isAdmin: false
}



let token;
// let userId;


describe("User", () => {

    let agent = chai.request.agent(server);

    describe('userroutes', () => {

        /**
         * Test signup route.
         */
        describe('POST /users/signup', () => {
            it('It should signup a new user.', (done) => {
                agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res)

                    done();
                });
            })
        })

        /**
         * Test signup route.
         */
        describe('POST /users/signup', () => {
            it('It should signup a new user.', (done) => {
                agent
                .post("/users/signup")
                .send(defaultUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res)
                    defaultUser._id = res.body._id;
                    done();
                });
            })
        })

        
        /**
         * Test Login route.
         */
         describe('POST /users/login', () => {
            it('It should login a user.', (done) => {
                agent
                .post("/users/login")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    token = res.body.token;
                    adminUser._id = res.body._id
                    done();
                })
            })
        })

        /**
         * Test GET route.
         */
        describe('GET /users', () => {
            it('It should GET all users.', (done) => {
                agent
                    .get('/users')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.users).to.be.a('array');
                        expect(res.body.users.length).to.eq(res.body.count);
                        done();
                    })
            })
        })

        /**
         * Test DELETE route.
         */
         describe('DELETE /users/:id', () => {
            it('It should DELETE a user.', (done) => {
                agent
                    .delete(`/users/${defaultUser._id}`)
                    .send({token: token})
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        done();
                    })
            })
        })
        

        

        // describe('GET /users', () => {
        //     it('It should NOT GET all users.', (done) => {
        //         agent
        //             .get('/user')
        //             .end((err, response) => {
        //                 response.should.have.status(404);
        //                 done();
        //             })
        //     })
        // })

        // /**
        //  * Test GET /:id route.
        //  */
        // describe('GET /users/:id', () => {
        //     it('It should GET an user by ID.', (done) => {
        //         const id = '62197b98a10a06efc7c8aa56'
        //         agent
        //             .get(`/users/${id}`)
        //             .end((err, response) => {
        //                 response.should.have.status(200);
        //                 response.body.should.be.a('object');
        //                 // response.body.should.have.property('challenger');
        //                 // response.body.should.have.property('defender');
        //                 // response.body.should.have.property('winner');
        //                 done();
        //             })
        //     })
        // })

        // // describe('GET /users/:id', () => {
        // //     it('It should NOT GET a user by ID for invalid ID format.', (done) => {
        // //         const id = '123'
        // //         chai.request(server)
        // //         .get('/users/' + id)
        // //         .end((err, response) => {
        // //             response.should.have.status(404);
        // //         done();
        // //         })
        // //     })
        // // })

        // describe('GET /users/:id', () => {
        //     it('It should NOT GET an user by ID for invalid ID.', (done) => {
        //         const id = '62197b98a10a06efc7c8aa5'
        //         agent
        //             .get('/users/' + id)
        //             .end((err, response) => {
        //                 response.should.have.status(500);
        //                 done();
        //             })
        //     })
        // })

        // /**
        //  * Test POST route.
        //  */
        // describe('POST /users', () => {
        //     it('It should CREATE a new user.', (done) => {
        //         agent
        //             .post('/users')
        //             .send({token: token,
        //             pokemon: {
        //                 pokemonId: 1,
        //                 name: "bulbasaur",
        //                 imageUrl: "https://www.serebii.net/pokemongo/pokemon/001.png",
        //                 type: [
        //                     "grass",
        //                     "poison"
        //                 ],
        //                 weight: 80,
        //                 height: 9,
        //                 moves: [
        //                     "fury-cutter",
        //                     "tackle",
        //                     "outrage",
        //                     "facade"
        //                 ]
        //             },
        //             caught: false})
        //             .end((err, res) => {
        //                 expect(err).to.be.null;
        //                 expect(res).to.have.status(201);
        //                 userId = res.body._id;
        //                 done();
        //             });

        //     })
        // })

        // /**
        //  * Test PATCH route.
        //  */
        // describe('PATCH /users/:id', () => {
        //     it('It should UPDATE an user so that a pokemon is caught.', (done) => {
        //         agent
        //             .patch(`/users/${userId}`)
        //             .send({token: token, userId: userId, caught: true})
        //             .end((err, res) => {
        //                 expect(err).to.be.null;
        //                 expect(res).to.have.status(201);
        //                 userId = res.body.userId;
        //                 done();
        //             });
        //     })
        // })

        // /**
        //  * Test DELETE route.
        //  */
        //  describe('DELETE /users/:id', () => {
        //     it('It should DELETE an user.', (done) => {
        //         console.log(userId)
        //         agent
        //             .delete(`/users/${userId}`)
        //             .send({token: token})
        //             .end((err, res) => {
        //                 expect(err).to.be.null;
        //                 expect(res).to.have.status(200);
        //                 done();
        //             });
        //     })
        // })
    })
})