export default {
    
    validarEmpty(input){
        if (input == ''){
            return false;
        }
        return true;
    },

    validarPass(password1, password2){
        if ( password1 !== password2){
            return false;
        }
        return true;
    }
}