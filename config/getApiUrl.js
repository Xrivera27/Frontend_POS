

const environment = process.env.NODE_ENV;

const getApi = () => {
    try {
        if(environment === 'development'){
            return 'localhost//300'
        }
        else if(environment === 'production'){
            console.log('no Estas en desarrollo');   
        }
    } catch (error) {
        console.log('No fue detectado el entorno correcto.');
    }
}

module.exports = { getApi };