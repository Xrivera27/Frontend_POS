const environment = process.env.NODE_ENV || 'production';

const getApi = () => {
    try {
        if(environment === 'development'){
            return 'http://localhost:3000/api'
        }
        else if(environment === 'production'){
            return 'http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api' 
        }
        else {
            console.log(environment);
            console.log('No fue detectado el entorno de ejecución');
        }
    } catch (error) {
        console.error('Ocurrio un error: ', error);
    }
}

module.exports = { getApi };