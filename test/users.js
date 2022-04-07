const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);





let token;
// let userId;



let agent = chai.request.agent(server);

describe('Admin and user should be created and cascade deleted with chosen pokemon and encounters.', () => {
    let adminUser = {
        name: "CJTheNewTest",
        email: "CJTheNewTest@NewLancaster.com",
        password: "password",
        pokemon: "squirtle",
        isAdmin: true
    }
    
    let defaultUser = {
        name: 'CJToBeDeletedTest',
        email: 'CJToBeDeleted@NewLancaster.com',
        password: 'password',
        pokemon: 'bulbasaur',
        isAdmin: false
    }
    
    /**
     * Test signup route.
     */
    describe('POST /users/signup admin', () => {
        it('It should signup an admin.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    adminUser._id = res.body._id
                    // console.log(res)
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
                    // console.log(res.body)
                    defaultUser._id = res.body._id;
                    done();
                });
        })
    })

    //pokemon creation on signup test.
    describe('GET /users/:id/pokemon', () => {
        it('It should GET all admin\'s pokemon.', (done) => {
            agent
                .get(`/users/${adminUser._id}/pokemon`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.pokemon).to.be.a('array');
                    expect(res.body.pokemon.length).to.eq(res.body.count);
                    adminUser.pokemonId = res.body.pokemon[0]._id
                    done();
                })
        })
    })

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

    //encounter tests.
    describe('POST /users/:id/encounters', () => {
        it('It should create a new encounter.', (done) => {
            agent
                .post(`/users/${adminUser._id}/encounters`)
                .send({token: token})
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    adminUser.encounterId = res.body._id
                    done();
                })
        })
    })

    describe('GET /users/:id/encounters', () => {
        it('It should get encounter.', (done) => {
            agent
                .post(`/users/${adminUser._id}/encounters`)
                .send({token: token})
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    done();
                })
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


    //Cascade delete test.
    describe('GET /users/:id/pokemon/:id', () => {
        it('It should NOT get pokemon after admin user has been deleted.', (done) => {
            agent
                .get(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    done();
                })
        })
    })

    describe('GET /users/:id/encounters', () => {
        it('It should NOT get encounter after admin user has been deleted.', (done) => {
            agent
                .get(`/users/${adminUser._id}/encounters/${adminUser.encounterId}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    done();
                })
        })
    })

})

describe('User should update account', () => {
    let adminUser = {
        name: 'CJTheUpdateTest',
        email: 'CJToBeUpdated@NewLancaster.com',
        password: 'password',
        pokemon: 'charmander',
        isAdmin: true
    }

    describe('POST /users/signup', () => {
        
        it('It should signup a new user.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {

                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res.body)
                    adminUser._id = res.body._id;
                    
                    done();
  
                });
        }).timeout(5000)
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
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

    describe('PATCH /users/:id', () => {
        it('It should update user\'s email.', (done) => {
            data = {
                email: adminUser.email,
                newEmail: "CJHasBeenUpdated@NewLancaster.com",
                password: "newpassword",
                token: token
            }
            agent
                .patch(`/users/${adminUser._id}`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a default user.', (done) => {
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

describe('User should update pokemon', () => {
    let adminUser = {
        name: 'CJThePokemonUpdate',
        email: 'CJThePokemonUpdate@NewLancaster.com',
        password: 'password',
        pokemon: 'charmander',
        isAdmin: true
    }

    describe('POST /users/signup', () => {
        
        it('It should signup a new user.', (done) => {
            agent
                .post("/users/signup")
                .send(adminUser)
                .end((err, res) => {

                    // console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    // console.log(res.body)
                    adminUser._id = res.body._id;
                    
                    done();
  
                });
        }).timeout(5000)
    })

    describe('POST /users/login', () => {
        it('It should login a user.', (done) => {
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

    describe('GET /users/:id/pokemon', () => {
        it('It should GET all pokemon of user', (done) => {
            agent
                .get(`/users/${adminUser._id}/pokemon`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    adminUser.pokemonId = res.body.pokemon[0]._id;
                    done();
                })
        })
    })

    describe('PATCH /users/:id/pokemon/:id', () => {
        it('It should update user\'s pokemon nickname.', (done) => {
            data = {
                nickName: "newNickname",
                token: token
            }
            agent
                .patch(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}`)
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.nickName).to.be.eq('newNickname')
                    done();
                })
        })
    })

    describe('PATCH /users/:id/pokemon/:id/moves', () => {
        it('It should update user\'s pokemon moves.', (done) => {
            data = {
                moves: [
                    "flamethrower",
                    "bite",
                    "ember",
                    "fire-fang"
                ],
                token: token
            }
            agent
                .patch(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}/moves`)
                .send(data)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);      
                    done();
                })
        })
    })

    describe('PATCH /users/:id/pokemon/:id/moves', () => {
        it('It should NOT update user\'s pokemon moves.', (done) => {
            data = {
                moves: [
                    "pwegjpdw", /*invalid move*/
                    "bite",
                    "ember",
                    "fire-fang"
                ],
                token: token
            }
            agent
                .patch(`/users/${adminUser._id}/pokemon/${adminUser.pokemonId}/moves`)
                .send(data)
                .end((err, res) => {
                    console.log(res.body)
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);      
                    done();
                })
        })
    })

    describe('DELETE /users/:id', () => {
        it('It should DELETE a default user.', (done) => {
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

// describe('User should update encounter', () => {
//     let adminUser = {
//         name: 'CJTheUpdateTest',
//         email: 'CJToBeUpdated@NewLancaster.com',
//         password: 'password',
//         pokemon: 'charmander',
//         isAdmin: true
//     }

//     describe('POST /users/signup', () => {
        
//         it('It should signup a new user.', (done) => {
//             agent
//                 .post("/users/signup")
//                 .send(adminUser)
//                 .end((err, res) => {

//                     console.log(res.body)
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(201);
//                     // console.log(res.body)
//                     adminUser._id = res.body._id;
                    
//                     done();
  
//                 });
//         })
//     })

//     describe('POST /users/login', () => {
//         it('It should login a user.', (done) => {
//             agent
//                 .post("/users/login")
//                 .send(adminUser)
//                 .end((err, res) => {
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(200);
//                     token = res.body.token;
//                     done();
//                 })
//         })
//     })

//     describe('PATCH /users/:id', () => {
//         it('It should update user\'s email.', (done) => {
//             data = {
//                 email: adminUser.email,
//                 newEmail: "CJHasBeenUpdated@NewLancaster.com",
//                 password: "newpassword",
//                 token: token
//             }
//             agent
//                 .patch(`/users/${adminUser._id}`)
//                 .send(data)
//                 .end((err, res) => {
//                     console.log(res.body)
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(200);
//                     done();
//                 })
//         })
//     })

//     describe('DELETE /users/:id', () => {
//         it('It should DELETE a default user.', (done) => {
//             agent
//                 .delete(`/users/${adminUser._id}`)
//                 .send({
//                     token: token
//                 })
//                 .end((err, res) => {
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(200);
//                     done();
//                 })
//         })
//     })
// })

// describe('User should update pokemon moves', () => {
//     let adminUser = {
//         name: 'CJTheUpdateTest',
//         email: 'CJToBeUpdated@NewLancaster.com',
//         password: 'password',
//         pokemon: 'charmander',
//         isAdmin: true
//     }

//     describe('POST /users/signup', () => {
        
//         it('It should signup a new user.', (done) => {
//             agent
//                 .post("/users/signup")
//                 .send(adminUser)
//                 .end((err, res) => {

//                     console.log(res.body)
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(201);
//                     // console.log(res.body)
//                     adminUser._id = res.body._id;
                    
//                     done();
  
//                 });
//         }).timeout(5000)
//     })

//     describe('POST /users/login', () => {
//         it('It should login a user.', (done) => {
//             agent
//                 .post("/users/login")
//                 .send(adminUser)
//                 .end((err, res) => {
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(200);
//                     token = res.body.token;
//                     done();
//                 })
//         })
//     })

//     describe('PATCH /users/:id', () => {
//         it('It should update user\'s email.', (done) => {
//             data = {
//                 email: adminUser.email,
//                 newEmail: "CJHasBeenUpdated@NewLancaster.com",
//                 password: "newpassword",
//                 token: token
//             }
//             agent
//                 .patch(`/users/${adminUser._id}`)
//                 .send(data)
//                 .end((err, res) => {
//                     console.log(res.body)
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(200);
//                     done();
//                 })
//         })
//     })

//     describe('DELETE /users/:id', () => {
//         it('It should DELETE a default user.', (done) => {
//             agent
//                 .delete(`/users/${adminUser._id}`)
//                 .send({
//                     token: token
//                 })
//                 .end((err, res) => {
//                     expect(err).to.be.null;
//                     expect(res).to.have.status(200);
//                     done();
//                 })
//         })
//     })
// })


/**
 * Test GET route.
 */
// describe('GET /users', () => {
//     it('It should GET all users.', (done) => {
//         agent
//             .get('/users')
//             .end((err, res) => {
//                 expect(res).to.have.status(200);
//                 expect(res.body.users).to.be.a('array');
//                 expect(res.body.users.length).to.eq(res.body.count);
//                 done();
//             })
//     })
// })        

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