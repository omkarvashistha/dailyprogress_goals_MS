const goalsRepo = require('../model/Schema');

exports.getId = async(username) => {
    try {
        let userGoals = await goalsRepo.findOne({username : username});

        let size = 0;

        if(userGoals){
            size = (userGoals.goalsData).length;
            size+=1;
            return "G" + size;
        } else {
            return "G1"
        }

    } catch (error) {
        console.log(error.message);
    }
}