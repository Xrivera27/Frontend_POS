const environment = process.env.NODE_ENV;

const getApi = () => {
    try {
        if(environment === 'development'){
            console.log('estas aqui');
            return 'http://localhost:3000/api'
        }
        else if(environment === 'production'){
            return 'http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api' 
        }
    } catch (error) {
        console.log('No fue detectado el entorno correcto.');
    }
}

module.exports = { getApi };