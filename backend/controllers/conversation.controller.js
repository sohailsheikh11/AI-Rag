import Conversation from "../model/conversations.js";

export const saveConversation = async (req,res)=>{

    try {

        const {title} = req.body;

    const conversation = await Conversation.create({title});

    res.json({
        id: conversation._id,
        title: conversation.title
    });
        
    } catch (error) {

        res.json(error.message);


        
    }
}

export const getConversation = async (req,res)=>{

    try {
        const conversations = await Conversation.find();

    console.log(conversations);

    res.json(conversations);

    } catch (error) {

        res.json(error);
        
    }
    
}