const chai = require('chai');
const chaiHttp = require('chai-http');
const { response } = require('../app');
const server = require('../server');

//Assertion style
chai.should();

chai.use(chaiHttp);

describe('Battleroutes', () => {

    /**
     * Test GET route.
     */
    describe('GET /battles', () => {
        it('It should GET all battles.', (done) => {
            chai.request(server)
            .get('/battles')
            .end((err, response) => {
                response.should.have.status(200);
                response.body.battles.should.be.a('array');
                response.body.battles.length.should.be.eq(response.body.count);
            done();
            })
        })
    })

    /**
     * Test GET /:id route.
     */


    /**
     * Test POST route.
     */


    /**
     * Test PATCH route.
     */


    /**
     * Test DELETE route.
     */

})

