//const goals = require('../model/Schema');
const goalsRepo = require('../model/Schema');
const helper = require('../Utilities/helper');

exports.getUserGoalsData = async(req,res) => {
    try {
        const username = req.params.username;

        const incompleteQuery =  [
            {$match : {username : req.params.username}},
            {$project : {
                goalsData : {$filter : {
                    input : '$goalsData',
                    as : 'item',
                    cond : {$eq : ['$$item.complete',false]}
                }}
            }}
        ]

        const completeQuery =  [
            {$match : {username : req.params.username}},
            {$project : {
                goalsData : {$filter : {
                    input : '$goalsData',
                    as : 'item',
                    cond : {$eq : ['$$item.complete',true]}
                }}
            }}
        ]

        const completeData = await goalsRepo.aggregate(completeQuery);
        const incompleteData = await goalsRepo.aggregate(incompleteQuery);

        console.log(incompleteData);

        if(completeData || incompleteData) {
            res.status(200).json({
                completeGoals : completeData[0].goalsData.length,
                incompleteGoals : incompleteData[0].goalsData.length
            })
        } else {
            res.status(200).json({
                completeGoals : 0,
                incompleteGoals : 0
            })
        }

    } catch (error) {
        res.status(400).json({
            data : error.message
        })
    }
}

exports.getUserGoals = async(req,res)=> {
    try {

        const query = [
            // Get just the docs that contain have complete = false
            {$match: {username : req.params.username}},
            {$project: {
                goalsData: {$filter: {
                    input: '$goalsData',
                    as: 'item',
                    cond: {$eq: ['$$item.complete', false]}
                }},
                _id: 0
            }}
        ]

        console.log(query);

        const goalsDataRes = await goalsRepo.aggregate(query);

        if(goalsDataRes.length > 0) {
            res.status(200).json({
                data : goalsDataRes
            })
        } else {
            res.status(200).json({
                data : "No goals yet"
            })
        }

    } catch (error) {
        res.status(400).json({
            data : error.message
        })
    }
}

exports.getUserCompletedGoals = async(req,res)=> {
    try {

        const query = [
                // Get just the docs that contain have complete = true
                {$match: {username : req.params.username}},
                {$project: {
                    goalsData: {$filter: {
                        input: '$goalsData',
                        as: 'item',
                        cond: {$eq: ['$$item.complete', true]}
                    }},
                    _id: 0
                }}
            ]
        console.log(query);
        const goalsDataRes = await goalsRepo.aggregate(query);
        console.log(goalsDataRes);

        if(goalsDataRes.length > 0) {
            res.status(200).json({
                data : goalsDataRes
            })
        } else {
            res.status(200).json({
                data : "No goals yet"
            })
        }

    } catch (error) {
        res.status(400).json({
            data : error.message
        })
    }
}

exports.addGoals = async(req,res)=>{
    try {

        const username = req.params.username;
        const userGoals = await goalsRepo.findOne({username : username});

        const goalsId = await helper.getId(username);
        
        const goalsData = {
            goalsId : goalsId,
            title : req.body.title,
            content : req.body.content,
            day : req.body.day,
            date : req.body.date,
            complete : false
        }

        if(userGoals) {
            
            if(userGoals.uncomplete === 6) {
                res.status(201).json({
                    message : "Maximum Goals Limit reached"
                })
            } else {
                userGoals.goalsData.push(goalsData); // To push the new object data with goals data into the array
                await userGoals.save();

                await goalsRepo.findOneAndUpdate(
                {
                    username : username
                },
                {
                    $inc : {uncomplete : 1}
                }).exec(); 

                res.status(201).json({
                    message : "Goal Added for user"
                })
            }
            

        } else {
            const addGoalResponse = await goalsRepo.create({
                username : username,
                completed : 0,
                uncomplete : 1,
                goalsData : goalsData
            });

            res.status(201).json({
                message : "Goal Added for user"
            })


        }

    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            message : error.message    
        })
    }
}

exports.updateGoals = async(req,res) => {
    try {
        const id = req.body.id;
        const username = req.params.username;
        const title = req.body.title;
        const content = req.body.content;

        const userInfo = await goalsRepo.find({username : username});

        if(userInfo) {

            // This will update the content and title for the particular goal
            await goalsRepo.updateOne(
                {username : username,'goalsData.goalsId' : id},
                {
                    $set : {
                        'goalsData.$.title' : title,
                        'goalsData.$.content' : content
                    }
                }
            );

            res.status(201).json({
                data : "Goal Updated"   
            })

        } else {
            res.status(201).json({
                data : "No goals yet"
            })
        }

    } catch (error) {
        res.status(400).json({
            message : error.message
        })
    }
}

exports.markGoalCompleted = async(req,res) => {
    try {
        const username = req.params.username;
        const goalId  = req.body.goalId;
        
        const userInfo = await goalsRepo.find({username : username});

        if(userInfo) {
            const updateResponse = await  goalsRepo.findOneAndUpdate(
                {
                    username : username,
                    'goalsData.goalsId' : goalId           
                },
                {
                    $inc : {completed : 1 , uncomplete : -1},
                    '$set' : {'goalsData.$.complete' : true}
                }
            )
            
            if(updateResponse) {
                res.status(201).json({
                    message : "Goal Marked As Completed"
                })
            } else {
                res.status(201).json({
                    message : "Some problem occured"
                })
            }

        }

    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            message : error.message    
        })
    }
}

exports.deleteGoals = async(req,res) => {
    try {
        const username = req.params.username;
        const goalId = req.body.goalId;
        const flag = req.body.flag;

        const userInfo = await goalsRepo.find({username : username});
        //console.log(userInfo);
        if(userInfo) {

            const deleteGoalResponse = await goalsRepo.updateOne({
                'goalsData.goalsId' : goalId
            },
            {
                '$pull' : {     // This will be used to remove the object from the array
                    'goalsData' : {
                        'goalsId' : goalId
                    }
                }
            },
            {
                safe : true,
                multi : true 
            })

            if(deleteGoalResponse) {

                if(flag) {  // {true -> InComplete Goal} and  {false -> Completed Goal}

                    await goalsRepo.findOneAndUpdate({
                        username : username
                    },
                    {
                        $inc : {uncomplete : -1}
                    })
                } else {

                    await goalsRepo.findOneAndUpdate({
                        username : username
                    },
                    {
                        $inc : {completed : -1}
                    })
                }

                res.status(201).json({
                    message : 'Goal deleted successfully'
                })
            } else {
                res.status(201).json({
                    message : 'Some problem occured in deleting goal'
                })
            }


        } else {
            res.status(201).json({
                message : "No data to delete yet"
            })
        }

    } catch (error) {
        res.status(400).json({
            message : error.message
        })
    }
}

exports.invalid = async(req,res,next)=>{
    const err = new Error();
    err.message = 'Invalid Route';
    err.status = 404;
    next(err);
}